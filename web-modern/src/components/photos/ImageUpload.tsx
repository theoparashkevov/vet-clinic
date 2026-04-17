import { useState, useCallback } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Upload, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  onUpload: (files: File[]) => void
  onCancel?: () => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

export function ImageUpload({
  onUpload,
  onCancel,
  maxFiles = 10,
  maxSize = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `${file.name} is not a supported image format`
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `${file.name} exceeds ${maxSize}MB limit`
    }
    return null
  }

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return

    const newFiles: File[] = []
    const errors: string[] = []

    Array.from(files).forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else if (selectedFiles.length + newFiles.length < maxFiles) {
        newFiles.push(file)
      }
    })

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error))
    }

    if (selectedFiles.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    const updatedFiles = [...selectedFiles, ...newFiles]
    setSelectedFiles(updatedFiles)

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrls((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }, [selectedFiles, maxFiles, maxSize, acceptedTypes])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    e.target.value = "" // Reset input
  }, [handleFiles])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpload = useCallback(() => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file")
      return
    }
    onUpload(selectedFiles)
    setSelectedFiles([])
    setPreviewUrls([])
  }, [selectedFiles, onUpload])

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/20 hover:border-muted-foreground/40"
          }
        `}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            Drop images here or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports: JPG, PNG, WebP up to {maxSize}MB each
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Maximum {maxFiles} files
          </p>
        </label>
      </div>

      {/* Preview Grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {previewUrls.map((url, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs truncate px-2 py-1">
                  {selectedFiles[index]?.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {selectedFiles.length > 0 && (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleUpload}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Upload {selectedFiles.length} {selectedFiles.length === 1 ? "photo" : "photos"}
          </Button>
        </div>
      )}
    </div>
  )
}