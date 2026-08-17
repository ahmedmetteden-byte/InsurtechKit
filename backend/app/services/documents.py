"""PDF document generation — policy certificates and payment receipts.

Uses fpdf2 (pure Python, no system dependencies) so the kit stays easy to
deploy. Swap this module for a templated HTML->PDF renderer later if richer
layouts are needed — callers only ever see the two render_* functions below.
"""
from typing import Any

from fpdf import FPDF

# Core PDF fonts (Helvetica) only support Latin-1 — swap common "smart"
# punctuation for ASCII equivalents rather than shipping a Unicode font file.
_ASCII_REPLACEMENTS = {
    "—": "-",  # em dash
    "–": "-",  # en dash
    "‘": "'",
    "’": "'",
    "“": '"',
    "”": '"',
    "…": "...",
    "₦": "NGN ",  # naira sign
}


def _ascii(text: str) -> str:
    for char, replacement in _ASCII_REPLACEMENTS.items():
        text = text.replace(char, replacement)
    return text.encode("latin-1", "replace").decode("latin-1")


def _document(title: str, company_name: str) -> FPDF:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, _ascii(company_name), new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, _ascii(title), new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(6)
    return pdf


def _row(pdf: FPDF, label: str, value: str) -> None:
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(55, 8, _ascii(label))
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, _ascii(value), new_x="LMARGIN", new_y="NEXT")


def _footer(pdf: FPDF, text: str) -> None:
    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(120, 120, 120)
    pdf.multi_cell(0, 6, _ascii(text))


def render_policy_certificate(policy: dict[str, Any], branding: dict[str, Any]) -> bytes:
    company_name = branding.get("companyName") or "InsureNG"
    pdf = _document("Certificate of Insurance", company_name)
    rows: list[tuple[str, str]] = [
        ("Policy Number", policy["policyNumber"]),
        ("Policyholder", policy["customerName"]),
        ("Product", f"{policy['productName']} ({policy['policyType']})"),
        ("Sum Insured", f"{policy['currency']} {policy['sumInsured']:,.2f}"),
        ("Premium", f"{policy['currency']} {policy['premium']:,.2f}"),
        ("Effective Date", policy["effectiveDate"]),
        ("Expiry Date", policy["expiryDate"]),
        ("Status", policy["status"].title()),
    ]
    for label, value in rows:
        _row(pdf, label, value)
    licence = f" Licence No. {branding['licenceNo']}." if branding.get("licenceNo") else ""
    _footer(
        pdf,
        f"This certificate confirms cover under policy {policy['policyNumber']}, subject to the full "
        f"terms and conditions of the policy. Issued by {company_name}.{licence}",
    )
    return bytes(pdf.output())


def render_payment_receipt(payment: dict[str, Any], customer_name: str, branding: dict[str, Any]) -> bytes:
    company_name = branding.get("companyName") or "InsureNG"
    pdf = _document("Payment Receipt", company_name)
    rows: list[tuple[str, str]] = [
        ("Receipt Number", payment["receiptNumber"]),
        ("Payment Reference", payment["reference"]),
        ("Received From", customer_name or "—"),
        ("Description", payment["description"]),
        ("Amount", f"{payment['currency']} {payment['amount']:,.2f}"),
        ("Method", payment["method"].replace("_", " ").title()),
        ("Paid At", payment["paidAt"]),
    ]
    for label, value in rows:
        _row(pdf, label, value)
    _footer(pdf, f"This receipt confirms payment was received by {company_name}. Thank you for your business.")
    return bytes(pdf.output())
