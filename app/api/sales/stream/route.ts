import { jsonError } from "@/lib/api";
import { subscribeToSales } from "@/lib/firestore-admin";
import { requireAdmin } from "@/lib/session";
import { createSseResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    return createSseResponse(request, (send) =>
      subscribeToSales(
        (sales) => send("sales", sales),
        (error) => send("error", { message: error.message })
      )
    );
  } catch (error) {
    return jsonError(error);
  }
}
