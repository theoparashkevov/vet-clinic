import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppTable from "./AppTable";

type TestRow = {
  id: string;
  name: string;
  email: string;
};

describe("AppTable", () => {
  const headers = ["Name", "Email"];
  const rows: TestRow[] = [
    { id: "1", name: "John Doe", email: "john@example.com" },
    { id: "2", name: "Jane Smith", email: "jane@example.com" },
  ];

  const renderRow = (row: TestRow) => (
    <>
      <td>{row.name}</td>
      <td>{row.email}</td>
    </>
  );

  it("renders headers", () => {
    render(
      <AppTable
        headers={headers}
        rows={rows}
        renderRow={renderRow}
        keyExtractor={(row) => row.id}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders rows", () => {
    render(
      <AppTable
        headers={headers}
        rows={rows}
        renderRow={renderRow}
        keyExtractor={(row) => row.id}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("calls onRowClick when row is clicked", async () => {
    const user = userEvent.setup();
    const onRowClick = jest.fn();

    render(
      <AppTable
        headers={headers}
        rows={rows}
        renderRow={renderRow}
        keyExtractor={(row) => row.id}
        onRowClick={onRowClick}
      />
    );

    await user.click(screen.getByText("John Doe"));
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it("renders empty state when no rows", () => {
    render(
      <AppTable
        headers={headers}
        rows={[]}
        renderRow={renderRow}
        keyExtractor={(row) => row.id}
        emptyState={{
          title: "No data",
          description: "Try again later",
        }}
      />
    );

    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("Try again later")).toBeInTheDocument();
  });

  it("renders skeleton when loading", () => {
    render(
      <AppTable
        headers={headers}
        rows={[]}
        renderRow={renderRow}
        keyExtractor={(row) => row.id}
        loading
      />
    );

    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });
});
