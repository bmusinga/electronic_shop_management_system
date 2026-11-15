import { assertSameOrigin, jsonError } from "@/lib/api";
import { deleteSale } from "@/lib/firestore-admin";
import { requireAdmin } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    await deleteSale(id);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
