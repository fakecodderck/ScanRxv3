import { AppUserProfile, ADMIN_EMAIL } from './firebase';

export const DEMO_PROFILES: Record<'admin' | 'company' | 'distributor' | 'pharmacy', AppUserProfile> = {
  admin: {
    uid: 'demo-admin-uid',
    email: ADMIN_EMAIL,
    displayName: 'Central Admin (fakemailcloud09)',
    role: 'admin',
    organization: 'National Drug Authority & Vigilance Directorate',
    facilityLocation: {
      lat: 28.6139,
      lng: 77.2090,
      facilityName: 'FDA Bhawan, Kotla Road',
      city: 'New Delhi',
      country: 'India',
    },
    status: 'active',
  },
  company: {
    uid: 'demo-company-uid',
    email: 'qa@sunpharma.in',
    displayName: 'Sun Pharma Manufacturing',
    role: 'company',
    organization: 'Sun Pharma Laboratories Ltd. (Baddi Unit)',
    facilityLocation: {
      lat: 30.9578,
      lng: 76.7914,
      facilityName: 'Sun Pharma Plant 4, Baddi',
      city: 'Solan (HP)',
      country: 'India',
    },
    status: 'active',
  },
  distributor: {
    uid: 'demo-dist-uid',
    email: 'ops@coldexlogistics.in',
    displayName: 'Coldex National Logistics',
    role: 'distributor',
    organization: 'Coldex Logistics Hub, Bhiwandi',
    facilityLocation: {
      lat: 19.2967,
      lng: 73.0631,
      facilityName: 'Coldex Mega Warehouse #3',
      city: 'Bhiwandi (MH)',
      country: 'India',
    },
    status: 'active',
  },
  pharmacy: {
    uid: 'demo-phr-uid',
    email: 'chemist@apollopharmacy.in',
    displayName: 'Apollo Pharmacy Lead Chemist',
    role: 'pharmacy',
    organization: 'Apollo Pharmacy #402, Bengaluru',
    facilityLocation: {
      lat: 12.9716,
      lng: 77.5946,
      facilityName: 'Apollo Pharmacy Dispensary #402',
      city: 'Bengaluru (KA)',
      country: 'India',
    },
    status: 'active',
  },
};
