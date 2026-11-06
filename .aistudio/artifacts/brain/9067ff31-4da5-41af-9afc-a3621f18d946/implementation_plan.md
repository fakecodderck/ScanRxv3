# MediTrust Ledger: Blockchain Anti-Counterfeit Pharmaceutical Verification

An enterprise-grade medical supply chain traceability and anti-counterfeit verification platform. It combines a zero-login public smartphone camera scanner for patients with role-based supply chain portals for manufacturers, distributors, and pharmacies, underpinned by a cryptographic SHA-256 Merkle ledger, offline verification caching, and real-time impossible travel counterfeit detection.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural parameters have been established based on your Phase 1 selections:

- **Confirmed Blockchain Ledger Model**: High-security client & server cryptographic ledger engine utilizing SHA-256 block hashing, parent hash chaining, and Merkle root verification for immutable chain-of-custody.
- **Confirmed Scanner & Testing Mode**: Dual-mode camera scanner featuring real-time WebRTC device camera video feed paired with interactive 1-click test packages (Authentic Pack, Distant Clone / Impossible Travel, Expired Batch, and Tampered Token) for instant testing.
- **Confirmed Geolocation Tracking Policy**: Strict browser geolocation (`navigator.geolocation`) capturing exact coordinates and microsecond timestamps on every scan, feeding into a physical velocity calculator ($v = \text{distance} / \Delta t$) that flags teleportation anomalies exceeding 900 km/h or concurrent duplicate scans.
- **App-Exclusive QR Architecture**: Medicine packs encode a signed cryptographic payload (`meditrust://v1/verify?t=...` with HMAC signature and rotating epoch nonce). When scanned outside our app, standard QR readers display a secure redirect instruction; when scanned in our web app, the custom decoder unpacks and cross-references the secure token against the blockchain ledger.

---

### 1. Overview & Core Concept

Counterfeit pharmaceuticals threaten human lives and cost global healthcare tens of billions annually. Traditional serial numbers are easily duplicated onto fake packaging. MediTrust Ledger solves this through:

1. **Dual-Tier Serialization**: Unique cryptographically signed QR codes for both **Batches** (master parent record) and individual **Medicine Packs** (leaf tokens in a Merkle tree), establishing an unbroken chain of custody from factory floor to patient hands.
2. **Universal Public Scanner (No Login)**: Patients open the web app on any smartphone, scan the package with their camera, and receive instant cryptographic proof of authenticity with manufacturer origin, dosage guidance, expiration dates, and distribution pedigree.
3. **App-Specific Token Security**: Scanned codes cannot be deciphered or forged by standard generic QR scanners, routing exclusively to our verified cryptographic engine.
4. **Offline Resilience**: Field health workers and patients in low-connectivity clinics can verify authenticity against a locally cached Merkle proof registry stored in IndexedDB and Service Worker caches.
5. **Real-Time Impossible Travel Anomaly Engine**: If Pack #7842 is scanned at a pharmacy in New York at 10:00 AM and the identical pack token is scanned at 10:15 AM in London or Singapore, the system flags an immediate critical counterfeit alert, locates both scan events on a security map, and invalidates subsequent dispensations.
6. **Unified Supply Chain Workspace**: Secure multi-role dashboard allowing:
   - **Manufacturers**: Mint new batches, generate serialized cryptographic QR codes, export printable label sheets.
   - **Distributors**: Scan inbound shipments, update cold-chain custody, record batch transfers.
   - **Pharmacies**: Verify delivery authenticity before stocking, log patient dispensation.
   - **Compliance & Security Officers**: Monitor global scan analytics, impossible travel triggers, and inventory velocity.

---

### 2. User Experience & Visual Design

#### Visual Identity & Theme
- **Aesthetic Direction**: High-trust Swiss medical and industrial instrumentation. Sterile, authoritative, crystal-clear typography, zero decorative clutter.
- **Palette (60-30-10 Rule)**:
  - **60% Canvas**: Crisp neutral slate canvas (`#F8FAFC` light / `#0B0F17` dark) giving high optical clarity.
  - **30% Structural**: Hairline bordered cards (`border-slate-200` / `border-slate-800`), muted slate metadata text, clean tabular layouts.
  - **10% Accent**: Deep medical teal (`#0D9488` / `#14B8A6`) for primary verified authentic states and actions; Signal Crimson (`#DC2626`) for counterfeit anomalies and security alerts; Amber (`#D97706`) for quarantine / cold-chain warnings.
- **Typography**: `Plus Jakarta Sans` for clean, professional display and navigation; `DM Sans` for readable medical prose; `JetBrains Mono` / `tabular-nums` for lot numbers, SHA-256 hashes, timestamps, and GPS coordinates.
- **Zero-Pill Discipline**: Metadata displayed as unboxed text separated by subtle typographic dots (`·`) or slashes (`/`). Interactive view selectors styled as segmented button groups.

#### Key User Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PUBLIC PATIENT FLOW                             │
│                                                                        │
│  [Open App] ──> [Public Scan Tab] ──> [Camera Viewfinder / Demo QR]   │
│                                              │                         │
│                                      [Capture GPS & Time]              │
│                                              │                         │
│                                      [Cross-Check Ledger]              │
│                                              │                         │
│               ┌──────────────────────────────┴─────────────────┐       │
│               ▼                                                ▼       │
│      [AUTHENTIC VERIFIED]                            [SECURITY ALERT]  │
│   · Batch, MFR & Expiry Date                    · Impossible travel /  │
│   · Complete Custody Timeline                     Duplicate scan alert │
│   · Offline Proof Certificate                   · Quarantine notice    │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                     SUPPLY CHAIN DASHBOARD FLOW                        │
│                                                                        │
│  [Role Switcher: MFR / Distributor / Pharmacy]                        │
│         │                                                              │
│         ├──> Manufacturer: Mint Batch -> Generate Serialized Pack QRs │
│         ├──> Distributor: Inbound Scan -> Cold Chain Verification     │
│         ├──> Pharmacy: Shelf Verification -> Log Patient Dispensation │
│         └──> Security Center: Anomaly Map & Impossible Travel Logs     │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Public Patient Verification Flow**:
   - Patient lands directly on the verification portal (no authentication barrier).
   - Tap "Open Camera Scanner" to trigger HTML5/WebRTC camera with live optical targeting reticle.
   - Instant geolocation lock with permission fallback for manual city test pins.
   - Camera scans the secure medicine pack token -> decodes the encrypted payload -> cross-checks the cryptographic ledger -> displays high-fidelity verification sheet:
     - Verified Authentic Badge with Merkle leaf verification hash.
     - Drug name, active ingredient, dosage, lot number, manufacture date, expiration date.
     - Interactive chain-of-custody journey: Factory -> Customs/Distributor -> Pharmacy -> Current Scan.
     - Offline cache status: "Certified offline via cached manufacturer Merkle root".
2. **Impossible Travel Anomaly Flow**:
   - User scans a package or clicks the "Test Impossible Travel Scenario" demo card.
   - Geolocation records point $B$ shortly after point $A$.
   - Calculation engine detects velocity exceeding $900\text{ km/h}$ or duplicate unconsumed pack serialization.
   - Screen transitions to high-visibility Security Warning: "Counterfeit Detected: Physical travel impossibility detected between last verified location and current scan. Do NOT consume this medicine."
   - Immediate event dispatch into the Supply Chain Security Incident Center.
3. **Supply Chain Operations Portal**:
   - Role Selector: Switch seamlessly between **Manufacturer (PharmaCorp Labs)**, **Distributor (Global Logistics Express)**, and **Pharmacy (St. Jude Central Pharmacy)**.
   - **Batch Minting & QR Generation**: Create medicine batch with NDC, serial count, formulation, temperature thresholds. Generates printable QR codes with individual unique encrypted tokens.
   - **Inbound & Custody Handshake**: Custody updates with digital signature and GPS tagging.
   - **Real-time Inventory & Blockchain Explorer**: Live inspection of every block, block hash, parent hash, transaction count, and Merkle root.

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: Cryptographic Ledger Architecture
- **Chosen Approach**: In-app and persistent SHA-256 cryptographic blockchain ledger with block header chaining, transaction Merkle trees, and tamper-evident digital signatures.
- **Why**: Delivers true mathematical immutability and instant verification without requiring third-party gas fees, wallet extensions (MetaMask), or external testnet latency that would break clinical emergency workflows.
- **Alternatives Considered**: Public Ethereum testnet (rejected due to network latency, gas fee requirements, and lack of offline execution).

#### Decision 2: App-Exclusive Signed QR Payload
- **Chosen Approach**: QR codes contain a structured URI `meditrust://v1/verify?t=<Base64EncryptedToken>&n=<Nonce>` containing encrypted batch ID, pack UUID, cryptographic signature, and issuance timestamp.
- **Why**: Generic phone camera apps scanning the QR will either open the web app verifier landing URL or see non-functional encrypted payload, preventing counterfeiters from simply extracting a plaintext URL to copy. When scanned inside our web scanner, the verification engine unpacks the payload and cross-references the ledger's Merkle root.

#### Decision 3: Offline Caching & Low-Connectivity Verification
- **Chosen Approach**: IndexedDB manifest store + Service Worker precaching of verified batch Merkle trees and cryptographic public keys.
- **Why**: Allows rural clinics or patients in low-connectivity areas to verify authentic packages locally by hashing the pack token and validating against the pre-cached Merkle root. When network is restored, local scan logs and GPS coordinates queue and sync back to the cloud ledger.

#### Decision 4: Impossible Travel Velocity Formula
- **Chosen Approach**: Haversine distance formula combined with timestamp delta ($\Delta t$):
  $$v = \frac{\text{Haversine}(lat_1, lon_1, lat_2, lon_2)}{\Delta t}$$
  If $v > 900\text{ km/h}$ or $\Delta t < 60\text{s}$ for distance $> 5\text{ km}$, trigger a Level-1 Counterfeit Alert.
- **Why**: A physical pill bottle cannot travel faster than commercial aviation speeds; duplicate scans in disparate locations are definitive mathematical proof of packaging clones.

---

### 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION SHELL                               │
│  ┌─────────────────────────────┐   ┌───────────────────────────────────┐  │
│  │ Top Bar: Brand, Links, Mode │   │ Theme Switcher, Offline Indicator │  │
│  └─────────────────────────────┘   └───────────────────────────────────┘  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                         MAIN VIEWPORT                               │  │
│  │  ┌───────────────────────┐   ┌───────────────────────────────────┐  │  │
│  │  │ Public Patient Portal │   │ Supply Chain Enterprise Dashboard │  │  │
│  │  │ - WebRTC QR Scanner   │   │ - Manufacturer Batch Minting      │  │  │
│  │  │ - 1-Click Demo Codes  │   │ - QR Label Sheet Generator        │  │  │
│  │  │ - Authenticity Card   │   │ - Custody Handover Logger         │  │  │
│  │  │ - Impossible Travel   │   │ - Security Anomaly Map & Alerts   │  │  │
│  │  └───────────────────────┘   └───────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                   CORE LOGIC & STORAGE ENGINES                      │  │
│  │  ┌───────────────────────┐   ┌───────────────────────────────────┐  │  │
│  │  │ Cryptographic Ledger  │   │ Anomaly & Velocity Engine         │  │  │
│  │  │ SHA-256 Merkle Engine │   │ Haversine Physics & Alert Manager │  │  │
│  │  └───────────────────────┘   └───────────────────────────────────┘  │  │
│  │  ┌───────────────────────┐   ┌───────────────────────────────────┐  │  │
│  │  │ Offline Cache Store   │   │ Sync Queue & Location Tracker     │  │  │
│  │  │ IndexedDB / Local     │   │ Real Geolocation + Fallback Pins  │  │  │
│  │  └───────────────────────┘   └───────────────────────────────────┘  │  │
└───────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities
1. **MedicineBatch**: `batchId`, `drugName`, `genericName`, `manufacturer`, `dosage`, `ndcCode`, `mfgDate`, `expiryDate`, `totalPacks`, `merkleRoot`, `status`.
2. **MedicinePack**: `packId`, `batchId`, `serialNumber`, `secureToken`, `currentCustodian`, `status` (`manufactured`, `in_transit`, `at_pharmacy`, `dispensed`, `compromised`).
3. **CustodyEvent**: `eventId`, `packId`, `timestamp`, `fromParty`, `toParty`, `location` (`lat`, `lng`, `facilityName`), `temperatureReading`, `signature`, `blockHash`.
4. **ScanLog**: `scanId`, `packId`, `timestamp`, `lat`, `lng`, `accuracy`, `deviceInfo`, `verificationResult` (`authentic`, `flagged_travel`, `unknown_token`, `expired`, `recalled`), `calculatedVelocityKmH`.
5. **SecurityAlert**: `alertId`, `packId`, `batchId`, `severity`, `triggerType`, `timestamp`, `scanA`, `scanB`, `details`, `resolved`.

#### Interactive Component & State Mapping
- `useLedgerStore`: Global Zustand store managing blockchain blocks, batches, serialized packs, scan logs, active security alerts, current user role, and offline sync queue.
- `QRCameraScanner`: Camera access via `navigator.mediaDevices.getUserMedia` with video frame canvas scanner, real-time bounding box detection, and simulated code inject buttons.
- `VerificationResultModal`: Displays authenticity certificate, leaf Merkle proof path, batch history, and impossible travel breakdown.
- `AnomalyMapTracker`: Interactive SVG/Canvas map rendering global scan pings, velocity vectors between successive scans, and flashing counterfeit origin markers.
- `BatchQRSheet`: Interactive modal rendering high-density printable QR labels for generated packs with copy-to-clipboard, SVG download, and direct test links.

---

### 5. Execution Steps

1. **Step 1: Install Dependencies**: Install `canvas-confetti` (for verification celebrations), `qrcode` (for high-fidelity SVG/Canvas QR generation), and required dev dependencies.
2. **Step 2: Core Cryptographic Ledger Engine**: Implement SHA-256 hashing, Merkle tree builder, signature validation, Haversine velocity calculations, and offline storage.
3. **Step 3: State Management & Seed Data**: Pre-populate realistic pharmaceutical batches (e.g. Lipitor 20mg, Paxlovid, Amoxicillin 500mg) with authentic packaging tokens and pre-configured impossible travel scenarios for zero-setup demo testing.
4. **Step 4: Public Patient Scanner UI**: Build camera viewfinder with audio/haptic feedback, instant geolocation detection, demo test cards, and verification result modal.
5. **Step 5: Supply Chain Enterprise Dashboards**:
   - Manufacturer portal: Batch minting form, printable QR code matrix generator.
   - Distributor portal: Inbound custody scan, transport temperature check.
   - Pharmacy portal: Dispensation registration, patient receipt issuance.
   - Security Audit console: Impossible travel alerts, velocity vector logs, interactive global scan map.
6. **Step 6: PWA & Offline Support**: Configure service worker, manifest, offline indicator, and offline cryptographic proof verification.
7. **Step 7: Verification & Build**: Run `compile_applet` and `lint_applet` to ensure zero compilation or runtime errors.
