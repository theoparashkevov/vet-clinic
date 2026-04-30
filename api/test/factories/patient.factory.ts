import { PrismaClient, type Patient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreatePatientOptions {
  name?: string;
  species?: string;
  breed?: string | null;
  ownerId: string;
  birthdate?: Date | null;
  microchipId?: string | null;
  notes?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
}

export async function createPatient(options: CreatePatientOptions): Promise<Patient> {
  const now = Date.now();
  return prisma.patient.create({
    data: {
      name: options.name ?? `Test Patient ${now}`,
      species: options.species ?? 'dog',
      breed: options.breed ?? null,
      ownerId: options.ownerId,
      birthdate: options.birthdate ?? null,
      microchipId: options.microchipId ?? null,
      notes: options.notes ?? null,
      allergies: options.allergies ?? null,
      chronicConditions: options.chronicConditions ?? null,
    },
  });
}
