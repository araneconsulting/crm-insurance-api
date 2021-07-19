export const PERMIT_TYPES = [
  {
    product: 'DBA',
    id: 'DBA',
    description: 'Register a DBA (Doing Business As)',
    amount: 17.0,
    type: 'REGISTRATION'
  },
  {
    product: 'LLC',
    id: 'LLC',
    description: 'Register an LLC (Limited Liability Company)',
    amount: 308.1,
    type: 'REGISTRATION'
  },
  {
    product: 'EIN',
    id: 'EIN',
    description: 'Application to obtain Employer ID Number (Tax ID)',
    amount: 0.0,
    type: 'REGISTRATION'
  },
  {
    product: 'UCR',
    id: 'UCR',
    description: 'Application to obtain Unified Carrier Registration',
    amount: 60.0,
    type: 'PERMIT'
  },
  {
    product: 'BOC-3',
    id: 'BOC-3',
    description: 'Fill BOC-3 form2 (Designation of Agent for Service of Process)',
    amount: 45.0,
    type: 'PERMIT'
  },
  {
    product: 'CLEARINGHOUSE',
    id: 'Clearinghouse',
    description: 'Register in Clearinghouse database',
    amount: 40.0,
    type: 'PERMIT'
  },
  {
    product: 'IFTA',
    id: 'IFTA',
    description: 'Register for International Fuel Tax Association',
    amount: 40.0,
    type: 'PERMIT'
  },
  {
    product: 'USDOT', 
    id: 'USDOT',
    description: 'Application to obtain a USDOT Number',
    amount: 40.0,
    type: 'PERMIT'
  },
  {
    product: 'MC',
    id: 'MC',
    description: 'Application to obtain operating authority (MC number)',
    amount: 300.0,
    type: 'PERMIT'
  },
  {
    product: 'TXDMV',
    id: 'TXDMV',
    description: 'Application to obtain TxDMV number + CAB Card',
    amount: 224.0,
    type: 'PERMIT'
  },
  {
    product: 'INCORPORATION',
    id: 'Incorporation',
    description: 'Incorporation processing fee',
    amount: 250.0,
    type: 'FEE'
  },
];

export const PERMIT_TYPES_BY_STATE = [
  {
    state: "ALL",
    permits: ['DBA', 'LLC', 'EIN', 'UCR', 'BOC-3', 'CLEARINGHOUSE', 'IFTA', 'USDOT', 'MC', 'TXDMV', 'INCORPORATION']
  },
  {
    state: "TX",
    permits: ['DBA', 'LLC', 'EIN', 'USDOT', 'TXDMV', 'INCORPORATION']
  }
];
