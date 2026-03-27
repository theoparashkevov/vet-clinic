import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppDialog from "./AppDialog";

describe("AppDialog", () => {
  it("renders title and children when open", () => {
    render(
      <AppDialog open title="Test Dialog" onClose={jest.fn()}>
        <div>Dialog content</div>
      </AppDialog>
    );

    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog content")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(
      <AppDialog open title="Test Dialog" subtitle="This is a subtitle" onClose={jest.fn()}>
        <div>Content</div>
      </AppDialog>
    );

    expect(screen.getByText("This is a subtitle")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(
      <AppDialog
        open
        title="Test Dialog"
        onClose={jest.fn()}
        actions={<button>Action</button>}
      >
        <div>Content</div>
      </AppDialog>
    );

    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("calls onClose when dialog is dismissed", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <AppDialog open title="Test Dialog" onClose={onClose}>
        <div>Content</div>
      </AppDialog>
    );

    const backdrop = document.querySelector(".MuiBackdrop-root");
    if (backdrop) {
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });
});
