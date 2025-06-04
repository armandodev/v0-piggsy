// lib/services/closing-service.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth-service";
import { getPeriodById } from "./period-service";
import { getAccountBalances } from "./account-service";
import { createTransaction, TransactionInput } from "./transaction-service";
import { calculateNetIncome } from "./reports-service";

export interface ClosingResult {
  success: boolean;
  message: string;
  transactionId?: string;
  netIncome?: number;
}

/**
 * Cierra un período contable
 */
export async function closePeriod(periodId: string): Promise<ClosingResult> {
  try {
    const user = await getCurrentUser();
    const period = await getPeriodById(periodId);

    if (!period) {
      return {
        success: false,
        message: "Período no encontrado",
      };
    }

    // Verificar que el período no esté ya cerrado
    const existingClosing = await checkPeriodClosed(periodId);
    if (existingClosing) {
      return {
        success: false,
        message: "Este período ya fue cerrado",
      };
    }

    // Calcular utilidad o pérdida del período
    const netIncome = await calculateNetIncome(periodId);

    // Obtener balances de cuentas temporales
    const balances = await getAccountBalances();
    const details: TransactionInput[] = [];

    // Cerrar cuentas de ingresos (cargo)
    const revenues = balances.filter(
      (b) => b.account_type === "INGRESO" && b.balance > 0
    );
    revenues.forEach((rev) => {
      details.push({
        accountCode: rev.code,
        debit: rev.balance,
        credit: 0,
      });
    });

    // Cerrar cuentas de gastos y costos (abono)
    const expenses = balances.filter(
      (b) =>
        (b.account_type === "GASTO" || b.account_type === "COSTO") &&
        b.balance > 0
    );
    expenses.forEach((exp) => {
      details.push({
        accountCode: exp.code,
        debit: 0,
        credit: exp.balance,
      });
    });

    // Registrar utilidad o pérdida
    if (netIncome > 0) {
      details.push({
        accountCode: 3100, // Utilidad del ejercicio
        debit: 0,
        credit: netIncome,
      });
    } else if (netIncome < 0) {
      details.push({
        accountCode: 3110, // Pérdida del ejercicio
        debit: Math.abs(netIncome),
        credit: 0,
      });
    }

    // Verificar que haya movimientos para cerrar
    if (details.length === 0) {
      return {
        success: false,
        message: "No hay movimientos para cerrar en este período",
      };
    }

    // Crear transacción de cierre
    const closeDate = new Date().toISOString().split("T")[0];
    const result = await createTransaction(
      `Cierre del período ${period.name}`,
      closeDate,
      details,
      "CIERRE"
    );

    if (result.success) {
      return {
        success: true,
        message: `Período cerrado exitosamente. ${netIncome >= 0 ? "Utilidad" : "Pérdida"}: ${formatCurrency(Math.abs(netIncome))}`,
        transactionId: result.transactionId,
        netIncome,
      };
    } else {
      return {
        success: false,
        message: result.error || "Error al crear la transacción de cierre",
      };
    }
  } catch (error) {
    console.error("Error en closePeriod:", error);
    return {
      success: false,
      message: "Error al cerrar el período",
    };
  }
}

/**
 * Verifica si un período ya fue cerrado
 */
async function checkPeriodClosed(periodId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("period_id", periodId)
      .eq("transaction_type", "CIERRE")
      .eq("status", true)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error("Error verificando cierre:", error);
    return false;
  }
}

/**
 * Revierte el cierre de un período
 */
export async function reopenPeriod(periodId: string): Promise<ClosingResult> {
  try {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Buscar la transacción de cierre
    const { data: closingTransaction, error } = await supabase
      .from("transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("period_id", periodId)
      .eq("transaction_type", "CIERRE")
      .eq("status", true)
      .single();

    if (error || !closingTransaction) {
      return {
        success: false,
        message: "No se encontró transacción de cierre para este período",
      };
    }

    // Desactivar la transacción de cierre
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ status: false })
      .eq("id", closingTransaction.id);

    if (updateError) throw updateError;

    // Refrescar balances
    await supabase.rpc("refresh_account_balances");

    return {
      success: true,
      message: "Período reabierto exitosamente",
    };
  } catch (error) {
    console.error("Error en reopenPeriod:", error);
    return {
      success: false,
      message: "Error al reabrir el período",
    };
  }
}

/**
 * Obtiene el estado de cierre de múltiples períodos
 */
export async function getPeriodsClosingStatus(
  periodIds: string[]
): Promise<{ [key: string]: boolean }> {
  try {
    const user = await getCurrentUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("period_id")
      .eq("user_id", user.id)
      .in("period_id", periodIds)
      .eq("transaction_type", "CIERRE")
      .eq("status", true);

    if (error) throw error;

    const closedPeriods = new Set(data?.map((t) => t.period_id) || []);
    const status: { [key: string]: boolean } = {};

    periodIds.forEach((id) => {
      status[id] = closedPeriods.has(id);
    });

    return status;
  } catch (error) {
    console.error("Error obteniendo estado de cierre:", error);
    return {};
  }
}

// Función auxiliar para formatear moneda
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}
