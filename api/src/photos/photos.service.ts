import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

// Multer file type definition
export type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
};

/**
 * PhotosService
 * 
 * Business logic for patient photo management.
 * Handles file storage, metadata tracking, and retrieval.
 * 
 * Storage Strategy:
 * - Development: Local filesystem (uploads/ directory)
 * - Production: AWS S3 or similar cloud storage
 */
@Injectable()
export class PhotosService {
  // Base upload directory - in production, this would be S3
  private readonly uploadDir = './uploads';

  constructor(private readonly prisma: PrismaService) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Find all photos for a patient, ordered by date taken (newest first)
   * 
   * @param patientId - Patient ID
   * @returns Array of photos with URLs
   */
  async findByPatient(patientId: string) {
    const photos = await this.prisma.patientPhoto.findMany({
      where: { patientId },
      orderBy: { takenAt: 'desc' },
    });

    // Generate full URLs for each photo
    return photos.map(photo => ({
      ...photo,
      url: `/uploads/${path.basename(photo.url)}`,
      thumbnailUrl: photo.thumbnailUrl ? `/uploads/${path.basename(photo.thumbnailUrl)}` : null,
    }));
  }

  /**
   * Upload a new photo
   * 
   * In development: Saves to local filesystem
   * In production: Would upload to S3
   * 
   * @param patientId - Patient ID
   * @param file - Uploaded file from multer
   * @param dto - Photo metadata
   * @returns Created photo record
   */
  async upload(
    patientId: string,
    file: MulterFile,
    dto: { category?: string; description?: string; takenAt?: string },
  ) {
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${patientId}_${timestamp}_${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    // Save file to disk (in production, upload to S3)
    if (file.buffer) {
      fs.writeFileSync(filepath, file.buffer);
    } else {
      throw new Error('No file buffer available');
    }

    // Create database record
    const photo = await this.prisma.patientPhoto.create({
      data: {
        patientId,
        url: filepath,
        category: dto.category || 'Other',
        description: dto.description || null,
        takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
        uploadedAt: new Date(),
        uploadedBy: 'system', // Should be current user ID
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    return {
      ...photo,
      url: `/uploads/${filename}`,
    };
  }

  /**
   * Delete a photo and its file
   * 
   * @param id - Photo ID
   */
  async remove(id: string) {
    const photo = await this.prisma.patientPhoto.findUnique({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Delete file from disk
    try {
      if (fs.existsSync(photo.url)) {
        fs.unlinkSync(photo.url);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      // Continue even if file deletion fails
    }

    // Delete database record
    await this.prisma.patientPhoto.delete({
      where: { id },
    });
  }
}
