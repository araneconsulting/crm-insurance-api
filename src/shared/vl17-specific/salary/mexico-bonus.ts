import { Location } from 'database/location.model';
import { LocationType } from 'shared/enum/location-type.enum';
import { RoleType } from 'shared/enum/role-type.enum';
import { roundAmount } from 'shared/util/math-functions';

const MONTHLY_SALES_TARGET_BY_EMPLOYEE = 50000;
const FEE_BONUS_PERCENT = 0.3;
const TIP_BONUS_PERCENT = 1;
const PERMIT_BONUS_PERCENT = 0.2;
const DEFAULT_SALES_COMMISION_PERCENT = 0.01;
const DEFAULT_AFTER_TARGET_COMMISSION = 100;
const DEFAULT_EMPLOYEES_COUNT_TARGET = 20;
const DEFAULT_EMPLOYEES_COUNT_COMMISSION = 400;
const DEFAULT_LOCATION_TOTAL_SALES_BONUS_PERCENT = 0.005;
const DEFAULT_25K_BONUS_PERCENT = 0.005;
const DEFAULT_50K_PLUS_BONUS_PERCENT = 0.01;
const DEFAULT_TRAINEE_CASH_BONUS_AFTER_SALES = 50;

/**
 * Calculates total bonus as sum of Fees + Permits + Tips
 *
 * @param  {number} feesAmount
 * @param  {number} permitsAmount
 * @param  {number} tipsAmount
 */
export function totalBonusExtra(
  feesAmount: number,
  permitsAmount: number,
  tipsAmount: number,
) {
  return (
    percentpercentBonusPerTips(feesAmount) +
    percentBonusPerPermits(permitsAmount) +
    percentBonusPerTips(tipsAmount)
  );
}

/**
 * Calculates bonus according to Fee sales
 *
 * @param  {number} feesAmount
 * @param  {number=FEE_BONUS_PERCENT} commisionPercent
 */
export function percentpercentBonusPerTips(
  feesAmount: number,
  commisionPercent: number = FEE_BONUS_PERCENT,
) {
  return feesAmount * commisionPercent;
}

/**
 * Calculates bonus according to Permit sales
 *
 * @param  {number} permitsAmount
 * @param  {number=PERMIT_BONUS_PERCENT} commisionPercent
 */
export function percentBonusPerPermits(
  permitsAmount: number,
  commisionPercent: number = PERMIT_BONUS_PERCENT,
) {
  return permitsAmount * commisionPercent;
}

/**
 * Calculates bonus according to Tips sales
 *
 * @param  {number} tipsAmount
 * @param  {number=TIP_BONUS_PERCENT} commisionPercent
 * @returns number
 */
export function percentBonusPerTips(
  tipsAmount: number,
  commisionPercent: number = TIP_BONUS_PERCENT,
) {
  return tipsAmount * commisionPercent;
}

//PERCENTAGE OF SALES
/**
 * Calculates bonus based on a fixed percentage of total sales
 *
 * @param  {number} totalSales
 * @param  {number=DEFAULT_SALES_COMMISION_PERCENT} percent
 * @returns number
 */
export function percentOfSalesFixed(
  totalSales: number,
  percent: number = DEFAULT_SALES_COMMISION_PERCENT,
) {
  return totalSales * percent;
}

//COMMISSION AFTER TARGET
/**
 * Calculates
 *
 * @param  {number} totalSales
 * @param  {number=DEFAULT_AFTER_TARGET_COMMISSION} commission
 * @param  {number=MONTHLY_SALES_TARGET_BY_EMPLOYEE} target
 */
export function cashBonusAfterMeetSalesTarget(
  totalSales: number,
  commission: number = DEFAULT_AFTER_TARGET_COMMISSION,
  monthSalesTarget: number = MONTHLY_SALES_TARGET_BY_EMPLOYEE,
) {
  return totalSales > monthSalesTarget ? commission : 0;
}

//COMMISSION AFTER TARGET
/**
 * Calculates
 *
 * @param  {number} totalSales
 * @param  {number=DEFAULT_AFTER_TARGET_COMMISSION} commission
 * @param  {number=MONTHLY_SALES_TARGET_BY_EMPLOYEE} target
 */
export function percentBonusAfterMeetSalesTarget(
  totalSales: number,
  percent: number = DEFAULT_SALES_COMMISION_PERCENT,
  monthSalesTarget: number = MONTHLY_SALES_TARGET_BY_EMPLOYEE,
) {
  return totalSales > monthSalesTarget ? totalSales * percent : 0;
}

export function cashBonusAfterEmployeesCount(
  employeesCount: number,
  employeesTarget: number = DEFAULT_EMPLOYEES_COUNT_TARGET,
  employeesTargetCommission: number = DEFAULT_EMPLOYEES_COUNT_COMMISSION,
) {
  return employeesCount >= employeesTarget ? employeesTargetCommission : 0;
}

export function cashBonusAfterEmployeesTotalSales(
  employeesSales: number,
  employeeSalesTarget: number = MONTHLY_SALES_TARGET_BY_EMPLOYEE,
) {
  return employeesSales >= employeeSalesTarget
    ? DEFAULT_AFTER_TARGET_COMMISSION
    : 0;
}

/**
 * Calculates a bonus paid to location managers, according to the formula: 
 * TOTAL OFFICE SALES > GOAL (ej: 50K) * EMPLOYEES COUNT - 

 * @param  {number} locationTotalSales
 * @param  {number} locationEmployeesCount
 * @param  {number} managerTotalSales
 * @param  {number=MONTHLY_SALES_TARGET_BY_EMPLOYEE} expectedMonthSalesBySeller
 * @param  {number=DEFAULT_LOCATION_TOTAL_SALES_BONUS_PERCENT} salesBonusPercent
 * @returns number
 */

function locationSalesBonusAfterTarget(
  locationTotalSales: number,
  locationEmployeesCount: number,
  managerTotalSales: number,
  expectedMonthSalesBySeller: number = MONTHLY_SALES_TARGET_BY_EMPLOYEE,
  salesBonusPercent: number = DEFAULT_LOCATION_TOTAL_SALES_BONUS_PERCENT,
) {
  return locationTotalSales >
    expectedMonthSalesBySeller * locationEmployeesCount
    ? (locationTotalSales - managerTotalSales) * salesBonusPercent
    : 0;
}

/**
 * Calculates bonus according to employee total sales in last month.
 * Scales are described as the following table:
 *
 * Start   End     %       Cash
 * 0       25      0       0
 * 25+     50      0.005   0
 * 50+     100     0.01    50
 * 100+    150     0.01    100
 * 150+    200     0.01    150
 * 200+    250     0.01    200
 *
 * @param  {number} employeeTotalSales
 * @param  {number=MONTHLY_SALES_TARGET_BY_EMPLOYEE} employeeMonthlySalesTarget
 */

function variablePercentAndCashSalesBonus(
  employeeTotalSales: number,
  employeeMonthlySalesTarget: number = MONTHLY_SALES_TARGET_BY_EMPLOYEE,
) {
  let cashCommission = 0;
  let percent = DEFAULT_SALES_COMMISION_PERCENT;

  if (
    employeeTotalSales > employeeMonthlySalesTarget / 2 &&
    employeeTotalSales < employeeMonthlySalesTarget
  )
    percent = DEFAULT_25K_BONUS_PERCENT;
  else {
    const mult = Math.floor(employeeTotalSales / employeeMonthlySalesTarget);
    console.log('multiplier', mult);
    cashCommission = (mult * employeeMonthlySalesTarget) / 1000;
  }
  return employeeTotalSales * percent + cashCommission;
}

/**
 * Calculates Salary Bonus by Role according to Mexico bonus calculation rules
 *
 * @param  {string} role
 * @param  {number} employeeTotalSales
 * @param  {number} extraBonus
 * @param  {number} officeEmployees
 * @param  {number} officeTotalSales
 */
export function salesBonusByRoleMexico(
  role: string,
  employeeTotalSales: number,
  extraBonus: number,
  officeEmployees: number,
  officeTotalSales: number,
) {
  let bonus = 0;
  switch (role) {
    case RoleType.CERTIFICATES:
      bonus =
        percentOfSalesFixed(employeeTotalSales) +
        cashBonusAfterMeetSalesTarget(employeeTotalSales);
      break;

    case RoleType.ENDORSEMENTS:
      break;

    case RoleType.LEGAL:
      bonus =
        cashBonusAfterEmployeesCount(officeEmployees) +
        cashBonusAfterEmployeesTotalSales(officeTotalSales);
      break;

    case RoleType.MANAGER:
      bonus =
        variablePercentAndCashSalesBonus(employeeTotalSales) +
        locationSalesBonusAfterTarget(
          officeTotalSales,
          officeEmployees,
          employeeTotalSales,
        );
      break;

    case RoleType.SELLER:
    case RoleType.OWNER:
      bonus = variablePercentAndCashSalesBonus(employeeTotalSales);
      break;

    case RoleType.TRAINEE:
      bonus =
        percentBonusAfterMeetSalesTarget(MONTHLY_SALES_TARGET_BY_EMPLOYEE) +
        DEFAULT_TRAINEE_CASH_BONUS_AFTER_SALES;

      break;
    case RoleType.ADMIN:
    default:
      bonus = 0;
  }

  return bonus + extraBonus;
}

export function bonusByRole(
  role: string,
  userCountry: string = "USA",
  employeeTotalSales: number,
  employeeTotalPermits: number,
  employeeTotalFees: number,
  employeeTotalTips: number,
  officeEmployees: number,
  officeTotalSales: number,
): any {
  let bonus = 0;

  /* console.log(
    'BONUS:',
    role,
    userCountry,
    employeeTotalSales,
    employeeTotalPermits,
    employeeTotalFees,
    employeeTotalTips,
    officeEmployees,
    officeTotalSales,
  ); */

  const extraBonus = totalBonusExtra(
    employeeTotalFees,
    employeeTotalPermits,
    employeeTotalTips,
  );

  switch (userCountry) {
    case 'MX':
      bonus = salesBonusByRoleMexico(
        role,
        employeeTotalSales,
        extraBonus,
        officeEmployees,
        officeTotalSales,
      );

      break;
    case 'US':
      break;
  }

  return roundAmount(bonus);
}
