import { PayrollDto } from 'business/payroll/dto/payroll.dto';
import { ReportService } from 'insurance/report/report.service';
import { PayAddon } from 'business/sub-docs/pay-addon';
import { User } from 'database/user.model';
import * as moment from 'moment';
import { Location } from 'database/location.model';
import { PayStub } from 'business/sub-docs/pay-stub';
import { UserService } from 'user/user.service';

const ADDON_TYPE_DISCOUNT = 'DISCOUNT';
const ADDON_TYPE_BONUS = 'BONUS';
const ADDON_TYPE_REIMBURSEMENT = 'REIMBURSEMENT';

/*
 * Receives:
 *   payrollDto: a payroll object to push final result
 *   reportService: injected Service to calculate bonus
 *   currentUser: current authenticated user
 *
 * Description: calculates salary bonus for each employee based in the data range coming in the payrollDto object,
 *              adding
 *
 */
export async function runPayrollCalculations(
  payrollDto: PayrollDto,
  reportService: ReportService,
  currentUser: Partial<User>,
) {
  let salaryMetrics: [] = await reportService.getEmployeesSalaryMetrics(
    currentUser,
    payrollDto.payPeriodStartedAt,
    payrollDto.payPeriodEndedAt,
    null,
  );

  console.log('salary report: ', salaryMetrics);

  let bonusAddon: PayAddon = {
    amount: 0,
    category: 'BONUS_SALE',
    description: 'Employee Monthly Sale Bonus',
    type: 'BONUS',
  };

  let reports = salaryMetrics.filter((employee) => employee);
  if (payrollDto.payStubs) {
    let stubs = payrollDto.payStubs.filter((payStub) => payStub);
    payrollDto.payStubs = stubs;
  } else {
    payrollDto.payStubs = [];
  }

  /* console.log('salary report: ', reports);
  console.log('payroll paystubs: ', stubs); */

  payrollDto.payStubs = payrollDto.payStubs.map((payStub) => {
    const employeeReport = reports.find(({ id }) => id === payStub.employee);

    let stub = { ...payStub };

    if (employeeReport) {
      /* console.log('hay reporte para ' + employeeReport['id']); */
      const saleBonusAddon = {
        ...bonusAddon,
        amount: employeeReport['bonus'] || 0,
      };
      stub.addons.push(saleBonusAddon) || 0;
      stub.totalSales = employeeReport['totalPremium'] || 0;
      stub.totalPermits = employeeReport['totalPermits'] || 0;
      stub.totalFees = employeeReport['totalFees'] || 0;
      stub.totalTips = employeeReport['totalTips'] || 0;
    } else {
      stub.totalSales = 0;
      stub.totalPermits = 0;
      stub.totalFees = 0;
      stub.totalTips = 0;
    }

    stub.totalBonus = payStub.addons.reduce(function (prev, cur) {
      return prev + (cur.type === ADDON_TYPE_BONUS ? cur.amount : 0);
    }, 0);

    stub.totalDiscount = payStub.addons.reduce(function (prev, cur) {
      return prev + (cur.type === ADDON_TYPE_DISCOUNT ? cur.amount : 0);
    }, 0);

    stub.totalReimbursement = payStub.addons.reduce(function (prev, cur) {
      return prev + (cur.type === ADDON_TYPE_REIMBURSEMENT ? cur.amount : 0);
    }, 0);

    stub.totalSalary =
      stub.payRate * stub.normalHoursWorked +
      stub.overtimeHoursWorked * stub.payRate * 1.5;

    stub.totalNetSalary =
      stub.totalSalary +
      stub.totalBonus +
      stub.totalReimbursement -
      stub.totalDiscount;

    /* console.log('PayStub: ', stub); */

    return stub;
  });

  return payrollDto;
}

export function getLastPayPeriod(payPeriodStartDay: number = 1) {
  const monthDiff = moment().date() >= payPeriodStartDay ? 0 : 1;

  return {
    start: moment()
      .subtract(monthDiff, 'month')
      .date(payPeriodStartDay)
      .startOf('day')
      .format('MM-DD-YYYY'),
    end: moment()
      .subtract(monthDiff + 1, 'month')
      .date(payPeriodStartDay - 1)
      .endOf('day')
      .format('MM-DD-YYYY'),
  };
}

export async function generateDefaultPayStubs(
  payroll: PayrollDto,
  userService: UserService,
): Promise<Partial<PayStub>[]> {
  const employees = await userService.findByLocation(payroll.location);

  let paystubs: Partial<PayStub>[] = [];

  if (employees.length) {
    paystubs = employees.map((employee) => {
      let paystub: Partial<PayStub> = {
        employee: (({ id, firstName, lastName }) => ({ id, firstName, lastName }))(employee),
        normalHoursWorked: 0,
        overtimeHoursWorked: 0,
        payRate: employee.employeeInfo.payRate,
      };

      paystub.addons = [
        {
          amount: 0,
          category: 'EMPLOYER_BONUS',
          description: '',
          type: 'BONUS',
        },
        {
          amount: 0,
          category: 'EMPLOYER_REIMBURSEMENT',
          description: '',
          type: 'REIMBURSEMENT',
        },
        {
          amount: 0,
          category: 'EMPLOYER_DISCOUNT',
          description: '',
          type: 'DISCOUNT',
        },
      ];

      return paystub;
    });
  }

  return paystubs;
}
