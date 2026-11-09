"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { removeHeroImage, uploadHeroImage } from "@/app/dashboard/site/actions"
import { DEFAULT_HERO_IMAGES, UPLOADED_IMAGE_FOCUS, type HeroSlideId } from "@/lib/site/hero"

const MAX_WIDTH = 2000
const TARGET_BYTES = 2 * 1024 * 1024

/**
 * Phone photos are often 5–10 MB: resize to 2000 px wide and re-encode as
 * JPEG in the browser, so uploads are quick and the homepage stays light.
 */
async function compress(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_WIDTH / bitmap.width)
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  for (const quality of [0.85, 0.75, 0.65]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
    if (blob && (blob.size <= TARGET_BYTES || quality === 0.65)) {
      return new File([blob], "hero.jpg", { type: "image/jpeg" })
    }
  }
  return file
}

export default function HeroImagePicker({
  slide,
  url,
  onChange,
}: {
  slide: HeroSlideId
  url: string
  onChange: (url: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null)
  const preview = url ? { src: url, focus: UPLOADED_IMAGE_FOCUS } : DEFAULT_HERO_IMAGES[slide]

  async function pick(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) return void toast.error("Choisissez une image (JPG, PNG ou WebP).")
    setBusy("upload")
    try {
      const body = new FormData()
      body.set("slide", slide)
      body.set("file", await compress(file))
      const result = await uploadHeroImage(body)
      if (!result.ok) return void toast.error(result.error)
      onChange(result.url)
      toast.success("Photo mise à jour. Elle est déjà visible sur le site.")
    } catch (err) {
      console.error("[hero image]", err)
      toast.error("Impossible de lire cette image. Essayez une autre photo.")
    } finally {
      setBusy(null)
      if (input.current) input.current.value = ""
    }
  }

  async function reset() {
    setBusy("remove")
    const result = await removeHeroImage(slide)
    setBusy(null)
    if (!result.ok) return void toast.error(result.error)
    onChange("")
    toast.success("Photo par défaut rétablie.")
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Photo de fond</p>
      <div className="relative aspect-[21/9] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview.src} alt="" className="h-full w-full object-cover" style={{ objectPosition: preview.focus }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d2d30]/80 via-[#0d2d30]/30 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {url ? "Photo personnalisée" : "Photo par défaut"}
        </span>
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-black/40">
            <Loader2 className="animate-spin text-white" size={28} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          id={`hero-image-${slide}`}
          onChange={(e) => void pick(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={!!busy}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <ImagePlus size={16} />
          Changer la photo
        </button>
        {url && (
          <button
            type="button"
            onClick={() => void reset()}
            disabled={!!busy}
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <RotateCcw size={15} />
            Revenir à la photo par défaut
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Format paysage conseillé. Le sujet principal à droite : la gauche est couverte par le texte. Enregistrée immédiatement.
      </p>
    </div>
  )
}
