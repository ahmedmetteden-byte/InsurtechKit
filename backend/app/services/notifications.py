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
    "claim_submitted": lambda ctx: (
        f"Claim received — {ctx['claimNumber']}",
        f"Hi {ctx['firstName']}, we've received your claim {ctx['claimNumber']}. Our claims team will review it shortly.",
    ),
    "claim_under_review": lambda ctx: (
        f"Your claim is under review — {ctx['claimNumber']}",
        f"Hi {ctx['firstName']}, claim {ctx['claimNumber']} is now being reviewed by our team.",
    ),
    "claim_approved": lambda ctx: (
        f"Claim approved — {ctx['claimNumber']}",
        f"Hi {ctx['firstName']}, great news — claim {ctx['claimNumber']} has been approved for {ctx['approvedAmount']}.",
    ),
    "claim_rejected": lambda ctx: (
        f"Update on your claim — {ctx['claimNumber']}",
        f"Hi {ctx['firstName']}, after review, claim {ctx['claimNumber']} was not approved. Contact us if you have questions.",
    ),
    "claim_paid": lambda ctx: (
        f"Claim payment sent — {ctx['claimNumber']}",
        f"Hi {ctx['firstName']}, payment for claim {ctx['claimNumber']} has been processed.",
    ),
}

STATUS_TEMPLATE = {
    "info_required": "application_info_required",
    "approved": "application_approved",
    "declined": "application_declined",
}

CLAIM_STATUS_TEMPLATE = {
    "under_review": "claim_under_review",
    "approved": "claim_approved",
    "rejected": "claim_rejected",
    "paid": "claim_paid",
}


def render(template_key: str, context: dict) -> tuple[str, str]:
    return TEMPLATES[template_key](context)


def deliver(channel: str, recipient: str, subject: str, body: str) -> None:
    """Default provider — logs instead of calling a live service. Swap for
    production use; the demo kit has no email/SMS credentials configured."""
    print(f"[notify:{channel}] -> {recipient} | {subject}")
