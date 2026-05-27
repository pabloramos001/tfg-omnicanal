import { NextResponse } from "next/server";

import { clubKnowledge, getPlaytomicDailyAvailability } from "@/lib/club-knowledge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const availability = await getPlaytomicDailyAvailability({ date, limit: 14 });

  return NextResponse.json({
    selectedDate: availability.resolvedDate ?? date,
    slots: availability.slots,
    clubUrl: `${clubKnowledge.reservations.playtomic.baseUrl}/${clubKnowledge.reservations.playtomic.clubPath}?source=demo-omnicanal`,
    openingHours: {
      opensAt: clubKnowledge.reservations.opensAt,
      closesAt: clubKnowledge.reservations.closesAt,
    },
  });
}