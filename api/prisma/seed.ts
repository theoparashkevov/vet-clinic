import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create doctors
  const drMaria = await prisma.user.upsert({
    where: { email: 'maria.ivanova@vetclinic.com' },
    update: {},
    create: {
      name: 'Dr. Maria Ivanova',
      email: 'maria.ivanova@vetclinic.com',
      role: 'doctor',
    },
  });

  const drPetar = await prisma.user.upsert({
    where: { email: 'petar.dimitrov@vetclinic.com' },
    update: {},
    create: {
      name: 'Dr. Petar Dimitrov',
      email: 'petar.dimitrov@vetclinic.com',
      role: 'doctor',
    },
  });

  const drElena = await prisma.user.upsert({
    where: { email: 'elena.georgieva@vetclinic.com' },
    update: {},
    create: {
      name: 'Dr. Elena Georgieva',
      email: 'elena.georgieva@vetclinic.com',
      role: 'doctor',
    },
  });

  console.log('Created doctors:', drMaria.name, drPetar.name, drElena.name);

  // Create owners
  const owner1 = await prisma.owner.create({
    data: {
      name: 'Ivan Petrov',
      phone: '+359 888 111 222',
      email: 'ivan.petrov@mail.com',
    },
  });

  const owner2 = await prisma.owner.create({
    data: {
      name: 'Ana Stoyanova',
      phone: '+359 888 333 444',
      email: 'ana.stoyanova@mail.com',
    },
  });

  const owner3 = await prisma.owner.create({
    data: {
      name: 'Georgi Nikolov',
      phone: '+359 888 555 666',
      email: 'georgi.nikolov@mail.com',
    },
  });

  console.log('Created owners:', owner1.name, owner2.name, owner3.name);

  // Create patients (pets)
  const rex = await prisma.patient.create({
    data: {
      name: 'Rex',
      species: 'Dog',
      breed: 'German Shepherd',
      birthdate: new Date('2020-03-15'),
      microchipId: 'BG-DOG-001',
      ownerId: owner1.id,
      allergies: 'Penicillin',
    },
  });

  const whiskers = await prisma.patient.create({
    data: {
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Siamese',
      birthdate: new Date('2021-07-20'),
      microchipId: 'BG-CAT-001',
      ownerId: owner2.id,
      chronicConditions: 'Mild asthma',
    },
  });

  const buddy = await prisma.patient.create({
    data: {
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      birthdate: new Date('2019-11-05'),
      microchipId: 'BG-DOG-002',
      ownerId: owner1.id,
    },
  });

  const luna = await prisma.patient.create({
    data: {
      name: 'Luna',
      species: 'Cat',
      breed: 'Persian',
      birthdate: new Date('2022-01-10'),
      ownerId: owner3.id,
    },
  });

  console.log('Created patients:', rex.name, whiskers.name, buddy.name, luna.name);

  // Create some appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appt1 = await prisma.appointment.create({
    data: {
      patientId: rex.id,
      ownerId: owner1.id,
      doctorId: drMaria.id,
      startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      endsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
      reason: 'Annual vaccination',
      status: 'scheduled',
    },
  });

  const appt2 = await prisma.appointment.create({
    data: {
      patientId: whiskers.id,
      ownerId: owner2.id,
      doctorId: drPetar.id,
      startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      endsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
      reason: 'Respiratory check-up',
      status: 'scheduled',
    },
  });

  const appt3 = await prisma.appointment.create({
    data: {
      patientId: buddy.id,
      ownerId: owner1.id,
      doctorId: drElena.id,
      startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      endsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30),
      reason: 'Dental cleaning',
      status: 'scheduled',
    },
  });

  console.log('Created appointments:', appt1.id, appt2.id, appt3.id);

  // Create medical records
  const pastDate = new Date(today);
  pastDate.setDate(pastDate.getDate() - 30);

  await prisma.medicalRecord.create({
    data: {
      patientId: rex.id,
      visitDate: pastDate,
      summary: 'Routine check-up. All vitals normal.',
      diagnoses: 'Healthy',
      treatments: 'None required',
      prescriptions: 'Heartworm prevention - monthly',
    },
  });

  await prisma.medicalRecord.create({
    data: {
      patientId: whiskers.id,
      visitDate: new Date(today.getFullYear(), today.getMonth() - 2, 15),
      summary: 'Presented with mild coughing. Lungs clear on auscultation.',
      diagnoses: 'Mild upper respiratory irritation',
      treatments: 'Steam therapy recommended',
      prescriptions: 'Bronchodilator - as needed',
    },
  });

  await prisma.medicalRecord.create({
    data: {
      patientId: buddy.id,
      visitDate: new Date(today.getFullYear(), today.getMonth() - 1, 10),
      summary: 'Limping on right front leg. X-ray performed.',
      diagnoses: 'Minor sprain',
      treatments: 'Rest, cold compress',
      prescriptions: 'Anti-inflammatory - 5 days',
    },
  });

  console.log('Created medical records');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
