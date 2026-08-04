import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { defaultFeatures, type FeatureKey, type FeaturesConfig } from './features'

type FeatureContextValue = {
  features: FeaturesConfig
  isEnabled: (key: FeatureKey) => boolean
  setFeature: (key: FeatureKey, enabled: boolean) => void
  setFeatures: (next: FeaturesConfig) => void
  resetFeatures: () => void
}

const FeatureContext = createContext<FeatureContextValue | null>(null)

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeaturesState] = useState<FeaturesConfig>(() => ({ ...defaultFeatures }))

  const isEnabled = useCallback(
    (key: FeatureKey) => features[key],
    [features],
  )

  const setFeature = useCallback((key: FeatureKey, enabled: boolean) => {
    setFeaturesState(prev => ({ ...prev, [key]: enabled }))
  }, [])

  const setFeatures = useCallback((next: FeaturesConfig) => {
    setFeaturesState({ ...next })
  }, [])

  const resetFeatures = useCallback(() => {
    setFeaturesState({ ...defaultFeatures })
  }, [])

  const value = useMemo(
    () => ({ features, isEnabled, setFeature, setFeatures, resetFeatures }),
    [features, isEnabled, setFeature, setFeatures, resetFeatures],
  )

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>
}

export function useFeatures() {
  const ctx = useContext(FeatureContext)
  if (!ctx) {
    throw new Error('useFeatures must be used within FeatureProvider')
  }
  return ctx
}
