// lib/services/reports-service.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth-service";
import { getCurrentPeriod, getPeriodById } from "./period-service";

export interface FinancialStatement {
  period_name: string;
  period_id: string;
  sections: FinancialSection[];
  total: number;
}

export interface FinancialSection {
  code: number;
  name: string;
  level: number;
  accounts: AccountBalance[];
  subtotal: number;
}

export interface AccountBalance {
  id: string;
  code: number;
  name: string;
  account_type: string;
  level: number;
  balance: number;
  total_debit: number;
  total_credit: number;
}

export interface TAccountEntry {
  id: string;
  date: string;
  description: string;
  reference_number: string | null;
  debit: number;
  credit: number;
  account_code: number;
  account_name: string;
  running_balance: number;
}

/**
 * Genera el Balance General
 */
export async function getBalanceSheet(
  periodId?: string
): Promise<FinancialStatement> {
  try {
    const user = await getCurrentUser();
    const period = periodId
      ? await getPeriodById(periodId)
      : await getCurrentPeriod();
    if (!period) throw new Error("Período no encontrado");

    const supabase = await createClient();

    // Obtener datos del balance general
    const { data: balanceData, error } = await supabase
      .from("balance_sheet_v2")
      .select("*")
      .eq("user_id", user.id)
      .eq("period_id", period.id)
      .order("sort_order")
      .order("code");

    if (error) throw error;

    // Organizar por secciones
    const sections: FinancialSection[] = [];
    let currentSection: FinancialSection | null = null;
    let totalAssets = 0;
    let totalLiabilitiesEquity = 0;

    balanceData?.forEach((item) => {
      // Si es cuenta de nivel 1, es una nueva sección
      if (item.level === 1) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          code: item.code,
          name: item.name,
          level: item.level,
          accounts: [],
          subtotal: 0,
        };
      } else if (currentSection && item.level === 3) {
        // Solo agregar cuentas de detalle (nivel 3)
        currentSection.accounts.push({
          id: `${item.code}`,
          code: item.code,
          name: item.name,
          account_type: item.account_type,
          level: item.level,
          balance: Number(item.balance),
          total_debit: 0,
          total_credit: 0,
        });

        currentSection.subtotal += Number(item.balance);

        if (item.account_type === "ACTIVO") {
          totalAssets += Number(item.balance);
        } else {
          totalLiabilitiesEquity += Number(item.balance);
        }
      }
    });

    // Agregar última sección
    if (currentSection) {
      sections.push(currentSection);
    }

    return {
      period_name: period.name,
      period_id: period.id,
      sections,
      total: totalAssets,
    };
  } catch (error) {
    console.error("Error en getBalanceSheet:", error);
    return {
      period_name: "",
      period_id: "",
      sections: [],
      total: 0,
    };
  }
}

/**
 * Genera el Estado de Resultados
 */
export async function getIncomeStatement(
  periodId?: string
): Promise<FinancialStatement> {
  try {
    const user = await getCurrentUser();
    const period = periodId
      ? await getPeriodById(periodId)
      : await getCurrentPeriod();
    if (!period) throw new Error("Período no encontrado");

    const supabase = await createClient();

    // Obtener datos del estado de resultados
    const { data: incomeData, error } = await supabase
      .from("income_statement_v2")
      .select("*")
      .eq("user_id", user.id)
      .eq("period_id", period.id)
      .order("sort_order")
      .order("code");

    if (error) throw error;

    // Organizar por secciones
    const sections: FinancialSection[] = [];
    const ingresos: AccountBalance[] = [];
    const costos: AccountBalance[] = [];
    const gastos: AccountBalance[] = [];

    let totalIncome = 0;
    let totalExpenses = 0;

    incomeData?.forEach((item) => {
      if (item.level === 3) {
        // Solo cuentas de detalle
        const account: AccountBalance = {
          id: `${item.code}`,
          code: item.code,
          name: item.name,
          account_type: item.account_type,
          level: item.level,
          balance: Number(item.amount),
          total_debit: 0,
          total_credit: 0,
        };

        switch (item.account_type) {
          case "INGRESO":
            ingresos.push(account);
            totalIncome += Number(item.amount);
            break;
          case "COSTO":
            costos.push(account);
            totalExpenses += Number(item.amount);
            break;
          case "GASTO":
            gastos.push(account);
            totalExpenses += Number(item.amount);
            break;
        }
      }
    });

    // Crear secciones
    if (ingresos.length > 0) {
      sections.push({
        code: 4000,
        name: "INGRESOS",
        level: 1,
        accounts: ingresos,
        subtotal: ingresos.reduce((sum, acc) => sum + acc.balance, 0),
      });
    }

    if (costos.length > 0) {
      sections.push({
        code: 5100,
        name: "COSTO DE VENTAS",
        level: 1,
        accounts: costos,
        subtotal: costos.reduce((sum, acc) => sum + acc.balance, 0),
      });
    }

    if (gastos.length > 0) {
      sections.push({
        code: 5200,
        name: "GASTOS DE OPERACIÓN",
        level: 1,
        accounts: gastos,
        subtotal: gastos.reduce((sum, acc) => sum + acc.balance, 0),
      });
    }

    const netIncome = totalIncome - totalExpenses;

    return {
      period_name: period.name,
      period_id: period.id,
      sections,
      total: netIncome,
    };
  } catch (error) {
    console.error("Error en getIncomeStatement:", error);
    return {
      period_name: "",
      period_id: "",
      sections: [],
      total: 0,
    };
  }
}

/**
 * Obtiene los movimientos de una cuenta T
 */
export async function getTAccountMovements(
  accountCode: number,
  periodId?: string
): Promise<TAccountEntry[]> {
  try {
    const user = await getCurrentUser();
    const period = periodId
      ? await getPeriodById(periodId)
      : await getCurrentPeriod();
    if (!period) throw new Error("Período no encontrado");

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("t_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("period_id", period.id)
      .eq("code", accountCode)
      .order("transaction_date")
      .order("transaction_date");

    if (error) throw error;

    return (data || []).map((item) => ({
      id: `${item.code}-${item.transaction_date}`,
      date: item.transaction_date,
      description: item.description,
      reference_number: item.reference_number,
      debit: Number(item.debit) || 0,
      credit: Number(item.credit) || 0,
      account_code: item.code,
      account_name: item.account_name,
      running_balance: Number(item.running_balance) || 0,
    }));
  } catch (error) {
    console.error("Error en getTAccountMovements:", error);
    return [];
  }
}

/**
 * Obtiene todas las cuentas T con movimientos
 */
export async function getAllTAccounts(
  periodId?: string
): Promise<{ [key: number]: TAccountEntry[] }> {
  try {
    const user = await getCurrentUser();
    const period = periodId
      ? await getPeriodById(periodId)
      : await getCurrentPeriod();
    if (!period) throw new Error("Período no encontrado");

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("t_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("period_id", period.id)
      .order("code")
      .order("transaction_date");

    if (error) throw error;

    // Agrupar por código de cuenta
    const groupedAccounts: { [key: number]: TAccountEntry[] } = {};

    data?.forEach((item) => {
      const accountCode = item.code;
      if (!groupedAccounts[accountCode]) {
        groupedAccounts[accountCode] = [];
      }

      groupedAccounts[accountCode].push({
        id: `${item.code}-${item.transaction_date}`,
        date: item.transaction_date,
        description: item.description,
        reference_number: item.reference_number,
        debit: Number(item.debit) || 0,
        credit: Number(item.credit) || 0,
        account_code: item.code,
        account_name: item.account_name,
        running_balance: Number(item.running_balance) || 0,
      });
    });

    return groupedAccounts;
  } catch (error) {
    console.error("Error en getAllTAccounts:", error);
    return {};
  }
}

/**
 * Calcula la utilidad neta del período
 */
export async function calculateNetIncome(periodId?: string): Promise<number> {
  try {
    const user = await getCurrentUser();
    const period = periodId
      ? await getPeriodById(periodId)
      : await getCurrentPeriod();
    if (!period) throw new Error("Período no encontrado");

    const supabase = await createClient();

    const { data: result, error } = await supabase.rpc("calculate_net_income", {
      p_user_id: user.id,
      p_period_id: period.id,
    });

    if (error) throw error;
    return Number(result) || 0;
  } catch (error) {
    console.error("Error calculando utilidad neta:", error);
    return 0;
  }
}

/**
 * Genera un resumen ejecutivo del período
 */
export async function getExecutiveSummary(periodId?: string) {
  try {
    const user = await getCurrentUser();
    const period = periodId
      ? await getPeriodById(periodId)
      : await getCurrentPeriod();
    if (!period) throw new Error("Período no encontrado");

    const supabase = await createClient();

    // Obtener métricas clave
    const { data: balances, error } = await supabase
      .from("account_balances")
      .select("account_type, balance")
      .eq("user_id", user.id)
      .eq("period_id", period.id)
      .eq("is_detail", true);

    if (error) throw error;

    // Calcular totales por tipo
    const totals = {
      assets: 0,
      liabilities: 0,
      equity: 0,
      revenue: 0,
      expenses: 0,
      currentAssets: 0,
      currentLiabilities: 0,
    };

    // Obtener cuentas específicas para activos y pasivos circulantes
    const { data: detailedBalances } = await supabase
      .from("account_balances")
      .select("code, account_type, balance")
      .eq("user_id", user.id)
      .eq("period_id", period.id)
      .eq("is_detail", true);

    detailedBalances?.forEach((account) => {
      const balance = Number(account.balance) || 0;

      switch (account.account_type) {
        case "ACTIVO":
          totals.assets += balance;
          if (account.code >= 1100 && account.code < 1200) {
            totals.currentAssets += balance;
          }
          break;
        case "PASIVO":
          totals.liabilities += balance;
          if (account.code >= 2100 && account.code < 2200) {
            totals.currentLiabilities += balance;
          }
          break;
        case "CAPITAL":
          totals.equity += balance;
          break;
        case "INGRESO":
          totals.revenue += balance;
          break;
        case "GASTO":
        case "COSTO":
          totals.expenses += balance;
          break;
      }
    });

    // Calcular métricas
    const netIncome = totals.revenue - totals.expenses;
    const currentRatio =
      totals.currentLiabilities > 0
        ? totals.currentAssets / totals.currentLiabilities
        : 0;
    const workingCapital = totals.currentAssets - totals.currentLiabilities;
    const debtToEquity =
      totals.equity > 0 ? totals.liabilities / totals.equity : 0;
    const returnOnEquity =
      totals.equity > 0 ? (netIncome / totals.equity) * 100 : 0;
    const profitMargin =
      totals.revenue > 0 ? (netIncome / totals.revenue) * 100 : 0;

    return {
      period: period.name,
      totals,
      metrics: {
        netIncome,
        currentRatio,
        workingCapital,
        debtToEquity,
        returnOnEquity,
        profitMargin,
      },
    };
  } catch (error) {
    console.error("Error generando resumen ejecutivo:", error);
    return null;
  }
}
