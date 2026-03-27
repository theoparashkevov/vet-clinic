import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormLayout from "./FormLayout";

describe("FormLayout", () => {
  it("renders children", () => {
    render(
      <FormLayout>
        <input placeholder="Test input" />
      </FormLayout>
    );

    expect(screen.getByPlaceholderText("Test input")).toBeInTheDocument();
  });

  it("displays error alert when error is provided", () => {
    render(
      <FormLayout error="Something went wrong">
        <input />
      </FormLayout>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("calls onSubmit when form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e.preventDefault());

    render(
      <FormLayout onSubmit={onSubmit}>
        <input />
      </FormLayout>
    );

    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <FormLayout onSubmit={jest.fn()} onCancel={onCancel}>
        <input />
      </FormLayout>
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("shows loading state on submit button", () => {
    render(
      <FormLayout onSubmit={jest.fn()} loading>
        <input />
      </FormLayout>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("disables buttons when loading", () => {
    render(
      <FormLayout onSubmit={jest.fn()} onCancel={jest.fn()} loading>
        <input />
      </FormLayout>
    );

    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });
});
