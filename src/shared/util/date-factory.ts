import * as moment from 'moment';
import { DateRange } from 'shared/enum/date-range.enum';

export const DEFAULT_FORMAT: String = 'MM-DD-YYYY';

export function dateRangeByName(rangeName?: String, format?: String): Array<string> {

    switch (rangeName) {

        case DateRange.YESTERDAY:
            return this.yesterday(format);
        case DateRange.WEEK_TO_DATE:
            return this.weekToDate(format);
        case DateRange.LAST_WEEK:
            return this.lastWeek(format);
        case DateRange.MONTH_TO_DATE:
            return this.monthToDate(format);
        case DateRange.LAST_MONTH:
            return this.lastMonth(format);
        case DateRange.QUARTER_TO_DATE:
            return this.quarterToDate(format);
        case DateRange.LAST_QUARTER:
            return this.lastQuarter(format);
        case DateRange.YEAR_TO_DATE:
            return this.yearToDate(format);
        case DateRange.LAST_YEAR:
            return this.lastYear(format);
        case DateRange.TODAY:
        default:
            return this.today();
    }

}

export function today(format: String): Array<string> {
    return [
        moment().startOf('day').format(format ? format : this.DEFAULT_FORMAT),
        moment().startOf('day').format(format ? format : this.DEFAULT_FORMAT)
    ];
}

export function yesterday(format: String): Array<string> {
    return [
        moment().startOf('day').subtract(1, 'day').format(format ? format : this.DEFAULT_FORMAT),
        moment().startOf('day').subtract(1, 'day').format(format ? format : this.DEFAULT_FORMAT)
    ];
}

export function weekToDate(format: String): Array<string> {
    return [
        moment().startOf('week').format(format ? format : this.DEFAULT_FORMAT),
        moment().format(format ? format : this.DEFAULT_FORMAT)
    ];
}

export function lastWeek(format: String): Array<string> {
    return [
        moment().startOf('week').subtract(1, 'week').format(format ? format : this.DEFAULT_FORMAT),
        moment().endOf('week').subtract(1, 'week').endOf('week').format(format ? format : this.DEFAULT_FORMAT)
    ];
}

export function monthToDate(format: String): Array<string> {
    return [
        moment().startOf('month').format(format ? format : this.DEFAULT_FORMAT),
        moment().format(format ? format : this.DEFAULT_FORMAT)
    ];
}

export function lastMonth(format: String): Array<string> {
    return [
        moment().startOf('month').subtract(1, 'month').format(format ? format : this.DEFAULT_FORMAT),
        moment().endOf('month').subtract(1, 'month').endOf('month').format(format ? format : this.DEFAULT_FORMAT)
    ];
}

export function quarterToDate(format: String): Array<string> {
    return [
        moment().startOf('quarter').format(format ? format : this.DEFAULT_FORMAT),
        moment().format(format ? format : this.DEFAULT_FORMAT)
    ];
}


export function lastQuarter(format: String): Array<string> {
    return [
        moment().startOf('quarter').subtract(1, 'quarter').format(format ? format : this.DEFAULT_FORMAT),
        moment().endOf('quarter').subtract(1, 'quarter').endOf('quarter').format(format ? format : this.DEFAULT_FORMAT)
    ];
}

export function yearToDate(format: String): Array<string> {
    return [
        moment().startOf('year').format(format ? format : this.DEFAULT_FORMAT),
        moment().format(format ? format : this.DEFAULT_FORMAT)
    ];
}

export function lastYear(format: String): Array<string> {
    return [
        moment().startOf('year').subtract(1, 'year').format(format ? format : this.DEFAULT_FORMAT),
        moment().endOf('year').subtract(1, 'year').endOf('year').format(format ? format : this.DEFAULT_FORMAT),
    ];
}

export function printAllDateRanges() {

    // Yesterday
    console.log("yesterday", moment().startOf('day').subtract(1, 'day').format(this.DEFAULT_FORMAT), moment().startOf('day').subtract(1, 'day').format(this.DEFAULT_FORMAT));
    console.log("");

    // Week
    console.log("week", moment().startOf('week').format(this.DEFAULT_FORMAT), moment().endOf('week').format(this.DEFAULT_FORMAT));
    console.log("week-to-date", moment().startOf('week').format(this.DEFAULT_FORMAT), moment().format(this.DEFAULT_FORMAT));
    console.log("prior-week", moment().startOf('week').subtract(1, 'week').format(this.DEFAULT_FORMAT), moment().endOf('week').subtract(1, 'week').endOf('week').format(this.DEFAULT_FORMAT));
    console.log("prior-week-to-date", moment().startOf('week').subtract(1, 'week').format(this.DEFAULT_FORMAT), moment().subtract(1, 'week').format(this.DEFAULT_FORMAT));
    console.log("prior-year-week", moment().startOf('week').subtract(1, 'year').format(this.DEFAULT_FORMAT), moment().endOf('week').subtract(1, 'year').format(this.DEFAULT_FORMAT));
    console.log("prior-year-week-to-date", moment().startOf('week').subtract(1, 'year').format(this.DEFAULT_FORMAT), moment().subtract(1, 'year').format(this.DEFAULT_FORMAT));
    console.log("");

    // Months
    console.log("month", moment().startOf('month').format(this.DEFAULT_FORMAT), moment().endOf('month').format(this.DEFAULT_FORMAT));
    console.log("month-to-date", moment().startOf('month').format(this.DEFAULT_FORMAT), moment().format(this.DEFAULT_FORMAT));
    console.log("prior-month", moment().startOf('month').subtract(1, 'month').format(this.DEFAULT_FORMAT), moment().endOf('month').subtract(1, 'month').endOf('month').format(this.DEFAULT_FORMAT));
    console.log("prior-month-to-date", moment().startOf('month').subtract(1, 'month').format(this.DEFAULT_FORMAT), moment().subtract(1, 'month').format(this.DEFAULT_FORMAT));
    console.log("prior-year-month", moment().startOf('month').subtract(1, 'year').format(this.DEFAULT_FORMAT), moment().endOf('month').subtract(1, 'year').format(this.DEFAULT_FORMAT));
    console.log("prior-year-month-to-date", moment().startOf('month').subtract(1, 'year').format(this.DEFAULT_FORMAT), moment().subtract(1, 'year').format(this.DEFAULT_FORMAT));
    console.log("");

    // Quarters
    console.log("quarter", moment().startOf('quarter').format(this.DEFAULT_FORMAT), moment().endOf('quarter').format(this.DEFAULT_FORMAT));
    console.log("quarter-to-date", moment().startOf('quarter').format(this.DEFAULT_FORMAT), moment().format(this.DEFAULT_FORMAT));
    console.log("prior-quarter", moment().startOf('quarter').subtract(1, 'quarter').format(this.DEFAULT_FORMAT), moment().endOf('quarter').subtract(1, 'quarter').endOf('quarter').format(this.DEFAULT_FORMAT));
    console.log("prior-quarter-to-date", moment().startOf('quarter').subtract(1, 'quarter').format(this.DEFAULT_FORMAT), moment().subtract(1, 'quarter').format(this.DEFAULT_FORMAT));
    console.log("prior-year-quarter", moment().startOf('quarter').subtract(1, 'year').format(this.DEFAULT_FORMAT), moment().endOf('quarter').subtract(1, 'year').endOf('quarter').format(this.DEFAULT_FORMAT));
    console.log("prior-year-quarter-to-date", moment().startOf('quarter').subtract(1, 'year').format(this.DEFAULT_FORMAT), moment().subtract(1, 'year').format(this.DEFAULT_FORMAT));
    console.log("");

    // years
    console.log("year", moment().startOf('year').format(this.DEFAULT_FORMAT), moment().endOf('year').format(this.DEFAULT_FORMAT));
    console.log("year-to-date", moment().startOf('year').format(this.DEFAULT_FORMAT), moment().format(this.DEFAULT_FORMAT));
    console.log("prior-year", moment().startOf('year').subtract(1, 'year').format(this.DEFAULT_FORMAT), moment().endOf('year').subtract(1, 'year').endOf('year').format(this.DEFAULT_FORMAT));
    console.log("prior-year-to-date", moment().startOf('year').subtract(1, 'year').format(this.DEFAULT_FORMAT), moment().subtract(1, 'year').format(this.DEFAULT_FORMAT));
    console.log("");
}