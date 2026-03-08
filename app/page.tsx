"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeDashboard } from "@/hooks/reportsHooks";
import {
  ShoppingCart,
  Truck,
  CreditCard,
  ClipboardCheck,
  IndianRupee,
  Clock,
  PackageX,
  AlertTriangle,
  ArrowRight,
  FileText,
  Banknote,
} from "lucide-react";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function paymentStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
      return "default";
    case "partial":
      return "secondary";
    case "unpaid":
      return "destructive";
    default:
      return "outline";
  }
}

function DashboardSkeleton() {
  return (
    <div className="p-5 space-y-6">
      <Skeleton className="h-8 w-48" />

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Recent activity skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>

      {/* Overdue skeleton */}
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

const quickActions = [
  {
    label: "New Sale",
    href: "/sales/new",
    icon: ShoppingCart,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-900",
  },
  {
    label: "New Purchase",
    href: "/purchases/new",
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-900",
  },
  {
    label: "Record Payment",
    href: "/sales/all",
    icon: CreditCard,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-900",
  },
  {
    label: "Stock Audit",
    href: "/stock/audit",
    icon: ClipboardCheck,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900",
  },
];

export default function Home() {
  const { data, isLoading, isError } = useHomeDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-destructive">
        Failed to load dashboard. Make sure the backend is running.
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-5 space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight">
        Dashboard
      </h1>

      {/* Row 1: Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card
              className={`cursor-pointer border ${action.border} ${action.bg} transition-all hover:shadow-md hover:scale-[1.02]`}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <action.icon className={`h-8 w-8 ${action.color}`} />
                <span className={`text-base font-medium ${action.color}`}>
                  {action.label}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Row 2: Today's Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatINR(data.todaySales.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.todaySales.count} invoice{data.todaySales.count !== 1 ? "s" : ""} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatINR(data.pendingPayments.totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.pendingPayments.count} unpaid invoice{data.pendingPayments.count !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <PackageX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.lowStockCount > 0 ? "text-orange-600" : "text-muted-foreground"}`}>
              {data.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Products with 5 or fewer units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.overdueInvoicesCount > 0 ? "text-red-600" : "text-muted-foreground"}`}>
              {data.overdueInvoicesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Past due date and unpaid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last 5 Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent Invoices
            </CardTitle>
            <Link
              href="/sales/all"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {data.lastInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lastInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Link
                          href={`/sales/${inv.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {inv.invoiceNumber}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(inv.invoiceDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{inv.customerName}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatINR(inv.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={paymentStatusVariant(inv.paymentStatus)}>
                          {inv.paymentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No invoices yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Last 5 Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.lastPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lastPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">
                        {formatDate(p.paymentDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {p.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatINR(p.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No payments yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Overdue Receivables */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Overdue Receivables
          </CardTitle>
          <Link
            href="/reports/"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {data.topOverdueCustomers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Overdue Invoices</TableHead>
                  <TableHead className="text-right">Amount Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topOverdueCustomers.map((c) => (
                  <TableRow key={c.customerId}>
                    <TableCell className="font-medium">{c.customerName}</TableCell>
                    <TableCell className="text-right">{c.overdueCount}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-red-600">
                        {formatINR(c.totalOverdue)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No overdue receivables
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
