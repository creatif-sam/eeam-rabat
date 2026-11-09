import { Suspense } from "react";
import { UpdatePasswordForm } from "@/components/update-password-form";
import { logout } from "@/app/auth/logout/actions";

type SearchParams = Promise<{ first?: string }>;

/** `?first=1` = first sign-in with a temporary password set by an administrator. */
async function PasswordStep({ searchParams }: { searchParams: SearchParams }) {
  const firstLogin = (await searchParams).first === "1";

  return (
    <>
      <UpdatePasswordForm firstLogin={firstLogin} />
      {firstLogin && (
        <form action={logout} className="text-center">
          <button type="submit" className="text-sm text-gray-500 underline underline-offset-4 hover:text-gray-700 dark:hover:text-gray-300">
            Se déconnecter
          </button>
        </form>
      )}
    </>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-4">
        <Suspense fallback={<UpdatePasswordForm />}>
          <PasswordStep searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
