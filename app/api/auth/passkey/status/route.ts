import { jsonError } from "@/lib/api";
import { listWebAuthnCredentials } from "@/lib/firestore-admin";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAdmin();
    const credentials = await listWebAuthnCredentials(user.uid);
    return Response.json(
      { enrolled: credentials.length > 0, count: credentials.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return jsonError(error);
  }
}
