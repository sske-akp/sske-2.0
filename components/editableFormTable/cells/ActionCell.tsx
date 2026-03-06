"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ActionCellProps {
  rowIndex: number;
  remove: (index: number) => void;
  fieldsLength: number;
  minRows: number;
}

export function ActionCell({
  rowIndex,
  remove,
  fieldsLength,
  minRows,
}: ActionCellProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      tabIndex={-1}
      disabled={fieldsLength <= minRows}
      onClick={() => remove(rowIndex)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
