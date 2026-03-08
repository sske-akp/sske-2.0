"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboard } from "@/hooks/reportsHooks";
import {
  IndianRupee,
  FileText,
  Package,
  AlertTriangle,
} from "lucide-react";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ReportsPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-destructive">
        Failed to load dashboard. Make sure the backend is running.
      </div>
    );
  }

  if (!data) return null;

  const { salesMetrics, salesTrend, topProducts, topCustomers, stockHealth, purchaseVsSales } = data;
  const grossMargin = purchaseVsSales.totalSold - purchaseVsSales.totalPurchased;

  return (
    <div className="p-5 space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight">
        Dashboard
      </h1>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(salesMetrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              This month: {formatINR(salesMetrics.revenueThisMonth)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesMetrics.invoiceCount}</div>
            <p className="text-xs text-muted-foreground">
              Today: {formatINR(salesMetrics.revenueToday)} | Week: {formatINR(salesMetrics.revenueThisWeek)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(stockHealth.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {stockHealth.productCount} products in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stockHealth.lowStockItems.length > 0 ? "text-destructive" : ""}`}>
              {stockHealth.lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Products with 5 or fewer units
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Sales Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                className="text-xs"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                className="text-xs"
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => [formatINR(value as number), "Revenue"]}
                labelFormatter={(d) => new Date(d as string).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row 3: Top Products + Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="productName"
                    width={150}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v.length > 25 ? v.slice(0, 25) + "..." : v}
                  />
                  <Tooltip
                    formatter={(value) => [formatINR(value as number), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No sales data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.customerName}</TableCell>
                      <TableCell className="text-right">{formatINR(c.totalSpent)}</TableCell>
                      <TableCell className="text-right">{c.invoiceCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No customer data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Low Stock + Purchase vs Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            {stockHealth.lowStockItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockHealth.lowStockItems.slice(0, 15).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className={`text-right font-medium ${item.qty <= 0 ? "text-destructive" : "text-orange-500"}`}>
                        {item.qty}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">
                All products have sufficient stock
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Purchase vs Sales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Purchased</span>
                <span className="font-medium">{formatINR(purchaseVsSales.totalPurchased)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Sold</span>
                <span className="font-medium">{formatINR(purchaseVsSales.totalSold)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Gross Margin</span>
                  <span className={`text-lg font-bold ${grossMargin >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {formatINR(grossMargin)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
