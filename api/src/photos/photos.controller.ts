import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService, MulterFile } from './photos.service';
import { StaffAccess } from '../auth/staff-access.decorator';

/**
 * PhotosController
 * 
 * REST API for managing patient photos (medical images, X-rays, wound photos).
 * Supports upload, listing, deletion, and comparison functionality.
 * 
 * Base path: /v1/patients/:patientId/photos
 */
@StaffAccess()
@Controller('patients/:patientId/photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  /**
   * GET /v1/patients/:patientId/photos
   * 
   * List all photos for a patient, ordered by date taken (newest first).
   * Optional filtering by category (Skin, Wound, Dental, etc.)
   * 
   * @param patientId - Patient ID
   * @returns Array of photos with metadata
   */
  @Get()
  async findByPatient(@Param('patientId') patientId: string) {
    const photos = await this.photosService.findByPatient(patientId);
    return { data: photos };
  }

  /**
   * POST /v1/patients/:patientId/photos
   * 
   * Upload a new photo for a patient.
   * Supports JPEG, PNG, WebP formats up to 10MB.
   * 
   * @param patientId - Patient ID
   * @param file - Uploaded image file
   * @param dto - Photo metadata (category, description, takenAt)
   * @returns Created photo record
   */
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, callback) => {
      // Accept only image files
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async upload(
    @Param('patientId') patientId: string,
    @UploadedFile() file: MulterFile | undefined,
    @Body() dto: { category?: string; description?: string; takenAt?: string },
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    // For development, store in local filesystem
    // In production, this would upload to S3 or similar
    const photo = await this.photosService.upload(patientId, file, dto);
    return { data: photo };
  }

  /**
   * DELETE /v1/photos/:id
   * 
   * Delete a photo and its associated file.
   * 
   * @param id - Photo ID
   * @returns Success confirmation
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.photosService.remove(id);
    return { success: true };
  }
}
