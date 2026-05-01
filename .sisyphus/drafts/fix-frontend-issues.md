# Fix Plan: Select Crash + Missing Pages

## Issues
1. **appointments.index.tsx**: Radix UI Select crashes on empty string values (`value=""`)
2. **patients.tsx**: 14-line stub — needs full patient list with search, table, create/edit/delete
3. **tasks.tsx**: 14-line stub — needs full task list with filters, create/edit/delete

## Execution

### T1: Fix Select Crash (appointments.index.tsx)
- Change `STATUS_OPTIONS[0]` from `value: ""` to `value: "all"`
- Change `<SelectItem value="">` to `<SelectItem value="all">`
- Update all state variables, filter logic, and API param building

### T2: Build Patients Page
- Search bar, patient table, pagination
- Use existing `PatientFormModal` for create/edit
- Delete confirmation dialog
- Match appointments page styling

### T3: Build Tasks Page
- Task table with status filter
- Create/edit dialog with form
- Delete confirmation
- Overdue highlighting
- Match appointments page styling

### T4: Commit and Verify
- Build must pass
- No TypeScript errors
