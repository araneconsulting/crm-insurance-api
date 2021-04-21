import { LocationType } from 'shared/enum/location-type.enum';
import { RoleType } from 'shared/enum/role-type.enum';
import { roundAmount } from './math-functions';

const MONTHLY_SALES_TARGET_BY_EMPLOYEE = 50000;

export function bonusByRole(
  role: string,
  location: string,
  employeeTotalPremium = 0,
  employeeTotalPermits = 0,
  employeeTotalFees = 0,
  employeeTotalTips = 0,
  officeEmployees = 0,
  officeTotalSales = 0,
): any {
  let bonus = 0;

  const extraBonus =
    employeeTotalFees * 0.3 + employeeTotalPermits * 0.2 + employeeTotalTips;

  switch (location) {
    case 'MEXICO-I':
      switch (role) {
        case RoleType.CERTIFICATES:
          bonus += extraBonus;
          bonus += employeeTotalPremium * 0.01;
          if (employeeTotalPremium > MONTHLY_SALES_TARGET_BY_EMPLOYEE) {
            bonus += 50;
          } else if (
            employeeTotalPremium >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2
          ) {
            bonus += 100;
          } else if (
            employeeTotalPremium >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * 3
          ) {
            bonus += 150;
          } else if (
            employeeTotalPremium >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * 4
          ) {
            bonus += 200;
          }
          break;

        case RoleType.ENDORSEMENTS:
          break;

        case RoleType.LEGAL:
          bonus += extraBonus;
          if (officeEmployees >= 20) bonus += 400;

          if (
            officeTotalSales >
            officeEmployees * MONTHLY_SALES_TARGET_BY_EMPLOYEE
          )
            bonus += 100;

          bonus += employeeTotalPremium * 0.01;

          if (employeeTotalPremium > MONTHLY_SALES_TARGET_BY_EMPLOYEE) {
            bonus += 50;
          } else if (
            employeeTotalPremium >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2
          ) {
            bonus += 100;
          } else if (
            employeeTotalPremium >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * 3
          ) {
            bonus += 150;
          } else if (
            employeeTotalPremium >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * 4
          ) {
            bonus += 200;
          }
          break;

        case RoleType.MANAGER:
          bonus += extraBonus;
          if (
            employeeTotalPremium > MONTHLY_SALES_TARGET_BY_EMPLOYEE / 2 &&
            employeeTotalPremium < MONTHLY_SALES_TARGET_BY_EMPLOYEE
          )
            bonus += employeeTotalPremium * 0.005;
          else if (
            employeeTotalPremium >= MONTHLY_SALES_TARGET_BY_EMPLOYEE &&
            employeeTotalPremium < MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2
          )
            bonus += employeeTotalPremium * 0.01 + 50;
          else if (
            employeeTotalPremium >= MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2 &&
            employeeTotalPremium < MONTHLY_SALES_TARGET_BY_EMPLOYEE * 3
          )
            bonus += employeeTotalPremium * 0.01 + 100;
          else if (
            employeeTotalPremium >= MONTHLY_SALES_TARGET_BY_EMPLOYEE * 3 &&
            employeeTotalPremium < MONTHLY_SALES_TARGET_BY_EMPLOYEE * 4
          )
            bonus += employeeTotalPremium * 0.01 + 150;
          else if (employeeTotalPremium >= MONTHLY_SALES_TARGET_BY_EMPLOYEE * 4)
            bonus += employeeTotalPremium * 0.01 + 200;

          if (
            officeTotalSales >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * officeEmployees
          )
            bonus += (officeTotalSales) * 0.005;

          break;

        case RoleType.SELLER:
          bonus += extraBonus;
          if (
            employeeTotalPremium > MONTHLY_SALES_TARGET_BY_EMPLOYEE / 2 &&
            employeeTotalPremium < MONTHLY_SALES_TARGET_BY_EMPLOYEE
          )
            bonus += employeeTotalPremium * 0.005;

          if (
            employeeTotalPremium >= MONTHLY_SALES_TARGET_BY_EMPLOYEE &&
            employeeTotalPremium < MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2
          )
            bonus += employeeTotalPremium * 0.01 + 50;

          if (employeeTotalPremium >= MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2)
            bonus += employeeTotalPremium * 0.01 + 100;

          break;

        case RoleType.TRAINEE:
          bonus += extraBonus;
          bonus += employeeTotalPremium * 0.01;

          if (employeeTotalPremium > MONTHLY_SALES_TARGET_BY_EMPLOYEE) {
            bonus += 50;
          } else if (
            employeeTotalPremium >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2
          ) {
            bonus += 100;
          } else if (
            employeeTotalPremium >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * 3
          ) {
            bonus += 150;
          } else if (
            employeeTotalPremium >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * 4
          ) {
            bonus += 200;
          }
          break;

        case RoleType.OWNER:
        case RoleType.ADMIN:
        default:
      }

      break;
    case 'USA-I':
      break;
  }

  return roundAmount(bonus);
}
