import { PayrollDto } from 'business/payroll/dto/payroll.dto';
import { ReportService } from 'insurance/report/report.service';
import { PayAddon } from 'business/sub-docs/pay-addon';
import { User } from 'database/user.model';
import * as moment from 'moment';
import { PayStub, PayStubSchema } from 'business/sub-docs/pay-stub';
import { UserService } from 'user/user.service';

const ADDON_TYPE_DISCOUNT = 'DISCOUNT';
const ADDON_TYPE_BONUS = 'BONUS';
const ADDON_TYPE_REIMBURSEMENT = 'REIMBURSEMENT';
const ADDON_CATEGORY_SALES_BONUS = 'BONUS_SALE';

const DEFAULT_SALE_BONUS_ADDON = {
  amount: 0,
  category: 'BONUS_SALE',
  description: 'Employee Monthly Sale Bonus',
  type: 'BONUS',
};

const DEFAULT_STUB_METRICS = {
  totalSales: 0,
  totalPermits: 0,
  totalFees: 0,
  totalTips: 0,
  totalSaleBonus: 0,
};

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
  resetPayrollAggregators(payrollDto);

  let salaryMetrics: [] = await reportService.getEmployeesSalaryMetrics(
    currentUser,
    payrollDto.payPeriodStartedAt,
    payrollDto.payPeriodEndedAt,
    null,
  );

  removeInvalidPayStubs();
  let reports = salaryMetrics.filter((employee) => employee);

  payrollDto.payStubs = payrollDto.payStubs.map((payStub) => {
    const employeeReport = reports.find(({ id }) => id === payStub.employee);

    let stub = {
      ...payStub,
      ...DEFAULT_STUB_METRICS,
    };

    
    if (employeeReport) {
      const saleBonusAddon = {
        ...DEFAULT_SALE_BONUS_ADDON,
        amount: employeeReport['salesBonus'] || 0,
      };

      stub.addons
        .filter((addon) => addon.category !== ADDON_CATEGORY_SALES_BONUS)
        .push(saleBonusAddon);

      stub.totalSaleBonus = employeeReport['salesBonus'] || 0;
      stub.totalSales = employeeReport['premium'] || 0;
      stub.totalPermits = employeeReport['permits'] || 0;
      stub.totalFees = employeeReport['fees'] || 0;
      stub.totalTips = employeeReport['tips'] || 0;
    }

    stub.totalExtraBonus = calculatePayStubTotalExtraBonus(payStub);
    stub.totalDiscount = calculatePayStubTotalDiscount(payStub);
    stub.totalReimbursement = calculatePayStubTotalReimbursement(payStub);
    stub.totalRegularSalary = calculateTotalRegularSalary(stub);
    stub.totalNetSalary = calculateTotalNetSalary(stub);

    updatePayrollAggregators(payrollDto, stub);

    console.log(stub);

    return stub;
  });

  //console.log(payrollDto);
  return payrollDto;

  function removeInvalidPayStubs() {
    if (payrollDto.payStubs) {
      let stubs = payrollDto.payStubs.filter((payStub) => payStub);
      payrollDto.payStubs = stubs;
    } else {
      payrollDto.payStubs = [];
    }
  }
}

function resetPayrollAggregators(payrollDto: PayrollDto) {
  payrollDto.totalSaleBonus = 0;
  payrollDto.totalSales = 0;
  payrollDto.totalPermits = 0;
  payrollDto.totalFees = 0;
  payrollDto.totalTips = 0;
  payrollDto.totalExtraBonus = 0;
  payrollDto.totalDiscount = 0;
  payrollDto.totalReimbursement = 0;
  payrollDto.totalRegularSalary = 0;
  payrollDto.totalNetSalary = 0;
}

function updatePayrollAggregators(
  payrollDto: PayrollDto,
  stub: Partial<PayStub>,
) {
  payrollDto.totalSaleBonus += stub.totalSaleBonus || 0;
  payrollDto.totalSales += stub.totalSales || 0;
  payrollDto.totalPermits += stub.totalPermits || 0;
  payrollDto.totalFees += stub.totalFees || 0;
  payrollDto.totalTips += stub.totalTips || 0;
  payrollDto.totalExtraBonus += stub.totalExtraBonus || 0;
  payrollDto.totalDiscount += stub.totalDiscount || 0;
  payrollDto.totalReimbursement += stub.totalReimbursement || 0;
  payrollDto.totalRegularSalary += stub.totalRegularSalary || 0;
  payrollDto.totalNetSalary += stub.totalNetSalary || 0;
}

function calculateTotalNetSalary(stub: Partial<PayStub>): number {
  return (
    stub.totalRegularSalary +
    stub.totalSaleBonus +
    stub.totalExtraBonus +
    stub.totalReimbursement -
    stub.totalDiscount +
    stub.totalTips
  );
}

function calculateTotalRegularSalary(stub: Partial<PayStub>): number {
  return (
    stub.payRate * (stub.normalHoursWorked || 0) +
    (stub.overtimeHoursWorked || 0) * stub.payRate * 1.5
  );
}

function calculatePayStubTotalReimbursement(payStub: Partial<PayStub>): number {
  return payStub.addons.reduce(function (prev, cur) {
    return prev + (cur.type === ADDON_TYPE_REIMBURSEMENT ? cur.amount : 0);
  }, 0);
}

function calculatePayStubTotalDiscount(payStub: Partial<PayStub>): number {
  return payStub.addons.reduce(function (prev, cur) {
    return prev + (cur.type === ADDON_TYPE_DISCOUNT ? cur.amount : 0);
  }, 0);
}

function calculatePayStubTotalExtraBonus(payStub: Partial<PayStub>): number {
  return payStub.addons.reduce(function (prev, cur) {
    return (
      prev +
      (cur.type === ADDON_TYPE_BONUS &&
      cur.category !== ADDON_CATEGORY_SALES_BONUS
        ? cur.amount
        : 0)
    );
  }, 0);
}

export function getLastPayPeriod(payPeriodStartDay: number = 1) {
  const monthDiff = moment().date() >= payPeriodStartDay ? 0 : 1;

  return {
    start: new Date(
      moment()
        .subtract(monthDiff + 1, 'month')
        .date(payPeriodStartDay)
        .startOf('day')
        .toISOString(),
    ),
    end: new Date(
      moment()
        .subtract(monthDiff, 'month')
        .date(payPeriodStartDay - 1)
        .endOf('day')
        .toISOString(),
    ),
  };
}

export async function generateDefaultPayStubs(
  payroll: PayrollDto,
  userService: UserService,
): Promise<PayStub[]> {
  const employees = await userService.findByLocation(payroll.location);

  let paystubs: PayStub[] = [];

  if (employees.length) {
    paystubs = employees.map((employee) => {
      let paystub: PayStub = {
        employeeName: (({ id, firstName, lastName }) =>
          `${firstName} ${lastName}`)(employee),
        employee: employee.id,
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
