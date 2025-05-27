"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMonth } from "@/lib/utils/date-utils";

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
  entry_number: string;
}

export interface AccountBalance {
  id: string;
  code: string;
  name: string;
  account_type: string;
  balance: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const { startDate, endDate } = getCurrentMonth();

  // Get previous month for comparison
  const prevMonthStart = new Date(
    startDate.getFullYear(),
    startDate.getMonth() - 1,
    1
  );
  const prevMonthEnd = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    0
  );

  try {
    // Calculate current month totals
    const currentMetrics = await calculatePeriodMetrics(
      supabase,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );

    // Calculate previous month totals for comparison
    const previousMetrics = await calculatePeriodMetrics(
      supabase,
      prevMonthStart.toISOString().split("T")[0],
      prevMonthEnd.toISOString().split("T")[0]
    );

    // Calculate percentage changes
    const assetChange = calculatePercentageChange(
      previousMetrics.totalAssets,
      currentMetrics.totalAssets
    );
    const liabilityChange = calculatePercentageChange(
      previousMetrics.totalLiabilities,
      currentMetrics.totalLiabilities
    );
    const revenueChange = calculatePercentageChange(
      previousMetrics.monthlyRevenue,
      currentMetrics.monthlyRevenue
    );
    const expenseChange = calculatePercentageChange(
      previousMetrics.monthlyExpenses,
      currentMetrics.monthlyExpenses
    );

    return {
      ...currentMetrics,
      assetChange,
      liabilityChange,
      revenueChange,
      expenseChange,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    // Return default values if there's an error
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

async function calculatePeriodMetrics(
  supabase: any,
  startDate: string,
  endDate: string
) {
  try {
    // Get account balances using direct SQL query instead of RPC
    const { data: accountBalances, error: balanceError } = await supabase
      .from("account_catalog")
      .select(
        `
        id,
        code,
        name,
        account_type,
        nature,
        journal_lines!left(
          debit_amount,
          credit_amount,
          journal_entries!inner(
            date,
            status
          )
        )
      `
      )
      .eq("is_active", true);

    if (balanceError) {
      console.error("Error fetching account balances:", balanceError);
      throw balanceError;
    }

    let totalAssets = 0;
    let totalLiabilities = 0;
    let monthlyRevenue = 0;
    let monthlyExpenses = 0;

    if (accountBalances) {
      accountBalances.forEach((account: any) => {
        let balance = 0;

        // Calculate balance from journal lines
        if (account.journal_lines) {
          account.journal_lines.forEach((line: any) => {
            // Only include posted entries within the date range
            if (
              line.journal_entries &&
              line.journal_entries.status === "posted" &&
              line.journal_entries.date >= startDate &&
              line.journal_entries.date <= endDate
            ) {
              if (account.nature === "debit") {
                balance += (line.debit_amount || 0) - (line.credit_amount || 0);
              } else {
                balance += (line.credit_amount || 0) - (line.debit_amount || 0);
              }
            }
          });
        }

        switch (account.account_type) {
          case "asset":
            totalAssets += balance;
            break;
          case "liability":
            totalLiabilities += balance;
            break;
          case "revenue":
            monthlyRevenue += balance;
            break;
          case "expense":
            monthlyExpenses += balance;
            break;
        }
      });
    }

    return {
      totalAssets,
      totalLiabilities,
      monthlyRevenue,
      monthlyExpenses,
    };
  } catch (error) {
    console.error("Error in calculatePeriodMetrics:", error);
    return {
      totalAssets: 0,
      totalLiabilities: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
    };
  }
}

function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

export async function getRecentTransactions(
  limit = 5
): Promise<RecentTransaction[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("journal_lines")
      .select(
        `
        id,
        journal_entry_id,
        debit_amount,
        credit_amount,
        description,
        journal_entries!inner(
          date,
          description,
          entry_number,
          status
        ),
        account_catalog!inner(
          name,
          account_type
        )
      `
      )
      .eq("journal_entries.status", "posted")
      .order("journal_entries.date", { ascending: false })
      .limit(limit * 2); // Get more to filter properly

    if (error) {
      console.error("Error fetching recent transactions:", error);
      return [];
    }

    // Transform and filter the data
    const transactions: RecentTransaction[] = [];

    data?.forEach((line: any) => {
      const amount =
        line.debit_amount > 0 ? line.debit_amount : line.credit_amount;
      const type = ["revenue"].includes(line.account_catalog.account_type)
        ? "income"
        : "expense";

      transactions.push({
        id: line.id,
        date: line.journal_entries.date,
        description: line.description || line.journal_entries.description,
        amount,
        type,
        account_name: line.account_catalog.name,
        entry_number: line.journal_entries.entry_number,
      });
    });

    return transactions.slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
}

export async function getAccountSummary(): Promise<AccountBalance[]> {
  const supabase = await createClient();

  try {
    // Get accounts with their balances
    const { data: accounts, error } = await supabase
      .from("account_catalog")
      .select(
        `
        id,
        code,
        name,
        account_type,
        nature,
        journal_lines!left(
          debit_amount,
          credit_amount,
          journal_entries!inner(
            status
          )
        )
      `
      )
      .eq("is_active", true)
      .order("code");

    if (error) {
      console.error("Error fetching account summary:", error);
      return [];
    }

    const accountBalances: AccountBalance[] = [];

    accounts?.forEach((account: any) => {
      let balance = 0;

      // Calculate balance from journal lines
      if (account.journal_lines) {
        account.journal_lines.forEach((line: any) => {
          // Only include posted entries
          if (
            line.journal_entries &&
            line.journal_entries.status === "posted"
          ) {
            if (account.nature === "debit") {
              balance += (line.debit_amount || 0) - (line.credit_amount || 0);
            } else {
              balance += (line.credit_amount || 0) - (line.debit_amount || 0);
            }
          }
        });
      }

      // Only include accounts with non-zero balances
      if (Math.abs(balance) > 0.01) {
        accountBalances.push({
          id: account.id,
          code: account.code,
          name: account.name,
          account_type: account.account_type,
          balance,
        });
      }
    });

    return accountBalances;
  } catch (error) {
    console.error("Error fetching account summary:", error);
    return [];
  }
}

export async function getMonthlyChartData() {
  const supabase = await createClient();

  try {
    // Get data for the last 6 months
    const months = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthName = date.toLocaleDateString("es-ES", { month: "short" });

      // Get revenue and expenses for this month using direct query
      const { data: monthData, error } = await supabase
        .from("journal_lines")
        .select(
          `
          debit_amount,
          credit_amount,
          account_catalog!inner(
            account_type,
            nature
          ),
          journal_entries!inner(
            date,
            status
          )
        `
        )
        .eq("journal_entries.status", "posted")
        .gte("journal_entries.date", startDate.toISOString().split("T")[0])
        .lte("journal_entries.date", endDate.toISOString().split("T")[0]);

      if (error) {
        console.error("Error fetching monthly data:", error);
        continue;
      }

      let revenue = 0;
      let expenses = 0;

      monthData?.forEach((line: any) => {
        const account = line.account_catalog;
        let amount = 0;

        if (account.nature === "debit") {
          amount = (line.debit_amount || 0) - (line.credit_amount || 0);
        } else {
          amount = (line.credit_amount || 0) - (line.debit_amount || 0);
        }

        if (account.account_type === "revenue") {
          revenue += amount;
        } else if (account.account_type === "expense") {
          expenses += amount;
        }
      });

      months.push({
        name: monthName,
        ingresos: revenue,
        gastos: expenses,
      });
    }

    return months;
  } catch (error) {
    console.error("Error fetching monthly chart data:", error);
    return [];
  }
}
