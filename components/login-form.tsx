"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { login } from "@/app/auth/login/actions"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à l’intranet
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            action={async (formData) => {
              setIsLoading(true)
              setError(null)
              try {
                await login(formData)
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : "Une erreur est survenue"
                )
                setIsLoading(false)
              }
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Vous n’avez pas de compte ?{" "}
              <Link
                href="/?modal=signup"
                className="underline underline-offset-4"
              >
                Créer un compte
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-gray-500">
        Par la compassion de Christ, si tu n’es pas membre du CP ou du corps
        pastoral, n’essaie pas d’entrer. Dieu est voyant.
      </p>
    </div>
  )
}
