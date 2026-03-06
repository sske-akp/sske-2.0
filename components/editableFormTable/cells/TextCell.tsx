"use client";

import { FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { TextColumn, AnyFormReturn } from "../types";

interface TextCellProps<TRow extends FieldValues> {
  form: AnyFormReturn;
  name: string;
  column: TextColumn<TRow>;
  inputRef: (el: HTMLElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function TextCell<TRow extends FieldValues>({
  form,
  name,
  column,
  inputRef,
  onKeyDown,
}: TextCellProps<TRow>) {
  const { register, formState: { errors } } = form;
  const { ref: registerRef, ...rest } = register(name);

  // Extract nested error from "items.0.field" path
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
