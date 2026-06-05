"use client";

import { Building2, Check, ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/** Navbar company switcher. Switching clears the query cache and refetches. */
export default function CompanySelector() {
  const { companies, companyId, selectedCompany, selectCompany, isAuthenticated } =
    useAuth();

  if (!isAuthenticated || companies.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Building2 className="size-4" />
          <span className="max-w-[12rem] truncate">
            {selectedCompany?.name ?? "Select company"}
          </span>
          <ChevronsUpDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[14rem]">
        <DropdownMenuLabel>Companies</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onSelect={() => {
              if (company.id !== companyId) selectCompany(company.id);
            }}
            className="gap-2"
          >
            <span className="flex-1 truncate">{company.name}</span>
            {company.id === companyId && <Check className="size-4 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
