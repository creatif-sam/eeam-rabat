"use client"

import { useEffect } from "react"

export default function NormalizeBody() {
  useEffect(() => {
    document.body.removeAttribute("cz-shortcut-listen")
  }, [])

  return null
}
