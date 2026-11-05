"use client";

import { usePathname } from "next/navigation";

/** Pages where the floating button would get in the way (members area, sign-in). */
const HIDDEN_PREFIXES = ["/dashboard", "/auth", "/profile"];

export default function WhatsAppButton() {
  const pathname = usePathname() ?? "/";
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  // The homepage has a bottom navigation bar on mobile: sit just above it
  const onHome = pathname === "/";

  return (
    <a
      href="https://wa.me/212707507100"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous écrire sur WhatsApp"
      title="Nous écrire sur WhatsApp"
      className={`group fixed right-4 sm:right-6 sm:bottom-6 z-40 flex items-center justify-center rounded-full bg-[#25D366] text-white
        h-12 w-12 sm:h-[52px] sm:w-[52px] shadow-md shadow-black/15 ring-1 ring-black/5
        opacity-90 hover:opacity-100 hover:shadow-lg transition
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2
        ${onHome ? "bottom-[5.25rem]" : "bottom-4"}`}
    >
      <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.34.677 4.523 1.85 6.37L4 29l7.84-1.79A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.8a9.76 9.76 0 0 1-4.98-1.37l-.357-.213-4.65 1.06 1.08-4.53-.233-.37A9.78 9.78 0 0 1 5.2 15c0-5.96 4.85-10.8 10.804-10.8 5.954 0 10.8 4.84 10.8 10.8s-4.846 10.8-10.8 10.8Zm5.96-8.1c-.327-.164-1.93-.953-2.23-1.063-.3-.11-.518-.164-.736.164-.218.327-.845 1.062-1.036 1.28-.19.218-.382.245-.708.082-1.93-.965-3.193-1.72-4.462-3.9-.337-.58.337-.54.965-1.8.107-.218.054-.41-.054-.573-.11-.164-.736-1.773-1.01-2.428-.267-.638-.54-.55-.736-.563-.19-.01-.41-.01-.628-.01-.218 0-.572.082-.872.41-.3.327-1.146 1.12-1.146 2.728 0 1.608 1.173 3.164 1.337 3.382.164.218 2.255 3.44 5.46 4.69 2.703 1.06 3.255.85 3.84.797.59-.054 1.93-.79 2.2-1.555.272-.764.272-1.418.19-1.555-.082-.137-.3-.218-.626-.382Z" />
      </svg>
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 sm:block">
        Nous écrire sur WhatsApp
      </span>
    </a>
  );
}
