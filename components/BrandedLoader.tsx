import Image from "next/image";

/** Full-screen loading state with the EEAM logo. Safe in server components. */
export default function BrandedLoader({ label = "Chargement…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen flex flex-col items-center justify-center gap-5 bg-slate-50 dark:bg-gray-950"
    >
      <div className="relative h-20 w-20">
        <span className="absolute inset-0 rounded-full border-4 border-cyan-100 dark:border-cyan-900/40" />
        <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-600 dark:border-t-cyan-400 motion-safe:animate-spin" />
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={48}
          height={48}
          className="absolute inset-0 m-auto rounded-full"
          priority
        />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
