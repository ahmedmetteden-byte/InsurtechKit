import { useState, type CSSProperties } from 'react'
import { useBranding } from '../../../config/BrandingContext'
import { OnboardingService } from '../../../data/services'
import {
  ONBOARDING_DOCUMENT_TYPES,
  onboardingDocumentTypeLabel,
  onboardingStatusLabel,
  type OnboardingApplicationSummary,
  type OnboardingDocumentType,
} from '../types/OnboardingApplication'

interface Props {
  onBackToHome: () => void
}

const inputStyle: CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
  background: 'white', fontFamily: 'var(--font-body)', fontSize: 14, color: '#0F172A', boxSizing: 'border-box',
}

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8, display: 'block',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function TrackApplicationPage({ onBackToHome }: Props) {
  const { branding } = useBranding()
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [looking, setLooking] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [application, setApplication] = useState<OnboardingApplicationSummary | null>(null)

  const [documentType, setDocumentType] = useState<OnboardingDocumentType>('identification')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLookupError('')
    setUploadSuccess('')
    if (!reference.trim() || !email.trim()) {
      setLookupError('Enter both your reference number and the email you applied with.')
      return
    }
    setLooking(true)
    try {
      const result = await Promise.resolve(
        OnboardingService.lookup({ reference: reference.trim(), email: email.trim() }),
      )
      setApplication(result)
    } catch (err) {
      setApplication(null)
      setLookupError(err instanceof Error ? err.message : 'Could not find that application.')
    } finally {
      setLooking(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError('')
    setUploadSuccess('')
    if (!application) return
    if (!file) {
      setUploadError('Choose a file to upload.')
      return
    }
    setUploading(true)
    try {
      const doc = await Promise.resolve(
        OnboardingService.uploadDocument({ applicationId: application.id, documentType, file }),
      )
      setApplication({ ...application, documents: [...application.documents, doc] })
      setUploadSuccess(`${doc.originalFilename} uploaded.`)
      setFile(null)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not upload that file.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section style={{ background: '#F8FAFC', minHeight: '70vh', padding: '56px 24px 80px' }}>
      <div className="max-w-[640px] mx-auto">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: '#1D4ED8', textTransform: 'uppercase', marginBottom: 10 }}>Track Application</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(26px,3.4vw,38px)', letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1.1, marginBottom: 10 }}>
          Check your application status
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#64748B', lineHeight: 1.6, marginBottom: 28 }}>
          Enter the reference number from your confirmation and the email you applied with.
        </p>

        <form onSubmit={handleLookup} style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Reference number</label>
              <input style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} value={reference} onChange={e => setReference(e.target.value)} placeholder="APP-XXXXXXXX" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </div>
          {lookupError && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontFamily: 'var(--font-body)', fontSize: 13, color: '#B91C1C' }}>
              {lookupError}
            </div>
          )}
          <button type="submit" disabled={looking} style={{ padding: '13px', borderRadius: 12, background: looking ? '#93C5FD' : '#1D4ED8', color: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, border: 'none', cursor: looking ? 'default' : 'pointer' }}>
            {looking ? 'Looking up…' : 'Find My Application'}
          </button>
          <button type="button" onClick={onBackToHome} style={{ padding: '4px', background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, color: '#94A3B8', cursor: 'pointer' }}>
            ← Back to home
          </button>
        </form>

        {application && (
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>{application.reference}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#0F172A' }}>{application.productName}</p>
              </div>
              <span style={{ padding: '5px 12px', borderRadius: 20, background: '#EFF6FF', border: '1px solid #BFDBFE', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#1D4ED8', whiteSpace: 'nowrap' }}>
                {onboardingStatusLabel(application.status)}
              </span>
            </div>

            {application.status === 'info_required' ? (
              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A', fontFamily: 'var(--font-body)', fontSize: 13, color: '#92400E' }}>
                We need a bit more information to continue — please upload the requested document below.
              </div>
            ) : (
              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#F8FAFC', border: '1px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B' }}>
                {application.status === 'approved'
                  ? `You're approved — the ${branding.companyName} team will be in touch about next steps.`
                  : application.status === 'declined'
                  ? "This application wasn't approved. Contact us if you have questions."
                  : "Your application is being reviewed. We'll update this page as it progresses."}
              </div>
            )}

            {application.documents.length > 0 && (
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 10 }}>Uploaded documents</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {application.documents.map(doc => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: '#F8FAFC', border: '1px solid var(--border)' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.originalFilename}</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{onboardingDocumentTypeLabel(doc.documentType)} · {formatBytes(doc.sizeBytes)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {application.status === 'info_required' && (
              <form onSubmit={handleUpload} style={{ borderTop: '1px solid var(--border)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Upload a document</p>
                <div>
                  <label style={labelStyle}>Document type</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={documentType} onChange={e => setDocumentType(e.target.value as OnboardingDocumentType)}>
                    {ONBOARDING_DOCUMENT_TYPES.map(t => (
                      <option key={t} value={t}>{onboardingDocumentTypeLabel(t)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>File (PDF, JPG, PNG, or WEBP · up to 10MB)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => setFile(e.target.files?.[0] ?? null)} style={inputStyle} />
                </div>
                {uploadError && (
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontFamily: 'var(--font-body)', fontSize: 13, color: '#B91C1C' }}>
                    {uploadError}
                  </div>
                )}
                {uploadSuccess && (
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', fontFamily: 'var(--font-body)', fontSize: 13, color: '#15803D' }}>
                    {uploadSuccess}
                  </div>
                )}
                <button type="submit" disabled={uploading} style={{ padding: '12px', borderRadius: 10, background: uploading ? '#93C5FD' : '#1D4ED8', color: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, border: 'none', cursor: uploading ? 'default' : 'pointer' }}>
                  {uploading ? 'Uploading…' : 'Upload Document'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
