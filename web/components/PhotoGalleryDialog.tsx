"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  TextField,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

interface PatientPhoto {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  category: string;
  description: string | null;
  takenAt: string;
  fileSize: number;
}

interface Props {
  open: boolean;
  patientId: string;
  patientName: string;
  photos: PatientPhoto[];
  onClose: () => void;
  onPhotoAdded: () => void;
}

const PHOTO_CATEGORIES = [
  "Skin",
  "Wound",
  "Dental",
  "X-Ray",
  "Surgery",
  "Eye",
  "Ear",
  "Behavior",
  "Other",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function PhotoGalleryDialog({
  open,
  patientId,
  patientName,
  photos,
  onClose,
  onPhotoAdded,
}: Props) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Other");
  const [description, setDescription] = useState("");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", selectedCategory);
        if (description) formData.append("description", description);
        formData.append("takenAt", new Date().toISOString());

        setUploadProgress(((i + 0.5) / files.length) * 100);

        await fetch(`/v1/patients/${patientId}/photos`, {
          method: "POST",
          body: formData,
        });

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      toast.success(`Uploaded ${files.length} photo(s)`);
      onPhotoAdded();
      setDescription("");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to upload photo";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      await apiJson(`/v1/photos/${photoId}`, { method: "DELETE" });
      toast.success("Photo deleted");
      onPhotoAdded();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to delete photo";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Photos - {patientName}
        <Typography variant="caption" display="block" color="text.secondary">
          {photos.length} photo{photos.length !== 1 ? "s" : ""}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Upload Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              {PHOTO_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="small"
              fullWidth
              placeholder="e.g., Left hind leg, post-surgery"
            />
          </Box>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
          />

          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            fullWidth
            sx={{ py: 2, borderStyle: "dashed" }}
          >
            {uploading ? "Uploading..." : "Click to upload photos"}
          </Button>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary">
                Uploading... {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            JPEG, PNG, WebP up to 10MB
          </Typography>
        </Box>

        {/* Photo Gallery */}
        {photos.length > 0 ? (
          <ImageList cols={3} gap={8}>
            {photos.map((photo) => (
              <ImageListItem key={photo.id}>
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.description || "Patient photo"}
                  loading="lazy"
                  style={{ borderRadius: 4, maxHeight: 200, objectFit: "cover" }}
                />
                <ImageListItemBar
                  title={photo.category}
                  subtitle={
                    <>
                      {photo.description && (
                        <Typography variant="caption" display="block">
                          {photo.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="inherit">
                        {new Date(photo.takenAt).toLocaleDateString()} •{" "}
                        {formatFileSize(photo.fileSize)}
                      </Typography>
                    </>
                  }
                  actionIcon={
                    <IconButton
                      sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                      onClick={() => handleDelete(photo.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Alert severity="info">No photos yet. Upload some above!</Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
