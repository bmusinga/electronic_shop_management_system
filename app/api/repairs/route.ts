import {
  assertSameOrigin,
  jsonError,
  optionalString,
  readJson,
  requireString,
} from "@/lib/api";
import { createRepairBooking, listRepairBookings } from "@/lib/firestore-admin";
import { normalizeKenyanPhone } from "@/lib/phone";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { AuthError, requireAdmin } from "@/lib/session";
import type { RepairBookingInput } from "@/lib/types";

export const dynamic = "force-dynamic";

interface RepairBody {
  name?: unknown;
  phone?: unknown;
  model?: unknown;
  problem?: unknown;
  notes?: unknown;
  preferredDate?: unknown;
}

function parseRepairInput(body: RepairBody): RepairBookingInput {
  const phone = normalizeKenyanPhone(requireString(body.phone, "Phone", 40));
  if (!phone) {
    throw new AuthError(400, "Enter a valid Kenyan phone number.");
  }

  const preferredDate = requireString(body.preferredDate, "Preferred date", 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) ||
    Number.isNaN(Date.parse(preferredDate)) ||
    preferredDate < new Date().toISOString().slice(0, 10)
  ) {
    throw new AuthError(400, "Choose today or a later drop-off date.");
  }

  return {
    name: requireString(body.name, "Name", 200),
    phone,
    model: requireString(body.model, "Phone model", 200),
    problem: requireString(body.problem, "Problem", 200),
    notes: optionalString(body.notes, 1000),
    preferredDate,
  };
}

export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await listRepairBookings(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!checkRateLimit(`repairs:${clientKey(request)}`, 5, 10 * 60 * 1000)) {
      throw new AuthError(
        429,
        "Too many booking attempts. Please try again later."
      );
    }

    const body = await readJson<RepairBody>(request);
    const booking = await createRepairBooking(parseRepairInput(body));
    return Response.json({ reference: booking.reference }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
