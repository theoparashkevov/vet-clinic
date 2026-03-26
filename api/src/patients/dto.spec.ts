import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePatientDto, UpdatePatientDto } from './dto';

const VALID_CREATE = {
  ownerId: 'own-1',
  name: 'Rex',
  species: 'dog',
};

// ---------------------------------------------------------------------------
// CreatePatientDto
// ---------------------------------------------------------------------------
describe('CreatePatientDto', () => {
  it('passes with required fields only', async () => {
    const dto = plainToInstance(CreatePatientDto, VALID_CREATE);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('passes with all optional fields provided', async () => {
    const dto = plainToInstance(CreatePatientDto, {
      ...VALID_CREATE,
      breed: 'Labrador',
      birthdate: '2020-01-01',
      microchipId: 'MC123',
      notes: 'Friendly',
      allergies: 'None',
      chronicConditions: 'None',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when ownerId is missing', async () => {
    const dto = plainToInstance(CreatePatientDto, { name: 'Rex', species: 'dog' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'ownerId')).toBe(true);
  });

  it('fails when name is missing', async () => {
    const dto = plainToInstance(CreatePatientDto, { ownerId: 'own-1', species: 'dog' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails when species is missing', async () => {
    const dto = plainToInstance(CreatePatientDto, { ownerId: 'own-1', name: 'Rex' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'species')).toBe(true);
  });

  it('fails when birthdate is not a valid ISO date string', async () => {
    const dto = plainToInstance(CreatePatientDto, { ...VALID_CREATE, birthdate: 'not-a-date' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'birthdate')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// UpdatePatientDto
// ---------------------------------------------------------------------------
describe('UpdatePatientDto', () => {
  it('passes with an empty object (all fields optional)', async () => {
    const dto = plainToInstance(UpdatePatientDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when birthdate is an invalid format', async () => {
    const dto = plainToInstance(UpdatePatientDto, { birthdate: 'bad' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'birthdate')).toBe(true);
  });
});
