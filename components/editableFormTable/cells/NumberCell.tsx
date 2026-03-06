"use client";

import { FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { NumberColumn, AnyFormReturn } from "../types";

interface NumberCellProps<TRow extends FieldValues> {
  form: AnyFormReturn;
  name: string;
  column: NumberColumn<TRow>;
  inputRef: (el: HTMLElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function NumberCell<TRow extends FieldValues>({
  form,
  name,
  column,
  inputRef,
  onKeyDown,
}: NumberCellProps<TRow>) {
  const { register, formState: { errors } } = form;
  const { ref: registerRef, ...rest } = register(name, { valueAsNumber: true });

  const pathParts = name.split(".");
  let error: Record<string, unknown> | undefined = errors as Record<string, unknown>;
  for (const part of pathParts) {
    error = error?.[part] as Record<string, unknown> | undefined;
  }
  const errorMessage = (error as { message?: string } | undefined)?.message;

  return (
    <div>
      <Input
        {...rest}
        ref={(el) => {
          registerRef(el);
          inputRef(el);
        }}
        type="number"
        min={column.min}
        max={column.max}
        step={column.step ?? "any"}
        placeholder={column.placeholder}
        onKeyDown={onKeyDown}
        aria-invalid={!!errorMessage}
        className="h-8"
      />
      {errorMessage && (
        <p className="text-xs text-destructive mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
