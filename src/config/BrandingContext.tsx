import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { defaultBranding, type BrandingConfig } from './branding'

type BrandingContextValue = {
  branding: BrandingConfig
  updateBranding: (patch: Partial<BrandingConfig>) => void
  setBranding: (next: BrandingConfig) => void
  resetBranding: () => void
}

const BrandingContext = createContext<BrandingContextValue | null>(null)

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBrandingState] = useState<BrandingConfig>(() => ({ ...defaultBranding }))

  const updateBranding = useCallback((patch: Partial<BrandingConfig>) => {
    setBrandingState(prev => {
      const next = { ...prev, ...patch }
      // Keep derived identity fields in sync when core fields change
      if (patch.companyName !== undefined || patch.licenceNo !== undefined) {
        const name = patch.companyName ?? prev.companyName
        const licence = patch.licenceNo ?? prev.licenceNo
        next.legalName = `${name} Ltd.`
        next.copyright = `© 2025 ${name} Ltd. RC 1234567. NAICOM Licence No. ${licence}. All rights reserved.`
        if (patch.companyName !== undefined && patch.shortName === undefined) {
          next.shortName = name
        }
      }
      if (patch.logoLight !== undefined && patch.logoDark === undefined) {
        next.logoDark = patch.logoLight
      }
      return next
    })
  }, [])

  const setBranding = useCallback((next: BrandingConfig) => {
    setBrandingState({ ...next })
  }, [])

  const resetBranding = useCallback(() => {
    setBrandingState({ ...defaultBranding })
  }, [])

  const value = useMemo(
    () => ({ branding, updateBranding, setBranding, resetBranding }),
    [branding, updateBranding, setBranding, resetBranding],
  )

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export function useBranding() {
  const ctx = useContext(BrandingContext)
  if (!ctx) {
    throw new Error('useBranding must be used within BrandingProvider')
  }
  return ctx
}
