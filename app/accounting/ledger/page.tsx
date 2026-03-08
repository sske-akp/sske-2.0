"use client";

import React, { useState, useMemo } from "react";
import {
  useJournalEntries,
  useAccounts,
  useCreateJournalEntry,
} from "@/hooks/accountingHooks";
import {
  Account,
  ManualJournalEntryForm,
  ManualJournalEntryLine,
} from "@/types/accounting";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  CalendarIcon,
} from "lucide-react";
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
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function LedgerPage() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [accountFilter, setAccountFilter] = useState("all");
  const [refTypeFilter, setRefTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filters = useMemo(
    () => ({
      dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
      dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
      accountId: accountFilter !== "all" ? accountFilter : undefined,
      referenceType: refTypeFilter !== "all" ? refTypeFilter : undefined,
    }),
    [dateFrom, dateTo, accountFilter, refTypeFilter]
  );

  const { data: entries, isLoading, isError } = useJournalEntries(filters);
  const { data: accounts } = useAccounts();

  const accountMap = useMemo(() => {
    const m = new Map<string, string>();
    accounts?.forEach((a) => m.set(a.id, `${a.code} - ${a.name}`));
    return m;
  }, [accounts]);

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        General Ledger
      </h1>
      <div className="p-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">From</Label>
            <DatePickerField
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="Start date"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">To</Label>
            <DatePickerField
              value={dateTo}
              onChange={setDateTo}
              placeholder="End date"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Account</Label>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts?.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.code} - {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Type</Label>
            <Select value={refTypeFilter} onValueChange={setRefTypeFilter}>
              <SelectTrigger className="w-[160px]">
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
          <div className="ml-auto">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Manual Entry
            </Button>
          </div>
        </div>

        {/* Entries table */}
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">
            Loading journal entries...
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-destructive">
            Failed to load journal entries.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Entry #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries && entries.length > 0 ? (
                  entries.map((entry) => (
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
                        <TableCell className="font-mono text-sm">
                          {entry.entryNumber}
                        </TableCell>
                        <TableCell>
                          {new Intl.DateTimeFormat("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(entry.entryDate))}
                        </TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {entry.referenceType ?? "manual"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatINR(entry.totalDebit)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatINR(entry.totalCredit)}
                        </TableCell>
                      </TableRow>
                      {expandedId === entry.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30 p-0">
                            <div className="px-8 py-3">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Description</TableHead>
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
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No journal entries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* New Manual Entry Dialog */}
      <ManualEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        accounts={accounts ?? []}
      />
    </>
  );
}

// --- Manual Entry Dialog ---

function ManualEntryDialog({
  open,
  onOpenChange,
  accounts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
}) {
  const createEntry = useCreateJournalEntry();

  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<ManualJournalEntryLine[]>([
    { accountId: "", debit: 0, credit: 0, description: "" },
    { accountId: "", debit: 0, credit: 0, description: "" },
  ]);

  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const addLine = () =>
    setLines([...lines, { accountId: "", debit: 0, credit: 0, description: "" }]);

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (
    index: number,
    field: keyof ManualJournalEntryLine,
    value: string | number
  ) => {
    setLines(
      lines.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const resetForm = () => {
    setEntryDate(new Date());
    setDescription("");
    setLines([
      { accountId: "", debit: 0, credit: 0, description: "" },
      { accountId: "", debit: 0, credit: 0, description: "" },
    ]);
  };

  const handleSubmit = () => {
    if (!entryDate || !description.trim()) {
      toast.error("Date and description are required");
      return;
    }
    if (!isBalanced) {
      toast.error("Debits must equal credits");
      return;
    }
    const validLines = lines.filter(
      (l) => l.accountId && (l.debit > 0 || l.credit > 0)
    );
    if (validLines.length < 2) {
      toast.error("At least two lines are required");
      return;
    }

    const form: ManualJournalEntryForm = {
      entryDate: format(entryDate, "yyyy-MM-dd"),
      description: description.trim(),
      referenceType: "adjustment",
      lines: validLines,
    };

    createEntry.mutate(form, {
      onSuccess: () => {
        toast.success("Journal entry created");
        resetForm();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(`Failed: ${error.message}`);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Manual Journal Entry</DialogTitle>
          <DialogDescription>
            Create a double-entry journal entry. Debits must equal credits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <DatePickerField
                value={entryDate}
                onChange={setEntryDate}
                placeholder="Select date"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Correcting entry for..."
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Lines</Label>
              <Button variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-3 w-3 mr-1" />
                Add Line
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="w-[120px]">Debit</TableHead>
                    <TableHead className="w-[120px]">Credit</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Select
                          value={line.accountId}
                          onValueChange={(v) => updateLine(i, "accountId", v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.code} - {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={line.debit || ""}
                          onChange={(e) =>
                            updateLine(i, "debit", parseFloat(e.target.value) || 0)
                          }
                          className="text-right"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={line.credit || ""}
                          onChange={(e) =>
                            updateLine(
                              i,
                              "credit",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="text-right"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.description}
                          onChange={(e) =>
                            updateLine(i, "description", e.target.value)
                          }
                          placeholder="Optional"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeLine(i)}
                          disabled={lines.length <= 2}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold">
                    <TableCell>Totals</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatINR(totalDebit)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatINR(totalCredit)}
                    </TableCell>
                    <TableCell colSpan={2}>
                      {totalDebit > 0 && totalDebit !== totalCredit && (
                        <span className="text-destructive text-xs">
                          Difference: {formatINR(Math.abs(totalDebit - totalCredit))}
                        </span>
                      )}
                      {isBalanced && (
                        <span className="text-green-600 text-xs">Balanced</span>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createEntry.isPending || !isBalanced}
          >
            {createEntry.isPending ? "Creating..." : "Create Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
