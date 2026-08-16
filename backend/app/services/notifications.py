"""Notification templates + a log-based provider adapter.

`deliver` is the swap point for a real email/SMS/WhatsApp provider (SMTP, SES,
Termii, etc.) — callers only ever go through NotificationService, so wiring a
live provider later means changing this one function, not every call site.
"""
from collections.abc import Callable

TEMPLATES: dict[str, Callable[[dict], tuple[str, str]]] = {
    "application_submitted": lambda ctx: (
        f"We've received your {ctx['productName']} application — {ctx['reference']}",
        f"Hi {ctx['firstName']}, thanks for applying for {ctx['productName']} with {ctx['companyName']}. "
        f"Your reference number is {ctx['reference']}. We'll be in touch soon.",
    ),
    "application_info_required": lambda ctx: (
        f"Action needed on application {ctx['reference']}",
        f"Hi {ctx['firstName']}, we need a bit more information to continue reviewing your "
        f"{ctx['productName']} application ({ctx['reference']}). Visit the Track Application page on "
        f"our site and upload the requested documents.",
    ),
    "application_approved": lambda ctx: (
        f"You're approved — {ctx['reference']}",
        f"Hi {ctx['firstName']}, great news — your {ctx['productName']} application ({ctx['reference']}) "
        f"has been approved. A member of the {ctx['companyName']} team will be in touch about next steps.",
    ),
    "application_declined": lambda ctx: (
        f"Update on your application — {ctx['reference']}",
        f"Hi {ctx['firstName']}, thank you for applying for {ctx['productName']}. After review, we're "
        f"unable to proceed with application {ctx['reference']} at this time. Contact us if you have questions.",
    ),
    "document_received": lambda ctx: (
        f"We received your document — {ctx['reference']}",
        f"Hi {ctx['firstName']}, we've received {ctx['filename']} for your application {ctx['reference']}. "
        f"Our team will review it shortly.",
    ),
    "payment_received": lambda ctx: (
        f"Payment received — {ctx['reference']}",
        f"Hi {ctx['firstName']}, we've received your payment of {ctx['amount']} for application "
        f"{ctx['reference']}. Receipt number: {ctx['receiptNumber']}.",
    ),
    "payment_refunded": lambda ctx: (
        f"Refund processed — {ctx['reference']}",
        f"Hi {ctx['firstName']}, your payment for application {ctx['reference']} has been refunded.",
    ),
}

STATUS_TEMPLATE = {
    "info_required": "application_info_required",
    "approved": "application_approved",
    "declined": "application_declined",
}


def render(template_key: str, context: dict) -> tuple[str, str]:
    return TEMPLATES[template_key](context)


def deliver(channel: str, recipient: str, subject: str, body: str) -> None:
    """Default provider — logs instead of calling a live service. Swap for
    production use; the demo kit has no email/SMS credentials configured."""
    print(f"[notify:{channel}] -> {recipient} | {subject}")
