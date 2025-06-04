// lib/services/transaction-service.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "./../supabase/actions/auth";
import { getCurrentPeriod } from "./period-service";
import { getOrCreateAccount, refreshAccountBalances } from "./account-service";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  reference_number: string | null;
  amount: number;
  transaction_type: "DIARIO" | "AJUSTE" | "CIERRE";
  status: boolean;
  created_at: string;
  details?: TransactionDetail[];
}

export interface TransactionDetail {
  id: string;
  account_id: string;
  account_code: number;
  account_name: string;
  debit: number;
  credit: number;
  balance?: number;
}

export interface TransactionInput {
  accountCode: number;
  debit: number;
  credit: number;
}

/**
 * Crea una nueva transacción con sus detalles
 */
export async function createTransaction(
  description: string,
  date: string,
  details: TransactionInput[],
  transactionType: "DIARIO" | "AJUSTE" | "CIERRE" = "DIARIO",
  referenceNumber?: string
) {
  try {
    const user = await getUserProfile();
    const period = await getCurrentPeriod();
    const supabase = await createClient();

    // Validar que la transacción esté balanceada
    const totalDebit = details.reduce((sum, d) => sum + d.debit, 0);
    const totalCredit = details.reduce((sum, d) => sum + d.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(
        `Transacción no balanceada: Débitos=${totalDebit} Créditos=${totalCredit}`
      );
    }

    // Crear transacción principal
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        period_id: period.id,
        description,
        date,
        amount: totalDebit,
        transaction_type: transactionType,
        reference_number: referenceNumber,
        status: true,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Crear detalles de la transacción
    const transactionDetails = [];

    for (const detail of details) {
      // Obtener o crear cuenta
      const accountId = await getOrCreateAccount(detail.accountCode);

      transactionDetails.push({
        user_id: user.id,
        transaction_id: transaction.id,
        account_id: accountId,
        debit: detail.debit,
        credit: detail.credit,
        total: detail.debit || detail.credit,
      });
    }

    const { error: detailsError } = await supabase
      .from("transaction_details")
      .insert(transactionDetails);

    if (detailsError) throw detailsError;

    // Refrescar vista materializada
    await refreshAccountBalances();

    return { success: true, transactionId: transaction.id };
  } catch (error) {
    console.error("Error en createTransaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Obtiene transacciones recientes
 */
export async function getRecentTransactions(
  limit: number = 10
): Promise<Transaction[]> {
  try {
    const user = await getUserProfile();
    const period = await getCurrentPeriod();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        id,
        date,
        description,
        reference_number,
        amount,
        transaction_type,
        status,
        created_at,
        transaction_details!inner(
          id,
          debit,
          credit,
          accounts!inner(code, name, account_type)
        )
      `
      )
      .eq("user_id", user.id)
      .eq("period_id", period.id)
      .eq("status", true)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((transaction) => ({
      ...transaction,
      details: transaction.transaction_details.map((detail: any) => ({
        id: detail.id,
        account_code: detail.accounts.code,
        account_name: detail.accounts.name,
        debit: Number(detail.debit) || 0,
        credit: Number(detail.credit) || 0,
      })),
    }));
  } catch (error) {
    console.error("Error en getRecentTransactions:", error);
    return [];
  }
}

/**
 * Obtiene una transacción por ID
 */
export async function getTransactionById(
  transactionId: string
): Promise<Transaction | null> {
  try {
    const user = await getUserProfile();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        transaction_details!inner(
          id,
          debit,
          credit,
          accounts!inner(code, name)
        )
      `
      )
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .single();

    if (error) return null;

    return {
      ...data,
      details: data.transaction_details.map((detail: any) => ({
        id: detail.id,
        account_code: detail.accounts.code,
        account_name: detail.accounts.name,
        debit: Number(detail.debit) || 0,
        credit: Number(detail.credit) || 0,
      })),
    };
  } catch (error) {
    console.error("Error obteniendo transacción:", error);
    return null;
  }
}

/**
 * Actualiza el estado de una transacción
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: boolean
) {
  try {
    const user = await getUserProfile();
    const supabase = await createClient();

    const { error } = await supabase
      .from("transactions")
      .update({ status })
      .eq("id", transactionId)
      .eq("user_id", user.id);

    if (error) throw error;

    // Refrescar balances
    await refreshAccountBalances();

    return { success: true };
  } catch (error) {
    console.error("Error actualizando transacción:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina una transacción (soft delete)
 */
export async function deleteTransaction(transactionId: string) {
  return updateTransactionStatus(transactionId, false);
}

/**
 * Obtiene transacciones por rango de fechas
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  try {
    const user = await getUserProfile();
    const period = await getCurrentPeriod();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        transaction_details!inner(
          id,
          debit,
          credit,
          accounts!inner(code, name)
        )
      `
      )
      .eq("user_id", user.id)
      .eq("period_id", period.id)
      .eq("status", true)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) throw error;

    return (data || []).map((transaction) => ({
      ...transaction,
      details: transaction.transaction_details.map((detail: any) => ({
        id: detail.id,
        account_code: detail.accounts.code,
        account_name: detail.accounts.name,
        debit: Number(detail.debit) || 0,
        credit: Number(detail.credit) || 0,
      })),
    }));
  } catch (error) {
    console.error("Error obteniendo transacciones por fecha:", error);
    return [];
  }
}
