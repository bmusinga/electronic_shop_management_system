import { jsonError } from "@/lib/api";
import { getOwnerUid } from "@/lib/firestore-admin";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    const user =
      sessionUser && (await getOwnerUid()) === sessionUser.uid
        ? sessionUser
        : null;
    return Response.json(
      { user },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return jsonError(error);
  }
}
