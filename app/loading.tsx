export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef1f4] dark:bg-[#0A1F44]">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff7a1a] border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </main>
  );
}
