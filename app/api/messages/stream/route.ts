import { jsonError } from "@/lib/api";
import { subscribeToMessages } from "@/lib/firestore-admin";
import { requireAdmin } from "@/lib/session";
import { createSseResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    return createSseResponse(request, (send) =>
      subscribeToMessages(
        (messages) => send("messages", messages),
        (error) => send("error", { message: error.message })
      )
    );
  } catch (error) {
    return jsonError(error);
  }
}
