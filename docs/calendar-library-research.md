# Calendar Library Research for Veterinary Clinic Management System

## Executive Summary

After evaluating four popular React calendar libraries against the veterinary clinic requirements, **Schedule-X** emerges as the best choice for this multi-doctor calendar system, followed by **FullCalendar** as a strong alternative. **React Big Calendar** is viable for simpler needs, while **react-calendar** is insufficient for this use case.

---

## Current Project Context

- **Stack**: Next.js 14, React 18 (can upgrade to 19), TypeScript, MUI v5
- **Theme**: Teal (#0D7377) primary, warm neutrals, nature-inspired
- **Key Need**: Multi-doctor (resource) scheduling with day/week/month views

---

## Library Comparison

### 1. FullCalendar (fullcalendar.io)

**Overview**: The most popular and mature calendar library with extensive features.

#### Pros
- ✅ **Mature & Battle-tested**: 17k+ GitHub stars, used by thousands of production apps
- ✅ **Excellent TypeScript Support**: Full type definitions, actively maintained
- ✅ **Comprehensive Views**: Day, week, month, timeline, list views out of the box
- ✅ **Multi-Resource Support**: Premium "Vertical Resource View" allows doctors as columns
- ✅ **Drag & Drop**: Built-in with `@fullcalendar/interaction` plugin
- ✅ **Highly Customizable**: Event render hooks, custom views, theming via CSS variables
- ✅ **React 19 Compatible**: Regular updates, works with latest React
- ✅ **Great Documentation**: Extensive docs with live examples
- ✅ **Performance**: Virtual scrolling for large datasets

#### Cons
- ❌ **Bundle Size**: ~85-120KB gzipped (with plugins)
- ❌ **Multi-Resource is Premium**: Resource timeline/day views require paid license ($480/year)
- ❌ **Complexity**: Steep learning curve, many configuration options
- ❌ **CSS-in-JS Challenges**: Uses global CSS, Tailwind integration requires workarounds
- ❌ **MUI Integration**: Requires custom styling to match MUI theme

#### Bundle Size
- Core + DayGrid: ~45KB gzipped
- Core + All Basic Plugins: ~85KB gzipped
- With Premium Scheduler: ~120KB+ gzipped

#### TypeScript Support: ⭐⭐⭐⭐⭐ Excellent
Full type definitions for all options, events, and APIs.

#### Multi-Doctor Support
**Free Option**: Use event coloring and filtering to show multiple doctors in standard views.
**Premium Option**: Vertical Resource View shows doctors as columns (ideal for clinic).

#### Tailwind/MUI Compatibility
Requires custom CSS overrides. FullCalendar uses its own CSS architecture that doesn't natively support Tailwind utility classes.

---

### 2. React Big Calendar (github.com/jquense/react-big-calendar)

**Overview**: A Google Calendar/Outlook-inspired React component with native React architecture.

#### Pros
- ✅ **React-Native Architecture**: Built specifically for React, uses React patterns
- ✅ **Flexible Styling**: SASS variables for theming, easier to customize
- ✅ **Good TypeScript Support**: Type definitions available
- ✅ **Date Library Agnostic**: Works with date-fns, moment, dayjs, or luxon
- ✅ **Custom Components**: Can override almost any internal component
- ✅ **Open Source**: Completely free, MIT license
- ✅ **Smaller Bundle**: ~45KB gzipped

#### Cons
- ❌ **No Built-in Multi-Resource Views**: Requires custom implementation for doctor columns
- ❌ **Drag & Drop Requires Addon**: Separate `@react-big-calendar/addon-dragAndDrop` package
- ❌ **Less Feature-Rich**: No timeline view, limited built-in views
- ❌ **Smaller Community**: 8.7k stars vs FullCalendar's 17k+
- ❌ **Maintenance**: Slower update cadence than FullCalendar

#### Bundle Size
- Core: ~45KB gzipped
- With Drag & Drop: ~55KB gzipped

#### TypeScript Support: ⭐⭐⭐⭐ Good
Type definitions exist but can lag behind updates.

#### Multi-Doctor Support
**Requires Custom Implementation**: No built-in resource view. Options:
1. Color-code events by doctor in standard views
2. Build custom view component showing doctors as rows/columns
3. Use multiple calendar instances side-by-side

#### Tailwind/MUI Compatibility: ⭐⭐⭐⭐ Good
Uses SASS for styling, which can be overridden. Easier to integrate with Tailwind than FullCalendar.

---

### 3. Schedule-X (schedule-x.dev)

**Overview**: Modern, headless calendar library built with Preact signals and Temporal API.

#### Pros
- ✅ **Modern Architecture**: Built with Preact signals, Temporal API support
- ✅ **Headless Design**: Highly customizable, bring your own UI components
- ✅ **Excellent React Integration**: First-class React hooks and components
- ✅ **Resource Views**: Built-in resource scheduler (premium) and time-grid resource view
- ✅ **Drag & Drop**: Native plugin system, smooth interactions
- ✅ **Dark Mode**: Built-in dark mode support
- ✅ **Small Bundle**: ~35KB gzipped (core)
- ✅ **TypeScript First**: Written in TypeScript, excellent type safety
- ✅ **Custom Components**: Override any calendar component with React components
- ✅ **Active Development**: Rapid updates, modern API design

#### Cons
- ❌ **Newer Library**: Less battle-tested than FullCalendar (launched 2023)
- ❌ **Resource Scheduler is Premium**: $299/year for commercial use
- ❌ **Temporal API Dependency**: Requires polyfill for older browsers
- ❌ **Smaller Ecosystem**: Fewer third-party plugins and extensions
- ❌ **Learning Curve**: Modern patterns (signals, Temporal) may be unfamiliar

#### Bundle Size
- Core + React adapter: ~35KB gzipped
- With plugins: ~45-55KB gzipped
- Premium resource scheduler: Additional ~20KB

#### TypeScript Support: ⭐⭐⭐⭐⭐ Excellent
Built with TypeScript from ground up, excellent inference.

#### Multi-Doctor Support
**Free Option**: Time Grid Resource View (shows resources as rows)
**Premium Option**: Resource Scheduler with infinite scroll, lazy loading, and advanced features

#### Tailwind/MUI Compatibility: ⭐⭐⭐⭐⭐ Excellent
Headless design means you control all styling. Perfect for Tailwind and MUI integration.

---

### 4. react-calendar (github.com/wojtekmaj/react-calendar)

**Overview**: Simple date picker/calendar component, not a full scheduling solution.

#### Pros
- ✅ **Tiny Bundle**: ~12KB gzipped
- ✅ **Simple API**: Easy to get started
- ✅ **Date Range Selection**: Built-in range picker
- ✅ **Accessibility**: Good ARIA support
- ✅ **No Dependencies**: Standalone component

#### Cons
- ❌ **NOT a Scheduling Calendar**: No event management, no time slots
- ❌ **No Drag & Drop**: Not designed for appointment scheduling
- ❌ **No Resource Views**: Cannot show multiple doctors
- ❌ **Limited Views**: Only month/year/decade/century views
- ❌ **Wrong Tool for Job**: This is a date picker, not an appointment calendar

#### Verdict
**Not suitable** for veterinary clinic appointment management. This is a date picker component, not a scheduling calendar.

---

## Detailed Comparison Matrix

| Feature | FullCalendar | React Big Calendar | Schedule-X | react-calendar |
|---------|-------------|-------------------|------------|----------------|
| **Day/Week/Month Views** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Multi-Doctor (Resources)** | ✅ Premium | ❌ Custom | ✅ Premium | ❌ No |
| **Drag & Drop** | ✅ Yes | ✅ Addon | ✅ Yes | ❌ No |
| **TypeScript** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Bundle Size** | ~85KB | ~45KB | ~35KB | ~12KB |
| **Tailwind Compatible** | ⚠️ Hard | ✅ Good | ⭐⭐⭐⭐⭐ | ✅ Good |
| **MUI Integration** | ⚠️ Custom CSS | ✅ Good | ⭐⭐⭐⭐⭐ | ✅ Good |
| **React 19 Support** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Customization** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **License Cost** | $480/yr (premium) | Free | $299/yr (premium) | Free |

---

## Recommendation

### 🏆 Winner: Schedule-X

**Why Schedule-X is best for this veterinary clinic:**

1. **Modern Architecture**: Built for 2024+ React apps with signals and Temporal API
2. **Headless Design**: Perfect integration with your existing MUI theme and Tailwind
3. **Resource Views**: Built-in support for multi-doctor scheduling
4. **Custom Components**: Can replace any calendar part with your own React components
5. **Smaller Bundle**: ~35KB vs 85KB+ for FullCalendar
6. **Better Developer Experience**: Cleaner API, better TypeScript support
7. **Cost**: $299/year vs $480/year for FullCalendar premium

### 🥈 Runner-up: FullCalendar

Choose FullCalendar if:
- You need maximum stability and community support
- You want the most comprehensive feature set
- Budget allows for $480/year premium license
- You don't mind larger bundle size

### 🥉 Alternative: React Big Calendar

Choose React Big Calendar if:
- Budget is tight (completely free)
- You need a simpler solution
- Multi-doctor view is not critical (can use color-coding)
- You prefer native React patterns

---

## Implementation Examples

### Schedule-X Multi-Doctor Calendar

```tsx
// components/VetCalendar.tsx
'use client';

import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewDay, createViewWeek, createViewMonthGrid } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';
import { useState, useEffect } from 'react';
import { Box, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface Doctor {
  id: string;
  name: string;
  color: string;
  specialty: string;
}

interface Appointment {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;
  doctorId: string;
  patientName: string;
  type: 'checkup' | 'surgery' | 'vaccination' | 'emergency';
}

const doctors: Doctor[] = [
  { id: 'dr-1', name: 'Dr. Maria Ivanova', color: '#0D7377', specialty: 'Small Animals' },
  { id: 'dr-2', name: 'Dr. Petar Dimitrov', color: '#C4705A', specialty: 'Surgery' },
  { id: 'dr-3', name: 'Dr. Elena Georgieva', color: '#059669', specialty: 'Exotic Pets' },
];

const getEventColor = (doctorId: string, type: string) => {
  const doctor = doctors.find(d => d.id === doctorId);
  const baseColor = doctor?.color || '#78716C';
  
  // Vary opacity based on appointment type
  const opacity = {
    emergency: '100%',
    surgery: '90%',
    vaccination: '75%',
    checkup: '60%',
  }[type] || '70%';
  
  return {
    backgroundColor: baseColor + opacity.replace('%', ''),
    borderColor: baseColor,
  };
};

export default function VetCalendar() {
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(doctors.map(d => d.id));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const eventsService = useState(() => createEventsServicePlugin())[0];
  
  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
    ],
    defaultView: 'week',
    events: appointments.map(apt => ({
      id: apt.id,
      title: `${apt.patientName} - ${apt.type}`,
      start: apt.start,
      end: apt.end,
      ...getEventColor(apt.doctorId, apt.type),
      // Custom data for modal
      doctorId: apt.doctorId,
      patientName: apt.patientName,
      type: apt.type,
    })),
    plugins: [
      eventsService,
      createDragAndDropPlugin(),
      createEventModalPlugin(),
    ],
    callbacks: {
      onEventUpdate: (event) => {
        // Handle drag-and-drop reschedule
        console.log('Event rescheduled:', event);
        // API call to update appointment
      },
      onClickEvent: (event) => {
        // Show appointment details
        console.log('Event clicked:', event);
      },
    },
  });

  // Filter events by selected doctors
  useEffect(() => {
    const filteredEvents = appointments
      .filter(apt => selectedDoctors.includes(apt.doctorId))
      .map(apt => ({
        id: apt.id,
        title: `${apt.patientName} - ${apt.type}`,
        start: apt.start,
        end: apt.end,
        ...getEventColor(apt.doctorId, apt.type),
      }));
    
    eventsService.set(filteredEvents);
  }, [selectedDoctors, appointments]);

  return (
    <Box sx={{ height: '100vh', p: 2 }}>
      {/* Doctor Filter */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Show Doctors</InputLabel>
          <Select
            multiple
            value={selectedDoctors}
            onChange={(e) => setSelectedDoctors(e.target.value as string[])}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {selected.map((id) => {
                  const doctor = doctors.find(d => d.id === id);
                  return (
                    <Chip
                      key={id}
                      label={doctor?.name}
                      size="small"
                      sx={{
                        backgroundColor: doctor?.color + '20',
                        borderColor: doctor?.color,
                        color: doctor?.color,
                      }}
                    />
                  );
                })}
              </Box>
            )}
          >
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: doctor.color,
                    }}
                  />
                  {doctor.name} - {doctor.specialty}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Calendar */}
      <Box sx={{ height: 'calc(100vh - 150px)' }}>
        <ScheduleXCalendar calendarApp={calendar} />
      </Box>
    </Box>
  );
}
```

### Schedule-X with Premium Resource Scheduler (Multi-Doctor Columns)

```tsx
// components/VetResourceCalendar.tsx
'use client';

import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { createInteractiveEventModal } from '@sx-premium/interactive-event-modal';
import { 
  createHourlyView, 
  createDailyView, 
  createConfig,
  TimeUnits 
} from '@sx-premium/resource-scheduler';
import { signal } from '@preact/signals';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';
import '@sx-premium/resource-scheduler/index.css';
import '@sx-premium/interactive-event-modal/index.css';

const doctors = [
  {
    id: 'dr-1',
    label: 'Dr. Maria Ivanova',
    colorName: 'dr-maria',
    lightColors: {
      main: '#0D7377',
      container: '#E6F4F1',
      onContainer: '#0D7377',
    },
  },
  {
    id: 'dr-2',
    label: 'Dr. Petar Dimitrov',
    colorName: 'dr-petar',
    lightColors: {
      main: '#C4705A',
      container: '#FDF2EF',
      onContainer: '#C4705A',
    },
  },
  {
    id: 'dr-3',
    label: 'Dr. Elena Georgieva',
    colorName: 'dr-elena',
    lightColors: {
      main: '#059669',
      container: '#ECFDF5',
      onContainer: '#059669',
    },
  },
];

export default function VetResourceCalendar() {
  const resourceConfig = createConfig();
  const hourlyView = createHourlyView(resourceConfig);
  const dailyView = createDailyView(resourceConfig);

  // Enable features
  resourceConfig.dragAndDrop.value = true;
  resourceConfig.resize.value = true;
  resourceConfig.dayBoundaries.value = { start: 8, end: 18 }; // 8 AM - 6 PM

  const eventsService = createEventsServicePlugin();
  
  const interactiveModal = createInteractiveEventModal({
    eventsService,
    onAddEvent: (event) => {
      console.log('New appointment:', event);
      // API call to create appointment
    },
    onUpdateEvent: (event) => {
      console.log('Updated appointment:', event);
      // API call to update appointment
    },
    fields: {
      title: { label: 'Patient Name' },
      resourceId: { label: 'Doctor' },
      description: { label: 'Reason for Visit' },
    },
  });

  const calendar = useCalendarApp({
    resources: doctors,
    views: [hourlyView, dailyView],
    defaultView: 'hourly',
    events: [
      {
        id: '1',
        title: 'Bella - Checkup',
        start: Temporal.ZonedDateTime.from('2024-05-11T09:00:00+02:00[Europe/Sofia]'),
        end: Temporal.ZonedDateTime.from('2024-05-11T09:30:00+02:00[Europe/Sofia]'),
        resourceId: 'dr-1',
      },
      {
        id: '2',
        title: 'Max - Surgery',
        start: Temporal.ZonedDateTime.from('2024-05-11T10:00:00+02:00[Europe/Sofia]'),
        end: Temporal.ZonedDateTime.from('2024-05-11T11:30:00+02:00[Europe/Sofia]'),
        resourceId: 'dr-2',
      },
    ],
    plugins: [eventsService, interactiveModal],
    callbacks: {
      onClickDateTime: (datetime, resourceId) => {
        // Open modal to create new appointment
        interactiveModal.open({
          start: datetime,
          resourceId,
        });
      },
    },
  });

  return (
    <div style={{ height: '800px' }}>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
```

### FullCalendar Multi-Doctor Calendar

```tsx
// components/VetCalendarFullCalendar.tsx
'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useState, useRef } from 'react';

interface Doctor {
  id: string;
  name: string;
  color: string;
}

const doctors: Doctor[] = [
  { id: 'dr-1', name: 'Dr. Maria Ivanova', color: '#0D7377' },
  { id: 'dr-2', name: 'Dr. Petar Dimitrov', color: '#C4705A' },
  { id: 'dr-3', name: 'Dr. Elena Georgieva', color: '#059669' },
];

const appointments = [
  {
    id: '1',
    title: 'Bella - Checkup',
    start: '2024-05-11T09:00:00',
    end: '2024-05-11T09:30:00',
    doctorId: 'dr-1',
    backgroundColor: '#0D7377',
    borderColor: '#0D7377',
  },
  {
    id: '2',
    title: 'Max - Surgery',
    start: '2024-05-11T10:00:00',
    end: '2024-05-11T11:30:00',
    doctorId: 'dr-2',
    backgroundColor: '#C4705A',
    borderColor: '#C4705A',
  },
];

export default function VetCalendarFullCalendar() {
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(doctors.map(d => d.id));
  const calendarRef = useRef<FullCalendar>(null);

  const filteredEvents = appointments.filter(event => 
    selectedDoctors.includes(event.doctorId)
  );

  const handleEventDrop = (info: any) => {
    console.log('Event dropped:', info.event);
    // API call to update appointment time
  };

  const handleEventClick = (info: any) => {
    console.log('Event clicked:', info.event);
    // Show appointment details modal
  };

  return (
    <Box sx={{ height: '100vh', p: 2 }}>
      {/* Doctor Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Show Doctors</InputLabel>
          <Select
            multiple
            value={selectedDoctors}
            onChange={(e) => setSelectedDoctors(e.target.value as string[])}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {selected.map((id) => {
                  const doctor = doctors.find(d => d.id === id);
                  return (
                    <Chip
                      key={id}
                      label={doctor?.name}
                      size="small"
                      sx={{
                        backgroundColor: doctor?.color + '20',
                        color: doctor?.color,
                      }}
                    />
                  );
                })}
              </Box>
            )}
          >
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: doctor.color,
                    }}
                  />
                  {doctor.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Calendar */}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={filteredEvents}
        editable={true}
        droppable={true}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        height="calc(100vh - 150px)"
        eventContent={(eventInfo) => (
          <Box sx={{ p: 0.5 }}>
            <Box sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {eventInfo.timeText}
            </Box>
            <Box sx={{ fontSize: '0.75rem' }}>
              {eventInfo.event.title}
            </Box>
          </Box>
        )}
      />
    </Box>
  );
}
```

### React Big Calendar Multi-Doctor

```tsx
// components/VetCalendarBigCalendar.tsx
'use client';

import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { Box, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DragAndDropCalendar = withDragAndDrop(Calendar);

interface Doctor {
  id: string;
  name: string;
  color: string;
}

const doctors: Doctor[] = [
  { id: 'dr-1', name: 'Dr. Maria Ivanova', color: '#0D7377' },
  { id: 'dr-2', name: 'Dr. Petar Dimitrov', color: '#C4705A' },
  { id: 'dr-3', name: 'Dr. Elena Georgieva', color: '#059669' },
];

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  doctorId: string;
  resourceId?: string;
}

export default function VetCalendarBigCalendar() {
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(doctors.map(d => d.id));
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Bella - Checkup',
      start: new Date(2024, 4, 11, 9, 0),
      end: new Date(2024, 4, 11, 9, 30),
      doctorId: 'dr-1',
    },
    {
      id: '2',
      title: 'Max - Surgery',
      start: new Date(2024, 4, 11, 10, 0),
      end: new Date(2024, 4, 11, 11, 30),
      doctorId: 'dr-2',
    },
  ]);

  const filteredEvents = useMemo(() => 
    appointments.filter(apt => selectedDoctors.includes(apt.doctorId)),
    [appointments, selectedDoctors]
  );

  const eventStyleGetter = (event: Appointment) => {
    const doctor = doctors.find(d => d.id === event.doctorId);
    return {
      style: {
        backgroundColor: doctor?.color || '#78716C',
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
      },
    };
  };

  const onEventDrop = ({ event, start, end }: any) => {
    const updated = appointments.map(apt => 
      apt.id === event.id ? { ...apt, start, end } : apt
    );
    setAppointments(updated);
  };

  return (
    <Box sx={{ height: '100vh', p: 2 }}>
      {/* Doctor Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Show Doctors</InputLabel>
          <Select
            multiple
            value={selectedDoctors}
            onChange={(e) => setSelectedDoctors(e.target.value as string[])}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {selected.map((id) => {
                  const doctor = doctors.find(d => d.id === id);
                  return (
                    <Chip
                      key={id}
                      label={doctor?.name}
                      size="small"
                      sx={{
                        backgroundColor: doctor?.color + '20',
                        color: doctor?.color,
                      }}
                    />
                  );
                })}
              </Box>
            )}
          >
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: doctor.color,
                    }}
                  />
                  {doctor.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Calendar */}
      <Box sx={{ height: 'calc(100vh - 150px)' }}>
        <DragAndDropCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onEventDrop={onEventDrop}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.WEEK}
          min={new Date(0, 0, 0, 8, 0)}
          max={new Date(0, 0, 0, 18, 0)}
        />
      </Box>
    </Box>
  );
}
```

---

## Installation Commands

### Schedule-X
```bash
# Basic calendar
npm install @schedule-x/react @schedule-x/calendar @schedule-x/theme-default @schedule-x/events-service temporal-polyfill

# With drag & drop
npm install @schedule-x/drag-and-drop @schedule-x/event-modal

# Premium resource scheduler (requires license)
npm install @sx-premium/resource-scheduler @sx-premium/interactive-event-modal
```

### FullCalendar
```bash
# Basic calendar
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid

# With interactions
npm install @fullcalendar/interaction

# Premium scheduler (requires license)
npm install @fullcalendar/resource @fullcalendar/resource-timegrid
```

### React Big Calendar
```bash
npm install react-big-calendar date-fns
```

---

## Migration Path

### From Current MUI Date Picker to Schedule-X

1. **Install dependencies** (see above)
2. **Create wrapper component** using examples above
3. **Integrate with existing API** - adapt appointment data format
4. **Apply MUI theme colors** - use your existing teal (#0D7377) theme
5. **Add doctor filtering** - use existing doctor data from your API

### Data Format Mapping

Your current appointment format:
```typescript
{
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  status: string;
}
```

Schedule-X event format:
```typescript
{
  id: string;
  title: string; // "Patient Name - Appointment Type"
  start: string; // ISO 8601
  end: string;   // ISO 8601
  doctorId: string; // Custom field
  patientName: string; // Custom field
}
```

---

## Cost Analysis

| Library | Free Features | Premium Cost | Best For |
|---------|--------------|--------------|----------|
| **Schedule-X** | Day/week/month views, drag & drop | $299/year for resource scheduler | Modern apps, custom UI |
| **FullCalendar** | Day/week/month views, basic interactions | $480/year for resource views | Maximum features, stability |
| **React Big Calendar** | All features | Free | Budget-conscious, simpler needs |
| **react-calendar** | Date picking only | N/A | Not suitable for scheduling |

---

## Final Recommendation

**Use Schedule-X** for the veterinary clinic calendar because:

1. **Best fit for multi-doctor scheduling** with resource views
2. **Modern React patterns** align with your Next.js 14 app
3. **Headless design** integrates perfectly with MUI theme
4. **Smaller bundle** improves performance
5. **Lower cost** than FullCalendar premium
6. **Active development** with modern API design

**Alternative**: If you need maximum stability and don't mind the larger bundle, **FullCalendar** is a proven choice with the most comprehensive feature set.
