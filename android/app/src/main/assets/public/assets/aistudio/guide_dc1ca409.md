# AushadhLedger --- Product & Development Guide

**Document type:** Product requirements and implementation guide\
**Status:** Requirements discovery / initial specification\
**Project objective:** Help prevent counterfeit medicines through
pack-level identity, secure verification, duplicate-scan intelligence,
and lightweight distribution confirmation.

------------------------------------------------------------------------

## 1. Product vision

AushadhLedger is a medicine authenticity verification platform. Its
primary purpose is to help consumers, pharmacies, manufacturers, and
platform administrators determine whether a medicine pack is registered
and whether its identity or scan history shows signs of possible
duplication or tampering.

This is **not intended to be a full pharmaceutical logistics or ERP
system**. Distribution features exist to establish basic custody and
delivery confirmation, provide stock visibility, and support
authenticity checks.

The system has two connected products:

1.  **AushadhLedger Website** --- administration and organization
    portals, QR and batch management, shipment confirmation, and public
    verification pages.
2.  **AushadhLedger Android App** --- the official consumer-facing
    secure scanner, intended to perform QR scanning and optical
    security-pattern capture.

Both products use the same central backend and verification service.

## 2. Core principles

-   Every physical medicine pack must have its own unique identity and
    QR code.
-   Every manufacturing batch must also have a separate batch identity
    and batch QR.
-   A QR code by itself must not be presented as proof that the physical
    medicine pack is genuine.
-   Verification must happen on the backend. The frontend or Android app
    must not be trusted to make the final authenticity decision.
-   Public scans and authenticated organization scans must be classified
    separately.
-   Repeated public scans must be evaluated intelligently; a repeat scan
    is not automatically proof of counterfeiting.
-   Scan history and security events must be auditable.
-   The organization registration and approval process is controlled by
    the main platform administrator.
-   Distribution workflows should remain simple and focused on
    confirming where stock was sent and received.

## 3. User roles and organization types

### 3.1 Main platform administrator

The platform owner has central control over the platform.

Required capabilities:

-   Review, approve, reject, suspend, and reactivate organizations.
-   Manage registered manufacturers, C&F/super stockists, distributors,
    stockists, and pharmacies.
-   Review organization documents and registration details.
-   Request additional information.
-   Manage platform users and permissions.
-   View products, batches, packs, shipments, and scan activity.
-   Review suspicious-scan alerts and investigate incidents.
-   Block or recall a pack or batch where authorized.
-   View audit history and platform reports.

Administrative actions must be recorded in an audit log. A normal
organization user must not be able to grant themselves an administrator
role.

### 3.2 Manufacturer

A verified manufacturer can:

-   Register medicine products.
-   Create manufacturing batches.
-   Enter product, batch, manufacturing-date, expiry-date, and quantity
    information.
-   Generate a unique identity and QR for every individual pack.
-   Generate a separate QR for each batch.
-   Register the required optical security-pattern reference for each
    pack, if the chosen production method supports pack-level patterns.
-   Manage basic distribution and shipment invoices.
-   See which registered organization received a shipment and its
    delivery confirmation.
-   View scan activity and suspicious-activity alerts for its products.

### 3.3 C&F / super stockist

A verified C&F or super stockist can:

-   Receive shipments addressed to its organization.
-   Confirm receipt through the shipment QR workflow.
-   View its received stock.
-   Transfer stock to an authorized downstream organization using a
    basic shipment/invoice process.
-   View relevant product and batch information.

### 3.4 Distributor / stockist

A verified distributor or stockist can:

-   Receive and confirm shipments.
-   View available stock.
-   Transfer stock to authorized pharmacies or other permitted
    organizations.
-   View product, batch, and shipment details relevant to its account.

The system should support organizations receiving products from multiple
manufacturers and supplying multiple eligible downstream organizations,
subject to platform permissions.

### 3.5 Pharmacy

A verified pharmacy can:

-   Scan a shipment QR after logging in.
-   Confirm receipt of a shipment addressed to that pharmacy.
-   View received products, batches, and available stock.
-   Scan individual medicine QR codes to view product details.
-   Have its authenticated scans recorded separately from public
    consumer scans.

Pharmacy scans must not count toward public duplicate-scan alerts. They
must still be retained in the audit history.

### 3.6 Public consumer

A consumer must be able to access basic verification information without
creating an account.

The official Android app is intended to provide the complete
QR-plus-optical-pattern verification workflow. A public website may
display basic QR registration information, scan history warnings, and
instructions to use the official app for physical-pattern
authentication.

## 4. Organization registration and approval

All organization types must submit an application before operating.

Suggested workflow:

1.  Applicant selects its organization type.
2.  Applicant submits business details and relevant registration
    documents.
3.  Application receives a `PENDING_REVIEW` status.
4.  Main administrator reviews the application.
5.  Administrator approves, rejects, or requests additional information.
6.  Only an approved organization receives operational permissions.
7.  Administrator can later suspend or reactivate the organization.

Suggested statuses:

-   `PENDING_REVIEW`
-   `MORE_INFORMATION_REQUIRED`
-   `APPROVED`
-   `REJECTED`
-   `SUSPENDED`

All approval decisions and status changes must be auditable and enforced
by backend authorization.

## 5. Medicine, batch, and pack identity

### 5.1 Product record

A product record should include, as applicable:

-   Product ID
-   Manufacturer ID
-   Product name
-   Generic/active ingredient information
-   Strength and dosage form
-   Pack size
-   Other product details supplied and approved by the manufacturer

### 5.2 Batch record

A batch record should include:

-   Batch ID and manufacturer batch number
-   Product ID
-   Manufacturer ID
-   Manufacturing date
-   Expiry date
-   Manufactured quantity
-   Batch QR identity
-   Batch status
-   Creation and audit timestamps

Batch status should support at least active, blocked, and recalled
states.

### 5.3 Individual pack record

Every physical pack must have a unique record, even when many packs
belong to the same batch.

Suggested fields:

-   Unique Pack ID
-   Product ID
-   Batch ID
-   Manufacturer ID
-   Random, high-entropy token
-   Digital signature or signed identity
-   Pack status
-   Optical-pattern reference identifier, where applicable
-   Creation and activation timestamps

The QR should contain a secure verification URL and an opaque,
unguessable token. It should not contain trusted product claims that the
client accepts without server validation.

### 5.4 Cryptographic signing

Use a well-reviewed digital-signature scheme such as Ed25519, subject to
implementation review.

-   Generate and sign pack identities on trusted backend infrastructure.
-   Keep signing private keys out of browser and Android application
    bundles.
-   Publish or securely distribute the corresponding verification public
    keys.
-   Support key rotation and key revocation.
-   Verify signatures on the backend.
-   Do not treat a valid signature as proof that the physical printed QR
    is the original.

A copied QR remains a copied valid identity. Duplicate detection and
physical authentication are required to address that threat.

## 6. Optical physical-pack authentication

### 6.1 Goal

The project intends to add a small machine-readable optical security
pattern printed directly beside the QR code. The official AushadhLedger
Android app will capture this pattern and submit evidence to the backend
for verification.

The goal is to make a copied QR image insufficient for the strongest
authenticity result, without requiring scratch-off labels or mandatory
NFC chips.

### 6.2 Candidate technologies to investigate

Do not assume that an ordinary printed graphic is unclonable. Prototype
and evaluate:

-   Random microtexture or microdot patterns.
-   Optical Physical Unclonable Function (PUF) printing.
-   Random fibre or substrate patterns.
-   Other low-cost security-printing methods suitable for pharmaceutical
    packaging.

A conventional image printed identically on every pack is not a
pack-specific physical identity. A photograph of a normal pattern may be
copied. The selected method must be tested against high-quality copying
and replay attempts.

### 6.3 Required research and prototype tests

Before committing manufacturers to a packaging change, test:

-   Whether each pack produces a sufficiently unique fingerprint.
-   Whether ordinary Android cameras can capture it reliably.
-   Authentication accuracy across different phone models.
-   Lighting, focus, angle, glare, blur, and packaging-wear tolerance.
-   False acceptance and false rejection rates.
-   Resistance to printed reproductions and screen replays.
-   Production-line printing speed and cost.
-   Whether reference capture can be automated during packaging.
-   Whether the pattern can be registered without slowing production
    unacceptably.

### 6.4 Important product limitation

A proprietary app does not make a printed pattern inherently impossible
for another app to photograph. The official app can provide the
supported capture flow and trusted verification experience, but security
must come from the physical pattern's measurable properties and
server-side challenge/validation---not from hiding the scanner
implementation.

If the optical pattern cannot reliably resist copying, the system must
describe the result as a pattern match or risk signal, not as conclusive
proof of physical authenticity.

## 7. Verification workflow

### 7.1 Official Android app

1.  Consumer opens AushadhLedger Secure Scanner.
2.  App scans the pack QR.
3.  Backend validates the token, pack record, signature, manufacturer,
    and batch status.
4.  App guides the consumer to capture the adjacent optical security
    pattern.
5.  App submits the captured evidence and scan context to the backend.
6.  Backend evaluates the physical-pattern match, previous scans, and
    risk signals.
7.  Backend returns a structured result and explanation.

### 7.2 Website QR flow

A standard camera or QR reader may open the public verification URL. The
website can check whether the QR identity is registered and show
relevant warnings. If physical-pattern authentication is required, it
should direct the user to the official Android app rather than falsely
claiming that QR-only verification completed the full check.

### 7.3 Verification result states

Suggested result states:

-   `VERIFIED` --- required identity and physical-authentication checks
    passed, with no significant risk detected.
-   `REGISTERED_BUT_NOT_FULLY_AUTHENTICATED` --- QR identity is
    registered, but physical authentication has not been completed.
-   `ALREADY_SCANNED` --- prior public scan history exists; show the
    relevant history and risk assessment.
-   `SUSPICIOUS` --- risk signals require caution or investigation.
-   `INVALID` --- token, signature, or registration check failed.
-   `BLOCKED` --- pack has been blocked by an authorized party.
-   `BATCH_RECALLED` --- associated batch is recalled.
-   `AUTHENTICATION_UNAVAILABLE` --- required service is unavailable; do
    not silently claim success.

A valid QR must not automatically authenticate every pack in a valid
batch. Pack-level and batch-level checks are separate.

## 8. Scan event recording

Every scan should create a scan event with, where available and
appropriate:

-   Scan event ID
-   Pack ID and batch ID
-   Timestamp from trusted server time
-   Scan category: public, pharmacy, manufacturer, distributor,
    stockist, or admin
-   IP address and derived approximate network location
-   GPS coordinates only when the user grants permission
-   Location source and accuracy/confidence
-   Device/app/browser metadata
-   Optical authentication result, if performed
-   Verification outcome
-   Risk score and reason codes

Do not treat IP geolocation as precise physical location. GPS can be
denied, spoofed, or inaccurate. Preserve the source and confidence of
location evidence.

Pharmacy and other authenticated organization scans must be recorded but
excluded from the public duplicate-scan comparison rules agreed for this
project.

## 9. Duplicate-scan and suspicious-activity engine

### 9.1 Agreed rule

-   Pharmacy scans are recorded in audit history.
-   Pharmacy scans are excluded from public duplicate-scan alerts.
-   Public scans are compared with previous public scans of the same
    pack.
-   A repeated public scan is not automatically counterfeit.
-   The engine evaluates time, distance, scan frequency, device signals,
    and other available evidence.

### 9.2 Risk signals

Potential signals include:

-   First public scan.
-   Repeat scan from the same device and nearby location.
-   Repeat scan from a different device in the same area.
-   Large distance between scans within a short time.
-   Many distinct locations scanning one pack.
-   Unusually high scan frequency.
-   Concurrent or near-concurrent scans.
-   Invalid or repeatedly manipulated scan requests.
-   Pack or batch status conflicts.

Use a configurable risk-scoring model. Initial numerical weights must be
treated as provisional until tested against real data. A risk score is
not a probability that a product is counterfeit.

### 9.3 Alert handling

When risk crosses configured thresholds:

-   Preserve the scan event and evidence.
-   Flag the pack for review.
-   Notify the relevant manufacturer and platform administrator.
-   Show prior public scan times and approximate locations where
    appropriate.
-   Explain the reason for the warning.
-   Allow authorized administrators to record an investigation outcome.

Do not automatically make an unsupported counterfeit accusation based
solely on a location anomaly.

## 10. Lightweight distribution and stock confirmation

Distribution exists to establish basic shipment receipt and stock
visibility, not to create a complex logistics ERP.

### 10.1 Shipment process

1.  An authorized organization creates a shipment/invoice for a
    registered recipient.
2.  The shipment receives a unique ID and its own QR code.
3.  The recipient logs in and scans the shipment QR.
4.  Backend checks the shipment, sender, recipient, and assigned pack
    identities.
5.  Recipient confirms receipt.
6.  Sender can see the recipient's registered identity, address, and
    delivery confirmation.

A batch may be split across multiple shipments and recipients. Every
individual pack must be assigned to no more than one active custody
allocation at a time.

### 10.2 Stock visibility

Provide basic received, available, and transferred quantities. Prevent
duplicate allocation and unauthorized transfers. Avoid building
unrelated route planning, fleet management, accounting, or advanced
warehouse workflows unless separately requested.

## 11. Security and data integrity requirements

-   Enforce role-based permissions on the backend.
-   Never trust role or organization IDs supplied by an untrusted
    client.
-   Prevent users from self-assigning administrator privileges.
-   Use server-side validation for QR, signatures, batch status,
    shipment receipt, and stock allocation.
-   Record scan events in an append-only or tamper-evident audit design.
-   Restrict access to sensitive scan and organization information.
-   Apply rate limits and abuse detection to public verification
    endpoints.
-   Use secure key storage and key rotation.
-   Protect against replayed API requests and duplicate submissions.
-   Use database transactions for pack allocation, shipment receipt, and
    other state changes that must be atomic.
-   Keep secrets out of frontend and Android source bundles.
-   Back up critical records and test restoration.
-   Log administrative actions and security-relevant changes.

Cryptographic hashes or periodic signed checkpoints can make
unauthorized changes to audit records detectable. They do not by
themselves create a decentralized blockchain or guarantee that the
original data was truthful.

## 12. Suggested high-level architecture

Keep the architecture modular:

1.  **Web frontend** --- main admin and organization portals.
2.  **Android application** --- official QR and optical-pattern scanner.
3.  **Authentication and authorization service** --- user sessions,
    organization membership, and roles.
4.  **Product and batch service** --- products, batches, and pack
    identities.
5.  **QR and signature service** --- token generation, signing, key
    management, and verification.
6.  **Verification API** --- public and authenticated verification
    workflows.
7.  **Optical authentication service** --- pattern enrollment, matching,
    and confidence results.
8.  **Scan intelligence service** --- scan events, duplicate detection,
    risk scoring, and alerts.
9.  **Shipment and stock service** --- lightweight invoice, receipt, and
    stock allocation.
10. **Audit and notification service** --- administrative history and
    alerts.

The technology stack is intentionally not fixed in this guide. Select it
after inspecting the existing repository, current Firebase
configuration, deployment constraints, and implementation quality. Do
not rewrite the project or migrate databases before making that
assessment.

## 13. Recommended implementation phases

### Phase 1 --- Requirements and repository audit

-   Inspect the complete existing repository.
-   Identify working UI and reusable components.
-   Identify demo-only, local-state, insecure, or incomplete
    functionality.
-   Map existing features to this guide.
-   Record gaps before changing code.
-   Confirm backend, hosting, and Android technology choices.

### Phase 2 --- Secure platform foundation

-   Authentication and organization membership.
-   Admin approval workflow.
-   Backend-enforced roles and permissions.
-   Product, batch, pack, and organization data model.
-   Audit logging and database access rules.

### Phase 3 --- Pack identity and QR generation

-   Secure token generation.
-   Server-side signing and verification.
-   Individual pack QR generation.
-   Batch QR generation.
-   Key management and revocation.
-   Tests for token uniqueness and invalid/tampered QR inputs.

### Phase 4 --- Verification and scan intelligence

-   Public QR verification.
-   Authenticated pharmacy scanning.
-   Scan-event recording.
-   Public-only duplicate comparison.
-   Location and time anomaly analysis.
-   Risk explanations, alerts, and admin investigation tools.

### Phase 5 --- Optical security prototype

-   Compare candidate physical security-printing technologies.
-   Build a camera-capture prototype.
-   Test against copied images, printed reproductions, and replay
    attacks.
-   Measure false acceptance and false rejection.
-   Confirm production feasibility and cost with manufacturers.
-   Only then finalize the pattern-enrollment and verification workflow.

### Phase 6 --- Android Secure Scanner

-   QR scanning.
-   Guided optical-pattern capture.
-   Secure API communication.
-   Clear verification results.
-   Offline/unavailable-service handling that never falsely reports
    success.
-   Device and camera compatibility testing.

### Phase 7 --- Lightweight shipment and stock workflows

-   Shipment invoice and QR.
-   Recipient confirmation.
-   Pack allocation and transfer safeguards.
-   Basic stock visibility.
-   Company delivery confirmation.

### Phase 8 --- Production readiness

-   Security review and penetration testing.
-   Load and concurrency testing.
-   Backup and recovery tests.
-   Monitoring and alerting.
-   Manufacturer pilot.
-   Android device testing.
-   Operational documentation.

## 14. Acceptance criteria

The project should not be considered production-ready until these
behaviours are demonstrated:

-   An unregistered or malformed QR cannot pass verification.
-   A modified token or invalid signature fails verification.
-   A valid pack QR can be verified against the correct manufacturer and
    batch.
-   A batch QR cannot substitute for an individual pack QR.
-   A public scan creates a durable scan event.
-   Pharmacy scans are recorded but do not trigger public duplicate-scan
    rules.
-   Repeated public scans are compared and risk-assessed.
-   A suspicious location/time pattern creates an explainable alert.
-   A suspended organization cannot perform protected operations.
-   An organization cannot assign or transfer a pack it does not hold.
-   A shipment can only be confirmed by its intended authorized
    recipient.
-   The official scanner does not claim physical authentication when the
    optical check was not completed.
-   Optical authentication is tested against high-quality copying and
    replay before being marketed as copy-resistant.
-   Concurrent requests cannot allocate or receive the same pack twice.
-   Administrative actions and security-relevant changes are auditable.

## 15. Decisions confirmed during requirements discussion

-   The main objective is stopping medicine counterfeiting through
    authenticity verification.
-   The platform has a central main administrator.
-   Manufacturers, pharmacies, stockists, distributors, and C&F/super
    stockists are separate organization types.
-   All organizations must be fully verified and approved by the main
    administrator before operating.
-   Manufacturers generate a unique QR for every medicine pack.
-   Each manufacturing batch also has a separate batch QR.
-   A shipment invoice has its own QR for the receiving organization to
    scan after login.
-   Companies can see the receiving pharmacy/organization identity,
    address, and delivery confirmation.
-   A batch can be divided among multiple shipments and organizations.
-   Public users can access verification without logging in.
-   Pharmacy scans are recorded but excluded from public duplicate-scan
    alerts.
-   Public scans are compared with previous public scans using time,
    location, and other risk signals.
-   A repeat scan should show relevant previous scan information and a
    risk assessment, not automatically label the medicine counterfeit.
-   Distribution should remain lightweight; the project is not a full
    distribution-chain management ERP.
-   Scratch-off codes are not acceptable as a mandatory packaging
    requirement.
-   The preferred direction is a low-cost optical security pattern
    printed beside the QR, subject to feasibility and anti-copy testing.
-   The official Android app is intended to perform QR and
    optical-pattern scanning.
-   The website and Android app share the same backend.

## 16. Open decisions

These items still require product or engineering decisions:

1.  Final optical security technology and its production cost.
2.  Whether the optical pattern can be unique per pack or is only unique
    per production lot.
3.  Whether the pattern is enrolled automatically on the packaging line
    or through a separate capture process.
4.  Android implementation technology and supported minimum Android
    version.
5.  Whether the existing Firebase backend should be retained or
    replaced/augmented after repository audit.
6.  Hosting, database, key-management, and notification infrastructure.
7.  Exact public verification result wording and which scan details are
    shown.
8.  Data retention, privacy, and location-consent rules.
9.  Manufacturer pilot criteria and acceptable optical
    false-acceptance/false-rejection rates.

------------------------------------------------------------------------

## Development instruction

Build from verified requirements, not from mock screens. Inspect the
existing code before changing it. Implement one module at a time, keep
the repository as the source of truth, enforce all security decisions on
the backend, and provide tests proving each feature works. Never mark a
feature complete merely because a button or dashboard screen exists.
