export const UserCatalog = {
  roles: [
    {
      id: 'ADMIN',
      name: 'System Administrator',
      description: '',
      groups: 'ADMIN',
    },
    {
      id: 'CERTIFICATES',
      name: 'Certificates Assistant',
      description: '',
      groups: 'EMPLOYEE',
    },
    {
      id: 'ENDORSEMENTS',
      name: 'Endorsements Assistant',
      description: '',
      groups: ['EMPLOYEE'],
    },
    {
      id: 'LEGAL',
      name: 'Legal Representative',
      description: '',
      groups: ['EXECUTIVE'],
    },
    {
      id: 'MANAGER',
      name: 'Office Manager',
      description: '',
      groups: ['EXECUTIVE, SELLER'],
    },
    {
      id: 'SELLER',
      name: 'Sales Agent',
      description: '',
      groups: ['EMPLOYEE, SELLER'],
    },
    {
      id: 'TRAINEE',
      name: 'Sales Agent in Training',
      description: '',
      groups: ['EMPLOYEE, SELLER'],
    },
    {
      id: 'OWNER',
      name: 'Company Owner',
      description: '',
      groups: ['ADMIN', 'EXECUTIVE', 'SELLER'],
    },
  ],
};
