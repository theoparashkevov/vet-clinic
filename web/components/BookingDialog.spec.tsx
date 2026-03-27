import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingDialog from './BookingDialog';
import { ToastProvider } from './ToastProvider';

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const DOCTORS = [{ id: 'doc-1', name: 'Dr Smith' }];
const PATIENTS = [
  { id: 'pat-1', name: 'Rex', species: 'dog', ownerId: 'own-1', owner: { id: 'own-1', name: 'Alice' } },
];
const SLOTS = ['2026-03-26T09:00:00.000Z', '2026-03-26T09:30:00.000Z'];

function mockFetch(responses: Array<{ ok: boolean; body: unknown }>) {
  let callCount = 0;
  global.fetch = jest.fn().mockImplementation(() => {
    const resp = responses[callCount] ?? responses[responses.length - 1];
    callCount++;
    return Promise.resolve({
      ok: resp.ok,
      json: () => Promise.resolve(resp.body),
    });
  });
}

function defaultFetch() {
  // First two calls: doctors + patients; subsequent calls return slots or appointment
  global.fetch = jest.fn().mockImplementation((url: string) => {
    if (url.includes('/doctors')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(DOCTORS) });
    }
    if (url.includes('/patients')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(PATIENTS) });
    }
    if (url.includes('/slots')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ date: '2026-03-26', slots: SLOTS }) });
    }
    // POST /appointments
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'new-appt' }) });
  });
}

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  onBooked: jest.fn(),
};

// ---------------------------------------------------------------------------
// Step 0: initial render
// ---------------------------------------------------------------------------
describe('BookingDialog — Step 0: Doctor & Date', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    defaultFetch();
  });

  it('renders the dialog with the stepper when open', async () => {
    renderWithProviders(<BookingDialog {...defaultProps} />);
    expect(screen.getByText('Book Appointment')).toBeInTheDocument();
    expect(screen.getByText('Select Doctor & Date')).toBeInTheDocument();
  });

  it('shows the "Show Available Slots" button', () => {
    renderWithProviders(<BookingDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /show available slots/i })).toBeInTheDocument();
  });

  it('fetches doctors and patients on open', async () => {
    renderWithProviders(<BookingDialog {...defaultProps} />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/doctors'), expect.anything());
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/patients'), expect.anything());
    });
  });

  it('does not render when open is false', () => {
    renderWithProviders(<BookingDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Book Appointment')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Step 0 → Step 1: fetch slots
// ---------------------------------------------------------------------------
describe('BookingDialog — Step 0 → Step 1: slot selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    defaultFetch();
  });

  it('advances to step 1 after clicking "Show Available Slots"', async () => {
    renderWithProviders(<BookingDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /show available slots/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/appointments/slots'), expect.anything());
    });

    await waitFor(() => {
      expect(screen.getByText('Choose Time Slot')).toBeInTheDocument();
      // At step 1, slot chips should appear
      expect(screen.getByText(/available slots/i)).toBeInTheDocument();
    });
  });

  it('renders slot chips for each available slot', async () => {
    renderWithProviders(<BookingDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /show available slots/i }));

    await waitFor(() => {
      // Both slots should be visible as chips (time formatted)
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
    });
  });

  it('shows empty state message when no slots are returned', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/slots')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ date: '2026-03-26', slots: [] }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    renderWithProviders(<BookingDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /show available slots/i }));

    await waitFor(() => {
      expect(screen.getByText(/no available slots/i)).toBeInTheDocument();
    });
  });

  it('shows an error message when the slots request fails', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/slots')) {
        return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    renderWithProviders(<BookingDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /show available slots/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/http 500/i).length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// Step 1 → Step 0: Back button
// ---------------------------------------------------------------------------
describe('BookingDialog — Back navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    defaultFetch();
  });

  it('goes back to step 0 when "Back" is clicked on step 1', async () => {
    renderWithProviders(<BookingDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /show available slots/i }));

    await waitFor(() => screen.getByText(/available slots/i));

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(screen.getByRole('button', { name: /show available slots/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Step 1 → Step 2: select a slot
// ---------------------------------------------------------------------------
describe('BookingDialog — Step 1 → Step 2: patient & reason', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    defaultFetch();
  });

  it('advances to step 2 when a slot chip is clicked', async () => {
    renderWithProviders(<BookingDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /show available slots/i }));

    // Wait for slots to appear
    await waitFor(() => screen.getByText(/available slots/i));

    // Click the first slot chip
    const chips = screen.getAllByRole('button', { name: /\d{2}:\d{2}/i });
    fireEvent.click(chips[0]);

    await waitFor(() => {
      expect(screen.getByText(/patient & reason/i)).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Step 2: submit booking
// ---------------------------------------------------------------------------
describe('BookingDialog — Step 2: booking submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    defaultFetch();
  });

  async function advanceToStep2() {
    renderWithProviders(
      <BookingDialog
        {...defaultProps}
        preselectedPatientId="pat-1"
        preselectedOwnerId="own-1"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /show available slots/i }));
    await waitFor(() => screen.getByText(/available slots/i));

    const chips = screen.getAllByRole('button', { name: /\d{2}:\d{2}/i });
    fireEvent.click(chips[0]);
    await waitFor(() => screen.getByText(/patient & reason/i));
  }

  it('renders the "Book Appointment" button on step 2', async () => {
    await advanceToStep2();
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument();
  });

  it('calls onBooked after a successful booking submission', async () => {
    await advanceToStep2();

    fireEvent.click(screen.getByRole('button', { name: /book appointment/i }));

    await waitFor(() => {
      expect(defaultProps.onBooked).toHaveBeenCalledTimes(1);
    });
  });

  it('sends a POST to /v1/appointments with correct fields', async () => {
    await advanceToStep2();

    fireEvent.click(screen.getByRole('button', { name: /book appointment/i }));

    await waitFor(() => {
      const postCall = (global.fetch as jest.Mock).mock.calls.find(
        ([url, opts]: [string, RequestInit]) => url.includes('/appointments') && opts?.method === 'POST',
      );
      expect(postCall).toBeDefined();
      const body = JSON.parse(postCall![1].body as string);
      expect(body.patientId).toBe('pat-1');
      expect(body.ownerId).toBe('own-1');
      expect(body.startsAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  it('displays an error when the booking request fails', async () => {
    global.fetch = jest.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'POST') {
        return Promise.resolve({ ok: false, status: 422, json: () => Promise.resolve({}) });
      }
      if (url.includes('/slots')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ date: '2026-03-26', slots: SLOTS }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(
      <ToastProvider>
        <BookingDialog {...defaultProps} preselectedPatientId="pat-1" preselectedOwnerId="own-1" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /show available slots/i }));
    await waitFor(() => screen.getByText(/available slots/i));
    const chips = screen.getAllByRole('button', { name: /\d{2}:\d{2}/i });
    fireEvent.click(chips[0]);
    await waitFor(() => screen.getByText(/patient & reason/i));

    fireEvent.click(screen.getByRole('button', { name: /book appointment/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/http 422/i).length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// Cancel button
// ---------------------------------------------------------------------------
describe('BookingDialog — Cancel', () => {
  it('calls onClose when the Cancel button is clicked', () => {
    defaultFetch();
    renderWithProviders(<BookingDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
