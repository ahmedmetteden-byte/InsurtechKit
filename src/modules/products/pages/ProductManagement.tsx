/**
 * ProductManagement — admin catalogue table with search, filters, and in-memory CRUD.
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, Card, CardBody, CardHeader, Row, Stack } from '../../../components/ui'
import { ProductService } from '../../../data/services'
import type { Product } from '../types/Product'
import ProductForm, { CATEGORIES, type ProductFormValues } from '../components/ProductForm'

type ActiveFilter = 'all' | 'active' | 'inactive'
type ModalMode = 'view' | 'edit' | 'create' | 'delete' | null

function formatPremium(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString()}`
}

function StatusPill({ active, status }: { active: boolean; status: string }) {
  const on = active && status === 'active'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 9px',
      borderRadius: 20,
      background: on ? '#F0FDF4' : '#F1F5F9',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 500,
      color: on ? '#16A34A' : '#64748B',
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: on ? '#16A34A' : '#94A3B8', display: 'inline-block' }} />
      {on ? 'Active' : status === 'draft' ? 'Draft' : 'Inactive'}
    </span>
  )
}

const selectStyle: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #E4E2DC',
  background: '#FAFAF8',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#0F172A',
  cursor: 'pointer',
}

const inputStyle: CSSProperties = {
  ...selectStyle,
  minWidth: 220,
  cursor: 'text',
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: wide ? 720 : 520, maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14, border: '1px solid #E4E2DC', boxShadow: '0 24px 60px rgba(15,23,42,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #E4E2DC', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{title}</p>
            {subtitle && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748B', marginTop: 4 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E4E2DC', background: 'white', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#64748B' }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  )
}

function ViewDetails({ product }: { product: Product }) {
  const rows: [string, string][] = [
    ['Name', product.name],
    ['Code', product.code],
    ['Category', String(product.category)],
    ['Description', product.description],
    ['Minimum Premium', formatPremium(product.minimumPremium, product.currency)],
    ['Currency', product.currency],
    ['Status', product.status],
    ['Active', product.active ? 'Yes' : 'No'],
    ['Inspection Required', product.requiresInspection ? 'Yes' : 'No'],
    ['Created', new Date(product.createdAt).toLocaleString()],
    ['Updated', new Date(product.updatedAt).toLocaleString()],
  ]

  return (
    <Stack gap={10}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#0F172A', textAlign: 'right', fontWeight: 500 }}>{value}</span>
        </div>
      ))}
    </Stack>
  )
}

export default function ProductManagement() {
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [modal, setModal] = useState<ModalMode>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const refresh = () => setTick(t => t + 1)

  const products = useMemo(() => {
    void tick
    return ProductService.getAll()
  }, [tick])

  const selected = selectedId ? products.find(p => p.id === selectedId) ?? ProductService.getById(selectedId) : null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter(p => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      const matchesCategory = category === 'all' || p.category === category
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && p.active) ||
        (activeFilter === 'inactive' && !p.active)
      return matchesSearch && matchesCategory && matchesActive
    })
  }, [products, search, category, activeFilter])

  const open = (mode: ModalMode, id: string | null = null) => {
    setSelectedId(id)
    setModal(mode)
  }

  const close = () => {
    setModal(null)
    setSelectedId(null)
  }

  const handleCreate = async (values: ProductFormValues) => {
    await Promise.resolve(ProductService.create(values))
    refresh()
    close()
  }

  const handleUpdate = async (values: ProductFormValues) => {
    if (!selectedId) return
    await Promise.resolve(ProductService.update({ id: selectedId, ...values }))
    refresh()
    close()
  }

  const handleDelete = async () => {
    if (!selectedId) return
    await Promise.resolve(ProductService.delete(selectedId))
    refresh()
    close()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card padding={22} radius={14} border="1px solid #E4E2DC" background="#FFFFFF">
        <CardHeader
          title="Product Catalogue"
          subtitle={`${filtered.length} of ${products.length} products · in-memory`}
          action={
            <Button variant="primary" size="md" onClick={() => open('create')}>
              + New Product
            </Button>
          }
        />
      </Card>

      <Card padding={16} radius={12} border="1px solid #E4E2DC" background="#FFFFFF">
        <Row gap={12} wrap align="center">
          <input
            style={inputStyle}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or code…"
          />
          <select style={selectStyle} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <select style={selectStyle} value={activeFilter} onChange={e => setActiveFilter(e.target.value as ActiveFilter)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Row>
      </Card>

      <Card padding={0} radius={14} border="1px solid #E4E2DC" background="#FFFFFF" gap={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #E4E2DC' }}>
                {['Name', 'Code', 'Category', 'Minimum Premium', 'Currency', 'Status', 'Inspection Required', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E4E2DC' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{p.name}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{p.code}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B', textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{p.minimumPremium.toLocaleString()}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#64748B' }}>{p.currency}</td>
                  <td style={{ padding: '14px 16px' }}><StatusPill active={p.active} status={p.status} /></td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{p.requiresInspection ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Row gap={6} wrap={false}>
                      <Button variant="ghost" size="sm" onClick={() => open('view', p.id)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => open('edit', p.id)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => open('delete', p.id)}>Delete</Button>
                    </Row>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#64748B' }}>
                    No products match the current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modal === 'view' && selected && (
        <ModalShell title={selected.name} subtitle={selected.code} onClose={close}>
          <ViewDetails product={selected} />
        </ModalShell>
      )}

      {modal === 'create' && (
        <ModalShell title="New Product" subtitle="Create catalogue entry" onClose={close} wide>
          <ProductForm onSubmit={handleCreate} onCancel={close} submitLabel="Create Product" />
        </ModalShell>
      )}

      {modal === 'edit' && selected && (
        <ModalShell title="Edit Product" subtitle={selected.code} onClose={close} wide>
          <ProductForm initial={selected} onSubmit={handleUpdate} onCancel={close} submitLabel="Update Product" />
        </ModalShell>
      )}

      {modal === 'delete' && selected && (
        <ModalShell title="Delete Product" subtitle="This cannot be undone in this session" onClose={close}>
          <CardBody>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 20 }}>
              Delete <strong>{selected.name}</strong> ({selected.code}) from the in-memory catalogue?
            </p>
            <Row gap={10}>
              <Button variant="danger" size="md" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="md" onClick={close}>Cancel</Button>
            </Row>
          </CardBody>
        </ModalShell>
      )}
    </div>
  )
}
