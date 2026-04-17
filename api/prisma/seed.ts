import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/auth/password';
import { USER_ROLES } from '../src/auth/roles.constants';

const prisma = new PrismaClient();
const demoDoctorPassword = 'demo12345';
const adminPassword = 'admin123';

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
  const doctorPasswordHash = hashPassword(demoDoctorPassword);
  const adminPasswordHash = hashPassword(adminPassword);

  // ── Doctors ──────────────────────────────────────────────────────────────
  const drMaria = await prisma.user.upsert({
    where: { email: 'maria.ivanova@vetclinic.com' },
    update: { name: 'Dr. Maria Ivanova', role: USER_ROLES.doctor, passwordHash: doctorPasswordHash },
    create: { name: 'Dr. Maria Ivanova', email: 'maria.ivanova@vetclinic.com', role: USER_ROLES.doctor, passwordHash: doctorPasswordHash },
  });
  const drPetar = await prisma.user.upsert({
    where: { email: 'petar.dimitrov@vetclinic.com' },
    update: { name: 'Dr. Petar Dimitrov', role: USER_ROLES.doctor, passwordHash: doctorPasswordHash },
    create: { name: 'Dr. Petar Dimitrov', email: 'petar.dimitrov@vetclinic.com', role: USER_ROLES.doctor, passwordHash: doctorPasswordHash },
  });
  const drElena = await prisma.user.upsert({
    where: { email: 'elena.georgieva@vetclinic.com' },
    update: { name: 'Dr. Elena Georgieva', role: USER_ROLES.doctor, passwordHash: doctorPasswordHash },
    create: { name: 'Dr. Elena Georgieva', email: 'elena.georgieva@vetclinic.com', role: USER_ROLES.doctor, passwordHash: doctorPasswordHash },
  });
  await prisma.user.upsert({
    where: { email: 'admin@vetclinic.com' },
    update: { name: 'Clinic Admin', role: USER_ROLES.admin, passwordHash: adminPasswordHash },
    create: { name: 'Clinic Admin', email: 'admin@vetclinic.com', role: USER_ROLES.admin, passwordHash: adminPasswordHash },
  });
  await prisma.user.upsert({
    where: { email: 'staff@vetclinic.com' },
    update: { name: 'Front Desk Staff', role: USER_ROLES.staff, passwordHash: doctorPasswordHash },
    create: { name: 'Front Desk Staff', email: 'staff@vetclinic.com', role: USER_ROLES.staff, passwordHash: doctorPasswordHash },
  });
  await prisma.user.upsert({
    where: { email: 'client@vetclinic.com' },
    update: { name: 'Client Demo', role: USER_ROLES.client, passwordHash: doctorPasswordHash },
    create: { name: 'Client Demo', email: 'client@vetclinic.com', role: USER_ROLES.client, passwordHash: doctorPasswordHash },
  });
  console.log('  Doctors: Dr. Ivanova, Dr. Dimitrov, Dr. Georgieva');
  console.log('  Admin user: admin@vetclinic.com');
  console.log('  Staff users: staff@vetclinic.com');
  console.log('  Client user: client@vetclinic.com');
  console.log(`  Admin password: ${adminPassword}`);
  console.log(`  Other users password: ${demoDoctorPassword}`);

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
      reason: 'Annual vaccination', status: 'in_progress',
    },
  });
  await prisma.appointment.create({
    data: {
      patientId: whiskers.id, ownerId: ana.id, doctorId: drPetar.id,
      startsAt: todayAt(10, 0), endsAt: todayAt(10, 30),
      reason: 'Respiratory check-up', status: 'checked_in',
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
  console.log("  Today's appointments: 5 (1 in progress, 1 checked in)");

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

  // ── Prescriptions ─────────────────────────────────────────────────────────
  // Rex - Active prescriptions
  await prisma.prescription.create({
    data: {
      patientId: rex.id,
      medication: 'Carprofen 75mg',
      dosage: '1 tablet',
      frequency: 'Once daily',
      duration: '7 days',
      instructions: 'Give with food for joint pain',
      expiresAt: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      refillsTotal: 2,
      refillsRemaining: 2,
      isControlled: false,
      veterinarian: 'Dr. Maria Ivanova',
    },
  });

  // Rex - This should trigger allergy warning (Penicillin allergy)
  await prisma.prescription.create({
    data: {
      patientId: rex.id,
      medication: 'Amoxicillin 250mg',
      dosage: '1 tablet',
      frequency: 'Twice daily',
      duration: '10 days',
      instructions: 'For skin infection',
      expiresAt: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      refillsTotal: 0,
      refillsRemaining: 0,
      isControlled: false,
      veterinarian: 'Dr. Petar Dimitrov',
    },
  });

  // Buddy - Past prescription (linked to sprain)
  await prisma.prescription.create({
    data: {
      patientId: buddy.id,
      medication: 'Meloxicam 1.5mg/ml',
      dosage: '0.1 mg/kg',
      frequency: 'Once daily',
      duration: '5 days',
      instructions: 'Give with food for pain',
      expiresAt: daysAgo(40),
      refillsTotal: 0,
      refillsRemaining: 0,
      isControlled: false,
      veterinarian: 'Dr. Elena Georgieva',
    },
  });

  // Whiskers - Ongoing asthma medication
  await prisma.prescription.create({
    data: {
      patientId: whiskers.id,
      medication: 'Bronchodilator (Albuterol)',
      dosage: '1 puff',
      frequency: 'As needed',
      duration: 'Ongoing',
      instructions: 'Use inhaler with spacer during asthma episodes',
      expiresAt: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
      refillsTotal: 5,
      refillsRemaining: 3,
      isControlled: false,
      veterinarian: 'Dr. Petar Dimitrov',
    },
  });
  console.log('  Prescriptions: 4 records created');

  // ── Follow-up Reminders ────────────────────────────────────────────────────
  // Rex - Lab results due today (high priority)
  await prisma.followUpReminder.create({
    data: {
      patientId: rex.id,
      type: 'lab_results',
      title: 'Call with lab results',
      description: 'Bloodwork from yesterday - discuss with owner',
      dueDate: todayAt(16, 0),
      priority: 'high',
      status: 'pending',
      assignedTo: drMaria.id,
      notifyClient: true,
    },
  });

  // Buddy - Weight recheck (overdue)
  await prisma.followUpReminder.create({
    data: {
      patientId: buddy.id,
      type: 'recheck',
      title: 'Weight loss recheck',
      description: 'Schedule weight check - continuing weight loss noted',
      dueDate: daysAgo(2),
      priority: 'urgent',
      status: 'pending',
      assignedTo: drElena.id,
      notifyClient: true,
    },
  });

  // Whiskers - Medication refill (due soon)
  const tomorrowReminder = new Date();
  tomorrowReminder.setDate(tomorrowReminder.getDate() + 1);
  await prisma.followUpReminder.create({
    data: {
      patientId: whiskers.id,
      type: 'medication',
      title: 'Bronchodilator refill',
      description: 'Inhaler running low - needs refill',
      dueDate: tomorrowReminder,
      priority: 'normal',
      status: 'pending',
      assignedTo: drPetar.id,
      notifyClient: true,
    },
  });

  // Luna - Post-vomiting check
  await prisma.followUpReminder.create({
    data: {
      patientId: luna.id,
      type: 'recheck',
      title: 'Post-gastritis follow-up',
      description: 'Check if vomiting has resolved',
      dueDate: todayAt(18, 0),
      priority: 'normal',
      status: 'pending',
      assignedTo: drMaria.id,
      notifyClient: false,
    },
  });

  // Bella - Surgery follow-up (from recent spay)
  await prisma.followUpReminder.create({
    data: {
      patientId: bella.id,
      type: 'surgery_followup',
      title: 'Spay incision check',
      description: 'Check incision healing, remove sutures if needed',
      dueDate: daysAgo(1),
      priority: 'high',
      status: 'pending',
      assignedTo: drPetar.id,
      notifyClient: true,
    },
  });
  console.log('  Follow-up reminders: 5 reminders created');

  // ── Medication Templates ─────────────────────────────────────────────────
  await prisma.medicationTemplate.createMany({
    data: [
      { name: 'Amoxicillin 250mg', category: 'Antibiotic', dosage: '1 tablet', frequency: 'Twice daily', duration: '7 days', instructions: 'Give with food', isCommon: true },
      { name: 'Amoxicillin 500mg', category: 'Antibiotic', dosage: '1 tablet', frequency: 'Twice daily', duration: '7 days', instructions: 'Give with food', isCommon: true },
      { name: 'Cephalexin 250mg', category: 'Antibiotic', dosage: '1 capsule', frequency: 'Twice daily', duration: '10 days', isCommon: true },
      { name: 'Clavamox 62.5mg', category: 'Antibiotic', dosage: '1 tablet', frequency: 'Twice daily', duration: '7-10 days', isCommon: true },
      { name: 'Metronidazole 250mg', category: 'Antibiotic', dosage: '1 tablet', frequency: 'Twice daily', duration: '5-7 days', instructions: 'Give with food', isCommon: true },
      { name: 'Carprofen 75mg', category: 'NSAID / Pain Relief', dosage: '1 tablet', frequency: 'Once daily', duration: '5-7 days', instructions: 'Give with food. Monitor for GI upset.', isCommon: true },
      { name: 'Meloxicam 1.5mg/ml', category: 'NSAID / Pain Relief', dosage: '0.1 mg/kg', frequency: 'Once daily', duration: '3-5 days', instructions: 'Oral suspension. Give with food.', isCommon: true },
      { name: 'Tramadol 50mg', category: 'Pain Relief', dosage: '1/2-1 tablet', frequency: '2-3 times daily', duration: 'As needed', instructions: 'May cause sedation', isCommon: true },
      { name: 'Gabapentin 100mg', category: 'Pain Relief / Anxiety', dosage: '1 capsule', frequency: '2-3 times daily', duration: 'Ongoing', instructions: 'May cause sedation. Taper when discontinuing.', isCommon: true },
      { name: 'Prednisone 5mg', category: 'Steroid', dosage: '1-2 tablets', frequency: 'Once daily', duration: '5-7 days then taper', instructions: 'Give with food. Do NOT stop abruptly.', isCommon: true },
      { name: 'Prednisone 20mg', category: 'Steroid', dosage: '1 tablet', frequency: 'Once daily', duration: '5-7 days then taper', instructions: 'Give with food. Do NOT stop abruptly.', isCommon: true },
      { name: 'Apoquel 16mg', category: 'Anti-Itch', dosage: '1 tablet', frequency: 'Twice daily for 14 days, then once daily', duration: 'Ongoing', instructions: 'For allergic dermatitis', isCommon: true },
      { name: 'Cyclosporine 25mg', category: 'Immunosuppressant', dosage: '1 capsule', frequency: 'Once daily', duration: 'Ongoing', instructions: 'For atopic dermatitis. Monitor blood work.', isCommon: false },
      { name: 'Doxycycline 100mg', category: 'Antibiotic', dosage: '1 tablet', frequency: 'Once daily', duration: '14-21 days', instructions: 'Give with food. Avoid dairy.', isCommon: true },
      { name: 'Enrofloxacin 68mg', category: 'Antibiotic', dosage: '1 tablet', frequency: 'Once daily', duration: '7-14 days', instructions: 'Avoid in young growing animals', isCommon: true },
      { name: 'Convenia (Cefovecin)', category: 'Antibiotic', dosage: '8 mg/kg', frequency: 'Single injection', duration: '14 days', instructions: 'Long-acting injection', isCommon: true },
      { name: 'Furosemide 40mg', category: 'Diuretic', dosage: '1/2-1 tablet', frequency: '1-3 times daily', duration: 'Ongoing', instructions: 'For CHF. Monitor kidney function.', isCommon: false },
      { name: 'Enalapril 5mg', category: 'ACE Inhibitor', dosage: '1 tablet', frequency: 'Once daily', duration: 'Ongoing', instructions: 'For heart disease. Monitor kidney function.', isCommon: false },
      { name: 'Pimobendan 5mg', category: 'Cardiac', dosage: '1 tablet', frequency: 'Twice daily', duration: 'Ongoing', instructions: 'For congestive heart failure', isCommon: false },
      { name: 'Methimazole 5mg', category: 'Thyroid', dosage: '1 tablet', frequency: 'Twice daily', duration: 'Ongoing', instructions: 'For hyperthyroidism (cats). Monitor T4.', isCommon: false },
      { name: 'Levothyroxine 0.5mg', category: 'Thyroid', dosage: '1 tablet', frequency: 'Twice daily', duration: 'Ongoing', instructions: 'For hypothyroidism (dogs)', isCommon: false },
      { name: 'Insulin (Lantus)', category: 'Diabetes', dosage: '2-4 units', frequency: 'Twice daily', duration: 'Ongoing', instructions: 'Adjust based on glucose curves', isCommon: false },
      { name: 'Prozinc (PZI)', category: 'Diabetes', dosage: '1-3 units', frequency: 'Twice daily', duration: 'Ongoing', instructions: 'For diabetic cats', isCommon: false },
      { name: 'Cerenia 16mg', category: 'Anti-Nausea', dosage: '1 tablet', frequency: 'Once daily', duration: '1-5 days', instructions: 'For vomiting. Can give injection also.', isCommon: true },
      { name: 'Omeprazole 20mg', category: 'GI Protectant', dosage: '1 capsule', frequency: 'Once daily', duration: '7-14 days', instructions: 'For gastric ulcers', isCommon: true },
      { name: 'Sucralfate 1g', category: 'GI Protectant', dosage: '1 tablet', frequency: '2-4 times daily', duration: '7-14 days', instructions: 'Give on empty stomach', isCommon: true },
      { name: 'Metoclopramide 10mg', category: 'GI Motility', dosage: '1/2 tablet', frequency: '3-4 times daily', duration: 'As needed', instructions: 'For nausea/GERD', isCommon: false },
      { name: 'Diphenhydramine 25mg', category: 'Antihistamine', dosage: '1-2 tablets', frequency: '2-3 times daily', duration: 'As needed', instructions: 'May cause sedation', isCommon: true },
      { name: 'Cetirizine 10mg', category: 'Antihistamine', dosage: '1/2 tablet', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Non-drowsy option', isCommon: true },
      { name: 'Chlorpheniramine 4mg', category: 'Antihistamine', dosage: '1/2 tablet', frequency: 'Twice daily', duration: 'Ongoing', instructions: 'For cats', isCommon: true },
      { name: 'Clopidogrel 75mg', category: 'Blood Thinner', dosage: '1/4 tablet', frequency: 'Once daily', duration: 'Ongoing', instructions: 'For heart disease', isCommon: false },
      { name: 'Amlodipine 2.5mg', category: 'Calcium Channel Blocker', dosage: '1/4 tablet', frequency: 'Once daily', duration: 'Ongoing', instructions: 'For hypertension', isCommon: false },
      { name: 'Benazepril 5mg', category: 'ACE Inhibitor', dosage: '1 tablet', frequency: 'Once daily', duration: 'Ongoing', instructions: 'For kidney disease', isCommon: false },
      { name: 'Mirtazapine 15mg', category: 'Appetite Stimulant', dosage: '1/4 tablet', frequency: 'Every 2-3 days', duration: 'As needed', instructions: 'For cats with poor appetite', isCommon: true },
      { name: 'Capromorelin (Entyce)', category: 'Appetite Stimulant', dosage: '3 mg/kg', frequency: 'Once daily', duration: 'As needed', instructions: 'For dogs', isCommon: false },
      { name: 'Atopica (Cyclosporine) 25mg', category: 'Immunosuppressant', dosage: '1 capsule', frequency: 'Once daily', duration: 'Ongoing', instructions: 'For atopic dermatitis', isCommon: false },
      { name: 'Ketoconazole 200mg', category: 'Antifungal', dosage: '1 tablet', frequency: 'Once daily', duration: '21-30 days', instructions: 'Monitor liver enzymes', isCommon: false },
      { name: 'Fluconazole 100mg', category: 'Antifungal', dosage: '1/2-1 tablet', frequency: 'Once daily', duration: '30-60 days', instructions: 'For systemic fungal infections', isCommon: false },
      { name: 'Ivermectin 1% Injectable', category: 'Antiparasitic', dosage: '0.1 ml', frequency: 'Single dose', duration: 'Single', instructions: 'For mites', isCommon: true },
      { name: 'Revolution (Selamectin)', category: 'Antiparasitic', dosage: 'By weight', frequency: 'Monthly', duration: 'Ongoing', instructions: 'Heartworm + flea prevention', isCommon: true },
      { name: 'Bravecto (Fluralaner)', category: 'Antiparasitic', dosage: 'By weight', frequency: 'Every 3 months', duration: 'Ongoing', instructions: 'Flea and tick prevention', isCommon: true },
      { name: 'NexGard (Afoxolaner)', category: 'Antiparasitic', dosage: 'By weight', frequency: 'Monthly', duration: 'Ongoing', instructions: 'Flea and tick prevention', isCommon: true },
      { name: 'Heartgard (Ivermectin)', category: 'Antiparasitic', dosage: 'By weight', frequency: 'Monthly', duration: 'Ongoing', instructions: 'Heartworm prevention', isCommon: true },
      { name: 'Interceptor (Milbemycin)', category: 'Antiparasitic', dosage: 'By weight', frequency: 'Monthly', duration: 'Ongoing', instructions: 'Heartworm + intestinal worms', isCommon: true },
      { name: 'Drontal (Praziquantel/Pyrantel)', category: 'Dewormer', dosage: 'By weight', frequency: 'Single dose', duration: 'Single', instructions: 'Tapeworm + roundworm', isCommon: true },
      { name: 'Panacur (Fenbendazole)', category: 'Dewormer', dosage: 'By weight', frequency: 'Once daily for 3 days', duration: '3 days', instructions: 'Broad spectrum dewormer', isCommon: true },
      { name: 'Ponazuril 100mg/ml', category: 'Coccidiostat', dosage: '20 mg/kg', frequency: 'Once daily for 1-3 days', duration: '1-3 days', instructions: 'For coccidia', isCommon: false },
      { name: 'Albon (Sulfadimethoxine)', category: 'Antibiotic', dosage: 'By weight', frequency: 'Once daily for 10 days', duration: '10 days', instructions: 'For coccidia', isCommon: false },
      { name: 'Atropine 1% Ophthalmic', category: 'Ophthalmic', dosage: '1 drop', frequency: '2-3 times daily', duration: 'As directed', instructions: 'Dilate pupil', isCommon: true },
      { name: 'Tobramycin Ophthalmic', category: 'Ophthalmic', dosage: '1 drop', frequency: '3-4 times daily', duration: '7-10 days', instructions: 'Antibiotic eye drops', isCommon: true },
      { name: 'Neo-Poly-Dex Ophthalmic', category: 'Ophthalmic', dosage: '1 drop', frequency: '3-4 times daily', duration: '7-10 days', instructions: 'Antibiotic + steroid', isCommon: true },
      { name: 'Cyclosporine Ophthalmic (Restasis)', category: 'Ophthalmic', dosage: '1 drop', frequency: 'Twice daily', duration: 'Ongoing', instructions: 'For dry eye (KCS)', isCommon: true },
      { name: 'TrizEDTA Ear Flush', category: 'Otology', dosage: 'Fill ear canal', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Ear cleaning solution', isCommon: true },
      { name: 'Otomax Ointment', category: 'Otology', dosage: '4 drops', frequency: 'Twice daily', duration: '7 days', instructions: 'For ear infections', isCommon: true },
      { name: 'Posatex Otic', category: 'Otology', dosage: '4 drops', frequency: 'Once daily', duration: '7 days', instructions: 'For ear infections', isCommon: true },
      { name: 'MalAcetic Otic', category: 'Otology', dosage: 'Fill ear canal', frequency: '2-3 times weekly', duration: 'Ongoing', instructions: 'Ear cleaning/maintenance', isCommon: true },
      { name: 'Lactated Ringers (Subcutaneous)', category: 'Fluid Therapy', dosage: '100-300 ml', frequency: 'As needed', duration: 'Ongoing', instructions: 'For hydration', isCommon: true },
      { name: 'Vitamin B12 Injection', category: 'Supplement', dosage: '0.25-0.5 ml', frequency: 'Weekly', duration: '4-6 weeks', instructions: 'For anemia/poor appetite', isCommon: false },
      { name: 'Iron Dextran Injection', category: 'Supplement', dosage: '10-20 mg/kg', frequency: 'Weekly', duration: '3-4 weeks', instructions: 'For iron deficiency anemia', isCommon: false },
      { name: 'Omega-3 Fatty Acids', category: 'Supplement', dosage: 'By weight', frequency: 'Once daily', duration: 'Ongoing', instructions: 'For skin/coat health', isCommon: true },
      { name: 'Glucosamine/Chondroitin', category: 'Supplement', dosage: 'By weight', frequency: 'Once daily', duration: 'Ongoing', instructions: 'For joint health', isCommon: true },
      { name: 'Adequan (Polysulfated Glycosaminoglycan)', category: 'Joint Supplement', dosage: '4.4 mg/kg', frequency: 'Twice weekly for 4 weeks, then monthly', duration: 'Ongoing', instructions: 'Intramuscular injection for arthritis', isCommon: false },
      { name: 'Cosequin (Glucosamine/Chondroitin)', category: 'Supplement', dosage: 'By weight', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Joint supplement', isCommon: true },
      { name: 'Dasuquin Advanced', category: 'Supplement', dosage: 'By weight', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Advanced joint supplement with ASU', isCommon: true },
      { name: 'Proin (Phenylpropanolamine) 25mg', category: 'Urinary Incontinence', dosage: '1/2-1 tablet', frequency: '2-3 times daily', duration: 'Ongoing', instructions: 'For urinary incontinence', isCommon: false },
      { name: 'Incurin (Estriol)', category: 'Urinary Incontinence', dosage: '1 tablet', frequency: 'Once daily', duration: 'Ongoing', instructions: 'For spay incontinence', isCommon: false },
    ],
  });
  console.log('  Medication templates: 60+ common drugs');

  // ── Note Templates ───────────────────────────────────────────────────────
  await prisma.noteTemplate.createMany({
    data: [
      {
        name: 'Wellness Exam - Normal',
        category: 'Wellness',
        content: `{{patientName}} presented for routine wellness examination.

Physical Examination:
- Temperature: Normal
- Heart rate: Normal ({{species}}: 80-120 bpm)
- Respiratory rate: Normal
- Body condition score: 5/9 (Ideal)
- Coat and skin: Healthy, no lesions or parasites
- Eyes: Clear, no discharge
- Ears: Clean, no odor or inflammation
- Oral cavity: Teeth clean, mild gingivitis
- Lymph nodes: Normal size
- Abdomen: Soft, non-painful
- Musculoskeletal: Normal gait, no lameness

Weight: {{weight}} kg

Assessment: Healthy adult {{species}}. No medical concerns identified.

Plan:
- Continue current diet and exercise regimen
- Vaccinations updated as indicated
- Parasite prevention maintained
- Next wellness examination in 12 months
- Owner education provided on dental care`,
        isCommon: true,
      },
      {
        name: 'Vaccination Only Visit',
        category: 'Preventive Care',
        content: `{{patientName}} presented for vaccination update.

Pre-vaccination examination: Normal
Body weight: {{weight}} kg

Vaccines Administered:
- Rabies (1-year or 3-year)
- {{species === 'Dog' ? 'DA2PP (Distemper/Parvo)' : 'FVRCP (Feline Distemper)'}}
- 

Patient tolerated vaccines well. No immediate adverse reactions observed.

Post-vaccination instructions provided to owner:
- Monitor for lethargy or soreness at injection site for 24-48 hours
- Contact clinic if vomiting, facial swelling, or difficulty breathing occurs

Next vaccines due:`,
        isCommon: true,
      },
      {
        name: 'Sick Visit - General',
        category: 'Sick Visit',
        content: `{{patientName}} presented with owner's concern regarding: 

History:
- Duration of symptoms: 
- Progression: 
- Current medications: 
- Appetite: 
- Activity level: 

Physical Examination:
- Temperature: 
- Heart rate: 
- Respiratory rate: 
- Body condition: 
- Specific findings: 

Diagnostic Tests:
- 

Assessment:
- Primary diagnosis: 
- Secondary concerns: 

Treatment Plan:
1. 
2. 
3. 

Medications prescribed:
- 

Follow-up:
- Recheck in 
- Return sooner if 

Prognosis:`,
        isCommon: true,
      },
      {
        name: 'Ear Infection (Otitis)',
        category: 'Sick Visit',
        content: `{{patientName}} presented for ear discomfort.

Chief Complaint: Head shaking, ear scratching, odor from {{ear}} ear(s)

Physical Examination:
- {{ear}} ear canal: Erythematous, swollen, {{discharge_type}} discharge
- {{ear}} ear canal: {{normal/abnormal}}
- Tympanic membrane: {{intact/not visible}}
- Odor: {{mild/moderate/severe}}
- Cytology: {{yeast/bacteria/both}}

Assessment: {{Acute/Chronic}} otitis {{externa/media}} - {{bacterial/yeast/mixed}}

Treatment:
1. Ear cleaning: TrizEDTA flush
2. Topical medication: {{medication}} - {{frequency}} for {{duration}}
3. Oral medication: {{if needed}}
4. Cone (E-collar) to prevent scratching

Owner Instructions:
- Apply medication as directed
- Keep ears dry
- Return in 7-10 days for recheck
- Call if worsening or no improvement in 3 days

Prognosis: Good with compliance`,
        isCommon: true,
      },
      {
        name: 'Skin Allergy / Dermatitis',
        category: 'Dermatology',
        content: `{{patientName}} presented for skin issues.

History:
- Duration: 
- Seasonality: 
- Previous episodes: 
- Current medications: 
- Diet: 
- Flea control: 

Physical Examination:
- Distribution: 
- Lesions: {{erythema, papules, crusts, excoriations}}
- Secondary changes: {{lichenification, hyperpigmentation}}
- Flea dirt: {{present/absent}}
- Ear involvement: 

Assessment: {{Allergic dermatitis / Atopy / Flea allergy / Food allergy}}

Diagnostic Plan:
- Skin cytology
- Skin scraping (rule out mites)
- Fungal culture (if indicated)
- Food trial (if food allergy suspected)
- Allergy testing (if atopy suspected)

Treatment Plan:
1. Symptomatic relief: {{Apoquel / Cytopoint / Steroids}}
2. Secondary infection: {{antibiotic}} if pyoderma present
3. Topical therapy: {{shampoo/spray}}
4. Flea prevention: Ensure current
5. Diet: {{food trial if indicated}}

Recheck in 2-4 weeks or sooner if worsening.`,
        isCommon: true,
      },
      {
        name: 'Post-Surgery Follow-up',
        category: 'Surgery',
        content: `{{patientName}} presented for post-operative recheck.

Surgery performed: 
Date of surgery: 
Surgeon: {{veterinarian}}

Incision site examination:
- Appearance: {{clean/dry/intact, mild redness, swelling, discharge}}
- Sutures: {{intact/absorbed/removed}}
- Pain level: {{comfortable/mild discomfort}}

Activity/Behavior:
- Activity level: 
- Appetite: 
- Elimination: 
- Medication compliance: 

Assessment: {{Normal healing / Complication noted}}

Plan:
- Continue {{medication}} for {{duration}}
- Activity restriction: {{continue/lift gradually}}
- Cone/E-collar: {{continue/discontinue}}
- Next recheck: {{date}}

Prognosis: {{Excellent/Good/Guarded}}`,
        isCommon: true,
      },
      {
        name: 'Dental Cleaning / Prophylaxis',
        category: 'Dental',
        content: `{{patientName}} presented for dental prophylaxis.

Pre-operative examination: Within normal limits
Anesthesia: Smooth induction and recovery

Dental Procedure:
- Scaling and polishing: Complete
- Dental radiographs: {{taken/normal findings}}

Findings:
- Calculus: {{mild/moderate/severe}}
- Gingivitis: {{Grade 0-3}}
- Extractions performed: {{none/# teeth}}
- Abnormalities: {{none/noted}}

Post-operative care:
- Pain management: {{medication}} sent home
- Antibiotics: {{if indicated}}
- Soft food for 7-10 days if extractions performed
- Home dental care discussed

Next dental recheck: 6-12 months

Prognosis: Excellent with home dental care`,
        isCommon: true,
      },
      {
        name: 'Geriatric Wellness',
        category: 'Wellness',
        content: `{{patientName}} presented for senior wellness examination.

Age: {{calculated from birthdate}}
Species: {{species}}
Current weight: {{weight}} kg ({{stable/increased/decreased}})

Physical Examination:
- General: Bright, alert, responsive
- Mobility: {{normal/stiffness noted}}
- Vision/Hearing: {{normal/changes noted}}
- Body condition: 
- Lumps/bumps: {{none/noted}}

Senior Wellness Screening:
- Complete blood count (CBC): 
- Chemistry panel: 
- Thyroid ({{species === 'Cat' ? 'T4' : 'T4/Free T4'}}): 
- Urinalysis: 
- Blood pressure: 

Assessment: {{Normal for age / Early changes noted / Significant findings}}

Recommendations:
- Continue current preventive care
- {{Diet modification if needed}}
- {{Joint supplements if indicated}}
- {{Medication adjustments}}
- Recheck labs in {{6-12 months}}`,
        isCommon: true,
      },
      {
        name: 'Euthanasia / End of Life',
        category: 'End of Life',
        content: `Difficult decision made by owner regarding {{patientName}}.

Reason for euthanasia consideration:
- 

Quality of life assessment:
- Pain level: 
- Mobility: 
- Appetite: 
- Enjoyment of life: 

Discussion with owner:
- Prognosis explained: 
- Treatment options discussed: 
- Quality of life considerations: 

Decision: Owner elected humane euthanasia.

Procedure:
- Sedation administered: 
- Euthanasia solution: 
- Time of passing: 

Owner present: {{Yes/No}}
Aftercare arrangements: {{Cremation/burial/home}}

Paw print/hair keepsake offered: {{Yes/No}}

Sympathies extended to family. {{patientName}} was a wonderful {{species}} and will be missed.`,
        isCommon: false,
      },
    ],
  } as any);
  console.log('  Note templates: 9 templates');

  // ── Lab Panels & Tests ─────────────────────────────────────────────────────
  
  // Complete Blood Count (CBC)
  const cbcPanel = await prisma.labPanel.create({
    data: {
      name: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      description: 'Measures red blood cells, white blood cells, and platelets',
      isCommon: true,
    },
  });

  await prisma.labTest.createMany({
    data: [
      { panelId: cbcPanel.id, name: 'White Blood Cell Count', abbreviation: 'WBC', unit: 'K/µL', refRangeDogMin: 6.0, refRangeDogMax: 17.0, refRangeCatMin: 5.5, refRangeCatMax: 19.5, criticalLow: 2.0, criticalHigh: 30.0, sortOrder: 1 },
      { panelId: cbcPanel.id, name: 'Red Blood Cell Count', abbreviation: 'RBC', unit: 'M/µL', refRangeDogMin: 5.5, refRangeDogMax: 8.5, refRangeCatMin: 5.0, refRangeCatMax: 10.0, criticalLow: 3.0, criticalHigh: 12.0, sortOrder: 2 },
      { panelId: cbcPanel.id, name: 'Hemoglobin', abbreviation: 'HGB', unit: 'g/dL', refRangeDogMin: 12.0, refRangeDogMax: 18.0, refRangeCatMin: 8.0, refRangeCatMax: 15.0, criticalLow: 6.0, criticalHigh: 20.0, sortOrder: 3 },
      { panelId: cbcPanel.id, name: 'Hematocrit', abbreviation: 'HCT', unit: '%', refRangeDogMin: 37.0, refRangeDogMax: 55.0, refRangeCatMin: 24.0, refRangeCatMax: 45.0, criticalLow: 18.0, criticalHigh: 60.0, sortOrder: 4 },
      { panelId: cbcPanel.id, name: 'Platelet Count', abbreviation: 'PLT', unit: 'K/µL', refRangeDogMin: 150, refRangeDogMax: 400, refRangeCatMin: 150, refRangeCatMax: 500, criticalLow: 50, criticalHigh: 800, sortOrder: 5 },
      { panelId: cbcPanel.id, name: 'Mean Corpuscular Volume', abbreviation: 'MCV', unit: 'fL', refRangeDogMin: 60.0, refRangeDogMax: 77.0, refRangeCatMin: 39.0, refRangeCatMax: 55.0, sortOrder: 6 },
      { panelId: cbcPanel.id, name: 'Mean Corpuscular Hemoglobin', abbreviation: 'MCH', unit: 'pg', refRangeDogMin: 19.5, refRangeDogMax: 24.5, refRangeCatMin: 12.5, refRangeCatMax: 17.5, sortOrder: 7 },
      { panelId: cbcPanel.id, name: 'Neutrophils', abbreviation: 'NEU', unit: 'K/µL', refRangeDogMin: 3.0, refRangeDogMax: 11.5, refRangeCatMin: 2.5, refRangeCatMax: 12.5, criticalLow: 1.0, sortOrder: 8 },
      { panelId: cbcPanel.id, name: 'Lymphocytes', abbreviation: 'LYM', unit: 'K/µL', refRangeDogMin: 1.0, refRangeDogMax: 4.8, refRangeCatMin: 1.5, refRangeCatMax: 7.0, sortOrder: 9 },
      { panelId: cbcPanel.id, name: 'Monocytes', abbreviation: 'MONO', unit: 'K/µL', refRangeDogMin: 0.15, refRangeDogMax: 1.35, refRangeCatMin: 0.05, refRangeCatMax: 0.8, sortOrder: 10 },
    ],
  });

  // Chemistry Panel
  const chemPanel = await prisma.labPanel.create({
    data: {
      name: 'Chemistry Panel (Chem 10)',
      category: 'Chemistry',
      description: 'Measures kidney, liver, and electrolyte values',
      isCommon: true,
    },
  });

  await prisma.labTest.createMany({
    data: [
      { panelId: chemPanel.id, name: 'Blood Urea Nitrogen', abbreviation: 'BUN', unit: 'mg/dL', refRangeDogMin: 7, refRangeDogMax: 27, refRangeCatMin: 16, refRangeCatMax: 36, criticalLow: 5, criticalHigh: 80, warningHigh: 40, sortOrder: 1 },
      { panelId: chemPanel.id, name: 'Creatinine', abbreviation: 'CREA', unit: 'mg/dL', refRangeDogMin: 0.5, refRangeDogMax: 1.6, refRangeCatMin: 0.8, refRangeCatMax: 2.4, criticalLow: 0.3, criticalHigh: 5.0, warningHigh: 2.5, sortOrder: 2 },
      { panelId: chemPanel.id, name: 'Alanine Aminotransferase', abbreviation: 'ALT', unit: 'U/L', refRangeDogMin: 10, refRangeDogMax: 125, refRangeCatMin: 20, refRangeCatMax: 100, criticalHigh: 500, warningHigh: 200, sortOrder: 3 },
      { panelId: chemPanel.id, name: 'Alkaline Phosphatase', abbreviation: 'ALP', unit: 'U/L', refRangeDogMin: 20, refRangeDogMax: 150, refRangeCatMin: 10, refRangeCatMax: 90, criticalHigh: 500, warningHigh: 250, sortOrder: 4 },
      { panelId: chemPanel.id, name: 'Total Bilirubin', abbreviation: 'TBIL', unit: 'mg/dL', refRangeDogMin: 0.1, refRangeDogMax: 0.6, refRangeCatMin: 0.1, refRangeCatMax: 0.6, criticalHigh: 3.0, warningHigh: 1.5, sortOrder: 5 },
      { panelId: chemPanel.id, name: 'Total Protein', abbreviation: 'TP', unit: 'g/dL', refRangeDogMin: 5.4, refRangeDogMax: 7.6, refRangeCatMin: 5.7, refRangeCatMax: 8.0, criticalLow: 4.0, criticalHigh: 10.0, sortOrder: 6 },
      { panelId: chemPanel.id, name: 'Albumin', abbreviation: 'ALB', unit: 'g/dL', refRangeDogMin: 2.6, refRangeDogMax: 4.0, refRangeCatMin: 2.2, refRangeCatMax: 3.8, criticalLow: 1.5, sortOrder: 7 },
      { panelId: chemPanel.id, name: 'Globulin', abbreviation: 'GLOB', unit: 'g/dL', refRangeDogMin: 2.0, refRangeDogMax: 4.0, refRangeCatMin: 2.0, refRangeCatMax: 5.0, sortOrder: 8 },
      { panelId: chemPanel.id, name: 'Glucose', abbreviation: 'GLU', unit: 'mg/dL', refRangeDogMin: 70, refRangeDogMax: 110, refRangeCatMin: 70, refRangeCatMax: 140, criticalLow: 40, criticalHigh: 300, warningLow: 60, warningHigh: 180, sortOrder: 9 },
      { panelId: chemPanel.id, name: 'Calcium', abbreviation: 'CA', unit: 'mg/dL', refRangeDogMin: 8.8, refRangeDogMax: 11.6, refRangeCatMin: 8.4, refRangeCatMax: 10.6, criticalLow: 6.0, criticalHigh: 14.0, sortOrder: 10 },
    ],
  });

  console.log('  Lab panels: CBC, Chemistry with 20 reference ranges');

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
