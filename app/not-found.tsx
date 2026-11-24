import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef1f4] px-4 dark:bg-[#0A1F44]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#14202a] dark:text-[#eaf0f5]">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-[#5b6b78] dark:text-[#9fb0be]">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-full bg-[#ff7a1a] px-5 py-2.5 font-semibold text-white hover:bg-[#e66e15]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
