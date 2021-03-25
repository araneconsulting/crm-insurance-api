export const CompanyCatalog = {
  locations: [
    {
      id: 'MEXICO-I',
      name: 'Merida (MX) Office',
      address: '',
      phone: '',
      email: 'contact@vl17insagency.com',
      fax: '',
      manager: 'Tatiana Nicles'
    },
    {
      id: 'USA-I',
      name: 'Houston Headquarters',
      address: '2150 Hwy 6 S Ste: 130, Houston, TX 77077',
      phone: '+1-281-803-8156',
      email: 'contact@vl17insagency.com',
      fax: '',
      manager: 'Lisandra Cunill'
    },
  ],
};

export function locationName(locationCode) {
  return CompanyCatalog.locations.find(
    (location) => location.id === locationCode
  ).name;
}