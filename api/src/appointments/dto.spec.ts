import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';

const VALID_CREATE = {
  patientId: 'pat-1',
  ownerId: 'own-1',
  startsAt: '2026-03-26T09:00:00.000Z',
  endsAt: '2026-03-26T09:30:00.000Z',
};

// ---------------------------------------------------------------------------
// CreateAppointmentDto
// ---------------------------------------------------------------------------
describe('CreateAppointmentDto', () => {
  it('passes with all required fields', async () => {
    const dto = plainToInstance(CreateAppointmentDto, VALID_CREATE);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('passes when optional fields (doctorId, reason, room, notes) are omitted', async () => {
    const dto = plainToInstance(CreateAppointmentDto, VALID_CREATE);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'doctorId')).toBe(false);
    expect(errors.some((e) => e.property === 'reason')).toBe(false);
    expect(errors.some((e) => e.property === 'room')).toBe(false);
    expect(errors.some((e) => e.property === 'notes')).toBe(false);
  });

  it('fails when patientId is missing', async () => {
    const dto = plainToInstance(CreateAppointmentDto, { ...VALID_CREATE, patientId: undefined });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'patientId')).toBe(true);
  });

  it('fails when ownerId is missing', async () => {
    const dto = plainToInstance(CreateAppointmentDto, { ...VALID_CREATE, ownerId: undefined });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'ownerId')).toBe(true);
  });

  it('fails when startsAt is not an ISO date string', async () => {
    const dto = plainToInstance(CreateAppointmentDto, { ...VALID_CREATE, startsAt: 'not-a-date' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'startsAt')).toBe(true);
  });

  it('fails when endsAt is not an ISO date string', async () => {
    const dto = plainToInstance(CreateAppointmentDto, { ...VALID_CREATE, endsAt: 'tomorrow' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'endsAt')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// UpdateAppointmentDto
// ---------------------------------------------------------------------------
describe('UpdateAppointmentDto', () => {
  it('passes with an empty object (all fields optional)', async () => {
    const dto = plainToInstance(UpdateAppointmentDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('passes with a valid status update', async () => {
    const dto = plainToInstance(UpdateAppointmentDto, { status: 'completed' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when status is not in allowed list', async () => {
    const dto = plainToInstance(UpdateAppointmentDto, { status: 'invalid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('passes with no_show status', async () => {
    const dto = plainToInstance(UpdateAppointmentDto, { status: 'no_show' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when startsAt is provided but is not an ISO date string', async () => {
    const dto = plainToInstance(UpdateAppointmentDto, { startsAt: 'not-a-date' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'startsAt')).toBe(true);
  });
});
