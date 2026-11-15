import "server-only";

const STREAM_DURATION_MS = 280_000;
const HEARTBEAT_MS = 15_000;

type SendEvent = (event: string, data: unknown) => void;

export function createSseResponse(
  request: Request,
  start: (send: SendEvent) => () => void
): Response {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  const cleanup = () => {
    if (closed) {
      return;
    }
    closed = true;
    if (heartbeat) {
      clearInterval(heartbeat);
    }
    if (closeTimer) {
      clearTimeout(closeTimer);
    }
    if (unsubscribe) {
      unsubscribe();
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const sendChunk = (chunk: string) => {
        if (closed) {
          return;
        }
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      const sendEvent: SendEvent = (event, data) => {
        sendChunk(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      sendChunk("retry: 3000\n\n");

      try {
        unsubscribe = start(sendEvent);
      } catch (error) {
        sendEvent("error", {
          message: error instanceof Error ? error.message : "Stream failed.",
        });
        cleanup();
        try {
          controller.close();
        } catch {}
        return;
      }

      heartbeat = setInterval(
        () => sendChunk(": heartbeat\n\n"),
        HEARTBEAT_MS
      );

      closeTimer = setTimeout(() => {
        cleanup();
        try {
          controller.close();
        } catch {}
      }, STREAM_DURATION_MS);

      request.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
