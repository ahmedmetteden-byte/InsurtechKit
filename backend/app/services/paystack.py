"""Thin Paystack REST client — the live payment gateway integration.

Only server-side verification is needed here: the frontend collects the card
via Paystack's own Inline Popup (using the public key), then this module
confirms the transaction with the secret key before we ever mark an invoice
paid. Webhook signature verification uses the same secret key as a backend-
to-backend safety net in case the browser never comes back with a result.
"""
import hashlib
import hmac

import httpx

from app.core.config import get_settings

BASE_URL = "https://api.paystack.co"


class PaystackError(Exception):
    pass


def verify_transaction(reference: str) -> dict:
    settings = get_settings()
    response = httpx.get(
        f"{BASE_URL}/transaction/verify/{reference}",
        headers={"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"},
        timeout=15,
    )
    body = response.json()
    if response.status_code >= 400 or not body.get("status"):
        raise PaystackError(body.get("message", "Could not verify Paystack transaction"))
    return body["data"]


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    settings = get_settings()
    if not settings.PAYSTACK_SECRET_KEY or not signature:
        return False
    computed = hmac.new(settings.PAYSTACK_SECRET_KEY.encode("utf-8"), payload, hashlib.sha512).hexdigest()
    return hmac.compare_digest(computed, signature)
