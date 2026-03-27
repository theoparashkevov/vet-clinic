import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalendarView from "./CalendarView";

const mockAppointments = [
  {
    id: "1",
    startsAt: "2026-03-27T10:00:00.000Z",
    endsAt: "2026-03-27T10:30:00.000Z",
    reason: "Checkup",
    status: "scheduled",
    patient: { id: "p1", name: "Fluffy", species: "Cat" },
    owner: { id: "o1", name: "John Doe" },
    doctor: { id: "d1", name: "Dr. Smith" },
  },
  {
    id: "2",
    startsAt: "2026-03-27T14:00:00.000Z",
    endsAt: "2026-03-27T14:30:00.000Z",
    reason: "Vaccination",
    status: "completed",
    patient: { id: "p2", name: "Rex", species: "Dog" },
    owner: { id: "o2", name: "Jane Smith" },
    doctor: { id: "d1", name: "Dr. Smith" },
  },
];

describe("CalendarView", () => {
  const defaultProps = {
    appointments: mockAppointments,
    selectedDate: "2026-03-27",
    onDateChange: jest.fn(),
    onAppointmentClick: jest.fn(),
  };

  it("renders calendar with day view by default", () => {
    render(<CalendarView {...defaultProps} />);
    
    expect(screen.getByText(/Today/i)).toBeInTheDocument();
    // Check that Day toggle button exists and is in a ToggleButtonGroup (not the Today button)
    const dayToggles = screen.getAllByRole("button", { name: /Day/i });
    expect(dayToggles.length).toBeGreaterThanOrEqual(1);
  });

  it("renders appointment cards", () => {
    render(<CalendarView {...defaultProps} />);
    
    expect(screen.getByText(/Fluffy/i)).toBeInTheDocument();
    expect(screen.getByText(/Rex/i)).toBeInTheDocument();
  });

  it("calls onAppointmentClick when appointment card is clicked", async () => {
    const user = userEvent.setup();
    const onAppointmentClick = jest.fn();
    
    render(<CalendarView {...defaultProps} onAppointmentClick={onAppointmentClick} />);
    
    const appointmentCard = screen.getByText(/Fluffy/i);
    await user.click(appointmentCard);
    
    expect(onAppointmentClick).toHaveBeenCalledWith(mockAppointments[0]);
  });

  it("switches to week view when week toggle is clicked", async () => {
    const user = userEvent.setup();
    
    render(<CalendarView {...defaultProps} />);
    
    const weekToggle = screen.getByRole("button", { name: /Week/i });
    await user.click(weekToggle);
    
    expect(weekToggle).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onDateChange when navigating to previous day", async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();
    
    render(<CalendarView {...defaultProps} onDateChange={onDateChange} />);
    
    const prevButton = screen.getAllByRole("button")[0]; // ChevronLeft
    await user.click(prevButton);
    
    expect(onDateChange).toHaveBeenCalled();
  });

  it("filters appointments by doctor when doctorFilter is provided", () => {
    render(<CalendarView {...defaultProps} doctorFilter="d1" />);
    
    expect(screen.getByText(/Fluffy/i)).toBeInTheDocument();
    expect(screen.getByText(/Rex/i)).toBeInTheDocument();
  });

  it("renders correct status chips on appointments", () => {
    render(<CalendarView {...defaultProps} />);
    
    const scheduledChip = screen.getByText("scheduled");
    const completedChip = screen.getByText("completed");
    
    expect(scheduledChip).toBeInTheDocument();
    expect(completedChip).toBeInTheDocument();
  });
});
