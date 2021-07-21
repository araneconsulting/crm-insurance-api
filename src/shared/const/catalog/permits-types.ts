export const PERMIT_TYPES = [
  {
    id: 'LLC',
    product: 'LLC',
    description: 'Register an LLC (Limited Liability Company)',
    amount: 308.1,
    type: 'REGISTRATION',
  },
  {
    id: 'DBA',
    product: 'DBA',
    description: 'Register a DBA (Doing Business As)',
    amount: 17.0,
    type: 'REGISTRATION',
  },
  {
    id: 'EIN',
    product: 'EIN Number',
    description: 'Application to obtain Employer ID Number (Tax ID)',
    amount: 0.0,
    type: 'REGISTRATION',
  },
  {
    id: 'UCR',
    product: 'UCR',
    description: 'Application to obtain Unified Carrier Registration',
    amount: 60.0,
    type: 'PERMIT',
  },
  {
    id: 'BOC-3',
    product: 'BOC-3',
    description:
      'Fill BOC-3 form2 (Designation of Agent for Service of Process)',
    amount: 45.0,
    type: 'PERMIT',
  },
  {
    id: 'CLEARINGHOUSE',
    product: 'Clearinghouse',
    description: 'Register in Clearinghouse database',
    amount: 40.0,
    type: 'PERMIT',
  },
  {
    id: 'IFTA',
    product: 'IFTA',
    description: 'Register for International Fuel Tax Association',
    amount: 40.0,
    type: 'PERMIT',
  },
  {
    id: 'USDOT',
    product: 'USDOT Number',
    description: 'Application to obtain a USDOT Number',
    amount: 40.0,
    type: 'PERMIT',
  },
  {
    id: 'MC',
    product: 'MC Number',
    description: 'Application to obtain operating authority (MC number)',
    amount: 300.0,
    type: 'PERMIT',
  },
  {
    id: 'TXDMV',
    product: 'TxDMV Number',
    description: 'Application to obtain TxDMV number + CAB Card',
    amount: 224.0,
    type: 'PERMIT',
  },
  {
    id: 'INCORPORATION',
    product: 'Incorporation',
    description: 'Incorporation processing fee',
    amount: 250.0,
    type: 'FEE',
  }
];

export const PERMIT_TYPES_BY_STATE = [
  {
    state: 'ALL',
    permits: [
      'LLC',
      'DBA',
      'EIN',
      'UCR',
      'BOC-3',
      'CLEARINGHOUSE',
      'IFTA',
      'USDOT',
      'MC',
      'TXDMV',
      'INCORPORATION',
    ],
  },
  {
    state: 'TX',
    permits: ['DBA', 'LLC', 'EIN', 'USDOT', 'TXDMV', 'INCORPORATION'],
  },
];
