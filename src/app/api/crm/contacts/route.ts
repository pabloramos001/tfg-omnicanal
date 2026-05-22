import { NextResponse } from "next/server";

import { crmContacts, crmSheetColumns, crmSummary } from "@/lib/crm";

export async function GET() {
  return NextResponse.json({
    source: "google-sheets-mock",
    columns: crmSheetColumns,
    summary: crmSummary,
    contacts: crmContacts,
  });
}