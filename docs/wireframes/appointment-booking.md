# Appointment Booking Flow

Step 1: Select animal (if multiple)
Step 2: Choose reason (dropdown + free text)
Step 3: Pick date/time (doctor availability view simplified for v1)
Step 4: Confirm details → [Schedule]

Success screen: "Appointment scheduled" with summary + note about email invite (.ics).

Edge cases: double-book attempt, outside hours, invalid duration.

A11y: stepper with aria-current, inputs labeled, keyboard date/time selection.
