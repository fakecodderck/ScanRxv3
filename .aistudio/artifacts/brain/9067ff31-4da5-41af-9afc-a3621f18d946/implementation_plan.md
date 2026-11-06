# ScanRx: Blockchain Pharmaceutical Anti-Counterfeit Verification

An enterprise-grade medical supply chain traceability and anti-counterfeit verification platform for India (CDSCO & MoHFW compliant). It combines a zero-login public smartphone camera scanner for citizens with dedicated role-based supply chain portals for manufacturers, distributors, pharmacies, and central administrators, underpinned by a cryptographic SHA-256 Merkle ledger, offline verification caching, and real-time impossible travel counterfeit detection.

---

### User Review & Critical Decisions

- **Blockchain Ledger Model**: High-security cryptographic ledger engine utilizing SHA-256 block hashing, parent hash chaining, and Merkle root verification for immutable chain-of-custody.
- **Public Scanner**: Minimalist smartphone camera scanner with optical reticle, manual token/pack serial verification, and 1-click test pills.
- **Clean Homepage**: Glassmorphic frosted container card with non-stick header, dedicated strictly to public medicine verification.
- **Registered Company Dashboard**:
  - Full industrial manufacturer dashboard with sub-navigation sidebar.
  - Sections: Company Overview & Analytics, Medicine Batches & Formulations, Generate Unique QRs (Batch Minting with custom quantity & individual signed QRs), QR Code Matrix & Bulk Print Sticker Sheet, Commercial Shipping Invoices, and Company Profile & CDSCO Form 25/28 Licenses.
- **Registered Pharmacy Dashboard**:
  - Full dispensary dashboard with sub-navigation sidebar.
  - Sections: Store Overview & Stock Health, Shelf Inventory & Stock Register (with audit print), Inbound Shipping Invoices (with 1-click Confirm Delivery & Accept Stock into custody), Scan & Verify Inbound QRs (pre-dispensation verification), and Store Profile & CDSCO Form 20/21 Retail Chemist Licenses.
- **Role-Based Access Control (RBAC) Sidebar**:
  - Global navigation dynamically displays the active role's dedicated portal sections and profile details.
  - Admin (`fakemailcloud09@gmail.com`) can inspect all registered companies, pharmacies, and national QR ledger.
  - Unauthenticated users have direct access to Public Scanner and quick demo logins for testing.

---

### Implemented Portals & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ScanRx APPLICATION                              │
│                                                                        │
│  [Public Homepage] ──> [Glassmorphic Scanner: Camera + Manual Token]   │
│                                                                        │
│  [Global Sidebar]                                                      │
│    ├── When Logged Out: Public Scanner + Staff Login                   │
│    ├── Company User: 6-Section Manufacturer Portal                     │
│    │     ├─ Overview (KPIs, Active Batches, Cold Chain)                │
│    │     ├─ Medicine Batches (Table, Specs, Recall Sec 26A)            │
│    │     ├─ Generate Unique QRs (Auto-generate unique QR per pack)     │
│    │     ├─ QR Matrix & Print (Bulk Stickers, Individual Inspection)   │
│    │     ├─ Shipping Invoices (Dispatch to Distributor / Pharmacy)     │
│    │     └─ Company Profile (Form 25/28 Licenses, GSTIN, Plant)        │
│    ├── Pharmacy User: 5-Section Retail Pharmacy Portal                 │
│    │     ├─ Store Overview (Stock Health, Inbound Invoices Pending)    │
│    │     ├─ Shelf Inventory (Verified Stock Register, Audit Sheet)     │
│    │     ├─ Inbound Consignments (Confirm & Transfer into Stock)       │
│    │     ├─ Scan & Verify Inbound QRs (Pre-stocking Inspection)        │
│    │     └─ Pharmacy Profile (Form 20/21 Retail Chemist License)       │
│    └── Admin User: Central Admin Console + Radar + Company + Pharmacy  │
└────────────────────────────────────────────────────────────────────────┘
```
