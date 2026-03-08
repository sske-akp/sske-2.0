"use client";

import React, { useState } from "react";
import { useTrialBalance } from "@/hooks/accountingHooks";
import { TrialBalanceRow } from "@/types/accounting";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { CalendarIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

const accountTypeLabels: Record<string, string> = {
  asset: "Assets",
  liability: "Liabilities",
  equity: "Equity",
  income: "Income",
  expense: "Expenses",
};

function groupByType(accounts: TrialBalanceRow[]) {
  const groups: Record<string, TrialBalanceRow[]> = {};
  for (const a of accounts) {
    const type = a.accountType;
    if (!groups[type]) groups[type] = [];
    groups[type].push(a);
  }
  return groups;
}

function exportCSV(accounts: TrialBalanceRow[], asOf: string) {
  const header = "Account Code,Account Name,Account Type,Debit,Credit,Balance";
  const rows = accounts.map(
    (a) =>
      `"${a.accountCode}","${a.accountName}","${a.accountType}",${a.totalDebit},${a.totalCredit},${a.balance}`
  );
  const totalDebit = accounts.reduce((s, a) => s + a.totalDebit, 0);
  const totalCredit = accounts.reduce((s, a) => s + a.totalCredit, 0);
  rows.push(`"","TOTAL","",${totalDebit},${totalCredit},${totalDebit - totalCredit}`);

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trial-balance-${asOf}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TrialBalancePage() {
  const [asOfDate, setAsOfDate] = useState<Date | undefined>(undefined);
  const asOfStr = asOfDate ? format(asOfDate, "yyyy-MM-dd") : undefined;
  const { data, isLoading, isError } = useTrialBalance(asOfStr);

  const grouped = data ? groupByType(data.accounts) : {};
  const typeOrder = ["asset", "liability", "equity", "income", "expense"];

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Trial Balance
      </h1>
      <div className="p-5 space-y-4">
        {/* Filters */}
        <div className="flex items-end gap-3">
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
                {data.isBalanced ? "Balanced" : "NOT Balanced"}
              </Badge>
            )}
            <Button
              variant="outline"
              disabled={!data || data.accounts.length === 0}
              onClick={() =>
                data && exportCSV(data.accounts, data.asOf)
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">
            Loading trial balance...
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-destructive">
            Failed to load trial balance.
          </div>
        ) : data ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typeOrder.map((type) => {
                  const rows = grouped[type];
                  if (!rows || rows.length === 0) return null;
                  return (
                    <React.Fragment key={type}>
                      <TableRow className="bg-muted/50">
                        <TableCell
                          colSpan={4}
                          className="font-semibold text-sm"
                        >
                          {accountTypeLabels[type] ?? type}
                        </TableCell>
                      </TableRow>
                      {rows.map((row) => (
                        <TableRow key={row.accountCode}>
                          <TableCell className="font-mono text-sm pl-6">
                            {row.accountCode}
                          </TableCell>
                          <TableCell>{row.accountName}</TableCell>
                          <TableCell className="text-right font-mono">
                            {row.totalDebit > 0
                              ? formatINR(row.totalDebit)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {row.totalCredit > 0
                              ? formatINR(row.totalCredit)
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })}
                <TableRow className="font-bold border-t-2">
                  <TableCell colSpan={2}>TOTAL</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatINR(data.totalDebit)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatINR(data.totalCredit)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : null}
      </div>
    </>
  );
}
