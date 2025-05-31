export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Define the database schema types based on the new simplified tables
export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: Account;
        Insert: Omit<Account, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Account, "id" | "created_at" | "updated_at">>;
        Update: Partial<Account>;
      };
      periods: {
        Row: Period;
        Insert: Omit<Period, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Period, "id" | "created_at" | "updated_at">>;
        Update: Partial<Period>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Transaction, "id" | "created_at" | "updated_at">>;
        Update: Partial<Transaction>;
      };
      transaction_details: {
        Row: TransactionDetail;
        Insert: Omit<TransactionDetail, "id" | "created_at" | "updated_at"> &
          Partial<Pick<TransactionDetail, "id" | "created_at" | "updated_at">>;
        Update: Partial<TransactionDetail>;
      };
    };
    Views: {
      balance_sheet: {
        Row: BalanceSheetRow;
      };
      income_statement: {
        Row: IncomeStatementRow;
      };
      accounts_ledger: {
        Row: AccountsLedgerRow;
      };
    };
    Functions: {
      get_account_name: {
        Args: { account_code: number };
        Returns: string;
      };
      get_account_type: {
        Args: { account_code: number };
        Returns: string;
      };
      get_account_subtype: {
        Args: { account_code: number };
        Returns: string;
      };
      is_parent_account: {
        Args: { account_code: number };
        Returns: boolean;
      };
      account_exists: {
        Args: {
          p_user_id: string;
          p_period_id: string;
          p_account_code: number;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Account
export interface Account {
  id: string;
  user_id: string;
  code: number;
  created_at: string;
  updated_at: string;
  period_id: string;
  is_active: boolean | null;
}

// Period
export interface Period {
  id: string;
  user_id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

// Transaction
export interface Transaction {
  id: string;
  user_id: string | null;
  description: string;
  amount: number;
  date: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  period_id: string;
}

// Transaction Detail
export interface TransactionDetail {
  id: string;
  user_id: string;
  transaction_id: string;
  account_id: string;
  debit: number;
  credit: number;
  total: number;
  created_at: string;
  updated_at: string;
}

// View Types
export interface BalanceSheetRow {
  period_name: string | null;
  code: number | null;
  account_name: string | null;
  account_type: string | null;
  account_subtype: string | null;
  balance: number | null;
  is_parent_account: boolean | null;
}

export interface IncomeStatementRow {
  period_name: string | null;
  code: number | null;
  account_name: string | null;
  account_type: string | null;
  amount: number | null;
  is_parent_account: boolean | null;
}

export interface AccountsLedgerRow {
  period_name: string | null;
  code: number | null;
  account_name: string | null;
  account_type: string | null;
  debit: number | null;
  credit: number | null;
  transaction_description: string | null;
  transaction_date: string | null;
}
