export interface SalesMetrics {
  totalRevenue: number;
  invoiceCount: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
}

export interface SalesTrendPoint {
  date: string;
  revenue: number;
}

export interface TopProduct {
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface TopCustomer {
  customerName: string;
  totalSpent: number;
  invoiceCount: number;
}

export interface LowStockItem {
  productName: string;
  qty: number;
}

export interface StockHealthMetrics {
  totalValue: number;
  productCount: number;
  lowStockItems: LowStockItem[];
}

export interface DashboardData {
  salesMetrics: SalesMetrics;
  salesTrend: SalesTrendPoint[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
  stockHealth: StockHealthMetrics;
  purchaseVsSales: { totalPurchased: number; totalSold: number };
}

// Home dashboard types (GET /reports/home)

export interface HomeDashboardInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  invoiceDate: string | null;
}

export interface HomeDashboardPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
}

export interface HomeDashboardOverdueCustomer {
  customerId: string;
  customerName: string;
  overdueCount: number;
  totalOverdue: number;
}

export interface HomeDashboardData {
  todaySales: { count: number; totalRevenue: number };
  pendingPayments: { count: number; totalOutstanding: number };
  lowStockCount: number;
  overdueInvoicesCount: number;
  lastInvoices: HomeDashboardInvoice[];
  lastPayments: HomeDashboardPayment[];
  topOverdueCustomers: HomeDashboardOverdueCustomer[];
}
