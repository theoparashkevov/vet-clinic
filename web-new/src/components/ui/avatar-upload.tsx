import { useRef, useState } from "react"
import { Camera, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface AvatarUploadProps {
  src?: string | null
  fallback: React.ReactNode
  onChange: (dataUrl: string | null) => void
  className?: string
  disabled?: boolean
}

function resizeToDataUrl(file: File, maxPx = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1)
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", quality))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function AvatarUpload({ src, fallback, onChange, className, disabled }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    setLoading(true)
    try {
      const dataUrl = await resizeToDataUrl(file)
      onChange(dataUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-full select-none",
        disabled && "pointer-events-none",
        className
      )}
      onClick={() => !disabled && inputRef.current?.click()}
      title="Click to upload photo"
    >
      {/* Photo or fallback */}
      {src ? (
        <img src={src} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center">{fallback}</div>
      )}

      {/* Hover overlay */}
      {!disabled && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5">
          {loading ? (
            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Camera className="h-4 w-4 text-white" />
          )}
          <span className="text-[10px] font-medium text-white leading-none">
            {src ? "Change" : "Upload"}
          </span>
        </div>
      )}

      {/* Remove button (top-right, shown when photo exists) */}
      {src && !disabled && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(null) }}
          className="absolute top-0.5 right-0.5 z-10 h-5 w-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive"
          title="Remove photo"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}

// Hook for persisting entity photos (patients, owners) in localStorage
export function useEntityPhoto(type: "patient" | "owner", id: string) {
  const key = `photo:${type}:${id}`
  const [photo, setPhoto] = useState<string | null>(() => {
    try { return localStorage.getItem(key) } catch { return null }
  })

  function save(dataUrl: string) {
    try { localStorage.setItem(key, dataUrl) } catch {}
    setPhoto(dataUrl)
  }

  function clear() {
    try { localStorage.removeItem(key) } catch {}
    setPhoto(null)
  }

  return { photo, save, clear }
}
