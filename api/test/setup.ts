import { PrismaClient } from '@prisma/client';
import { resolve } from 'path';

const dbPath = resolve(process.cwd(), 'prisma', 'test.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  const tables = [
    'LabResultValue',
    'LabResult',
    'LabTest',
    'LabPanel',
    'PatientPhoto',
    'Vaccination',
    'WeightRecord',
    'PatientAlert',
    'Prescription',
    'FollowUpReminder',
    'MedicalRecord',
    'Appointment',
    'Patient',
    'User',
    'Owner',
    'Task',
    'MedicationTemplate',
    'NoteTemplate',
    'VitalSigns',
    'CommunicationLog',
    'BotMessage',
    'BotConversation',
    'Payment',
    'InvoiceItem',
    'Invoice',
    'AuditLog',
    'AiPromptTemplate',
    'AIProviderConfig',
    'PlatformSetting',
    'RolePermission',
    'UserRole',
    'Permission',
    'Role',
    'ServiceCatalog',
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
    } catch {
    }
  }
});
