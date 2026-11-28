function defaultErrorMessage(status: number): string {
  if (status === 429) {
    return "Too many requests. Please try again later.";
  }
  if (status >= 500) {
    return "The server is temporarily unavailable. Please try again.";
  }
  return "The request could not be completed. Please try again.";
}

export async function apiFetch<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (
    init?.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(input, { ...init, headers });
  } catch {
    throw new Error(
      "Unable to reach the server. Check your connection and try again."
    );
  }

  const data = (await response.json().catch(() => null)) as
    | { error?: string }
    | T
    | null;

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : defaultErrorMessage(response.status);
    throw new Error(message);
  }

  return data as T;
}
