import { jsonError } from "@/lib/api";
import { subscribeToProducts } from "@/lib/firestore-admin";
import { requireAdmin } from "@/lib/session";
import { createSseResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    return createSseResponse(request, (send) =>
      subscribeToProducts(
        (products) => send("products", products),
        (error) => send("error", { message: error.message })
      )
    );
  } catch (error) {
    return jsonError(error);
  }
}
