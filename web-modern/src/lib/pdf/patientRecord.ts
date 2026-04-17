import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface PatientRecordData {
  patient: {
    name: string
    type: string
    breed: string
    age: string
    weight: string
    color: string
    microchip: string
    status: string
  }
  owner: {
    name: string
    phone: string
    email: string
    address: string
  }
  medicalHistory: Array<{
    date: string
    type: string
    veterinarian: string
    diagnosis: string
    notes: string
    medications: string[]
  }>
  vaccinations: Array<{
    name: string
    date: string
    nextDue: string
    status: string
  }>
  appointments: Array<{
    date: string
    time: string
    reason: string
    doctor: string
    status: string
  }>
}

export function generatePatientRecordPDF(data: PatientRecordData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  const primaryColor = "#0d9488"
  const textColor = "#374151"
  const lightGray = "#f3f4f6"
  
  doc.setFontSize(24)
  doc.setTextColor(primaryColor)
  doc.text("Veterinary Patient Record", pageWidth / 2, 20, { align: "center" })
  
  doc.setFontSize(10)
  doc.setTextColor("#6b7280")
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: "center" })
  
  doc.setFontSize(14)
  doc.setTextColor(primaryColor)
  doc.text("Patient Information", 14, 45)
  
  doc.setFontSize(10)
  doc.setTextColor(textColor)
  const patientInfo = [
    ["Name:", data.patient.name, "Type:", data.patient.type],
    ["Breed:", data.patient.breed, "Age:", data.patient.age],
    ["Weight:", data.patient.weight, "Color:", data.patient.color],
    ["Microchip:", data.patient.microchip, "Status:", data.patient.status],
  ]
  
  autoTable(doc, {
    body: patientInfo,
    startY: 50,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { fontStyle: "bold", cellWidth: 30 },
      3: { cellWidth: 60 },
    },
  })
  
  const ownerStartY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  
  doc.setFontSize(14)
  doc.setTextColor(primaryColor)
  doc.text("Owner Information", 14, ownerStartY)
  
  doc.setFontSize(10)
  doc.setTextColor(textColor)
  const ownerInfo = [
    ["Name:", data.owner.name],
    ["Phone:", data.owner.phone],
    ["Email:", data.owner.email],
    ["Address:", data.owner.address],
  ]
  
  autoTable(doc, {
    body: ownerInfo,
    startY: ownerStartY + 5,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 30 },
      1: { cellWidth: 150 },
    },
  })
  
  let currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
  
  if (currentY > 250) {
    doc.addPage()
    currentY = 20
  }
  
  doc.setFontSize(14)
  doc.setTextColor(primaryColor)
  doc.text("Vaccination Records", 14, currentY)
  
  const vaccinationHeaders = [["Vaccine", "Date Given", "Next Due", "Status"]]
  const vaccinationData = data.vaccinations.map((v) => [
    v.name,
    new Date(v.date).toLocaleDateString(),
    new Date(v.nextDue).toLocaleDateString(),
    v.status,
  ])
  
  autoTable(doc, {
    head: vaccinationHeaders,
    body: vaccinationData,
    startY: currentY + 5,
    theme: "grid",
    headStyles: {
      fillColor: "#0d9488",
      textColor: "#ffffff",
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
  })
  
  currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
  
  if (currentY > 220) {
    doc.addPage()
    currentY = 20
  }
  
  doc.setFontSize(14)
  doc.setTextColor(primaryColor)
  doc.text("Medical History", 14, currentY)
  
  const medicalHeaders = [["Date", "Type", "Veterinarian", "Diagnosis"]]
  const medicalData = data.medicalHistory.map((m) => [
    new Date(m.date).toLocaleDateString(),
    m.type,
    m.veterinarian,
    m.diagnosis,
  ])
  
  autoTable(doc, {
    head: medicalHeaders,
    body: medicalData,
    startY: currentY + 5,
    theme: "grid",
    headStyles: {
      fillColor: "#0d9488",
      textColor: "#ffffff",
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
  })
  
  currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
  
  if (currentY > 220) {
    doc.addPage()
    currentY = 20
  }
  
  doc.setFontSize(14)
  doc.setTextColor(primaryColor)
  doc.text("Appointment History", 14, currentY)
  
  const appointmentHeaders = [["Date", "Time", "Reason", "Doctor", "Status"]]
  const appointmentData = data.appointments.map((a) => [
    new Date(a.date).toLocaleDateString(),
    a.time,
    a.reason,
    a.doctor,
    a.status,
  ])
  
  autoTable(doc, {
    head: appointmentHeaders,
    body: appointmentData,
    startY: currentY + 5,
    theme: "grid",
    headStyles: {
      fillColor: "#0d9488",
      textColor: "#ffffff",
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
  })
  
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor("#9ca3af")
    doc.text(
      `VetClinic Patient Record - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
  }
  
  return doc
}

export function downloadPatientRecordPDF(data: PatientRecordData, filename?: string) {
  const doc = generatePatientRecordPDF(data)
  const defaultFilename = `${data.patient.name.replace(/\s+/g, "_")}_medical_record_${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(filename || defaultFilename)
}

export function printPatientRecordPDF(data: PatientRecordData) {
  const doc = generatePatientRecordPDF(data)
  const pdfBlob = doc.output("blob")
  const pdfUrl = URL.createObjectURL(pdfBlob)
  
  const printWindow = window.open(pdfUrl, "_blank")
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}