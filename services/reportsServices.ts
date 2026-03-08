import { DashboardData, HomeDashboardData } from "@/types/reports";
import { fetchCustomers } from "@/services/customersServices";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

interface DashboardAPIResponse {
  sales_metrics: {
    total_revenue: number;
    invoice_count: number;
    revenue_today: number;
    revenue_this_week: number;
    revenue_this_month: number;
  };
  sales_trend: { date: string; revenue: number }[];
  top_products: { product_name: string; quantity_sold: number; revenue: number }[];
  top_customers: { customer_name: string; total_spent: number; invoice_count: number }[];
  stock_health: {
    total_value: number;
    product_count: number;
    low_stock_items: { product_name: string; qty: number }[];
  };
  purchase_vs_sales: {
    total_purchased: number;
    total_sold: number;
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch(`${baseUrl}/reports/dashboard`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  const data: DashboardAPIResponse = await response.json();

  return {
    salesMetrics: {
      totalRevenue: data.sales_metrics.total_revenue,
      invoiceCount: data.sales_metrics.invoice_count,
      revenueToday: data.sales_metrics.revenue_today,
      revenueThisWeek: data.sales_metrics.revenue_this_week,
      revenueThisMonth: data.sales_metrics.revenue_this_month,
    },
    salesTrend: data.sales_trend.map((p) => ({
      date: p.date,
      revenue: p.revenue,
    })),
    topProducts: data.top_products.map((p) => ({
      productName: p.product_name,
      quantitySold: p.quantity_sold,
      revenue: p.revenue,
    })),
    topCustomers: data.top_customers.map((c) => ({
      customerName: c.customer_name,
      totalSpent: c.total_spent,
      invoiceCount: c.invoice_count,
    })),
    stockHealth: {
      totalValue: data.stock_health.total_value,
      productCount: data.stock_health.product_count,
      lowStockItems: data.stock_health.low_stock_items.map((item) => ({
        productName: item.product_name,
        qty: item.qty,
      })),
    },
    purchaseVsSales: {
      totalPurchased: data.purchase_vs_sales.total_purchased,
      totalSold: data.purchase_vs_sales.total_sold,
    },
  };
}

interface HomeAPIResponse {
  today_sales: { count: number; total_revenue: number };
  pending_payments: { count: number; total_outstanding: number };
  low_stock_alerts: { product_id: string; product_name: string; remaining_qty: number }[];
  overdue_invoices_count: number;
  last_invoices: {
    id: string;
    invoice_number: string;
    customer_id: string | null;
    total_amount: number;
    payment_status: string;
    invoice_date: string | null;
  }[];
  last_payments: {
    id: string;
    invoice_id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
  }[];
  top_overdue_customers: {
    customer_id: string;
    customer_name: string;
    overdue_count: number;
    total_overdue: number;
  }[];
}

export async function fetchHomeDashboard(): Promise<HomeDashboardData> {
  const [homeRes, customers] = await Promise.all([
    fetch(`${baseUrl}/reports/home`),
    fetchCustomers(),
  ]);

  if (!homeRes.ok) {
    throw new Error("Failed to fetch home dashboard");
  }

  const data: HomeAPIResponse = await homeRes.json();
  const customerMap = new Map(customers.map((c) => [c.id, c.name]));

  return {
    todaySales: {
      count: data.today_sales.count,
      totalRevenue: data.today_sales.total_revenue,
    },
    pendingPayments: {
      count: data.pending_payments.count,
      totalOutstanding: data.pending_payments.total_outstanding,
    },
    lowStockCount: data.low_stock_alerts.length,
    overdueInvoicesCount: data.overdue_invoices_count,
    lastInvoices: data.last_invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      customerName: inv.customer_id
        ? customerMap.get(inv.customer_id) ?? "Unknown"
        : "Walk-in",
      totalAmount: inv.total_amount,
      paymentStatus: inv.payment_status ?? "unpaid",
      invoiceDate: inv.invoice_date,
    })),
    lastPayments: data.last_payments.map((p) => ({
      id: p.id,
      invoiceId: p.invoice_id,
      amount: p.amount,
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
    })),
    topOverdueCustomers: data.top_overdue_customers.map((c) => ({
      customerId: c.customer_id,
      customerName: c.customer_name,
      overdueCount: c.overdue_count,
      totalOverdue: c.total_overdue,
    })),
  };
}
