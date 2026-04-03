import { IsEmail, IsString, MinLength, IsOptional, IsNumber, Max, IsEnum } from 'class-validator';

export class ClientLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class CreateRefillRequestDto {
  @IsString()
  prescriptionId!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RegisterClientDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  ownerId!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class ClientPetResponseDto {
  id!: string;
  name!: string;
  species!: string;
  breed!: string | null;
  birthdate!: string | null;
  vaccinations!: {
    status: 'current' | 'due-soon' | 'overdue';
    count: number;
  };
  upcomingAppointments!: number;
}

export class PetDetailsDto {
  id!: string;
  name!: string;
  species!: string;
  breed!: string | null;
  birthdate!: string | null;
  microchipId!: string | null;
  allergies!: string | null;
  chronicConditions!: string | null;
  vaccinations!: Array<{
    id: string;
    name: string;
    givenDate: string;
    dueDate: string;
    status: 'current' | 'due-soon' | 'overdue';
  }>;
  weightRecords!: Array<{
    id: string;
    weight: number;
    date: string;
    notes: string | null;
  }>;
  upcomingAppointments!: Array<{
    id: string;
    startsAt: string;
    reason: string | null;
    doctor: { id: string; name: string } | null;
  }>;
  recentVisits!: Array<{
    id: string;
    visitDate: string;
    summary: string;
    diagnoses: string | null;
    treatments: string | null;
  }>;
}

export class VaccinationDto {
  id!: string;
  name!: string;
  type!: string;
  givenDate!: string;
  dueDate!: string;
  batchNumber!: string | null;
  veterinarian!: string | null;
  notes!: string | null;
  status!: 'current' | 'due-soon' | 'overdue';
}

export class PrescriptionDto {
  id!: string;
  medication!: string;
  dosage!: string;
  frequency!: string;
  duration!: string;
  instructions!: string | null;
  prescribedAt!: string;
  expiresAt!: string;
  refillsTotal!: number;
  refillsRemaining!: number;
  isControlled!: boolean;
  veterinarian!: string;
  notes!: string | null;
  isActive!: boolean;
}

export class AppointmentDto {
  id!: string;
  startsAt!: string;
  endsAt!: string;
  status!: string;
  reason!: string | null;
  patient!: { id: string; name: string };
  doctor!: { id: string; name: string } | null;
}

export class RefillRequestDto {
  id!: string;
  prescriptionId!: string;
  medication!: string;
  status!: 'pending' | 'approved' | 'denied';
  requestedAt!: string;
  respondedAt!: string | null;
  notes!: string | null;
}

export class VaccineCertificateDataDto {
  pet!: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
  };
  owner!: {
    name: string;
    email: string | null;
    phone: string;
  };
  vaccinations!: Array<{
    name: string;
    givenDate: string;
    dueDate: string;
    veterinarian: string | null;
  }>;
  certificateDate!: string;
  clinicName!: string;
  clinicAddress!: string;
}
