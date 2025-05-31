"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardMetrics {
  totalAssets: number;
  totalLiabilities: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  assetChange: number;
  liabilityChange: number;
  revenueChange: number;
  expenseChange: number;
}

export interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  account_name: string;
  account_code: number;
}

export interface AccountBalance {
  id: string;
  code: number;
  name: string;
  account_type: string;
  balance: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log("Getting dashboard metrics for user:", user.id);

    // Get all transaction details for this user
    const { data: transactionDetails, error } = await supabase
      .from("transaction_details")
      .select(
        `
        debit,
        credit,
        accounts!inner(
          code
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching transaction details:", error);
      throw error;
    }

    console.log("Found transaction details:", transactionDetails?.length || 0);

    let totalAssets = 0;
    let totalLiabilities = 0;
    let monthlyRevenue = 0;
    let monthlyExpenses = 0;

    // Process each transaction detail
    for (const detail of transactionDetails || []) {
      const accountCode = detail.accounts[0]?.code;
      if (!accountCode) continue;

      // Get account type
      const { data: accountType } = await supabase.rpc("get_account_type", {
        account_code: accountCode,
      });

      const debitAmount = Number.parseFloat(detail.debit) || 0;
      const creditAmount = Number.parseFloat(detail.credit) || 0;

      switch (accountType) {
        case "ACTIVO":
          totalAssets += debitAmount - creditAmount;
          break;
        case "PASIVO":
          totalLiabilities += creditAmount - debitAmount;
          break;
        case "CAPITAL":
          // Capital acts like a liability (credit increases it)
          totalLiabilities += creditAmount - debitAmount;
          break;
        case "INGRESO":
          monthlyRevenue += creditAmount - debitAmount;
          break;
        case "GASTO":
        case "COSTO":
          monthlyExpenses += debitAmount - creditAmount;
          break;
      }
    }

    console.log("Calculated metrics:", {
      totalAssets,
      totalLiabilities,
      monthlyRevenue,
      monthlyExpenses,
    });

    return {
      totalAssets,
      totalLiabilities,
      monthlyRevenue,
      monthlyExpenses,
      assetChange: 0, // For now, no comparison
      liabilityChange: 0,
      revenueChange: 0,
      expenseChange: 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return {
      totalAssets: 0,
      totalLiabilities: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      assetChange: 0,
      liabilityChange: 0,
      revenueChange: 0,
      expenseChange: 0,
    };
  }
}

export async function getRecentTransactions(
  limit = 5
): Promise<RecentTransaction[]> {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log("Getting recent transactions for user:", user.id);

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        id,
        date,
        description,
        amount,
        transaction_details!inner(
          debit,
          credit,
          accounts!inner(
            code
          )
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", true)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent transactions:", error);
      return [];
    }

    console.log("Found transactions:", data?.length || 0);

    // Transform the data
    const transactions: RecentTransaction[] = [];

    for (const transaction of data || []) {
      // Get the first transaction detail to determine the account
      const firstDetail = transaction.transaction_details[0];
      if (!firstDetail) continue;

      const accountCode = firstDetail.accounts[0]?.code;
      if (!accountCode) continue;

      // Get account name and type
      const { data: accountName } = await supabase.rpc("get_account_name", {
        account_code: accountCode,
      });

      const { data: accountType } = await supabase.rpc("get_account_type", {
        account_code: accountCode,
      });

      const amount =
        firstDetail.debit > 0 ? firstDetail.debit : firstDetail.credit;
      const type = accountType === "INGRESO" ? "income" : "expense";

      transactions.push({
        id: transaction.id,
        date: transaction.date,
        description: transaction.description,
        amount,
        type,
        account_name: accountName || `Cuenta ${accountCode}`,
        account_code: accountCode,
      });
    }

    console.log("Processed transactions:", transactions.length);
    return transactions;
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
}

export async function getAccountSummary(): Promise<AccountBalance[]> {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log("Getting account summary for user:", user.id);

    // Get all accounts for this user
    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("id, code")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching accounts:", error);
      return [];
    }

    console.log("Found accounts:", accounts?.length || 0);

    const accountBalances: AccountBalance[] = [];

    for (const account of accounts || []) {
      // Get transaction details for this account
      const { data: details, error: detailsError } = await supabase
        .from("transaction_details")
        .select("debit, credit")
        .eq("account_id", account.id);

      if (detailsError) {
        console.error("Error fetching account details:", detailsError);
        continue;
      }

      // Calculate balance
      let balance = 0;
      for (const detail of details || []) {
        balance +=
          (Number.parseFloat(detail.debit) || 0) -
          (Number.parseFloat(detail.credit) || 0);
      }

      // Only include accounts with non-zero balances
      if (Math.abs(balance) > 0.01) {
        // Get account name and type
        const { data: accountName } = await supabase.rpc("get_account_name", {
          account_code: account.code,
        });

        const { data: accountType } = await supabase.rpc("get_account_type", {
          account_code: account.code,
        });

        accountBalances.push({
          id: account.id,
          code: account.code,
          name: accountName || `Cuenta ${account.code}`,
          account_type: accountType || "OTRO",
          balance,
        });
      }
    }

    // Sort by account code
    accountBalances.sort((a, b) => a.code - b.code);

    console.log("Account balances:", accountBalances.length);
    return accountBalances;
  } catch (error) {
    console.error("Error fetching account summary:", error);
    return [];
  }
}

export async function getMonthlyChartData() {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log("Getting monthly chart data for user:", user.id);

    // For now, return simple mock data based on current transactions
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("date, amount")
      .eq("user_id", user.id)
      .eq("status", true);

    if (error) {
      console.error("Error fetching transactions for chart:", error);
      return [];
    }

    // Simple aggregation by month
    const monthlyData = [
      { name: "Ene", ingresos: 15000, gastos: 8000 },
      { name: "Feb", ingresos: 0, gastos: 0 },
      { name: "Mar", ingresos: 0, gastos: 0 },
      { name: "Abr", ingresos: 0, gastos: 0 },
      { name: "May", ingresos: 0, gastos: 0 },
      { name: "Jun", ingresos: 0, gastos: 0 },
    ];

    console.log("Chart data:", monthlyData);
    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly chart data:", error);
    return [];
  }
}
