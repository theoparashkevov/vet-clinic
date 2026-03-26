import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateOwnerDto, UpdateOwnerDto } from './dto';

// ---------------------------------------------------------------------------
// CreateOwnerDto
// ---------------------------------------------------------------------------
describe('CreateOwnerDto', () => {
  it('passes validation with required fields', async () => {
    const dto = plainToInstance(CreateOwnerDto, { name: 'Alice', phone: '555-1234' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('passes validation with optional email', async () => {
    const dto = plainToInstance(CreateOwnerDto, { name: 'Alice', phone: '555-1234', email: 'alice@example.com' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when name is missing', async () => {
    const dto = plainToInstance(CreateOwnerDto, { phone: '555-1234' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails when phone is missing', async () => {
    const dto = plainToInstance(CreateOwnerDto, { name: 'Alice' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('fails when email is an invalid format', async () => {
    const dto = plainToInstance(CreateOwnerDto, { name: 'Alice', phone: '555-1234', email: 'not-an-email' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('passes when email is omitted (it is optional)', async () => {
    const dto = plainToInstance(CreateOwnerDto, { name: 'Alice', phone: '555-1234' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// UpdateOwnerDto
// ---------------------------------------------------------------------------
describe('UpdateOwnerDto', () => {
  it('passes with an empty object (all fields optional)', async () => {
    const dto = plainToInstance(UpdateOwnerDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when email is an invalid format', async () => {
    const dto = plainToInstance(UpdateOwnerDto, { email: 'bad' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('passes with a valid partial update', async () => {
    const dto = plainToInstance(UpdateOwnerDto, { name: 'Bob' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
