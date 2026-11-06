/**
 * AushadhLedger Data Types & Interfaces
 * In strict compliance with AushadhLedger Product & Development Guide
 */

export type RoleType =
  | 'public'
  | 'admin'
  | 'company'
  | 'manufacturer'
  | 'super_stockist'
  | 'distributor'
  | 'stockist'
  | 'pharmacy'
  | 'auditor'
  | 'patient';

export type OrgType =
  | 'manufacturer'
  | 'super_stockist'
  | 'distributor'
  | 'stockist'
  | 'pharmacy';

export type OrgStatus =
  | 'PENDING_REVIEW'
  | 'MORE_INFORMATION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface RegisteredOrganization {
  id: string;
  name: string;
  type: OrgType;
  status: OrgStatus;
  contactEmail: string;
  drugLicenseNo: string;
  gstin: string;
  stateJurisdiction: string;
  address: string;
  appliedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  reviewNotes?: string;
  documentsSubmitted: string[];
}

export interface LocationData {
  lat: number;
  lng: number;
  facilityName: string;
  city?: string;
  country?: string;
}

export interface CustodyEvent {
  id: string;
  packId: string;
  batchNumber: string;
  fromActor: string;
  toActor: string;
  role: RoleType;
  timestamp: number;
  location: LocationData;
  temperatureReading?: number; // In Celsius
  transactionHash: string;
  note?: string;
}

export type PackStatus = 
  | 'manufactured'
  | 'in_transit'
  | 'at_pharmacy'
  | 'dispensed'
  | 'compromised'
  | 'quarantined'
  | 'blocked';

export interface MedicinePack {
  packId: string; // e.g. "IND-AUG-8821-0002"
  batchNumber: string; // e.g. "LOT-AUG-8821"
  serialNumber: string; // e.g. "SN-0002"
  secureToken: string; // Cryptographic signed token string
  tokenHash: string; // SHA-256 of the token
  merkleLeafIndex: number;
  merkleProof: string[]; // Hashes along path to root
  status: PackStatus;
  currentHolder: string;
  manufactureDate: string;
  expiryDate: string;
  opticalSecurityPatternEnrolled: boolean;
  opticalPatternRef?: string; // Machine-readable PUF/microdot reference
  custodyHistory: CustodyEvent[];
  lastKnownLocation?: {
    lat: number;
    lng: number;
    placeName: string;
    timestamp: number;
    ipAddress?: string;
  };
  scanLocations?: {
    lat: number;
    lng: number;
    placeName: string;
    timestamp: number;
    ipAddress?: string;
    scanCategory?: string;
  }[];
  publicScanCount?: number;
}

export interface MedicineBatch {
  batchNumber: string;
  drugName: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string; // e.g. "500mg Film-Coated Tablet IP"
  ndcCode: string; // Indian CDSCO / Barcode registration code
  mfgLicenseNo?: string; // e.g. "S-MNB/09/42 (HP)"
  mrpInr?: number; // Maximum Retail Price in ₹ (inclusive of all taxes)
  cdscoApprovalRef?: string;
  stateDrugAuthority?: string;
  mfgDate: string;
  expiryDate: string;
  totalPacks: number;
  merkleRoot: string;
  status: 'active' | 'recalled' | 'quarantined' | 'blocked';
  temperatureSpec: {
    min: number;
    max: number;
    unit: 'C';
  };
  creationTxHash: string;
  timestamp: number;
}

/**
 * Result states matching Section 7.3 of the Product & Development Guide
 */
export type VerificationResultType = 
  | 'VERIFIED'
  | 'REGISTERED_BUT_NOT_FULLY_AUTHENTICATED'
  | 'ALREADY_SCANNED'
  | 'SUSPICIOUS'
  | 'INVALID'
  | 'BLOCKED'
  | 'BATCH_RECALLED'
  | 'AUTHENTICATION_UNAVAILABLE'
  // Backward compatibility aliases
  | 'verified_authentic'
  | 'impossible_travel'
  | 'counterfeit_clone'
  | 'invalid_token'
  | 'expired_batch'
  | 'recalled_batch';

export interface ScanLog {
  id: string;
  packId: string;
  batchNumber: string;
  timestamp: number;
  scanCategory: 'public' | 'pharmacy' | 'manufacturer' | 'distributor' | 'stockist' | 'admin';
  lat: number;
  lng: number;
  placeName: string;
  ipAddress?: string;
  accuracy: number;
  result: VerificationResultType;
  opticalAuthPerformed?: boolean;
  opticalAuthMatched?: boolean;
  riskScore?: number; // 0 (nominal) to 100 (critical counterfeit alert)
  riskReason?: string;
  velocityKmH?: number;
  distanceKm?: number;
  timeDeltaSec?: number;
  previousScan?: {
    lat: number;
    lng: number;
    timestamp: number;
    placeName: string;
    ipAddress?: string;
    category?: string;
  };
  priorPublicScanCount?: number;
  verifiedOffline: boolean;
  userAgent?: string;
}

export interface SecurityAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  alertType: 'impossible_travel' | 'duplicate_pack_scan' | 'temperature_excursion' | 'unregistered_token' | 'recalled_dispense';
  timestamp: number;
  packId: string;
  batchNumber: string;
  drugName: string;
  details: string;
  locations: {
    lat: number;
    lng: number;
    timestamp: number;
    name: string;
  }[];
  calculatedVelocityKmH?: number;
  resolved: boolean;
  resolutionNote?: string;
}

export interface BlockchainBlock {
  index: number;
  timestamp: number;
  transactions: {
    txId: string;
    type: 'BATCH_MINT' | 'CUSTODY_TRANSFER' | 'DISPENSATION' | 'SECURITY_FLAG' | 'BATCH_RECALL' | 'ORG_APPROVAL';
    payload: any;
    hash: string;
  }[];
  previousHash: string;
  merkleRoot: string;
  hash: string;
  nonce: number;
}

export interface SupplyChainUser {
  id: string;
  name: string;
  role: RoleType;
  organization: string;
  facilityLocation: LocationData;
}

export interface ShippingInvoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  companyName: string;
  distributorId: string;
  distributorName: string;
  batchNumber: string;
  drugName: string;
  packQuantity: number;
  unitPriceInr: number;
  totalAmountInr: number;
  gstPercentage: number;
  gstAmountInr: number;
  grandTotalInr: number;
  dispatchDate: string;
  status: 'dispatched' | 'in_transit' | 'delivered_confirmed' | 'disputed';
  temperatureReading?: number;
  deliveryConfirmation?: {
    confirmedBy: string;
    confirmedAt: number;
    signature: string;
    note?: string;
  };
  timestamp: number;
}
