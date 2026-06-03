"use client";

import React, { useState, useMemo } from "react";
import { useJournalEntries, useAccounts } from "@/hooks/accountingHooks";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDown, ChevronRight, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

const referenceTypes = [
  { value: "all", label: "All Types" },
  { value: "invoice", label: "Invoice" },
  { value: "credit_note", label: "Credit Note" },
  { value: "payment", label: "Payment" },
  { value: "receipt", label: "Receipt" },
  { value: "contra", label: "Contra" },
  { value: "journal", label: "Journal" },
  { value: "purchase", label: "Purchase" },
  { value: "adjustment", label: "Adjustment" },
];

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

export default function DayBookPage() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [refTypeFilter, setRefTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
      dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
      referenceType: refTypeFilter !== "all" ? refTypeFilter : undefined,
    }),
    [dateFrom, dateTo, refTypeFilter]
  );

  const { data: entries, isLoading, isError } = useJournalEntries(filters);
  const { data: accounts } = useAccounts();

  const accountMap = useMemo(() => {
    const m = new Map<string, string>();
    accounts?.forEach((a) => m.set(a.id, `${a.code} - ${a.name}`));
    return m;
  }, [accounts]);

  // Chronological order (oldest -> newest) like a Tally day book.
  const sortedEntries = useMemo(() => {
    if (!entries) return [];
    return [...entries].sort(
      (a, b) =>
        new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    );
  }, [entries]);

  const grandTotal = useMemo(
    () => sortedEntries.reduce((s, e) => s + e.totalDebit, 0),
    [sortedEntries]
  );

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Day Book
      </h1>
      <div className="p-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
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
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Type
            </Label>
            <Select value={refTypeFilter} onValueChange={setRefTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {referenceTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {sortedEntries.length > 0 && (
            <div className="ml-auto text-right">
              <Label className="text-xs text-muted-foreground mb-1 block">
                {sortedEntries.length} vouchers
              </Label>
              <span className="font-mono font-semibold">
                {formatINR(grandTotal)}
              </span>
            </div>
          )}
        </div>

        {/* Entries table */}
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">
            Loading day book...
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-destructive">
            Failed to load day book.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Date</TableHead>
                  <TableHead>Entry #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Narration</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEntries.length > 0 ? (
                  sortedEntries.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          setExpandedId(
                            expandedId === entry.id ? null : entry.id
                          )
                        }
                      >
                        <TableCell>
                          {expandedId === entry.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Intl.DateTimeFormat("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(entry.entryDate))}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {entry.entryNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {entry.referenceType ?? "manual"}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatINR(entry.totalDebit)}
                        </TableCell>
                      </TableRow>
                      {expandedId === entry.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30 p-0">
                            <div className="px-8 py-3">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Narration</TableHead>
                                    <TableHead className="text-right">
                                      Debit
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Credit
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {entry.lines.map((line) => (
                                    <TableRow key={line.id}>
                                      <TableCell className="text-sm">
                                        {accountMap.get(line.accountId) ??
                                          line.accountId}
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {line.description ?? "-"}
                                      </TableCell>
                                      <TableCell className="text-right font-mono text-sm">
                                        {line.debit > 0
                                          ? formatINR(line.debit)
                                          : "-"}
                                      </TableCell>
                                      <TableCell className="text-right font-mono text-sm">
                                        {line.credit > 0
                                          ? formatINR(line.credit)
                                          : "-"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No vouchers found for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
