// lib/services/index.ts

// Auth Service
export {
  getCurrentUser,
  isAuthenticated,
  getUserProfile,
} from "./auth-service";

// Period Service
export {
  getCurrentPeriod,
  getUserPeriods,
  getPeriodById,
  createPeriod,
  getRecentPeriods,
  type Period,
} from "./period-service";

// Account Service
export {
  getCatalogAccounts,
  getCatalogAccountByCode,
  getOrCreateAccount,
  getActiveAccounts,
  getAccountBalances,
  getAccountsByType,
  searchAccounts,
  refreshAccountBalances,
  type Account,
  type AccountBalance,
  type CatalogAccount,
} from "./account-service";

// Transaction Service
export {
  createTransaction,
  getRecentTransactions,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
  getTransactionsByDateRange,
  type Transaction,
  type TransactionDetail,
  type TransactionInput,
} from "./transaction-service";

// Reports Service
export {
  getBalanceSheet,
  getIncomeStatement,
  getTAccountMovements,
  getAllTAccounts,
  calculateNetIncome,
  getExecutiveSummary,
  type FinancialStatement,
  type FinancialSection,
  type TAccountEntry,
} from "./reports-service";

// Dashboard Service
export {
  getDashboardMetrics,
  getMonthlyChartData,
  getAccountSummary,
  type DashboardMetrics,
  type ChartDataPoint,
} from "./dashboard-service";

// Closing Service
export {
  closePeriod,
  reopenPeriod,
  getPeriodsClosingStatus,
  type ClosingResult,
} from "./closing-service";
