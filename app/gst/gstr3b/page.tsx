"use client";

import React, { useState } from "react";
import { useGstr3b } from "@/hooks/gstHooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";

const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};
const monthEnd = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
};

const formatINR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Gstr3bPage() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(monthEnd());
  const { data, isLoading, isError } = useGstr3b(from, to, true);

  const outward = data?.sup_details.osup_det;
  const itc = data?.itc_elg.itc_avl[0];

  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">GSTR-3B (Summary Return)</h1>
          <p className="text-muted-foreground text-sm">
            Outward taxable supplies and eligible input tax credit.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button
            variant="outline"
            disabled={!data}
            onClick={() => data && downloadJson(data, `gstr3b-${from}-to-${to}.json`)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download JSON
          </Button>
        </div>
      </div>

      {isLoading && <div className="text-muted-foreground">Loading…</div>}
      {isError && <div className="text-destructive">Failed to load GSTR-3B.</div>}

      {data && outward && itc && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">3.1(a) Outward Taxable Supplies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">Taxable Value</TableHead>
                    <TableHead className="text-right">IGST</TableHead>
                    <TableHead className="text-right">CGST</TableHead>
                    <TableHead className="text-right">SGST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-right">{formatINR(outward.txval)}</TableCell>
                    <TableCell className="text-right">{formatINR(outward.iamt)}</TableCell>
                    <TableCell className="text-right">{formatINR(outward.camt)}</TableCell>
                    <TableCell className="text-right">{formatINR(outward.samt)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">4. Eligible ITC</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">IGST</TableHead>
                    <TableHead className="text-right">CGST</TableHead>
                    <TableHead className="text-right">SGST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-right">{formatINR(itc.iamt)}</TableCell>
                    <TableCell className="text-right">{formatINR(itc.camt)}</TableCell>
                    <TableCell className="text-right">{formatINR(itc.samt)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Net Tax Payable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-lg font-semibold">
                <span>Output − ITC</span>
                <span>
                  {formatINR(
                    outward.iamt + outward.camt + outward.samt - (itc.iamt + itc.camt + itc.samt)
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
