"use client";

import React, { useState } from "react";
import { useBalanceSheet } from "@/hooks/accountingHooks";
import { BalanceSheetLineItem } from "@/types/accounting";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

function SectionTable({
  items,
  total,
  emptyText,
}: {
  items: BalanceSheetLineItem[];
  total: number;
  emptyText: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length > 0 ? (
          items.map((item) => (
            <TableRow key={item.accountCode}>
              <TableCell>
                <span className="font-mono text-sm mr-2">
                  {item.accountCode}
                </span>
                {item.accountName}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatINR(item.balance)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={2}
              className="text-center text-muted-foreground"
            >
              {emptyText}
            </TableCell>
          </TableRow>
        )}
        <TableRow className="font-bold border-t-2">
          <TableCell>Subtotal</TableCell>
          <TableCell className="text-right font-mono">
            {formatINR(total)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default function BalanceSheetPage() {
  const [asOfDate, setAsOfDate] = useState<Date | undefined>(undefined);
  const asOfStr = asOfDate ? format(asOfDate, "yyyy-MM-dd") : undefined;
  const { data, isLoading, isError } = useBalanceSheet(asOfStr);

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Balance Sheet
      </h1>
      <div className="p-5 space-y-4">
        {/* Filters */}
        <div className="flex items-end gap-3 print:hidden">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              As of Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[180px] justify-start text-left font-normal",
                    !asOfDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {asOfDate ? format(asOfDate, "dd MMM yyyy") : "Today"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={asOfDate}
                  onSelect={setAsOfDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="ml-auto flex gap-2">
            {data && (
              <Badge
                variant={data.isBalanced ? "default" : "destructive"}
                className="self-center"
              >
                {data.isBalanced
                  ? "Assets = Liabilities + Equity"
                  : "NOT Balanced"}
              </Badge>
            )}
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">
            Loading balance sheet...
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-destructive">
            Failed to load balance sheet.
          </div>
        ) : data ? (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              As of:{" "}
              {new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(data.asOf))}
            </p>

            {/* Assets */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionTable
                  items={data.assets}
                  total={data.totalAssets}
                  emptyText="No assets"
                />
              </CardContent>
            </Card>

            {/* Liabilities */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionTable
                  items={data.liabilities}
                  total={data.totalLiabilities}
                  emptyText="No liabilities"
                />
              </CardContent>
            </Card>

            {/* Equity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionTable
                  items={data.equity}
                  total={data.totalEquity}
                  emptyText="No equity accounts"
                />
              </CardContent>
            </Card>

            {/* Verification */}
            <Card
              className={cn(
                "border-2",
                data.isBalanced
                  ? "border-green-500/30"
                  : "border-red-500/30"
              )}
            >
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Assets
                    </p>
                    <p className="text-lg font-bold font-mono">
                      {formatINR(data.totalAssets)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    =
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Liabilities + Equity
                    </p>
                    <p className="text-lg font-bold font-mono">
                      {formatINR(data.totalLiabilities + data.totalEquity)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </>
  );
}
