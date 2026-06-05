"use client";

import { Building2, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface CompanySelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When true the dialog cannot be dismissed until a company is chosen. */
  forced?: boolean;
}

/**
 * Company picker, reused in two places: after login when the user has more than
 * one company, and by AppShell when an authenticated user has no active company.
 */
export default function CompanySelectDialog({
  open,
  onOpenChange,
  forced = false,
}: CompanySelectDialogProps) {
  const { companies, companyId, selectCompany } = useAuth();

  function handleSelect(id: string) {
    selectCompany(id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={forced ? undefined : onOpenChange}>
      <DialogContent
        className={cn(forced && "[&>button]:hidden")}
        onInteractOutside={(e) => forced && e.preventDefault()}
        onEscapeKeyDown={(e) => forced && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Select a company</DialogTitle>
          <DialogDescription>
            Choose the company you want to work in. You can switch at any time
            from the top bar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {companies.length === 0 && (
            <p className="text-muted-foreground text-sm">
              You don&apos;t have access to any company yet.
            </p>
          )}
          {companies.map((company) => {
            const isActive = company.id === companyId;
            return (
              <Button
                key={company.id}
                variant={isActive ? "secondary" : "outline"}
                className="h-auto justify-start gap-3 py-3 text-left"
                onClick={() => handleSelect(company.id)}
              >
                <Building2 className="size-4 shrink-0" />
                <span className="flex flex-1 flex-col">
                  <span className="font-medium">{company.name}</span>
                  {company.gstin && (
                    <span className="text-muted-foreground text-xs">
                      {company.gstin}
                    </span>
                  )}
                </span>
                {isActive && <Check className="size-4 shrink-0" />}
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
