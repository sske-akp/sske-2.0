"use client";

import React, { useMemo, useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAccounts, useCreateJournalEntry } from "@/hooks/accountingHooks";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AppCombobox } from "@/components/utils/appCombobox";
import { useFieldRefs } from "@/components/editableFormTable/hooks";
import { Plus, Trash2, CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

// Cash/Bank account codes used to scope voucher account pickers.
const CASH_BANK_CODES = ["1000", "1010", "1020"];

type VoucherType = "payment" | "receipt" | "contra" | "journal";

interface VoucherConfig {
  label: string;
  description: string;
  /** reference_type sent to the API */
  referenceType: string;
}

const VOUCHER_CONFIG: Record<VoucherType, VoucherConfig> = {
  payment: {
    label: "Payment",
    description:
      "Money going out. Credit cash/bank, debit the expense or party account.",
    referenceType: "payment",
  },
  receipt: {
    label: "Receipt",
    description:
      "Money coming in. Debit cash/bank, credit the party or income account.",
    referenceType: "receipt",
  },
  contra: {
    label: "Contra",
    description: "Transfer between cash and bank accounts.",
    referenceType: "contra",
  },
  journal: {
    label: "Journal",
    description: "Free-form balanced entry across any accounts.",
    referenceType: "journal",
  },
};

const VOUCHER_ORDER: VoucherType[] = [
  "payment",
  "receipt",
  "contra",
  "journal",
];

// --- voucher line state ---
interface VoucherLine extends ManualJournalEntryLine {
  /** stable key so React keeps inputs mounted across re-renders */
  key: string;
}

let lineSeq = 0;
const newLine = (): VoucherLine => ({
  key: `line-${lineSeq++}`,
  accountId: "",
  debit: 0,
  credit: 0,
  description: "",
});

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
            "w-[180px] justify-start text-left font-normal",
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

export default function VouchersPage() {
  return (
    <Suspense fallback={null}>
      <VouchersScreen />
    </Suspense>
  );
}

function VouchersScreen() {
  const searchParams = useSearchParams();
  const initialType = useMemo<VoucherType>(() => {
    const t = searchParams.get("type");
    return t && VOUCHER_ORDER.includes(t as VoucherType)
      ? (t as VoucherType)
      : "payment";
  }, [searchParams]);

  const [voucherType, setVoucherType] = useState<VoucherType>(initialType);

  // Keep the active tab in sync if the query param changes (e.g. Alt+R/Alt+P).
  useEffect(() => {
    setVoucherType(initialType);
  }, [initialType]);

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-extralight tracking-tight text-balance mt-5 mx-5">
        Vouchers
      </h1>
      <div className="p-5 space-y-4">
        <Tabs
          value={voucherType}
          onValueChange={(v) => setVoucherType(v as VoucherType)}
        >
          <TabsList>
            {VOUCHER_ORDER.map((vt) => (
              <TabsTrigger key={vt} value={vt}>
                {VOUCHER_CONFIG[vt].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Remount the form when the voucher type changes so it starts clean */}
        <VoucherForm key={voucherType} voucherType={voucherType} />
      </div>
    </>
  );
}

// --- Voucher form ---

function VoucherForm({ voucherType }: { voucherType: VoucherType }) {
  const config = VOUCHER_CONFIG[voucherType];
  const { data: accounts } = useAccounts();
  const createEntry = useCreateJournalEntry();
  const { setRef, focusCell, removeRow } = useFieldRefs();

  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());
  const [narration, setNarration] = useState("");
  const [lines, setLines] = useState<VoucherLine[]>([newLine(), newLine()]);

  // Account options scoped per voucher type.
  const allOptions = useMemo(
    () =>
      (accounts ?? []).map((a: Account) => ({
        value: a.id,
        label: `${a.code} - ${a.name}`,
      })),
    [accounts]
  );
  const cashBankOptions = useMemo(
    () =>
      (accounts ?? [])
        .filter((a) => CASH_BANK_CODES.includes(a.code))
        .map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` })),
    [accounts]
  );

  // Column layout differs by voucher type. Each column is keyboard-navigable.
  // Payment/Receipt/Contra use a single-amount layout; Journal uses dr/cr.
  const isJournal = voucherType === "journal";

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const difference = totalDebit - totalCredit;
  const isBalanced = totalDebit > 0 && difference === 0;

  const updateLine = useCallback(
    (index: number, patch: Partial<VoucherLine>) => {
      setLines((prev) =>
        prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
      );
    },
    []
  );

  const addLine = useCallback(() => setLines((prev) => [...prev, newLine()]), []);

  const removeLine = useCallback(
    (index: number) => {
      setLines((prev) => {
        if (prev.length <= 2) return prev;
        return prev.filter((_, i) => i !== index);
      });
      removeRow(index);
    },
    [removeRow]
  );

  const resetForm = useCallback(() => {
    setEntryDate(new Date());
    setNarration("");
    setLines([newLine(), newLine()]);
  }, []);

  // Build the journal lines that get POSTed.
  const buildForm = useCallback((): ManualJournalEntryForm | null => {
    const validLines: ManualJournalEntryLine[] = lines
      .filter((l) => l.accountId && (Number(l.debit) > 0 || Number(l.credit) > 0))
      .map((l) => ({
        accountId: l.accountId,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description,
      }));

    if (validLines.length < 2) {
      toast.error("At least two lines with an account and amount are required");
      return null;
    }
    if (!isBalanced) {
      toast.error("Debits must equal credits");
      return null;
    }
    if (!entryDate) {
      toast.error("Date is required");
      return null;
    }

    return {
      entryDate: format(entryDate, "yyyy-MM-dd"),
      description: narration.trim() || `${config.label} voucher`,
      referenceType: config.referenceType,
      lines: validLines,
    };
  }, [lines, isBalanced, entryDate, narration, config]);

  const handleSave = useCallback(() => {
    const form = buildForm();
    if (!form) return;
    createEntry.mutate(form, {
      onSuccess: (entry) => {
        toast.success(`${config.label} voucher saved (${entry.entryNumber})`);
        resetForm();
      },
      onError: (error) => toast.error(`Failed: ${error.message}`),
    });
  }, [buildForm, createEntry, config.label, resetForm]);

  // Ctrl+S / Alt+S to save.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === "s") || (e.altKey && e.key.toLowerCase() === "s")) {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleSave]);

  // Columns: editable column indices for keyboard nav.
  // Journal:  [account(0), debit(1), credit(2), description(3)]
  // Others:   [account(0), debit(1), credit(2), description(3)] too, but
  //           amount cells are conditionally shown. We keep a single grid and
  //           navigate across the visible editable columns.
  const editableCols = isJournal ? [0, 1, 2, 3] : [0, 1, 2, 3];

  const handleCellKeyDown = useCallback(
    (rowIndex: number, colIndex: number) =>
      (e: React.KeyboardEvent) => {
        const isLastRow = rowIndex === lines.length - 1;
        const colPos = editableCols.indexOf(colIndex);
        const isLastCol = colPos === editableCols.length - 1;

        if (e.key === "Enter") {
          e.preventDefault();
          if (isLastRow) {
            addLine();
            setTimeout(() => focusCell(rowIndex + 1, colIndex), 50);
          } else {
            focusCell(rowIndex + 1, colIndex);
          }
        }

        // Tabbing off the last editable cell of the last row adds a new line.
        if (e.key === "Tab" && !e.shiftKey && isLastRow && isLastCol) {
          e.preventDefault();
          addLine();
          setTimeout(() => focusCell(rowIndex + 1, editableCols[0]), 50);
        }
      },
    [lines.length, editableCols, addLine, focusCell]
  );

  const accountOptionsFor = (): { value: string; label: string }[] => {
    // Contra restricts every line to cash/bank accounts.
    if (voucherType === "contra") return cashBankOptions;
    return allOptions;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-normal">
          {config.label} Voucher
        </CardTitle>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Date
            </Label>
            <DatePickerField
              value={entryDate}
              onChange={setEntryDate}
              placeholder="Select date"
            />
          </div>
          <div className="flex-1 min-w-[260px]">
            <Label className="text-xs text-muted-foreground mb-1 block">
              Narration
            </Label>
            <Input
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder={`${config.label} narration (optional)`}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Lines</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Enter / Tab to move - last line auto-adds a row
              </span>
              <Button variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-3 w-3 mr-1" />
                Add Line
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="w-[140px] text-right">Debit</TableHead>
                  <TableHead className="w-[140px] text-right">Credit</TableHead>
                  <TableHead>Narration</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, i) => (
                  <TableRow key={line.key}>
                    {/* Account (col 0) */}
                    <TableCell>
                      <div ref={setRef(i, 0)}>
                        <AppCombobox
                          items={accountOptionsFor()}
                          searchCategory="Select account"
                          defaultValue={line.accountId}
                          onValueChange={(v) =>
                            updateLine(i, { accountId: v })
                          }
                        />
                      </div>
                    </TableCell>
                    {/* Debit (col 1) */}
                    <TableCell>
                      <Input
                        ref={setRef(i, 1)}
                        type="number"
                        min={0}
                        value={line.debit || ""}
                        onChange={(e) =>
                          updateLine(i, {
                            debit: parseFloat(e.target.value) || 0,
                          })
                        }
                        onKeyDown={handleCellKeyDown(i, 1)}
                        className="text-right"
                        placeholder="0.00"
                      />
                    </TableCell>
                    {/* Credit (col 2) */}
                    <TableCell>
                      <Input
                        ref={setRef(i, 2)}
                        type="number"
                        min={0}
                        value={line.credit || ""}
                        onChange={(e) =>
                          updateLine(i, {
                            credit: parseFloat(e.target.value) || 0,
                          })
                        }
                        onKeyDown={handleCellKeyDown(i, 2)}
                        className="text-right"
                        placeholder="0.00"
                      />
                    </TableCell>
                    {/* Narration (col 3) */}
                    <TableCell>
                      <Input
                        ref={setRef(i, 3)}
                        value={line.description}
                        onChange={(e) =>
                          updateLine(i, { description: e.target.value })
                        }
                        onKeyDown={handleCellKeyDown(i, 3)}
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
                        tabIndex={-1}
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
                    {isBalanced ? (
                      <Badge className="bg-green-600 hover:bg-green-600">
                        Dr - Cr = 0
                      </Badge>
                    ) : (
                      <span className="text-destructive text-xs">
                        Dr - Cr = {formatINR(difference)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground mr-auto">
            Press <kbd className="rounded border px-1">Ctrl</kbd>+
            <kbd className="rounded border px-1">S</kbd> to save
          </span>
          <Button variant="outline" onClick={resetForm} type="button">
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={createEntry.isPending || !isBalanced}
          >
            <Save className="h-4 w-4 mr-1" />
            {createEntry.isPending ? "Saving..." : "Save Voucher"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
