import * as moment from 'moment';
import { DateRange } from 'shared/enum/date-range.enum';

export const DEFAULT_FORMAT = 'MM-DD-YYYY';

export function dateRangeByName(rangeName?: string, format?: string): any {

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

export function today(format: string): any {
    return {
        "start": moment().startOf('day').format(format ? format : this.DEFAULT_FORMAT),
        "end": moment().startOf('day').format(format ? format : this.DEFAULT_FORMAT)
    };
}

export function yesterday(format: string): any {
    return {
        "start": moment().startOf('day').subtract(1, 'day').format(format ? format : this.DEFAULT_FORMAT),
        "end": moment().startOf('day').subtract(1, 'day').format(format ? format : this.DEFAULT_FORMAT)
    };
}

export function weekToDate(format: string): any {
    return {
        "start": moment().startOf('week').format(format ? format : this.DEFAULT_FORMAT),
        "end": moment().format(format ? format : this.DEFAULT_FORMAT)
    };
}

export function lastWeek(format: string): any {
    return {
        "start": moment().startOf('week').subtract(1, 'week').format(format ? format : this.DEFAULT_FORMAT),
        "end": moment().endOf('week').subtract(1, 'week').endOf('week').format(format ? format : this.DEFAULT_FORMAT)
    };
}

export function monthToDate(format: string): any {
    return {
        "start": moment().startOf('month').format(format ? format : this.DEFAULT_FORMAT),
        "end": moment().format(format ? format : this.DEFAULT_FORMAT)
    };
}

export function lastMonth(format: string): any {
    return {
        "start": moment().startOf('month').subtract(1, 'month').format(format ? format : this.DEFAULT_FORMAT),
        "end": moment().endOf('month').subtract(1, 'month').endOf('month').format(format ? format : this.DEFAULT_FORMAT)
    };
}

export function quarterToDate(format: string): any {
    return {
        "start": moment().startOf('quarter').format(format ? format : this.DEFAULT_FORMAT),
        "end": moment().format(format ? format : this.DEFAULT_FORMAT)
    };
}


export function lastQuarter(format: string): any {
    return {
        "start": moment().startOf('quarter').subtract(1, 'quarter').format(format ? format : this.DEFAULT_FORMAT),
        "end": moment().endOf('quarter').subtract(1, 'quarter').endOf('quarter').format(format ? format : this.DEFAULT_FORMAT)
    };
}

export function yearToDate(format: string): any {
    return {
        "start": moment().startOf('year').format(format ? format : this.DEFAULT_FORMAT),
        "end": moment().format(format ? format : this.DEFAULT_FORMAT)
    };
}

export function lastYear(format: string): any {
    return {
        "start": moment().startOf('year').subtract(1, 'year').format(format ? format : this.DEFAULT_FORMAT),
        "end": moment().endOf('year').subtract(1, 'year').endOf('year').format(format ? format : this.DEFAULT_FORMAT),
    };
}