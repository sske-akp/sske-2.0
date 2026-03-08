// --- API response shapes (snake_case from backend) ---

export interface AccountAPI {
  id: string;
  code: string;
  name: string;
  account_type: string;
  parent_id: string | null;
  is_system: boolean;
  disabled: boolean;
  created_at: string | null;
}

export interface JournalLineAPI {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit: number;
  credit: number;
  description: string | null;
}

export interface JournalEntryAPI {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference_type: string | null;
  reference_id: string | null;
  is_auto: boolean;
  created_at: string | null;
  lines: JournalLineAPI[];
}

// --- Frontend types (camelCase) ---

export interface Account {
  id: string;
  code: string;
  name: string;
  accountType: string;
  parentId: string | null;
  isSystem: boolean;
}

export interface JournalLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string | null;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  referenceType: string | null;
  referenceId: string | null;
  isAuto: boolean;
  createdAt: string | null;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
}

export interface JournalEntryFilters {
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  referenceType?: string;
}

export interface ManualJournalEntryLine {
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

export interface ManualJournalEntryForm {
  entryDate: string;
  description: string;
  referenceType?: string;
  lines: ManualJournalEntryLine[];
}

// --- Report types ---

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  accountType: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface TrialBalanceReport {
  asOf: string;
  accounts: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface ProfitLossLineItem {
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface ProfitLossReport {
  from: string;
  to: string;
  income: ProfitLossLineItem[];
  expenses: ProfitLossLineItem[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export interface BalanceSheetLineItem {
  accountCode: string;
  accountName: string;
  balance: number;
}

export interface BalanceSheetReport {
  asOf: string;
  assets: BalanceSheetLineItem[];
  liabilities: BalanceSheetLineItem[];
  equity: BalanceSheetLineItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
}

export interface AgingRow {
  customerId: string;
  customerName: string;
  current: number;
  days31_60: number;
  days61_90: number;
  days90Plus: number;
  total: number;
}

export interface AgingReceivablesReport {
  asOf: string;
  customers: AgingRow[];
}
