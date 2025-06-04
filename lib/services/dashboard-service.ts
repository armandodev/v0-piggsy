// lib/services/dashboard-service.ts
"use server";

import { getRecentPeriods } from "./period-service";
import { getAccountBalances } from "./account-service";
import { getExecutiveSummary } from "./reports-service";

export interface DashboardMetrics {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netIncome: number;
  currentRatio: number;
  workingCapital: number;
}

export interface ChartDataPoint {
  name: string;
  ingresos: number;
  gastos: number;
}

/**
 * Obtiene las métricas principales del dashboard
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const summary = await getExecutiveSummary();

    if (!summary) {
      return {
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        netIncome: 0,
        currentRatio: 0,
        workingCapital: 0,
      };
    }

    return {
      totalAssets: summary.totals.assets,
      totalLiabilities: summary.totals.liabilities,
      totalEquity: summary.totals.equity,
      monthlyRevenue: summary.totals.revenue,
      monthlyExpenses: summary.totals.expenses,
      netIncome: summary.metrics.netIncome,
      currentRatio: summary.metrics.currentRatio,
      workingCapital: summary.metrics.workingCapital,
    };
  } catch (error) {
    console.error("Error en getDashboardMetrics:", error);
    return {
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      netIncome: 0,
      currentRatio: 0,
      workingCapital: 0,
    };
  }
}

/**
 * Obtiene los datos para el gráfico de tendencias mensuales
 */
export async function getMonthlyChartData(): Promise<ChartDataPoint[]> {
  try {
    const periods = await getRecentPeriods(6);
    const chartData: ChartDataPoint[] = [];

    for (const period of periods.reverse()) {
      const summary = await getExecutiveSummary(period.id);

      if (summary) {
        chartData.push({
          name: period.name.split(" ")[0], // Solo el mes
          ingresos: summary.totals.revenue,
          gastos: summary.totals.expenses,
        });
      }
    }

    return chartData;
  } catch (error) {
    console.error("Error en getMonthlyChartData:", error);
    return [];
  }
}

/**
 * Obtiene un resumen de cuentas con saldo
 */
export async function getAccountSummary() {
  try {
    const balances = await getAccountBalances();

    // Filtrar solo cuentas con saldo significativo
    return balances.filter((account) => Math.abs(account.balance) > 0.01);
  } catch (error) {
    console.error("Error en getAccountSummary:", error);
    return [];
  }
}
