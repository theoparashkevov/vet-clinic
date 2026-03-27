import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/auth/password';
import { USER_ROLES } from '../src/auth/roles.constants';

const prisma = new PrismaClient();
const demoDoctorPassword = 'demo12345';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function todayAt(h: number, m = 0): Date {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateAt(base: Date, h: number, m = 0): Date {
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

async function main() {
  console.log('Seeding database...');
  const passwordHash = hashPassword(demoDoctorPassword);

  // ── Doctors ──────────────────────────────────────────────────────────────
  const drMaria = await prisma.user.upsert({
    where: { email: 'maria.ivanova@vetclinic.com' },
    update: { name: 'Dr. Maria Ivanova', role: USER_ROLES.doctor, passwordHash },
    create: { name: 'Dr. Maria Ivanova', email: 'maria.ivanova@vetclinic.com', role: USER_ROLES.doctor, passwordHash },
  });
  const drPetar = await prisma.user.upsert({
    where: { email: 'petar.dimitrov@vetclinic.com' },
    update: { name: 'Dr. Petar Dimitrov', role: USER_ROLES.doctor, passwordHash },
    create: { name: 'Dr. Petar Dimitrov', email: 'petar.dimitrov@vetclinic.com', role: USER_ROLES.doctor, passwordHash },
  });
  const drElena = await prisma.user.upsert({
    where: { email: 'elena.georgieva@vetclinic.com' },
    update: { name: 'Dr. Elena Georgieva', role: USER_ROLES.doctor, passwordHash },
    create: { name: 'Dr. Elena Georgieva', email: 'elena.georgieva@vetclinic.com', role: USER_ROLES.doctor, passwordHash },
  });
  await prisma.user.upsert({
    where: { email: 'admin@vetclinic.com' },
    update: { name: 'Clinic Admin', role: USER_ROLES.admin, passwordHash },
    create: { name: 'Clinic Admin', email: 'admin@vetclinic.com', role: USER_ROLES.admin, passwordHash },
  });
  await prisma.user.upsert({
    where: { email: 'staff@vetclinic.com' },
    update: { name: 'Front Desk Staff', role: USER_ROLES.staff, passwordHash },
    create: { name: 'Front Desk Staff', email: 'staff@vetclinic.com', role: USER_ROLES.staff, passwordHash },
  });
  await prisma.user.upsert({
    where: { email: 'client@vetclinic.com' },
    update: { name: 'Client Demo', role: USER_ROLES.client, passwordHash },
    create: { name: 'Client Demo', email: 'client@vetclinic.com', role: USER_ROLES.client, passwordHash },
  });
  console.log('  Doctors: Dr. Ivanova, Dr. Dimitrov, Dr. Georgieva');
  console.log('  Staff users: admin@vetclinic.com, staff@vetclinic.com');
  console.log('  Client user: client@vetclinic.com');
  console.log(`  Demo doctor password: ${demoDoctorPassword}`);

  // ── Owners ───────────────────────────────────────────────────────────────
  const ivan = await prisma.owner.create({
    data: { name: 'Ivan Petrov', phone: '+359 888 111 222', email: 'ivan.petrov@mail.com' },
  });
  const ana = await prisma.owner.create({
    data: { name: 'Ana Stoyanova', phone: '+359 888 333 444', email: 'ana.stoyanova@mail.com' },
  });
  const georgi = await prisma.owner.create({
    data: { name: 'Georgi Nikolov', phone: '+359 888 555 666', email: 'georgi.nikolov@mail.com' },
  });
  const marina = await prisma.owner.create({
    data: { name: 'Marina Todorova', phone: '+359 888 777 888', email: 'marina.todorova@mail.com' },
  });
  console.log('  Owners: Ivan, Ana, Georgi, Marina');

  // ── Patients ─────────────────────────────────────────────────────────────
  const rex = await prisma.patient.create({
    data: {
      name: 'Rex', species: 'Dog', breed: 'German Shepherd',
      birthdate: new Date('2020-03-15'), microchipId: 'BG-DOG-001',
      ownerId: ivan.id, allergies: 'Penicillin',
    },
  });
  const whiskers = await prisma.patient.create({
    data: {
      name: 'Whiskers', species: 'Cat', breed: 'Siamese',
      birthdate: new Date('2021-07-20'), microchipId: 'BG-CAT-001',
      ownerId: ana.id, chronicConditions: 'Mild asthma',
    },
  });
  const buddy = await prisma.patient.create({
    data: {
      name: 'Buddy', species: 'Dog', breed: 'Golden Retriever',
      birthdate: new Date('2019-11-05'), microchipId: 'BG-DOG-002',
      ownerId: ivan.id,
    },
  });
  const luna = await prisma.patient.create({
    data: {
      name: 'Luna', species: 'Cat', breed: 'Persian',
      birthdate: new Date('2022-01-10'), ownerId: georgi.id,
    },
  });
  const milo = await prisma.patient.create({
    data: {
      name: 'Milo', species: 'Rabbit', breed: 'Holland Lop',
      birthdate: new Date('2023-06-01'), ownerId: marina.id,
      notes: 'Very timid, handle gently',
    },
  });
  const bella = await prisma.patient.create({
    data: {
      name: 'Bella', species: 'Dog', breed: 'Beagle',
      birthdate: new Date('2021-04-18'), microchipId: 'BG-DOG-003',
      ownerId: ana.id, allergies: 'Chicken-based food',
    },
  });
  console.log('  Patients: Rex, Whiskers, Buddy, Luna, Milo, Bella');

  // ── Patient Alerts ────────────────────────────────────────────────────────
  // Rex - Critical allergy alert
  await prisma.patientAlert.create({
    data: {
      patientId: rex.id,
      type: 'allergy',
      severity: 'critical',
      description: 'Severe penicillin allergy — anaphylaxis risk',
    },
  });
  await prisma.patientAlert.create({
    data: {
      patientId: rex.id,
      type: 'behavioral',
      severity: 'warning',
      description: 'Anxious around other dogs — exam room preferred',
    },
  });

  // Whiskers - Chronic condition
  await prisma.patientAlert.create({
    data: {
      patientId: whiskers.id,
      type: 'chronic_condition',
      severity: 'warning',
      description: 'Mild asthma — avoid stress, dusty environments',
    },
  });
  await prisma.patientAlert.create({
    data: {
      patientId: whiskers.id,
      type: 'medication',
      severity: 'info',
      description: 'Bronchodilator as needed for respiratory distress',
    },
  });

  // Bella - Food allergy
  await prisma.patientAlert.create({
    data: {
      patientId: bella.id,
      type: 'allergy',
      severity: 'warning',
      description: 'Chicken-based food — causes skin reactions',
    },
  });

  // Milo - Special handling
  await prisma.patientAlert.create({
    data: {
      patientId: milo.id,
      type: 'behavioral',
      severity: 'info',
      description: 'Timid — handle gently, slow movements',
    },
  });
  console.log('  Patient alerts: 7 alerts created (critical: 1, warning: 4, info: 2)');

  // ── Vaccinations ───────────────────────────────────────────────────────────
  // Rex vaccinations
  const today = new Date();
  await prisma.vaccination.create({
    data: {
      patientId: rex.id,
      type: 'rabies',
      name: 'Rabies Vaccine',
      givenDate: daysAgo(365),
      dueDate: new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()),
      batchNumber: 'RV-2024-001',
      veterinarian: 'Dr. Maria Ivanova',
      notes: '3-year vaccine administered',
    },
  });
  await prisma.vaccination.create({
    data: {
      patientId: rex.id,
      type: 'dapp',
      name: 'DHPP (Distemper/Hepatitis/Parvo/Parainfluenza)',
      givenDate: daysAgo(365),
      dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30), // Due soon
      batchNumber: 'DHPP-2024-002',
      veterinarian: 'Dr. Maria Ivanova',
    },
  });

  // Whiskers vaccinations
  await prisma.vaccination.create({
    data: {
      patientId: whiskers.id,
      type: 'rabies',
      name: 'Rabies Vaccine',
      givenDate: daysAgo(400),
      dueDate: daysAgo(35), // Overdue
      batchNumber: 'RV-2024-C001',
      veterinarian: 'Dr. Petar Dimitrov',
      notes: 'Overdue for booster',
    },
  });
  await prisma.vaccination.create({
    data: {
      patientId: whiskers.id,
      type: 'fvrcp',
      name: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
      givenDate: daysAgo(380),
      dueDate: daysAgo(15), // Overdue
      batchNumber: 'FVRCP-2024-001',
      veterinarian: 'Dr. Petar Dimitrov',
    },
  });

  // Buddy vaccinations (current)
  await prisma.vaccination.create({
    data: {
      patientId: buddy.id,
      type: 'rabies',
      name: 'Rabies Vaccine',
      givenDate: daysAgo(180),
      dueDate: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
      batchNumber: 'RV-2024-003',
      veterinarian: 'Dr. Elena Georgieva',
    },
  });
  await prisma.vaccination.create({
    data: {
      patientId: buddy.id,
      type: 'dapp',
      name: 'DHPP',
      givenDate: daysAgo(180),
      dueDate: new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()),
      batchNumber: 'DHPP-2024-004',
      veterinarian: 'Dr. Elena Georgieva',
    },
  });
  console.log('  Vaccinations: 6 records created');

  // ── Weight Records ─────────────────────────────────────────────────────────
  // Rex weight history - showing gradual weight gain
  await prisma.weightRecord.create({
    data: {
      patientId: rex.id,
      weight: 30.5,
      date: daysAgo(180),
      notes: 'Healthy weight at 6-month check',
    },
  });
  await prisma.weightRecord.create({
    data: {
      patientId: rex.id,
      weight: 31.2,
      date: daysAgo(90),
      notes: 'Slight gain, within normal range',
    },
  });
  await prisma.weightRecord.create({
    data: {
      patientId: rex.id,
      weight: 32.0,
      date: daysAgo(30),
      notes: 'Good condition',
    },
  });
  await prisma.weightRecord.create({
    data: {
      patientId: rex.id,
      weight: 33.5,
      date: today,
      notes: 'Current weight - slight increase, monitor',
    },
  });

  // Buddy weight history - showing significant weight loss (concerning)
  await prisma.weightRecord.create({
    data: {
      patientId: buddy.id,
      weight: 34.0,
      date: daysAgo(120),
      notes: 'Healthy weight',
    },
  });
  await prisma.weightRecord.create({
    data: {
      patientId: buddy.id,
      weight: 33.5,
      date: daysAgo(90),
      notes: 'Stable',
    },
  });
  await prisma.weightRecord.create({
    data: {
      patientId: buddy.id,
      weight: 32.0,
      date: daysAgo(60),
      notes: 'Some weight loss noted',
    },
  });
  await prisma.weightRecord.create({
    data: {
      patientId: buddy.id,
      weight: 30.0,
      date: daysAgo(45),
      notes: 'Post-sprain recovery - decreased appetite',
    },
  });
  await prisma.weightRecord.create({
    data: {
      patientId: buddy.id,
      weight: 29.5,
      date: today,
      notes: 'Current - continued weight loss, needs investigation',
    },
  });

  // Whiskers weight (stable)
  await prisma.weightRecord.create({
    data: {
      patientId: whiskers.id,
      weight: 4.2,
      date: daysAgo(60),
    },
  });
  await prisma.weightRecord.create({
    data: {
      patientId: whiskers.id,
      weight: 4.3,
      date: today,
      notes: 'Stable weight',
    },
  });

  // Bella weight (slight loss)
  await prisma.weightRecord.create({
    data: {
      patientId: bella.id,
      weight: 10.5,
      date: daysAgo(90),
    },
  });
  await prisma.weightRecord.create({
    data: {
      patientId: bella.id,
      weight: 9.8,
      date: today,
      notes: 'On hypoallergenic diet - some weight loss expected',
    },
  });
  console.log('  Weight records: 15 records created');

  // ── Today's appointments ──────────────────────────────────────────────────
  await prisma.appointment.create({
    data: {
      patientId: rex.id, ownerId: ivan.id, doctorId: drMaria.id,
      startsAt: todayAt(9, 0), endsAt: todayAt(9, 30),
      reason: 'Annual vaccination', status: 'scheduled',
    },
  });
  await prisma.appointment.create({
    data: {
      patientId: whiskers.id, ownerId: ana.id, doctorId: drPetar.id,
      startsAt: todayAt(10, 0), endsAt: todayAt(10, 30),
      reason: 'Respiratory check-up', status: 'scheduled',
    },
  });
  await prisma.appointment.create({
    data: {
      patientId: buddy.id, ownerId: ivan.id, doctorId: drElena.id,
      startsAt: todayAt(14, 0), endsAt: todayAt(14, 30),
      reason: 'Dental cleaning', status: 'scheduled',
    },
  });
  await prisma.appointment.create({
    data: {
      patientId: luna.id, ownerId: georgi.id, doctorId: drMaria.id,
      startsAt: todayAt(11, 0), endsAt: todayAt(11, 30),
      reason: 'General check-up', status: 'scheduled',
    },
  });
  await prisma.appointment.create({
    data: {
      patientId: bella.id, ownerId: ana.id, doctorId: drPetar.id,
      startsAt: todayAt(15, 0), endsAt: todayAt(15, 30),
      reason: 'Skin allergy follow-up', status: 'scheduled',
    },
  });
  console.log("  Today's appointments: 5");

  // ── Past appointments + medical records ───────────────────────────────────
  const pastAppt1 = await prisma.appointment.create({
    data: {
      patientId: rex.id, ownerId: ivan.id, doctorId: drMaria.id,
      startsAt: dateAt(daysAgo(30), 9, 0), endsAt: dateAt(daysAgo(30), 9, 30),
      reason: 'Routine check-up', status: 'completed',
    },
  });
  await prisma.medicalRecord.create({
    data: {
      patientId: rex.id, appointmentId: pastAppt1.id,
      visitDate: daysAgo(30),
      summary: 'Routine check-up. All vitals normal. Weight 32 kg.',
      diagnoses: 'Healthy',
      treatments: 'None required',
      prescriptions: 'Heartworm prevention — monthly',
    },
  });

  const pastAppt2 = await prisma.appointment.create({
    data: {
      patientId: rex.id, ownerId: ivan.id, doctorId: drPetar.id,
      startsAt: dateAt(daysAgo(90), 10, 0), endsAt: dateAt(daysAgo(90), 10, 30),
      reason: 'Ear infection', status: 'completed',
    },
  });
  await prisma.medicalRecord.create({
    data: {
      patientId: rex.id, appointmentId: pastAppt2.id,
      visitDate: daysAgo(90),
      summary: 'Presented with head shaking and ear scratching. Left ear inflamed.',
      diagnoses: 'Otitis externa (bacterial)',
      treatments: 'Ear cleaning, topical antibiotic drops',
      prescriptions: 'Otomax ear drops — 7 days',
    },
  });

  const pastAppt3 = await prisma.appointment.create({
    data: {
      patientId: whiskers.id, ownerId: ana.id, doctorId: drPetar.id,
      startsAt: dateAt(daysAgo(60), 11, 0), endsAt: dateAt(daysAgo(60), 11, 30),
      reason: 'Coughing episode', status: 'completed',
    },
  });
  await prisma.medicalRecord.create({
    data: {
      patientId: whiskers.id, appointmentId: pastAppt3.id,
      visitDate: daysAgo(60),
      summary: 'Mild coughing. Lungs clear on auscultation. Asthma history noted.',
      diagnoses: 'Mild upper respiratory irritation — asthma flare',
      treatments: 'Steam therapy recommended, reduce dust exposure',
      prescriptions: 'Bronchodilator — as needed',
    },
  });

  const pastAppt4 = await prisma.appointment.create({
    data: {
      patientId: buddy.id, ownerId: ivan.id, doctorId: drElena.id,
      startsAt: dateAt(daysAgo(45), 14, 0), endsAt: dateAt(daysAgo(45), 14, 30),
      reason: 'Limping — right front leg', status: 'completed',
    },
  });
  await prisma.medicalRecord.create({
    data: {
      patientId: buddy.id, appointmentId: pastAppt4.id,
      visitDate: daysAgo(45),
      summary: 'Limping on right front leg. X-ray performed — no fracture.',
      diagnoses: 'Minor sprain — right carpus',
      treatments: 'Rest, cold compress 3× daily',
      prescriptions: 'Meloxicam 1 mg/kg — 5 days',
    },
  });

  const pastAppt5 = await prisma.appointment.create({
    data: {
      patientId: buddy.id, ownerId: ivan.id, doctorId: drElena.id,
      startsAt: dateAt(daysAgo(38), 14, 0), endsAt: dateAt(daysAgo(38), 14, 30),
      reason: 'Sprain follow-up', status: 'completed',
    },
  });
  await prisma.medicalRecord.create({
    data: {
      patientId: buddy.id, appointmentId: pastAppt5.id,
      visitDate: daysAgo(38),
      summary: 'Follow-up for right carpus sprain. Full weight bearing restored. Good recovery.',
      diagnoses: 'Resolved sprain',
      treatments: 'Gradual return to normal activity',
      prescriptions: 'None',
    },
  });

  const pastAppt6 = await prisma.appointment.create({
    data: {
      patientId: luna.id, ownerId: georgi.id, doctorId: drMaria.id,
      startsAt: dateAt(daysAgo(15), 9, 0), endsAt: dateAt(daysAgo(15), 9, 30),
      reason: 'Vomiting', status: 'completed',
    },
  });
  await prisma.medicalRecord.create({
    data: {
      patientId: luna.id, appointmentId: pastAppt6.id,
      visitDate: daysAgo(15),
      summary: 'Presented with 2-day vomiting history. Palpation normal. Likely dietary indiscretion.',
      diagnoses: 'Acute gastritis',
      treatments: '24h fasting, bland diet (boiled chicken + rice)',
      prescriptions: 'Cerenia 1 mg/kg — 3 days',
    },
  });

  // ── Future appointment ────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await prisma.appointment.create({
    data: {
      patientId: milo.id, ownerId: marina.id, doctorId: drElena.id,
      startsAt: dateAt(tomorrow, 10, 30), endsAt: dateAt(tomorrow, 11, 0),
      reason: 'First visit — health screening', status: 'scheduled',
    },
  });

  console.log('  Past appointments + medical records: 6');
  console.log('  Upcoming appointments: 1 (tomorrow)');
  console.log('\nSeeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
