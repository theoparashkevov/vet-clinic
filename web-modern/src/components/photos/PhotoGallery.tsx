import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { X, ZoomIn, Calendar, User, ImageIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../ui/dialog"

export interface Photo {
  id: string
  url: string
  thumbnailUrl?: string
  category: string
  description?: string
  takenAt: string
  uploadedAt: string
  uploadedBy: string
  fileSize: number
  mimeType: string
}

interface PhotoGalleryProps {
  photos: Photo[]
  onDelete?: (id: string) => void
  isLoading?: boolean
}

export function PhotoGallery({ photos, onDelete, isLoading }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="aspect-square bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ImageIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No photos yet</p>
        <p className="text-sm">Upload photos to see them here</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="group overflow-hidden cursor-pointer">
            <CardContent className="p-0 relative">
              <div 
                className="aspect-square relative"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.description || 'Patient photo'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="h-8 w-8 text-white" />
                </div>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(photo.id)
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="p-3">
                <Badge variant="secondary" className="mb-2">
                  {photo.category}
                </Badge>
                {photo.description && (
                  <p className="text-sm truncate">{photo.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(photo.takenAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedPhoto?.description || 'Photo preview'}
          </DialogTitle>
          {selectedPhoto && (
            <div className="grid md:grid-cols-[1fr,300px]">
              <div className="bg-black flex items-center justify-center min-h-[300px]">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.description || 'Full size'}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Taken: {formatDate(selectedPhoto.takenAt)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      Uploaded by: {selectedPhoto.uploadedBy}
                    </div>
                    <div className="text-muted-foreground">
                      Size: {formatFileSize(selectedPhoto.fileSize)}
                    </div>
                    <div className="text-muted-foreground">
                      Type: {selectedPhoto.mimeType}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Category</h3>
                  <Badge>{selectedPhoto.category}</Badge>
                </div>

                {selectedPhoto.description && (
                  <div>
                    <h3 className="font-semibold mb-1">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPhoto.description}
                    </p>
                  </div>
                )}

                {onDelete && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      onDelete(selectedPhoto.id)
                      setSelectedPhoto(null)
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Delete Photo
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}