"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef1f4] px-4 dark:bg-[#0A1F44]">
      <div className="w-full max-w-md rounded-xl border border-[#d5dce2] bg-white p-6 text-center dark:border-[#2a3a47] dark:bg-[#15202a]">
        <h1 className="text-xl font-semibold text-[#14202a] dark:text-[#eaf0f5]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[#5b6b78] dark:text-[#9fb0be]">
          Please try again. If the problem continues, contact the store.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-full bg-[#ff7a1a] px-5 py-2.5 font-semibold text-white hover:bg-[#e66e15]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
