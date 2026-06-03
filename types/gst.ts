// GST return response shapes (mirror the backend GSTN-style JSON)

export interface Gstr1ItemDetail {
  num: number;
  itm_det: {
    rt: number;
    txval: number;
    iamt: number;
    camt: number;
    samt: number;
  };
}

export interface Gstr1B2bInvoice {
  inum: string;
  idt: string;
  val: number;
  pos: string;
  rchrg: string;
  inv_typ: string;
  itms: Gstr1ItemDetail[];
}

export interface Gstr1B2b {
  ctin: string;
  inv: Gstr1B2bInvoice[];
}

export interface Gstr1B2cs {
  sply_ty: string;
  pos: string;
  typ: string;
  rt: number;
  txval: number;
  iamt: number;
  camt: number;
  samt: number;
}

export interface Gstr1HsnRow {
  num: number;
  hsn_sc: string;
  desc: string;
  uqc: string;
  qty: number;
  rt: number;
  txval: number;
  iamt: number;
  camt: number;
  samt: number;
}

export interface Gstr1Response {
  gstin: string | null;
  fp: string;
  from: string;
  to: string;
  b2b: Gstr1B2b[];
  b2cs: Gstr1B2cs[];
  hsn: { data: Gstr1HsnRow[] };
}

export interface Gstr3bResponse {
  gstin: string | null;
  fp: string;
  from: string;
  to: string;
  sup_details: {
    osup_det: {
      txval: number;
      iamt: number;
      camt: number;
      samt: number;
      csamt: number;
    };
  };
  itc_elg: {
    itc_avl: Array<{
      ty: string;
      iamt: number;
      camt: number;
      samt: number;
      csamt: number;
    }>;
  };
}
