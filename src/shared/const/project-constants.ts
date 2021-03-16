import { RoleType } from 'shared/enum/role-type.enum';

export const startOfDayTime = 'T00:00:00.000Z';
export const endOfDayTime = 'T23:59:59.999Z';
export const SELLER_ROLES = [RoleType.SELLER, RoleType.TRAINEE];
export const ADMIN_ROLES = [RoleType.OWNER, RoleType.ADMIN];
export const EXECUTIVE_ROLES = [RoleType.OWNER, RoleType.ADMIN, RoleType.MANAGER];

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
};

export const COMPANY = {
  payrollDay : 21
}
