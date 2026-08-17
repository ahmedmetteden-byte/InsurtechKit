/**
 * Client-side PDF generation for memory mode — mirrors the layout produced
 * by the backend's fpdf2-based `app/services/documents.py` so certificates
 * and receipts look the same regardless of data provider.
 */
import jsPDF from 'jspdf'

function document(title: string, companyName: string): jsPDF {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(companyName, 14, 20)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(title, 14, 28)
  doc.setTextColor(0)
  return doc
}

function rows(doc: jsPDF, entries: [string, string][], startY: number): number {
  let y = startY
  entries.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(label, 14, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 70, y)
    y += 8
  })
  return y
}

function footer(doc: jsPDF, text: string, y: number): void {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(120)
  doc.text(doc.splitTextToSize(text, 180), 14, y + 6)
}

export interface CertificateData {
  companyName: string
  licenceNo?: string
  policyNumber: string
  customerName: string
  productName: string
  policyType: string
  sumInsured: number
  premium: number
  currency: string
  effectiveDate: string
  expiryDate: string
  status: string
}

export function buildPolicyCertificatePdf(data: CertificateData): Blob {
  const doc = document('Certificate of Insurance', data.companyName)
  const y = rows(doc, [
    ['Policy Number', data.policyNumber],
    ['Policyholder', data.customerName],
    ['Product', `${data.productName} (${data.policyType})`],
    ['Sum Insured', `${data.currency} ${data.sumInsured.toLocaleString()}`],
    ['Premium', `${data.currency} ${data.premium.toLocaleString()}`],
    ['Effective Date', data.effectiveDate],
    ['Expiry Date', data.expiryDate],
    ['Status', data.status.charAt(0).toUpperCase() + data.status.slice(1)],
  ], 42)
  const licence = data.licenceNo ? ` Licence No. ${data.licenceNo}.` : ''
  footer(
    doc,
    `This certificate confirms cover under policy ${data.policyNumber}, subject to the full terms and conditions of the policy. Issued by ${data.companyName}.${licence}`,
    y,
  )
  return doc.output('blob')
}

export interface ReceiptData {
  companyName: string
  receiptNumber: string
  reference: string
  customerName: string
  description: string
  amount: number
  currency: string
  method: string
  paidAt: string
}

export function buildReceiptPdf(data: ReceiptData): Blob {
  const doc = document('Payment Receipt', data.companyName)
  const y = rows(doc, [
    ['Receipt Number', data.receiptNumber],
    ['Payment Reference', data.reference],
    ['Received From', data.customerName || '-'],
    ['Description', data.description],
    ['Amount', `${data.currency} ${data.amount.toLocaleString()}`],
    ['Method', data.method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
    ['Paid At', data.paidAt],
  ], 42)
  footer(doc, `This receipt confirms payment was received by ${data.companyName}. Thank you for your business.`, y)
  return doc.output('blob')
}
