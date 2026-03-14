# Veterinary Clinic Web System – Project Description

## Project Goal

Create a **modern veterinary clinic web system** that simplifies the daily work of **veterinary doctors** and improves the **appointment and communication experience for pet owners**.

The system should focus on two primary groups of users:

1. **Veterinary Practitioners (Doctors / Clinic Staff)**
2. **Clients (Pet Owners) and their Patients (Animals: dogs, cats, etc.)**

The platform should prioritize **ease of use, automation, and intuitive workflows**.

---

# 1. Veterinary Doctors (Primary System Users)

## Goal

Reduce administrative workload and allow veterinarians to focus more on **patient care rather than paperwork**.

## Core Requirements

### Modern Web Interface

The system should include:

* Clean **modern UI**
* **Responsive design** (desktop, tablet, mobile)
* **Minimal clicks workflow**
* **Fast patient search**
* **Simple navigation**

Recommended tech stack example (optional):

* Frontend: React / Next.js
* UI framework: Material UI or similar
* Backend: Python / Node.js
* Database: PostgreSQL

---

## Core Features for Doctors

### Patient Management

Doctors should be able to:

* Register new patients
* Attach patients to owners
* View patient history
* Update patient information

Patient profile fields:

* Name
* Species (dog, cat, etc.)
* Breed
* Age / Birthdate
* Weight history
* Vaccination records
* Microchip ID
* Owner information
* Medical notes
* Allergies
* Chronic conditions

---

### Medical Records

Doctors should be able to create and view:

* Visit summaries
* Diagnoses
* Treatments
* Prescribed medications
* Lab results
* Attachments (X-rays, images, files)

Each visit should generate a **medical record entry**.

---

### Appointment Management

Doctors need a **calendar system** with:

* Appointment scheduling
* Appointment editing
* Time slot management
* Emergency visits
* Appointment reminders

---

### Recommended Diagnosis Assistance (AI Feature)

The system may include an **AI diagnostic assistant** that can:

* Suggest possible diagnoses based on:

 * symptoms
 * species
 * age
 * previous history
* Suggest treatment guidelines
* Suggest medication dosages

This should be **assistive only**, not replacing doctor decisions.

---

### Medical History Timeline

Each patient should have a **timeline view**:

Example:

```
2026-01-15 — Vaccination
2026-02-10 — Ear infection
2026-03-02 — Surgery follow-up
```

This allows fast navigation through patient history.

---

### Additional Features for Doctors

Recommended additions:

**Inventory Management**

* medicines
* vaccines
* medical supplies

**Billing & Invoicing**

* treatment costs
* invoice generation

**Vaccination Reminders**

* automatic reminders to clients

**Lab Results Integration**

* attach or upload lab reports

**Multi-doctor Clinic Support**

* multiple doctors per clinic
* role permissions

---

# 2. Clients (Pet Owners)

## Goal

Make veterinary services **easy to access** and **easy to schedule**.

Clients should have **simple ways to book appointments** without complicated registration.

---

## Appointment Booking (Web)

Users should be able to:

### Guest Booking

Book appointments **without registration**:

Required fields:

* Owner name
* Phone number
* Pet name
* Pet type
* Reason for visit
* Preferred time

---

### Registered Client Portal (Optional)

If users choose to register they can:

* Manage their pets
* View appointment history
* Receive reminders
* View vaccination records
* Download visit summaries

---

# 3. Viber Integration with AI Assistant

## Goal

Allow pet owners to **book appointments through Viber messages**.

---

## LLM Assistant

Use an **LLM-powered chatbot** integrated with the clinic system.

Example flow:

Client sends message in Viber:

```
Hi, I want to book an appointment for my dog tomorrow.
```

The AI should:

1. Ask follow-up questions
2. Extract structured data
3. Call backend tools

Example conversation:

```
AI: What is your pet's name?
User: Rex
AI: What type of animal is Rex?
User: Dog
AI: What time works best for you tomorrow?
User: Around 3pm
```

The AI then:

* Calls backend API
* Creates appointment
* Confirms booking

---

## Required Backend Tools for LLM

The LLM should have access to structured tools like:

### Create Appointment

```
create_appointment(
 owner_name,
 phone,
 pet_name,
 pet_type,
 appointment_time,
 reason
)
```

### Check Available Slots

```
get_available_slots(date)
```

### Register Client

```
create_client_profile()
```

---

# 4. System Architecture (High-Level)

Components:

**Frontend**

* Doctor dashboard
* Client booking interface

**Backend API**

* Authentication
* Patient management
* Appointment management

**Database**

* patients
* owners
* appointments
* medical_records

**AI Layer**

* LLM assistant
* tool-calling API

**Messaging Integration**

* Viber bot API

---

# 5. Security & Compliance

Important requirements:

* Secure authentication
* Role-based access control
* Patient data privacy
* Encrypted communication

---

# 6. Future Features (Optional)

Potential expansions:

* Mobile app
* SMS reminders
* Telemedicine video visits
* AI triage assistant
* Automatic vaccination tracking
* Integration with lab systems
* Smart clinic analytics

---

# 7. Key Design Principles

The system must prioritize:

* **Speed**
* **Ease of use**
* **Automation**
* **Low cognitive load for doctors**
* **Minimal friction for clients**
