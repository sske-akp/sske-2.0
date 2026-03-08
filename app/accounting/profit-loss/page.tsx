"use client";

import React, { useState } from "react";
import { useProfitLoss } from "@/hooks/accountingHooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfMonth } from "date-fns";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

function DatePickerField({
  value,
  onChange,
  placeholder,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[160px] justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}

export default function ProfitLossPage() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    startOfMonth(new Date())
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  const fromStr = dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined;
  const toStr = dateTo ? format(dateTo, "yyyy-MM-dd") : undefined;

  const { data, isLoading, isError } = useProfitLoss(fromStr, toStr);

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Profit & Loss Statement
      </h1>
      <div className="p-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 print:hidden">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              From
            </Label>
            <DatePickerField
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="Start date"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              To
            </Label>
            <DatePickerField
              value={dateTo}
              onChange={setDateTo}
              placeholder="End date"
            />
          </div>
          <div className="ml-auto">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">
            Loading P&L report...
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-destructive">
            Failed to load P&L report.
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Period heading for print */}
            <p className="text-sm text-muted-foreground">
              Period:{" "}
              {new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(data.from))}{" "}
              to{" "}
              {new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(data.to))}
            </p>

            {/* Income */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Income</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.income.length > 0 ? (
                      data.income.map((item) => (
                        <TableRow key={item.accountCode}>
                          <TableCell>
                            <span className="font-mono text-sm mr-2">
                              {item.accountCode}
                            </span>
                            {item.accountName}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatINR(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-muted-foreground"
                        >
                          No income recorded
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total Income</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatINR(data.totalIncome)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.expenses.length > 0 ? (
                      data.expenses.map((item) => (
                        <TableRow key={item.accountCode}>
                          <TableCell>
                            <span className="font-mono text-sm mr-2">
                              {item.accountCode}
                            </span>
                            {item.accountName}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatINR(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-muted-foreground"
                        >
                          No expenses recorded
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total Expenses</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatINR(data.totalExpenses)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Net Profit/Loss */}
            <Card
              className={cn(
                "border-2",
                data.netProfit >= 0
                  ? "border-green-500/30"
                  : "border-red-500/30"
              )}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>
                    {data.netProfit >= 0 ? "Net Profit" : "Net Loss"}
                  </span>
                  <span
                    className={cn(
                      "font-mono",
                      data.netProfit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {formatINR(Math.abs(data.netProfit))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            Select a date range to generate the report.
          </div>
        )}
      </div>
    </>
  );
}
