"use client";

import { cn } from "@/lib/utils";
import { changePassword } from "@/app/dashboard/profile/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";

const MIN_LENGTH = 8;

export function UpdatePasswordForm({
  className,
  firstLogin = false,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { firstLogin?: boolean }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`);
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await changePassword(password);
    setIsLoading(false);

    if (!result.ok) {
      setError(
        /session/i.test(result.error)
          ? firstLogin
            ? "Votre session a expiré. Reconnectez-vous avec le mot de passe temporaire."
            : "Votre lien a expiré. Demandez un nouveau lien de réinitialisation."
          : result.error
      );
      return;
    }
    toast.success(firstLogin ? "Bienvenue ! Votre mot de passe est enregistré." : "Mot de passe mis à jour.");
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {firstLogin ? "Choisissez votre mot de passe" : "Nouveau mot de passe"}
          </CardTitle>
          <CardDescription>
            {firstLogin
              ? "Vous vous êtes connecté avec un mot de passe temporaire. Choisissez maintenant votre mot de passe personnel : vous seul le connaîtrez."
              : "Choisissez un nouveau mot de passe pour votre compte."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={`${MIN_LENGTH} caractères minimum`}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirm"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enregistrement…" : "Enregistrer le mot de passe"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
