"use server";

import { createClient } from "@/lib/supabase/server";

// Tipos simples y claros
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

// Helper para obtener el usuario actual
async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Usuario no autenticado");
  }

  return user;
}

// Función para obtener el nombre de la cuenta basado en el código
function getAccountName(code: number): string {
  const accountNames: Record<number, string> = {
    // Activos
    110101: "Caja",
    110201: "Bancos",
    110301: "Inversiones temporales",
    110401: "Clientes",
    110501: "Documentos por cobrar",
    110601: "Deudores diversos",

    // Pasivos
    210101: "Proveedores",
    210201: "Documentos por pagar",
    210301: "Acreedores diversos",

    // Capital
    310101: "Capital social",
    310201: "Reserva legal",

    // Ingresos
    410101: "Ventas",
    410201: "Productos financieros",

    // Gastos
    510101: "Costo de ventas",
    510201: "Gastos de venta",
    510301: "Gastos de administración",
    510401: "Gastos financieros",
  };

  return accountNames[code] || `Cuenta ${code}`;
}

// Función para obtener el tipo de cuenta basado en el código
function getAccountType(code: number): string {
  const firstDigit = Math.floor(code / 100000);

  switch (firstDigit) {
    case 1:
      return "asset";
    case 2:
      return "liability";
    case 3:
      return "equity";
    case 4:
      return "revenue";
    case 5:
      return "expense";
    default:
      return "other";
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Obtener todas las transacciones del usuario con sus detalles
    const { data: transactions, error } = await supabase
      .from("transaction_details")
      .select(
        `
        debit,
        credit,
        accounts!inner(code)
      `
      )
      .eq("user_id", user.id);

    if (error) throw error;

    // Inicializar contadores
    let totalAssets = 0;
    let totalLiabilities = 0;
    let monthlyRevenue = 0;
    let monthlyExpenses = 0;

    // Procesar cada transacción
    transactions?.forEach((detail) => {
      const code = detail.accounts?.code;
      if (!code) return;

      const accountType = getAccountType(code);
      const debit = Number(detail.debit) || 0;
      const credit = Number(detail.credit) || 0;

      switch (accountType) {
        case "asset":
          totalAssets += debit - credit;
          break;
        case "liability":
        case "equity":
          totalLiabilities += credit - debit;
          break;
        case "revenue":
          monthlyRevenue += credit - debit;
          break;
        case "expense":
          monthlyExpenses += debit - credit;
          break;
      }
    });

    return {
      totalAssets,
      totalLiabilities,
      monthlyRevenue,
      monthlyExpenses,
      assetChange: 0,
      liabilityChange: 0,
      revenueChange: 0,
      expenseChange: 0,
    };
  } catch (error) {
    console.error("Error en getDashboardMetrics:", error);
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
  try {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Obtener transacciones recientes con sus detalles
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
          accounts!inner(code)
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", true)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transformar los datos
    return (data || []).map((transaction) => {
      const firstDetail = transaction.transaction_details[0];
      const code = firstDetail?.accounts?.code || 0;
      const accountType = getAccountType(code);

      return {
        id: transaction.id,
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: accountType === "revenue" ? "income" : "expense",
        account_name: getAccountName(code),
        account_code: code,
      };
    });
  } catch (error) {
    console.error("Error en getRecentTransactions:", error);
    return [];
  }
}

export async function getAccountSummary(): Promise<AccountBalance[]> {
  try {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Obtener cuentas con sus balances
    const { data, error } = await supabase
      .from("accounts")
      .select(
        `
        id,
        code,
        transaction_details(debit, credit)
      `
      )
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (error) throw error;

    // Calcular balances y filtrar cuentas con saldo
    const accountBalances: AccountBalance[] = [];

    data?.forEach((account) => {
      let balance = 0;

      account.transaction_details?.forEach((detail) => {
        balance += (Number(detail.debit) || 0) - (Number(detail.credit) || 0);
      });

      if (Math.abs(balance) > 0.01) {
        accountBalances.push({
          id: account.id,
          code: account.code,
          name: getAccountName(account.code),
          account_type: getAccountType(account.code),
          balance,
        });
      }
    });

    // Ordenar por código de cuenta
    return accountBalances.sort((a, b) => a.code - b.code);
  } catch (error) {
    console.error("Error en getAccountSummary:", error);
    return [];
  }
}

export async function getMonthlyChartData() {
  try {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Por ahora, retornar datos de ejemplo
    // En producción, esto debería agregarse por mes
    const currentMonth = new Date().getMonth();
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    // Crear array con los últimos 6 meses
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      chartData.push({
        name: months[monthIndex],
        ingresos: 0,
        gastos: 0,
      });
    }

    // Obtener transacciones de los últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(
        `
        date,
        transaction_details!inner(
          debit,
          credit,
          accounts!inner(code)
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", true)
      .gte("date", sixMonthsAgo.toISOString().split("T")[0]);

    if (error) throw error;

    // Agregar datos reales si existen
    transactions?.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const monthDiff = currentMonth - transactionDate.getMonth();
      const chartIndex = 5 - monthDiff;

      if (chartIndex >= 0 && chartIndex < 6) {
        transaction.transaction_details.forEach((detail) => {
          const code = detail.accounts?.code;
          if (!code) return;

          const accountType = getAccountType(code);
          const amount = Number(detail.credit) || Number(detail.debit) || 0;

          if (accountType === "revenue") {
            chartData[chartIndex].ingresos += amount;
          } else if (accountType === "expense") {
            chartData[chartIndex].gastos += amount;
          }
        });
      }
    });

    return chartData;
  } catch (error) {
    console.error("Error en getMonthlyChartData:", error);
    return [];
  }
}
