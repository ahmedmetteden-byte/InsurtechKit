/**
 * Paystack Inline Popup — loaded lazily so the SDK is only fetched when a
 * customer actually reaches checkout. The popup collects the card itself;
 * the reference it returns still has to be verified server-side (see
 * OnboardingService.confirmPayment) before anything is trusted as paid.
 */
interface PaystackPopHandle {
  openIframe(): void
}

interface PaystackSetupOptions {
  key: string
  email: string
  amount: number
  currency?: string
  ref: string
  onClose?: () => void
  callback?: (response: { reference: string }) => void
}

declare global {
  interface Window {
    PaystackPop?: {
      setup(options: PaystackSetupOptions): PaystackPopHandle
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Could not load the Paystack checkout. Check your connection and try again.'))
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

export interface PaystackCheckoutInput {
  publicKey: string
  email: string
  amountKobo: number
  currency: string
  reference: string
}

/** Opens the popup and resolves with the transaction reference on success. */
export async function openPaystackCheckout(input: PaystackCheckoutInput): Promise<string> {
  await loadPaystackScript()
  return new Promise((resolve, reject) => {
    if (!window.PaystackPop) {
      reject(new Error('Paystack checkout failed to load.'))
      return
    }
    const handle = window.PaystackPop.setup({
      key: input.publicKey,
      email: input.email,
      amount: input.amountKobo,
      currency: input.currency,
      ref: input.reference,
      callback: response => resolve(response.reference),
      onClose: () => reject(new Error('Payment window closed before completing payment.')),
    })
    handle.openIframe()
  })
}
