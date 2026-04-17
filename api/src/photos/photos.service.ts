import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

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

@Injectable()
export class PhotosService implements OnModuleInit {
  private readonly uploadDir = './uploads';

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async findByPatient(patientId: string) {
    const photos = await this.prisma.patientPhoto.findMany({
      where: { patientId },
      orderBy: { takenAt: 'desc' },
    });

    return photos.map(photo => ({
      ...photo,
      url: `/uploads/${path.basename(photo.url)}`,
      thumbnailUrl: photo.thumbnailUrl ? `/uploads/${path.basename(photo.thumbnailUrl)}` : null,
    }));
  }

  async upload(
    patientId: string,
    file: MulterFile,
    dto: { category?: string; description?: string; takenAt?: string },
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const timestamp = Date.now();
    const filename = `${patientId}_${timestamp}_${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    if (file.buffer) {
      await fs.writeFile(filepath, file.buffer);
    } else {
      throw new Error('No file buffer available');
    }

    const photo = await this.prisma.patientPhoto.create({
      data: {
        patientId,
        url: filepath,
        category: dto.category || 'Other',
        description: dto.description || null,
        takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
        uploadedAt: new Date(),
        uploadedBy: 'system',
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    return {
      ...photo,
      url: `/uploads/${filename}`,
    };
  }

  async remove(id: string) {
    const photo = await this.prisma.patientPhoto.findUnique({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    try {
      await fs.access(photo.url);
      await fs.unlink(photo.url);
    } catch {
      // File doesn't exist or already deleted, continue
    }

    await this.prisma.patientPhoto.delete({
      where: { id },
    });
  }
}