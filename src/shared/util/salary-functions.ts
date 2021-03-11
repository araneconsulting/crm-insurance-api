import { LocationType } from 'shared/enum/location-type.enum';
import { RoleType } from 'shared/enum/role-type.enum';

const MONTHLY_SALES_TARGET_BY_EMPLOYEE = 50000;

export function bonusByRole(
  role: string,
  location: string,
  employeeTotalSales: number,
  officeEmployees: number,
  officeTotalSales: number,
): any {
  
  let bonus = 0;

  switch (location) {
    case LocationType.MEXICO:
      switch (role) {
        case RoleType.CERTIFICATES:
          bonus += employeeTotalSales * 0.01;
          if (employeeTotalSales > MONTHLY_SALES_TARGET_BY_EMPLOYEE) {
            bonus += 100;
          }
          break;

        case RoleType.ENDORSEMENTS:
          break;

        case RoleType.LEGAL:
          if (officeEmployees >= 20) bonus += 400;

          if (
            officeTotalSales >
            officeEmployees * MONTHLY_SALES_TARGET_BY_EMPLOYEE
          )
            bonus += 100;
          break;

        case RoleType.MANAGER:
          if (
            employeeTotalSales > MONTHLY_SALES_TARGET_BY_EMPLOYEE / 2 &&
            employeeTotalSales < MONTHLY_SALES_TARGET_BY_EMPLOYEE
          )
            bonus += employeeTotalSales * 0.005;

          if (
            employeeTotalSales >= MONTHLY_SALES_TARGET_BY_EMPLOYEE &&
            employeeTotalSales < MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2
          )
            bonus += employeeTotalSales * 0.01 + 50;

          if (employeeTotalSales >= MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2)
            bonus += employeeTotalSales * 0.01 + 100;

          if (
            officeTotalSales >
            MONTHLY_SALES_TARGET_BY_EMPLOYEE * officeEmployees
          )
            bonus += (officeTotalSales - employeeTotalSales) * 0.005;
          break;

        case RoleType.SELLER:
          if (
            employeeTotalSales > MONTHLY_SALES_TARGET_BY_EMPLOYEE / 2 &&
            employeeTotalSales < MONTHLY_SALES_TARGET_BY_EMPLOYEE
          )
            bonus += employeeTotalSales * 0.005;

          if (
            employeeTotalSales >= MONTHLY_SALES_TARGET_BY_EMPLOYEE &&
            employeeTotalSales < MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2
          )
            bonus += employeeTotalSales * 0.01 + 50;

          if (employeeTotalSales >= MONTHLY_SALES_TARGET_BY_EMPLOYEE * 2)
            bonus += employeeTotalSales * 0.01 + 100;
          break;

        case RoleType.TRAINEE:
          if (employeeTotalSales >= MONTHLY_SALES_TARGET_BY_EMPLOYEE)
            bonus += employeeTotalSales * 0.01 + 50;
          break;

        case RoleType.OWNER:
        case RoleType.ADMIN:
        default:
      }

      break;
    case LocationType.USA:
      break;
  }

  
  return Math.round(bonus * 100) / 100;
}
