import { assertSameOrigin, jsonError, readJson, requireString } from "@/lib/api";
import { getRepairBooking } from "@/lib/firestore-admin";
import { normalizeKenyanPhone } from "@/lib/phone";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { AuthError } from "@/lib/session";

export const dynamic = "force-dynamic";

interface TrackBody {
  reference?: unknown;
  phone?: unknown;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!checkRateLimit(`track:${clientKey(request)}`, 10, 10 * 60 * 1000)) {
      throw new AuthError(
        429,
        "Too many tracking attempts. Please try again later."
      );
    }

    const body = await readJson<TrackBody>(request);
    const reference = requireString(body.reference, "Reference", 40)
      .toUpperCase()
      .replace(/\s+/g, "");
    if (!/^R-\d{4,}$/.test(reference)) {
      throw new AuthError(400, "Enter a valid reference number.");
    }

    const phone = normalizeKenyanPhone(requireString(body.phone, "Phone", 40));
    if (!phone) {
      throw new AuthError(400, "Enter a valid Kenyan phone number.");
    }

    const booking = await getRepairBooking(reference);
    if (!booking || booking.phone !== phone) {
      throw new AuthError(
        404,
        "No repair found. Check your reference number and phone number."
      );
    }

    return Response.json(
      {
        reference: booking.reference,
        device: booking.model,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return jsonError(error);
  }
}
