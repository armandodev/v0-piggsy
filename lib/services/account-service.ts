// lib/services/account-service.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth-service";
import { getCurrentPeriod } from "./period-service";

export interface Account {
  id: string;
  code: number;
  name: string;
  account_type: string;
  parent_code: number | null;
  level: number;
  is_detail: boolean;
  is_active: boolean;
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

export interface CatalogAccount {
  code: number;
  name: string;
  account_type: string;
  account_subtype: string;
  parent_code: number | null;
  level: number;
  is_detail: boolean;
  normal_side: string;
}

/**
 * Obtiene todas las cuentas del catálogo
 */
export async function getCatalogAccounts(): Promise<CatalogAccount[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("catalog_accounts")
    .select("*")
    .order("code");

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene una cuenta del catálogo por código
 */
export async function getCatalogAccountByCode(
  code: number
): Promise<CatalogAccount | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("catalog_accounts")
    .select("*")
    .eq("code", code)
    .single();

  if (error) return null;
  return data;
}

/**
 * Obtiene o crea una cuenta para el usuario y período actual
 */
export async function getOrCreateAccount(accountCode: number): Promise<string> {
  const user = await getCurrentUser();
  const period = await getCurrentPeriod();
  const supabase = await createClient();

  const { data: accountId, error } = await supabase.rpc(
    "get_or_create_account",
    {
      p_user_id: user.id,
      p_period_id: period.id,
      p_account_code: accountCode,
    }
  );

  if (error) throw error;
  return accountId;
}

/**
 * Obtiene todas las cuentas activas del usuario para el período actual
 */
export async function getActiveAccounts(): Promise<Account[]> {
  const user = await getCurrentUser();
  const period = await getCurrentPeriod();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("period_id", period.id)
    .eq("is_active", true)
    .order("code");

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene los balances de todas las cuentas
 */
export async function getAccountBalances(): Promise<AccountBalance[]> {
  const user = await getCurrentUser();
  const period = await getCurrentPeriod();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("account_balances")
    .select("*")
    .eq("user_id", user.id)
    .eq("period_id", period.id)
    .eq("is_detail", true)
    .order("code");

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    account_type: item.account_type,
    level: item.level,
    balance: Number(item.balance),
    total_debit: Number(item.total_debit),
    total_credit: Number(item.total_credit),
  }));
}

/**
 * Obtiene cuentas por tipo
 */
export async function getAccountsByType(
  accountType: string
): Promise<AccountBalance[]> {
  const user = await getCurrentUser();
  const period = await getCurrentPeriod();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("account_balances")
    .select("*")
    .eq("user_id", user.id)
    .eq("period_id", period.id)
    .eq("account_type", accountType)
    .eq("is_detail", true)
    .order("code");

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    account_type: item.account_type,
    level: item.level,
    balance: Number(item.balance),
    total_debit: Number(item.total_debit),
    total_credit: Number(item.total_credit),
  }));
}

/**
 * Busca cuentas por nombre o código
 */
export async function searchAccounts(query: string): Promise<Account[]> {
  const user = await getCurrentUser();
  const period = await getCurrentPeriod();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("period_id", period.id)
    .eq("is_active", true)
    .or(`name.ilike.%${query}%,code.eq.${parseInt(query) || 0}`)
    .order("code")
    .limit(10);

  if (error) throw error;
  return data || [];
}

/**
 * Refresca la vista materializada de balances
 */
export async function refreshAccountBalances(): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("refresh_account_balances");
}
