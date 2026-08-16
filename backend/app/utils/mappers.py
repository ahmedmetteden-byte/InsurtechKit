"""Map ORM entities ↔ camelCase API schemas."""
from typing import Any

from app.utils.serializers import to_iso


def _ts(entity: Any) -> dict[str, str]:
    return {
        "createdAt": to_iso(getattr(entity, "created_at", None)),
        "updatedAt": to_iso(getattr(entity, "updated_at", None)),
    }


def product_to_dict(p: Any) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "code": p.code,
        "description": p.description,
        "category": p.category,
        "status": p.status,
        "minimumPremium": p.minimum_premium,
        "currency": p.currency,
        "requiresInspection": p.requires_inspection,
        "active": p.active,
        **_ts(p),
    }


def customer_to_dict(c: Any) -> dict:
    return {
        "id": c.id,
        "customerNumber": c.customer_number,
        "customerType": c.customer_type,
        "firstName": c.first_name,
        "lastName": c.last_name,
        "companyName": c.company_name,
        "email": c.email,
        "phone": c.phone,
        "dateOfBirth": c.date_of_birth,
        "gender": c.gender,
        "identificationType": c.identification_type,
        "identificationNumber": c.identification_number,
        "address": c.address,
        "city": c.city,
        "state": c.state,
        "country": c.country,
        "occupation": c.occupation,
        "status": c.status,
        "notes": c.notes,
        **_ts(c),
    }


def policy_to_dict(p: Any) -> dict:
    return {
        "id": p.id,
        "policyNumber": p.policy_number,
        "customerId": p.customer_id,
        "productId": p.product_id,
        "customerName": p.customer_name,
        "productName": p.product_name,
        "policyType": p.policy_type,
        "effectiveDate": p.effective_date,
        "expiryDate": p.expiry_date,
        "premium": p.premium,
        "sumInsured": p.sum_insured,
        "currency": p.currency,
        "status": p.status,
        "agent": p.agent,
        "branch": p.branch,
        **_ts(p),
    }


def claim_to_dict(c: Any) -> dict:
    return {
        "id": c.id,
        "claimNumber": c.claim_number,
        "policyId": c.policy_id,
        "policyNumber": c.policy_number,
        "customerId": c.customer_id,
        "customerName": c.customer_name,
        "productName": c.product_name,
        "incidentDate": c.incident_date,
        "reportedDate": c.reported_date,
        "claimAmount": c.claim_amount,
        "approvedAmount": c.approved_amount,
        "currency": c.currency,
        "description": c.description,
        "status": c.status,
        "assignedTo": c.assigned_to,
        "notes": c.notes,
        **_ts(c),
    }


def onboarding_application_to_dict(a: Any) -> dict:
    return {
        "id": a.id,
        "reference": a.reference,
        "productId": a.product_id,
        "productName": a.product_name,
        "applicantFirstName": a.applicant_first_name,
        "applicantLastName": a.applicant_last_name,
        "applicantEmail": a.applicant_email,
        "applicantPhone": a.applicant_phone,
        "message": a.message,
        "consent": a.consent,
        "consentAt": a.consent_at,
        "status": a.status,
        "reviewNotes": a.review_notes,
        "customerId": a.customer_id or "",
        **_ts(a),
    }


def onboarding_document_to_dict(d: Any) -> dict:
    return {
        "id": d.id,
        "applicationId": d.application_id,
        "documentType": d.document_type,
        "originalFilename": d.original_filename,
        "contentType": d.content_type,
        "sizeBytes": d.size_bytes,
        **_ts(d),
    }


def role_to_dict(r: Any) -> dict:
    return {
        "id": r.id,
        "name": r.name,
        "description": r.description,
        "permissions": list(r.permissions or []),
        **_ts(r),
    }


def permission_to_dict(p: Any) -> dict:
    return {
        "id": p.id,
        "code": p.code,
        "description": p.description,
        **_ts(p),
    }


def user_to_dict(u: Any) -> dict:
    return {
        "id": u.id,
        "employeeId": u.employee_id,
        "firstName": u.first_name,
        "lastName": u.last_name,
        "email": u.email,
        "phone": u.phone,
        "department": u.department,
        "roleId": u.role_id,
        "roleName": u.role_name,
        "branch": u.branch,
        "status": u.status,
        "lastLogin": u.last_login,
        **_ts(u),
    }


def integration_to_dict(i: Any) -> dict:
    return {
        "id": i.id,
        "name": i.name,
        "type": i.type,
        "provider": i.provider,
        "status": i.status,
        "baseUrl": i.base_url,
        "apiKey": i.api_key,
        "apiSecret": i.api_secret,
        "username": i.username,
        "password": i.password,
        "webhookUrl": i.webhook_url,
        "timeout": i.timeout,
        "enabled": i.enabled,
        "lastHealthCheck": i.last_health_check,
        "notes": i.notes,
        **_ts(i),
    }


def branding_to_dict(b: Any) -> dict:
    return {
        "id": b.id,
        "companyName": b.company_name,
        "shortName": b.short_name,
        "legalName": b.legal_name,
        "tagline": b.tagline,
        "portalLabel": b.portal_label,
        "kitLabel": b.kit_label,
        "adminLabel": b.admin_label,
        "website": b.website,
        "emailDomain": b.email_domain,
        "supportEmail": b.support_email,
        "claimsEmail": b.claims_email,
        "supportPhone": b.support_phone,
        "whatsapp": b.whatsapp,
        "address": b.address,
        "logoLight": b.logo_light,
        "logoDark": b.logo_dark,
        "favicon": b.favicon,
        "primaryColor": b.primary_color,
        "secondaryColor": b.secondary_color,
        "accentColor": b.accent_color,
        "copyright": b.copyright,
        "licenceNo": b.licence_no,
        **_ts(b),
    }


def flags_to_dict(f: Any) -> dict:
    return {
        "id": f.id,
        "flags": dict(f.flags or {}),
        **_ts(f),
    }
