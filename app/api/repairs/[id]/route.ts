import {
  assertSameOrigin,
  jsonError,
  readJson,
} from "@/lib/api";
import { updateRepairStatus } from "@/lib/firestore-admin";
import { AuthError, requireAdmin } from "@/lib/session";
import { REPAIR_STATUSES } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface StatusBody {
  status?: unknown;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    await requireAdmin();

    const body = await readJson<StatusBody>(request);
    const status = body.status;
    if (
      typeof status !== "string" ||
      !(REPAIR_STATUSES as readonly string[]).includes(status)
    ) {
      throw new AuthError(400, "Invalid repair status.");
    }

    const { id } = await context.params;
    await updateRepairStatus(id, status as (typeof REPAIR_STATUSES)[number]);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
