/**
 * AushadhLedger India Global State Management (Zustand)
 * Compliant with CDSCO, Ministry of Health & Family Welfare (MoHFW) QR Traceability Guidelines
 */

import { create } from 'zustand';
import {
  MedicineBatch,
  MedicinePack,
  CustodyEvent,
  ScanLog,
  SecurityAlert,
  BlockchainBlock,
  SupplyChainUser,
  RoleType,
  PackStatus,
  ShippingInvoice,
} from '../types';
import { AppUserProfile } from '../lib/firebase';
import {
  sha256Sync,
  buildMerkleTree,
  verifyMerkleProof,
  generateSecureTokenPayload,
  decodeAndValidateToken,
  evaluateTravelVelocity,
  TravelCheckResult,
} from '../lib/crypto';
import {
  cacheBatchManifests,
  getCachedBatchManifests,
  queueOfflineScan,
  getPendingOfflineScans,
  clearPendingOfflineScans,
} from '../lib/offlineStorage';

// Indian Pharmaceutical Supply Chain Roles & Certified Nodes
const INITIAL_USERS: SupplyChainUser[] = [
  {
    id: 'user-mfr-01',
    name: 'Dr. Rajesh Sharma (QA Head)',
    role: 'manufacturer',
    organization: 'Sun Pharma Laboratories Ltd. (Baddi Unit)',
    facilityLocation: {
      lat: 30.9578,
      lng: 76.7914,
      facilityName: 'Sun Pharma Plant II, Baddi Industrial Area',
      city: 'Baddi',
      country: 'Himachal Pradesh, India',
    },
  },
  {
    id: 'user-dst-01',
    name: 'Vikram Singhania (Logistics VP)',
    role: 'distributor',
    organization: 'Coldex National Pharma Logistics Hub',
    facilityLocation: {
      lat: 19.2967,
      lng: 73.0631,
      facilityName: 'Bhiwandi Central Pharma Cargo Terminal',
      city: 'Bhiwandi (Mumbai MMR)',
      country: 'Maharashtra, India',
    },
  },
  {
    id: 'user-phr-01',
    name: 'Ananya Iyer, Chief Pharmacist',
    role: 'pharmacy',
    organization: 'Apollo Pharmacy #402',
    facilityLocation: {
      lat: 12.9784,
      lng: 77.6408,
      facilityName: 'Apollo Pharmacy, 100ft Road, Indiranagar',
      city: 'Bengaluru',
      country: 'Karnataka, India',
    },
  },
];

function createInitialBlocks(batches: MedicineBatch[]): BlockchainBlock[] {
  const genesisBlock: BlockchainBlock = {
    index: 0,
    timestamp: Date.now() - 86400000 * 30,
    transactions: [
      {
        txId: 'tx-cdsco-genesis-000',
        type: 'BATCH_MINT',
        payload: {
          note: 'AushadhLedger India CDSCO Blockchain Genesis Node',
          gazetteNotification: 'G.S.R. 823(E) Barcoding & QR Rules',
        },
        hash: sha256Sync('CDSCO_GENESIS_TRANSACTION'),
      },
    ],
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    merkleRoot: sha256Sync('AUSHADH_GENESIS_ROOT'),
    hash: sha256Sync('CDSCO_GENESIS_BLOCK_HASH_2026'),
    nonce: 1042,
  };

  const batchBlock: BlockchainBlock = {
    index: 1,
    timestamp: Date.now() - 86400000 * 14,
    transactions: batches.map((b) => ({
      txId: `tx-mint-${b.batchNumber}`,
      type: 'BATCH_MINT',
      payload: {
        batchNumber: b.batchNumber,
        drugName: b.drugName,
        mfgLicenseNo: b.mfgLicenseNo,
        merkleRoot: b.merkleRoot,
      },
      hash: b.creationTxHash,
    })),
    previousHash: genesisBlock.hash,
    merkleRoot: batches[0]?.merkleRoot || sha256Sync('BLOCK1_ROOT'),
    hash: sha256Sync('BLOCK_1_HASH_' + batches.map((b) => b.batchNumber).join('')),
    nonce: 8719,
  };

  return [genesisBlock, batchBlock];
}

function createSeedData() {
  // Batch 1: Augmentin 625 Duo (Authentic Certified Batch)
  const batch1Number = 'LOT-AUG-8821';
  const batch1PacksCount = 8;
  const batch1Tokens: { token: string; tokenHash: string }[] = [];
  const batch1Packs: MedicinePack[] = [];

  for (let i = 1; i <= batch1PacksCount; i++) {
    const serial = `SN-${String(i).padStart(4, '0')}`;
    const packId = `IND-AUG-8821-${String(i).padStart(4, '0')}`;
    const { token, tokenHash } = generateSecureTokenPayload({
      batchNumber: batch1Number,
      serialNumber: serial,
      mfgTimestamp: Date.now() - 86400000 * 45,
      salt: `AUG_SALT_${i}`,
    });
    batch1Tokens.push({ token, tokenHash });
  }

  const merkle1 = buildMerkleTree(batch1Tokens.map((t) => t.tokenHash));

  for (let i = 1; i <= batch1PacksCount; i++) {
    const serial = `SN-${String(i).padStart(4, '0')}`;
    const packId = `IND-AUG-8821-${String(i).padStart(4, '0')}`;
    const idx = i - 1;

    batch1Packs.push({
      packId,
      batchNumber: batch1Number,
      serialNumber: serial,
      secureToken: batch1Tokens[idx].token,
      tokenHash: batch1Tokens[idx].tokenHash,
      merkleLeafIndex: idx,
      merkleProof: merkle1.proofs[idx],
      status: i === 1 ? 'dispensed' : i < 5 ? 'at_pharmacy' : 'in_transit',
      currentHolder:
        i === 1
          ? 'Verified Patient (Ramesh K.)'
          : i < 5
          ? 'Apollo Pharmacy #402, Bengaluru'
          : 'Coldex National Logistics, Bhiwandi Hub',
      manufactureDate: '2026-01-15',
      expiryDate: '2028-01-15',
      custodyHistory: [
        {
          id: `ev-aug-01-${i}`,
          packId,
          batchNumber: batch1Number,
          fromActor: 'Sun Pharma Ltd. (Baddi Unit)',
          toActor: 'Coldex Logistics (Bhiwandi Hub)',
          role: 'distributor',
          timestamp: Date.now() - 86400000 * 20,
          location: {
            lat: 30.9578,
            lng: 76.7914,
            facilityName: 'Sun Pharma Plant II, Baddi (HP)',
            city: 'Baddi',
            country: 'India',
          },
          temperatureReading: 19.4,
          transactionHash: sha256Sync(`CUSTODY_1_${packId}`),
          note: 'Passed Indian Pharmacopoeia (IP) dissolution release tests. Dispatched via temperature-controlled carrier.',
        },
        {
          id: `ev-aug-02-${i}`,
          packId,
          batchNumber: batch1Number,
          fromActor: 'Coldex Logistics (Bhiwandi Hub)',
          toActor: 'Apollo Pharmacy #402, Bengaluru',
          role: 'pharmacy',
          timestamp: Date.now() - 86400000 * 7,
          location: {
            lat: 12.9784,
            lng: 77.6408,
            facilityName: 'Apollo Pharmacy, Indiranagar, Bengaluru',
            city: 'Bengaluru',
            country: 'India',
          },
          temperatureReading: 21.2,
          transactionHash: sha256Sync(`CUSTODY_2_${packId}`),
          note: 'Stock checked by Registered Pharmacist. Stored in climate-controlled dispensary.',
        },
      ],
      lastKnownLocation: {
        lat: 12.9784,
        lng: 77.6408,
        placeName: 'Apollo Pharmacy, Indiranagar, Bengaluru',
        timestamp: Date.now() - 86400000 * 7,
      },
    });
  }

  const batch1: MedicineBatch = {
    batchNumber: batch1Number,
    drugName: 'Augmentin 625 Duo Tablets IP',
    genericName: 'Amoxicillin & Potassium Clavulanate Tablets IP',
    manufacturer: 'Sun Pharma Laboratories Ltd. (Baddi Unit)',
    dosageForm: '625mg Film-Coated Strip (10 Tablets)',
    ndcCode: 'CDSCO/HP/2026/8841',
    mfgLicenseNo: 'S-MNB/09/42 (HP)',
    mrpInr: 204.50,
    cdscoApprovalRef: 'CDSCO/DRUG/REG/AUG625-DUO',
    stateDrugAuthority: 'State Drugs Control Administration, Himachal Pradesh',
    mfgDate: '2026-01-15',
    expiryDate: '2028-01-15',
    totalPacks: batch1PacksCount,
    merkleRoot: merkle1.root,
    status: 'active',
    temperatureSpec: { min: 15, max: 25, unit: 'C' },
    creationTxHash: sha256Sync(`BATCH_MINT_${batch1Number}`),
    timestamp: Date.now() - 86400000 * 45,
  };

  // Batch 2: Dolo 650 with Preloaded Impossible Travel Scenario!
  // Scanned in Chennai 11 minutes ago; scanning now from Delhi / North India immediately triggers 11,000 km/h impossible travel clone alert!
  const batch2Number = 'LOT-DOLO-9921';
  const batch2PacksCount = 4;
  const batch2Tokens: { token: string; tokenHash: string }[] = [];
  const batch2Packs: MedicinePack[] = [];

  for (let i = 1; i <= batch2PacksCount; i++) {
    const serial = `SN-${String(i).padStart(4, '0')}`;
    const { token, tokenHash } = generateSecureTokenPayload({
      batchNumber: batch2Number,
      serialNumber: serial,
      mfgTimestamp: Date.now() - 86400000 * 30,
      salt: `DOLO_SALT_${i}`,
    });
    batch2Tokens.push({ token, tokenHash });
  }

  const merkle2 = buildMerkleTree(batch2Tokens.map((t) => t.tokenHash));

  for (let i = 1; i <= batch2PacksCount; i++) {
    const serial = `SN-${String(i).padStart(4, '0')}`;
    const packId = `IND-DOLO-9921-${String(i).padStart(4, '0')}`;
    const idx = i - 1;
    const isChennaiPack = i === 1;

    batch2Packs.push({
      packId,
      batchNumber: batch2Number,
      serialNumber: serial,
      secureToken: batch2Tokens[idx].token,
      tokenHash: batch2Tokens[idx].tokenHash,
      merkleLeafIndex: idx,
      merkleProof: merkle2.proofs[idx],
      status: 'at_pharmacy',
      currentHolder: 'Apollo Pharmacy, Anna Nagar, Chennai',
      manufactureDate: '2026-02-01',
      expiryDate: '2029-02-01',
      custodyHistory: [
        {
          id: `ev-dolo-01-${i}`,
          packId,
          batchNumber: batch2Number,
          fromActor: 'Micro Labs Limited (Sikkim Unit)',
          toActor: 'Apollo Pharmacy, Anna Nagar, Chennai',
          role: 'pharmacy',
          timestamp: Date.now() - 86400000 * 2,
          location: {
            lat: 13.0850,
            lng: 80.2101,
            facilityName: 'Apollo Pharmacy, Anna Nagar West, Chennai',
            city: 'Chennai',
            country: 'Tamil Nadu, India',
          },
          temperatureReading: 22.0,
          transactionHash: sha256Sync(`CUSTODY_DOLO_${packId}`),
          note: 'Dispensation stock authenticated by South Zone Chemist Registry.',
        },
      ],
      lastKnownLocation: isChennaiPack
        ? {
            lat: 13.0850,
            lng: 80.2101,
            placeName: 'Apollo Pharmacy, Anna Nagar, Chennai (Tamil Nadu)',
            timestamp: Date.now() - 660000, // 11 minutes ago in Chennai!
          }
        : {
            lat: 13.0850,
            lng: 80.2101,
            placeName: 'Apollo Pharmacy, Anna Nagar, Chennai',
            timestamp: Date.now() - 86400000 * 2,
          },
    });
  }

  const batch2: MedicineBatch = {
    batchNumber: batch2Number,
    drugName: 'Dolo 650 Tablets IP',
    genericName: 'Paracetamol Tablets IP 650mg',
    manufacturer: 'Micro Labs Limited',
    dosageForm: '650mg Blister Strip (15 Tablets)',
    ndcCode: 'CDSCO/KA/DOLO-650',
    mfgLicenseNo: 'M-724/2015 (KA)',
    mrpInr: 33.75,
    cdscoApprovalRef: 'CDSCO/GOV/MED-300-DOLO',
    stateDrugAuthority: 'Karnataka State Drugs Control Department',
    mfgDate: '2026-02-01',
    expiryDate: '2029-02-01',
    totalPacks: batch2PacksCount,
    merkleRoot: merkle2.root,
    status: 'active',
    temperatureSpec: { min: 15, max: 30, unit: 'C' },
    creationTxHash: sha256Sync(`BATCH_MINT_${batch2Number}`),
    timestamp: Date.now() - 86400000 * 30,
  };

  // Batch 3: Pan-D (Recalled Spurious Batch Alert)
  const batch3Number = 'LOT-PAN-4412';
  const batch3PacksCount = 2;
  const batch3Tokens: { token: string; tokenHash: string }[] = [];
  const batch3Packs: MedicinePack[] = [];

  for (let i = 1; i <= batch3PacksCount; i++) {
    const serial = `SN-${String(i).padStart(4, '0')}`;
    const { token, tokenHash } = generateSecureTokenPayload({
      batchNumber: batch3Number,
      serialNumber: serial,
      mfgTimestamp: Date.now() - 86400000 * 90,
      salt: `PAN_SALT_${i}`,
    });
    batch3Tokens.push({ token, tokenHash });
  }

  const merkle3 = buildMerkleTree(batch3Tokens.map((t) => t.tokenHash));

  for (let i = 1; i <= batch3PacksCount; i++) {
    const serial = `SN-${String(i).padStart(4, '0')}`;
    const packId = `IND-PAN-4412-${String(i).padStart(4, '0')}`;
    const idx = i - 1;

    batch3Packs.push({
      packId,
      batchNumber: batch3Number,
      serialNumber: serial,
      secureToken: batch3Tokens[idx].token,
      tokenHash: batch3Tokens[idx].tokenHash,
      merkleLeafIndex: idx,
      merkleProof: merkle3.proofs[idx],
      status: 'quarantined',
      currentHolder: 'CDSCO Seizure Quarantine Depot, Delhi-NCR',
      manufactureDate: '2025-06-01',
      expiryDate: '2027-06-01',
      custodyHistory: [],
      lastKnownLocation: {
        lat: 28.5672,
        lng: 77.2100,
        placeName: 'AIIMS Central Depot, New Delhi',
        timestamp: Date.now() - 86400000 * 10,
      },
    });
  }

  const batch3: MedicineBatch = {
    batchNumber: batch3Number,
    drugName: 'Pan-D Gastro-Resistant Capsules IP',
    genericName: 'Pantoprazole Gastro-resistant & Domperidone Prolonged-release Capsules IP',
    manufacturer: 'Alkem Laboratories Ltd.',
    dosageForm: 'Capsules IP (Strip of 15)',
    ndcCode: 'CDSCO/DL/PAN-D-RECALL',
    mfgLicenseNo: 'MNB/06/331',
    mrpInr: 198.00,
    cdscoApprovalRef: 'CDSCO/RECALL/2026/091',
    stateDrugAuthority: 'CDSCO North Zone & Drug Controller Himachal Pradesh',
    mfgDate: '2025-06-01',
    expiryDate: '2027-06-01',
    totalPacks: batch3PacksCount,
    merkleRoot: merkle3.root,
    status: 'recalled',
    temperatureSpec: { min: 15, max: 25, unit: 'C' },
    creationTxHash: sha256Sync(`BATCH_MINT_${batch3Number}`),
    timestamp: Date.now() - 86400000 * 90,
  };

  const allBatches = [batch1, batch2, batch3];
  const allPacks = [...batch1Packs, ...batch2Packs, ...batch3Packs];

  cacheBatchManifests(
    allBatches.map((b) => ({
      batchNumber: b.batchNumber,
      drugName: b.drugName,
      manufacturer: b.manufacturer,
      merkleRoot: b.merkleRoot,
      expiryDate: b.expiryDate,
      status: b.status,
      cachedAt: Date.now(),
    }))
  );

  return { batches: allBatches, packs: allPacks };
}

interface VerificationOutput {
  result:
    | 'verified_authentic'
    | 'impossible_travel'
    | 'counterfeit_clone'
    | 'invalid_token'
    | 'expired_batch'
    | 'recalled_batch';
  pack?: MedicinePack;
  batch?: MedicineBatch;
  scanLog: ScanLog;
  alert?: SecurityAlert;
  isOfflineVerified?: boolean;
}

interface LedgerState {
  batches: MedicineBatch[];
  packs: MedicinePack[];
  blocks: BlockchainBlock[];
  scanLogs: ScanLog[];
  securityAlerts: SecurityAlert[];
  invoices: ShippingInvoice[];
  currentUser: SupplyChainUser;
  availableUsers: SupplyChainUser[];
  firebaseUser: AppUserProfile | null;
  activeView: 'public_scan' | 'manufacturer' | 'distributor' | 'pharmacy' | 'security_center' | 'batch_detail' | 'admin';
  selectedBatchNumber: string | null;
  selectedPackForDetail: MedicinePack | null;
  isOfflineMode: boolean;
  offlineQueueCount: number;

  setActiveView: (view: LedgerState['activeView'], batchNum?: string) => void;
  switchUserRole: (role: RoleType) => void;
  setFirebaseUser: (profile: AppUserProfile | null) => void;
  toggleOfflineMode: () => void;
  syncOfflineQueue: () => void;

  mintNewBatch: (data: {
    drugName: string;
    genericName: string;
    dosageForm: string;
    ndcCode: string;
    mfgLicenseNo?: string;
    mrpInr?: number;
    totalPacks: number;
    mfgDate: string;
    expiryDate: string;
    tempMin: number;
    tempMax: number;
  }) => { batchNumber: string; root: string };

  updateBatchDetails: (batchNumber: string, updates: Partial<MedicineBatch>) => void;

  createShippingInvoice: (data: {
    batchNumber: string;
    distributorName: string;
    packQuantity: number;
    unitPriceInr: number;
    gstPercentage: number;
    dispatchDate: string;
  }) => ShippingInvoice;

  confirmShippingInvoice: (invoiceId: string, temp: number, note?: string) => void;

  transferCustodyBatch: (
    batchNumber: string,
    toActor: string,
    role: RoleType,
    location: { lat: number; lng: number; facilityName: string },
    tempReading: number,
    note?: string
  ) => void;

  dispensePackToPatient: (packId: string, patientRef: string) => void;

  verifyMedicineScan: (params: {
    scannedText: string;
    userLat: number;
    userLng: number;
    placeName?: string;
  }) => VerificationOutput;

  resolveAlert: (alertId: string, note?: string) => void;
  recallBatch: (batchNumber: string, reason: string) => void;
}

const INITIAL_INVOICES: ShippingInvoice[] = [
  {
    id: 'inv-01',
    invoiceNumber: 'TAX-INV-2026-0042',
    companyId: 'user-mfr-01',
    companyName: 'Sun Pharma Laboratories Ltd. (Baddi Unit)',
    distributorId: 'user-dst-01',
    distributorName: 'Coldex National Logistics Hub, Bhiwandi',
    batchNumber: 'LOT-AUG-8821',
    drugName: 'Augmentin 625 Duo Tablets IP',
    packQuantity: 8,
    unitPriceInr: 180.00,
    totalAmountInr: 1440.00,
    gstPercentage: 12,
    gstAmountInr: 172.80,
    grandTotalInr: 1612.80,
    dispatchDate: '2026-02-10',
    status: 'delivered_confirmed',
    temperatureReading: 19.4,
    deliveryConfirmation: {
      confirmedBy: 'Vikram Singhania (Coldex Logistics VP)',
      confirmedAt: Date.now() - 86400000 * 7,
      signature: 'SEAL_CONFIRMED_BHIWANDI_CARGO_01',
      note: 'Verified seal numbers & Merkle leaf proofs. Stored in cold chamber.'
    },
    timestamp: Date.now() - 86400000 * 14,
  },
  {
    id: 'inv-02',
    invoiceNumber: 'TAX-INV-2026-0089',
    companyId: 'user-mfr-02',
    companyName: 'Micro Labs Limited',
    distributorId: 'user-dst-01',
    distributorName: 'Coldex National Logistics Hub, Bhiwandi',
    batchNumber: 'LOT-DOLO-9921',
    drugName: 'Dolo 650 Tablets IP',
    packQuantity: 4,
    unitPriceInr: 30.00,
    totalAmountInr: 120.00,
    gstPercentage: 12,
    gstAmountInr: 14.40,
    grandTotalInr: 134.40,
    dispatchDate: '2026-02-28',
    status: 'in_transit',
    temperatureReading: 21.0,
    timestamp: Date.now() - 86400000 * 3,
  }
];

const { batches: seedBatches, packs: seedPacks } = createSeedData();
const seedBlocks = createInitialBlocks(seedBatches);

export const useLedgerStore = create<LedgerState>((set, get) => ({
  batches: seedBatches,
  packs: seedPacks,
  blocks: seedBlocks,
  scanLogs: [],
  securityAlerts: [],
  invoices: INITIAL_INVOICES,
  currentUser: INITIAL_USERS[0],
  availableUsers: INITIAL_USERS,
  firebaseUser: null,
  activeView: 'public_scan',
  selectedBatchNumber: null,
  selectedPackForDetail: null,
  isOfflineMode: false,
  offlineQueueCount: 0,

  setActiveView: (view, batchNum) => {
    set({
      activeView: view,
      selectedBatchNumber: batchNum || null,
    });
  },

  setFirebaseUser: (profile) => {
    if (profile) {
      set({
        firebaseUser: profile,
        currentUser: {
          id: profile.uid,
          name: profile.displayName,
          role: profile.role,
          organization: profile.organization,
          facilityLocation: profile.facilityLocation || {
            lat: 28.6139,
            lng: 77.2090,
            facilityName: profile.organization,
            city: 'New Delhi',
            country: 'India',
          },
        },
        activeView:
          profile.role === 'admin'
            ? 'admin'
            : profile.role === 'company'
            ? 'manufacturer'
            : profile.role === 'distributor'
            ? 'distributor'
            : 'pharmacy',
      });
    } else {
      set({
        firebaseUser: null,
        currentUser: INITIAL_USERS[0],
        activeView: 'public_scan',
      });
    }
  },

  switchUserRole: (role) => {
    const user = INITIAL_USERS.find((u) => u.role === role) || {
      id: `user-${role}-custom`,
      name: `Authorized ${role.toUpperCase()} Officer`,
      role,
      organization: 'CDSCO Registered Pharma Facility, India',
      facilityLocation: {
        lat: 28.6139,
        lng: 77.2090,
        facilityName: 'Connaught Place Drug Distribution Centre, New Delhi',
      },
    };
    set({ currentUser: user });
  },

  toggleOfflineMode: () => {
    const newOffline = !get().isOfflineMode;
    set({ isOfflineMode: newOffline });
    if (!newOffline) {
      get().syncOfflineQueue();
    }
  },

  syncOfflineQueue: () => {
    const pending = getPendingOfflineScans();
    if (pending.length === 0) return;

    set((state) => ({
      scanLogs: [...pending, ...state.scanLogs],
      offlineQueueCount: 0,
    }));
    clearPendingOfflineScans();
  },

  mintNewBatch: (data) => {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const prefix = data.drugName.slice(0, 3).toUpperCase();
    const batchNumber = `LOT-${prefix}-${randomSeq}`;
    const packCount = Math.min(Math.max(data.totalPacks, 1), 64);
    const newTokens: { token: string; tokenHash: string }[] = [];
    const newPacks: MedicinePack[] = [];

    const mfgTimestamp = new Date(data.mfgDate).getTime() || Date.now();

    for (let i = 1; i <= packCount; i++) {
      const serial = `SN-${String(i).padStart(4, '0')}`;
      const { token, tokenHash } = generateSecureTokenPayload({
        batchNumber,
        serialNumber: serial,
        mfgTimestamp,
        salt: `SALT_${batchNumber}_${i}`,
      });
      newTokens.push({ token, tokenHash });
    }

    const merkleResult = buildMerkleTree(newTokens.map((t) => t.tokenHash));

    for (let i = 1; i <= packCount; i++) {
      const serial = `SN-${String(i).padStart(4, '0')}`;
      const packId = `IND-${prefix}-${randomSeq}-${String(i).padStart(4, '0')}`;
      const idx = i - 1;

      newPacks.push({
        packId,
        batchNumber,
        serialNumber: serial,
        secureToken: newTokens[idx].token,
        tokenHash: newTokens[idx].tokenHash,
        merkleLeafIndex: idx,
        merkleProof: merkleResult.proofs[idx],
        status: 'manufactured',
        currentHolder: get().currentUser.organization,
        manufactureDate: data.mfgDate,
        expiryDate: data.expiryDate,
        custodyHistory: [
          {
            id: `ev-${batchNumber}-${i}`,
            packId,
            batchNumber,
            fromActor: 'Plant QA Release Division',
            toActor: get().currentUser.organization,
            role: 'manufacturer',
            timestamp: Date.now(),
            location: get().currentUser.facilityLocation,
            temperatureReading: (data.tempMin + data.tempMax) / 2,
            transactionHash: sha256Sync(`MINT_${packId}`),
            note: 'CDSCO barcoding & cryptographic Merkle tree sealed.',
          },
        ],
        lastKnownLocation: {
          lat: get().currentUser.facilityLocation.lat,
          lng: get().currentUser.facilityLocation.lng,
          placeName: get().currentUser.facilityLocation.facilityName,
          timestamp: Date.now(),
        },
      });
    }

    const txHash = sha256Sync(`BATCH_TX_${batchNumber}_${merkleResult.root}`);

    const newBatch: MedicineBatch = {
      batchNumber,
      drugName: data.drugName,
      genericName: data.genericName,
      manufacturer: get().currentUser.organization,
      dosageForm: data.dosageForm,
      ndcCode: data.ndcCode,
      mfgLicenseNo: data.mfgLicenseNo || 'S-MNB/14/99 (HP)',
      mrpInr: data.mrpInr || 145.00,
      cdscoApprovalRef: `CDSCO/REG/2026/${batchNumber}`,
      stateDrugAuthority: 'State Drugs Controller & CDSCO North Zone',
      mfgDate: data.mfgDate,
      expiryDate: data.expiryDate,
      totalPacks: packCount,
      merkleRoot: merkleResult.root,
      status: 'active',
      temperatureSpec: {
        min: data.tempMin,
        max: data.tempMax,
        unit: 'C',
      },
      creationTxHash: txHash,
      timestamp: Date.now(),
    };

    const prevBlock = get().blocks[get().blocks.length - 1];
    const newBlockIndex = prevBlock.index + 1;
    const newBlock: BlockchainBlock = {
      index: newBlockIndex,
      timestamp: Date.now(),
      transactions: [
        {
          txId: `tx-mint-${batchNumber}`,
          type: 'BATCH_MINT',
          payload: {
            batchNumber,
            drugName: data.drugName,
            mfgLicenseNo: newBatch.mfgLicenseNo,
            totalPacks: packCount,
            merkleRoot: merkleResult.root,
          },
          hash: txHash,
        },
      ],
      previousHash: prevBlock.hash,
      merkleRoot: merkleResult.root,
      hash: sha256Sync(prevBlock.hash + merkleResult.root + newBlockIndex),
      nonce: Math.floor(Math.random() * 90000),
    };

    set((state) => {
      const updatedBatches = [newBatch, ...state.batches];
      const updatedPacks = [...newPacks, ...state.packs];
      const updatedBlocks = [...state.blocks, newBlock];

      cacheBatchManifests(
        updatedBatches.map((b) => ({
          batchNumber: b.batchNumber,
          drugName: b.drugName,
          manufacturer: b.manufacturer,
          merkleRoot: b.merkleRoot,
          expiryDate: b.expiryDate,
          status: b.status,
          cachedAt: Date.now(),
        }))
      );

      return {
        batches: updatedBatches,
        packs: updatedPacks,
        blocks: updatedBlocks,
      };
    });

    return { batchNumber, root: merkleResult.root };
  },

  updateBatchDetails: (batchNumber, updates) => {
    set((state) => {
      const updated = state.batches.map((b) =>
        b.batchNumber === batchNumber ? { ...b, ...updates } : b
      );
      return { batches: updated };
    });
  },

  createShippingInvoice: (data) => {
    const invSeq = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `TAX-INV-2026-${invSeq}`;
    const totalAmountInr = data.packQuantity * data.unitPriceInr;
    const gstAmountInr = (totalAmountInr * data.gstPercentage) / 100;
    const grandTotalInr = totalAmountInr + gstAmountInr;
    const user = get().currentUser;
    const batch = get().batches.find((b) => b.batchNumber === data.batchNumber);

    const newInvoice: ShippingInvoice = {
      id: `inv-${invSeq}`,
      invoiceNumber,
      companyId: user.id,
      companyName: user.organization,
      distributorId: 'dst-registered',
      distributorName: data.distributorName,
      batchNumber: data.batchNumber,
      drugName: batch?.drugName || 'Pharmaceutical Formulation',
      packQuantity: data.packQuantity,
      unitPriceInr: data.unitPriceInr,
      totalAmountInr,
      gstPercentage: data.gstPercentage,
      gstAmountInr,
      grandTotalInr,
      dispatchDate: data.dispatchDate,
      status: 'in_transit',
      temperatureReading: 20.0,
      timestamp: Date.now(),
    };

    set((state) => ({
      invoices: [newInvoice, ...state.invoices],
    }));

    return newInvoice;
  },

  confirmShippingInvoice: (invoiceId, temp, note) => {
    const user = get().currentUser;
    const timestamp = Date.now();

    set((state) => {
      const invoice = state.invoices.find((inv) => inv.id === invoiceId);
      const updatedInvoices = state.invoices.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'delivered_confirmed' as const,
              temperatureReading: temp,
              deliveryConfirmation: {
                confirmedBy: `${user.name} (${user.organization})`,
                confirmedAt: timestamp,
                signature: `SEAL_RECEIPT_` + sha256Sync(`${invoiceId}_${timestamp}`).slice(0, 16),
                note,
              },
            }
          : inv
      );

      // If invoice matched a batch, update batch pack statuses to at_pharmacy
      let updatedPacks = state.packs;
      if (invoice) {
        updatedPacks = state.packs.map((p) =>
          p.batchNumber === invoice.batchNumber && p.status === 'in_transit'
            ? { ...p, status: 'at_pharmacy' as PackStatus, currentHolder: user.organization }
            : p
        );
      }

      return {
        invoices: updatedInvoices,
        packs: updatedPacks,
      };
    });
  },

  transferCustodyBatch: (batchNumber, toActor, role, location, tempReading, note) => {
    const timestamp = Date.now();
    const user = get().currentUser;

    set((state) => {
      const updatedPacks = state.packs.map((p) => {
        if (p.batchNumber !== batchNumber) return p;

        const newStatus: PackStatus =
          role === 'distributor'
            ? 'in_transit'
            : role === 'pharmacy'
            ? 'at_pharmacy'
            : p.status;

        const event: CustodyEvent = {
          id: `ev-custody-${p.packId}-${timestamp}`,
          packId: p.packId,
          batchNumber,
          fromActor: user.organization,
          toActor,
          role,
          timestamp,
          location,
          temperatureReading: tempReading,
          transactionHash: sha256Sync(`CUSTODY_${p.packId}_${timestamp}`),
          note: note || `Transfer of custody to ${toActor}`,
        };

        return {
          ...p,
          status: newStatus,
          currentHolder: toActor,
          custodyHistory: [...p.custodyHistory, event],
          lastKnownLocation: {
            lat: location.lat,
            lng: location.lng,
            placeName: location.facilityName,
            timestamp,
          },
        };
      });

      const prevBlock = state.blocks[state.blocks.length - 1];
      const newBlock: BlockchainBlock = {
        index: prevBlock.index + 1,
        timestamp,
        transactions: [
          {
            txId: `tx-custody-${batchNumber}-${timestamp}`,
            type: 'CUSTODY_TRANSFER',
            payload: {
              batchNumber,
              fromActor: user.organization,
              toActor,
              location,
              tempReading,
            },
            hash: sha256Sync(`TX_CUSTODY_${batchNumber}_${timestamp}`),
          },
        ],
        previousHash: prevBlock.hash,
        merkleRoot: sha256Sync(`ROOT_CUSTODY_${batchNumber}`),
        hash: sha256Sync(prevBlock.hash + batchNumber + timestamp),
        nonce: Math.floor(Math.random() * 50000),
      };

      return {
        packs: updatedPacks,
        blocks: [...state.blocks, newBlock],
      };
    });
  },

  dispensePackToPatient: (packId, patientRef) => {
    const timestamp = Date.now();
    const user = get().currentUser;

    set((state) => {
      const updatedPacks = state.packs.map((p) => {
        if (p.packId !== packId) return p;

        const event: CustodyEvent = {
          id: `ev-dispense-${packId}-${timestamp}`,
          packId,
          batchNumber: p.batchNumber,
          fromActor: user.organization,
          toActor: `Patient (${patientRef})`,
          role: 'patient',
          timestamp,
          location: user.facilityLocation,
          transactionHash: sha256Sync(`DISPENSE_${packId}_${timestamp}`),
          note: `Dispensed to verified patient. Token lifecycle sealed.`,
        };

        return {
          ...p,
          status: 'dispensed' as PackStatus,
          currentHolder: `Verified Patient (${patientRef})`,
          custodyHistory: [...p.custodyHistory, event],
        };
      });

      return { packs: updatedPacks };
    });
  },

  verifyMedicineScan: ({ scannedText, userLat, userLng, placeName }) => {
    const timestamp = Date.now();
    const isOffline = get().isOfflineMode;
    const finalPlaceName = placeName || `India GPS (${userLat.toFixed(4)}°, ${userLng.toFixed(4)}°)`;

    const decoded = decodeAndValidateToken(scannedText);

    if (!decoded.isValidFormat || decoded.isTampered) {
      const scanLog: ScanLog = {
        id: `scan-fail-${timestamp}`,
        packId: 'UNKNOWN_OR_FORGED',
        batchNumber: decoded.batchNumber || 'UNKNOWN',
        timestamp,
        lat: userLat,
        lng: userLng,
        placeName: finalPlaceName,
        accuracy: 15,
        result: 'invalid_token',
        verifiedOffline: isOffline,
      };

      const alert: SecurityAlert = {
        id: `alert-tamper-${timestamp}`,
        severity: 'critical',
        alertType: 'unregistered_token',
        timestamp,
        packId: 'FORGED_TOKEN',
        batchNumber: decoded.batchNumber || 'N/A',
        drugName: 'Spurious / Unregistered Indian Medicine Strip',
        details: `CDSCO cryptographic token signature validation failed. The scanned QR is not signed by any licensed Indian pharmaceutical manufacturer.`,
        locations: [{ lat: userLat, lng: userLng, timestamp, name: finalPlaceName }],
        resolved: false,
      };

      if (isOffline) {
        queueOfflineScan(scanLog);
        set((s) => ({ offlineQueueCount: s.offlineQueueCount + 1 }));
      } else {
        set((s) => ({
          scanLogs: [scanLog, ...s.scanLogs],
          securityAlerts: [alert, ...s.securityAlerts],
        }));
      }

      return {
        result: 'invalid_token',
        scanLog,
        alert,
        isOfflineVerified: isOffline,
      };
    }

    let batch = get().batches.find((b) => b.batchNumber === decoded.batchNumber);
    let pack = get().packs.find(
      (p) =>
        p.batchNumber === decoded.batchNumber &&
        (p.serialNumber === decoded.serialNumber || p.secureToken === scannedText || p.packId === scannedText)
    );

    if (!pack && decoded.batchNumber && decoded.serialNumber) {
      pack = get().packs.find(
        (p) => p.batchNumber === decoded.batchNumber && p.serialNumber === decoded.serialNumber
      );
    }

    if (!batch && isOffline) {
      const cached = getCachedBatchManifests().find((b) => b.batchNumber === decoded.batchNumber);
      if (cached) {
        batch = {
          batchNumber: cached.batchNumber,
          drugName: cached.drugName,
          genericName: cached.drugName,
          manufacturer: cached.manufacturer,
          dosageForm: 'Certified Offline Batch (India)',
          ndcCode: 'OFFLINE-CACHE',
          mfgLicenseNo: 'CDSCO-CACHED',
          mrpInr: 100.00,
          mfgDate: 'Cached',
          expiryDate: cached.expiryDate,
          totalPacks: 100,
          merkleRoot: cached.merkleRoot,
          status: cached.status,
          temperatureSpec: { min: 15, max: 25, unit: 'C' },
          creationTxHash: sha256Sync(`OFFLINE_${cached.batchNumber}`),
          timestamp: cached.cachedAt,
        };
      }
    }

    if (batch && batch.status === 'recalled') {
      const scanLog: ScanLog = {
        id: `scan-recall-${timestamp}`,
        packId: pack?.packId || `${decoded.batchNumber}-${decoded.serialNumber}`,
        batchNumber: batch.batchNumber,
        timestamp,
        lat: userLat,
        lng: userLng,
        placeName: finalPlaceName,
        accuracy: 10,
        result: 'recalled_batch',
        verifiedOffline: isOffline,
      };

      const alert: SecurityAlert = {
        id: `alert-recall-${timestamp}`,
        severity: 'high',
        alertType: 'recalled_dispense',
        timestamp,
        packId: pack?.packId || 'N/A',
        batchNumber: batch.batchNumber,
        drugName: batch.drugName,
        details: `Batch ${batch.batchNumber} has been officially RECALLED by CDSCO & State Drug Controller. Patient must not consume.`,
        locations: [{ lat: userLat, lng: userLng, timestamp, name: finalPlaceName }],
        resolved: false,
      };

      set((s) => ({
        scanLogs: [scanLog, ...s.scanLogs],
        securityAlerts: [alert, ...s.securityAlerts],
      }));

      return {
        result: 'recalled_batch',
        batch,
        pack,
        scanLog,
        alert,
        isOfflineVerified: isOffline,
      };
    }

    let travelEvaluation: TravelCheckResult = {
      isImpossible: false,
      distanceKm: 0,
      timeDeltaSec: 0,
      velocityKmH: 0,
      severity: 'nominal',
      reason: '',
    };

    if (pack?.lastKnownLocation) {
      travelEvaluation = evaluateTravelVelocity(
        {
          lat: pack.lastKnownLocation.lat,
          lng: pack.lastKnownLocation.lng,
          timestamp: pack.lastKnownLocation.timestamp,
        },
        {
          lat: userLat,
          lng: userLng,
          timestamp,
        }
      );
    }

    if (travelEvaluation.isImpossible) {
      const scanLog: ScanLog = {
        id: `scan-anomaly-${timestamp}`,
        packId: pack?.packId || 'FLAGGED-CLONE',
        batchNumber: decoded.batchNumber || 'UNKNOWN',
        timestamp,
        lat: userLat,
        lng: userLng,
        placeName: finalPlaceName,
        accuracy: 8,
        result: 'impossible_travel',
        velocityKmH: travelEvaluation.velocityKmH,
        distanceKm: travelEvaluation.distanceKm,
        timeDeltaSec: travelEvaluation.timeDeltaSec,
        previousScan: pack?.lastKnownLocation
          ? {
              lat: pack.lastKnownLocation.lat,
              lng: pack.lastKnownLocation.lng,
              timestamp: pack.lastKnownLocation.timestamp,
              placeName: pack.lastKnownLocation.placeName,
            }
          : undefined,
        verifiedOffline: isOffline,
      };

      const alert: SecurityAlert = {
        id: `alert-travel-${timestamp}`,
        severity: 'critical',
        alertType: 'impossible_travel',
        timestamp,
        packId: pack?.packId || 'N/A',
        batchNumber: batch?.batchNumber || decoded.batchNumber || 'N/A',
        drugName: batch?.drugName || 'Unknown Formulation',
        details:
          travelEvaluation.reason ||
          `Impossible physical travel velocity (${travelEvaluation.velocityKmH.toLocaleString()} km/h) detected across Indian pharma transport corridors between ${
            pack?.lastKnownLocation?.placeName || 'previous scan'
          } and ${finalPlaceName}. Spurious duplicate clone strip detected!`,
        locations: [
          ...(pack?.lastKnownLocation
            ? [
                {
                  lat: pack.lastKnownLocation.lat,
                  lng: pack.lastKnownLocation.lng,
                  timestamp: pack.lastKnownLocation.timestamp,
                  name: pack.lastKnownLocation.placeName,
                },
              ]
            : []),
          {
            lat: userLat,
            lng: userLng,
            timestamp,
            name: finalPlaceName,
          },
        ],
        calculatedVelocityKmH: travelEvaluation.velocityKmH,
        resolved: false,
      };

      set((s) => ({
        packs: s.packs.map((p) =>
          p.packId === pack?.packId ? { ...p, status: 'compromised' as PackStatus } : p
        ),
        scanLogs: [scanLog, ...s.scanLogs],
        securityAlerts: [alert, ...s.securityAlerts],
      }));

      return {
        result: 'impossible_travel',
        batch,
        pack,
        scanLog,
        alert,
        isOfflineVerified: isOffline,
      };
    }

    const authenticLog: ScanLog = {
      id: `scan-auth-${timestamp}`,
      packId: pack?.packId || `${decoded.batchNumber}-${decoded.serialNumber}`,
      batchNumber: batch?.batchNumber || decoded.batchNumber || 'UNKNOWN',
      timestamp,
      lat: userLat,
      lng: userLng,
      placeName: finalPlaceName,
      accuracy: 10,
      result: 'verified_authentic',
      velocityKmH: travelEvaluation.velocityKmH,
      distanceKm: travelEvaluation.distanceKm,
      timeDeltaSec: travelEvaluation.timeDeltaSec,
      verifiedOffline: isOffline,
    };

    if (isOffline) {
      queueOfflineScan(authenticLog);
      set((s) => ({
        offlineQueueCount: s.offlineQueueCount + 1,
        packs: s.packs.map((p) =>
          p.packId === pack?.packId
            ? {
                ...p,
                lastKnownLocation: {
                  lat: userLat,
                  lng: userLng,
                  placeName: finalPlaceName,
                  timestamp,
                },
              }
            : p
        ),
      }));
    } else {
      set((s) => ({
        scanLogs: [authenticLog, ...s.scanLogs],
        packs: s.packs.map((p) =>
          p.packId === pack?.packId
            ? {
                ...p,
                lastKnownLocation: {
                  lat: userLat,
                  lng: userLng,
                  placeName: finalPlaceName,
                  timestamp,
                },
              }
            : p
        ),
      }));
    }

    return {
      result: 'verified_authentic',
      batch,
      pack,
      scanLog: authenticLog,
      isOfflineVerified: isOffline,
    };
  },

  resolveAlert: (alertId, note) => {
    set((s) => ({
      securityAlerts: s.securityAlerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              resolved: true,
              resolutionNote: note || 'Quarantine order issued under Drugs & Cosmetics Act by State Drug Controller.',
            }
          : a
      ),
    }));
  },

  recallBatch: (batchNumber, reason) => {
    const timestamp = Date.now();
    set((s) => {
      const updatedBatches = s.batches.map((b) =>
        b.batchNumber === batchNumber ? { ...b, status: 'recalled' as const } : b
      );

      const alert: SecurityAlert = {
        id: `alert-recall-init-${timestamp}`,
        severity: 'high',
        alertType: 'recalled_dispense',
        timestamp,
        packId: 'ALL_BATCH_PACKS',
        batchNumber,
        drugName: s.batches.find((b) => b.batchNumber === batchNumber)?.drugName || 'Batch',
        details: `Batch recalled across India. Reason: ${reason}. Order issued under CDSCO Section 26A.`,
        locations: [],
        resolved: false,
      };

      return {
        batches: updatedBatches,
        securityAlerts: [alert, ...s.securityAlerts],
      };
    });
  },
}));
