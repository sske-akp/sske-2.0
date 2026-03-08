"use client";

import React from "react";
import { useAgingReceivables } from "@/hooks/accountingHooks";
import { AgingRow } from "@/types/accounting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { cn } from "@/lib/utils";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

function amountClass(value: number) {
  if (value >= 50000) return "text-red-600 font-semibold";
  if (value >= 20000) return "text-orange-600";
  return "";
}

export default function ReceivablesPage() {
  const { data, isLoading, isError } = useAgingReceivables();

  const totals = React.useMemo(() => {
    if (!data) return null;
    return data.customers.reduce(
      (acc, c) => ({
        current: acc.current + c.current,
        days31_60: acc.days31_60 + c.days31_60,
        days61_90: acc.days61_90 + c.days61_90,
        days90Plus: acc.days90Plus + c.days90Plus,
        total: acc.total + c.total,
      }),
      { current: 0, days31_60: 0, days61_90: 0, days90Plus: 0, total: 0 }
    );
  }, [data]);

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Aging Receivables
      </h1>
      <div className="p-5 space-y-4">
        {data && (
          <p className="text-sm text-muted-foreground">
            As of:{" "}
            {new Intl.DateTimeFormat("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(data.asOf))}
          </p>
        )}

        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">
            Loading aging receivables...
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-destructive">
            Failed to load aging receivables.
          </div>
        ) : data && data.customers.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">
                    Current (0-30)
                  </TableHead>
                  <TableHead className="text-right">31-60 days</TableHead>
                  <TableHead className="text-right">61-90 days</TableHead>
                  <TableHead className="text-right">90+ days</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.customers.map((row: AgingRow) => (
                  <TableRow key={row.customerId}>
                    <TableCell>
                      <Link
                        href={`/customers/${row.customerId}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {row.customerName}
                      </Link>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono",
                        amountClass(row.current)
                      )}
                    >
                      {row.current > 0 ? formatINR(row.current) : "-"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono",
                        amountClass(row.days31_60)
                      )}
                    >
                      {row.days31_60 > 0 ? formatINR(row.days31_60) : "-"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono",
                        amountClass(row.days61_90)
                      )}
                    >
                      {row.days61_90 > 0 ? formatINR(row.days61_90) : "-"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono",
                        amountClass(row.days90Plus)
                      )}
                    >
                      {row.days90Plus > 0 ? formatINR(row.days90Plus) : "-"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono font-semibold",
                        amountClass(row.total)
                      )}
                    >
                      {formatINR(row.total)}
                    </TableCell>
                  </TableRow>
                ))}
                {totals && (
                  <TableRow className="font-bold border-t-2 bg-muted/30">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatINR(totals.current)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatINR(totals.days31_60)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatINR(totals.days61_90)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatINR(totals.days90Plus)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatINR(totals.total)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            No outstanding receivables found.
          </div>
        )}
      </div>
    </>
  );
}
