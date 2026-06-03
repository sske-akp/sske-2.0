"use client";

import React, { useState } from "react";
import { useGstr1 } from "@/hooks/gstHooks";
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

export default function Gstr1Page() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(monthEnd());
  const { data, isLoading, isError } = useGstr1(from, to, true);

  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">GSTR-1 (Outward Supplies)</h1>
          <p className="text-muted-foreground text-sm">
            B2B, B2C (small) and HSN summary for the selected period.
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
            onClick={() => data && downloadJson(data, `gstr1-${from}-to-${to}.json`)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download JSON
          </Button>
        </div>
      </div>

      {isLoading && <div className="text-muted-foreground">Loading…</div>}
      {isError && <div className="text-destructive">Failed to load GSTR-1.</div>}

      {data && (
        <>
          {/* B2B */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">B2B Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>POS</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Invoice Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.b2b.flatMap((g) =>
                    g.inv.map((inv) => {
                      const taxable = inv.itms.reduce((s, i) => s + i.itm_det.txval, 0);
                      const tax = inv.itms.reduce(
                        (s, i) => s + i.itm_det.iamt + i.itm_det.camt + i.itm_det.samt,
                        0
                      );
                      return (
                        <TableRow key={`${g.ctin}-${inv.inum}`}>
                          <TableCell className="font-mono text-xs">{g.ctin}</TableCell>
                          <TableCell>{inv.inum}</TableCell>
                          <TableCell>{inv.idt}</TableCell>
                          <TableCell>{inv.pos}</TableCell>
                          <TableCell className="text-right">{formatINR(taxable)}</TableCell>
                          <TableCell className="text-right">{formatINR(tax)}</TableCell>
                          <TableCell className="text-right">{formatINR(inv.val)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  {data.b2b.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                        No B2B invoices.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* B2CS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">B2C (Small) Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supply</TableHead>
                    <TableHead>POS</TableHead>
                    <TableHead className="text-right">Rate %</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">IGST</TableHead>
                    <TableHead className="text-right">CGST</TableHead>
                    <TableHead className="text-right">SGST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.b2cs.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.sply_ty}</TableCell>
                      <TableCell>{r.pos}</TableCell>
                      <TableCell className="text-right">{r.rt}</TableCell>
                      <TableCell className="text-right">{formatINR(r.txval)}</TableCell>
                      <TableCell className="text-right">{formatINR(r.iamt)}</TableCell>
                      <TableCell className="text-right">{formatINR(r.camt)}</TableCell>
                      <TableCell className="text-right">{formatINR(r.samt)}</TableCell>
                    </TableRow>
                  ))}
                  {data.b2cs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                        No B2C supplies.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* HSN */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">HSN Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HSN</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate %</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">IGST</TableHead>
                    <TableHead className="text-right">CGST</TableHead>
                    <TableHead className="text-right">SGST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.hsn.data.map((r) => (
                    <TableRow key={r.num}>
                      <TableCell className="font-mono text-xs">{r.hsn_sc}</TableCell>
                      <TableCell>{r.desc}</TableCell>
                      <TableCell className="text-right">{r.qty}</TableCell>
                      <TableCell className="text-right">{r.rt}</TableCell>
                      <TableCell className="text-right">{formatINR(r.txval)}</TableCell>
                      <TableCell className="text-right">{formatINR(r.iamt)}</TableCell>
                      <TableCell className="text-right">{formatINR(r.camt)}</TableCell>
                      <TableCell className="text-right">{formatINR(r.samt)}</TableCell>
                    </TableRow>
                  ))}
                  {data.hsn.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                        No HSN data.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
