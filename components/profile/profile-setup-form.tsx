"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ProfileSetupForm({
  profile
}: {
  profile?: any
}) {
  const supabase = createClient()
  const router = useRouter()

  const [fullName, setFullName] = useState(profile?.full_name ?? "")
  const [role, setRole] = useState(profile?.role ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [church, setChurch] = useState(profile?.church ?? "EEAM Rabat")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Utilisateur non authentifié")
      setIsLoading(false)
      return
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      role,
      phone,
      church,
      completed: true
    })

    if (upsertError) {
      console.error("Upsert error details:", upsertError)
      setError("Une erreur est survenue lors de l’enregistrement")
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Profil utilisateur</CardTitle>
        <CardDescription>
          Vous pouvez modifier ces informations à tout moment
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nom complet</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>

          <div>
            <Label>Rôle</Label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Sélectionner</option>
              <option value="admin">Administrateur</option>
              <option value="cp">Conseil pastoral</option>
              <option value="corps_pastoral">Corps pastoral</option>
            </select>
          </div>

          <div>
            <Label>Téléphone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div>
            <Label>Église locale</Label>
            <Input value={church} onChange={e => setChurch(e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button className="w-full" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
