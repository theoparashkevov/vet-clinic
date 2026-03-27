import { render, screen } from "@testing-library/react";
import TableSkeleton from "./TableSkeleton";

describe("TableSkeleton", () => {
  it("renders a busy table with headers", () => {
    render(
      <TableSkeleton columns={3} headers={["A", "B", "C"]} rows={2} />,
    );

    const tableContainer = screen.getByLabelText(/loading/i);
    expect(tableContainer).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });
});
