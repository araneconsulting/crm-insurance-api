import { RoleType } from 'shared/enum/role-type.enum';

export const startOfDayTime = 'T00:00:00.000Z';
export const endOfDayTime = 'T23:59:59.999Z';
export const SELLER_ROLES = [RoleType.SELLER, RoleType.TRAINEE, RoleType.OWNER, RoleType.ADMIN, RoleType.MANAGER, RoleType.CERTIFICATES];
export const ADMIN_ROLES = [RoleType.OWNER, RoleType.ADMIN];
export const SUPER_ADMIN_ROLES = [RoleType.SUPER];
export const EXECUTIVE_ROLES = [RoleType.OWNER, RoleType.ADMIN, RoleType.MANAGER, RoleType.LEGAL];

export const METRICS = {
  sales: {
    returnedFields: [
      'liabilityCharge',
      'cargoCharge',
      'physicalDamageCharge',
      'wcGlUmbCharge',
      'tips',
      'permits',
      'fees',
      'premium',
      'chargesPaid',
      'amountReceivable',
      'totalCharge',
    ],
  },
  companies: {
    returnedFields: [],
  }

};

export const COMPANY = {
  payrollDay : 21
}
