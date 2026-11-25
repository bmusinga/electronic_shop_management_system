import { assertSameOrigin, jsonError, readJson, requireEmail } from "@/lib/api";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { AuthError } from "@/lib/session";

export const dynamic = "force-dynamic";

interface ForgotPasswordBody {
  email?: unknown;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (
      !checkRateLimit(
        `forgot-password:${clientKey(request)}`,
        5,
        15 * 60 * 1000
      )
    ) {
      throw new AuthError(
        429,
        "Too many reset requests. Please try again later."
      );
    }

    const body = await readJson<ForgotPasswordBody>(request);
    const email = requireEmail(body.email);
    const apiKey =
      process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new AuthError(500, "Password reset is not configured.");
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      const code = data?.error?.message || "";
      if (!code.includes("EMAIL_NOT_FOUND")) {
        throw new AuthError(502, "Could not send the reset email.");
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error, "Could not send the reset email.");
  }
}
