import { assertSameOrigin, jsonError } from "@/lib/api";
import { destroySession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await destroySession();
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
