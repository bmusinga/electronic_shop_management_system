import {
  assertSameOrigin,
  jsonError,
  optionalString,
  readJson,
  requireEmail,
  requireString,
} from "@/lib/api";
import { createMessage, listMessages } from "@/lib/firestore-admin";
import { requireAdmin } from "@/lib/session";
import type { ContactMessageInput } from "@/lib/types";

export const dynamic = "force-dynamic";

interface MessageBody {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
}

function parseMessageInput(body: MessageBody): ContactMessageInput {
  return {
    name: requireString(body.name, "Name", 200),
    email: requireEmail(body.email),
    subject: optionalString(body.subject, 200),
    message: requireString(body.message, "Message", 4000),
  };
}

export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await listMessages(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson<MessageBody>(request);
    const id = await createMessage(parseMessageInput(body));
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
