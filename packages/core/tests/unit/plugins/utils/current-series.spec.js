import { utils as kubevueUtils } from '@/plugins/utils/index.js';
const momentTZ = require('moment-timezone');
const moment = require('moment');



describe('Current date and time series function', () => {
    test('CurrentDateTime', () => {
        // -11:00
        const aDateTime = kubevueUtils.FormatDateTime(kubevueUtils.CurrDateTime('noUse'), 'yyyy-MM-dd HH:mm:ss', 'Pacific/Midway');
        // +14:00
        const bDateTime = kubevueUtils.FormatDateTime(kubevueUtils.CurrDateTime('noUse'), 'yyyy-MM-dd HH:mm:ss', 'Pacific/Kiritimati');
        expect(kubevueUtils.DateDiff(new Date(bDateTime), new Date(aDateTime), 'h', false)).toBe(-25);
        expect(kubevueUtils.DateDiff(new Date(bDateTime), new Date(aDateTime), 'h')).toBe(25);

        const utcDate = momentTZ.tz(new Date(), 'UTC');
        const cDate = kubevueUtils.CurrDateTime('noUse');
        if (utcDate.hours() > 10) {
            // Possible spans of months: -30, -29, -28, -27
            expect([1, -30, -29, -28]).toContain(momentTZ.tz(cDate, 'Pacific/Kiritimati').date() - utcDate.date());
        } else {
            // Possibly across months
            expect([-1, 30, 29, 28, 27]).toContain(momentTZ.tz(cDate, 'Pacific/Midway').date() - utcDate.date());
        }
    });

    test('CurrentDate', () => {
        // - 11:00
        const aDate = kubevueUtils.CurrDate('Pacific/Midway');
        const a = momentTZ.tz(aDate, 'YYYY-MM-DD', 'Pacific/Midway').date();

        // +14:00
        const bDate = kubevueUtils.CurrDate('Pacific/Kiritimati');
        const b = momentTZ.tz(bDate, 'YYYY-MM-DD', 'Pacific/Kiritimati').date();

        if (b - a > 0) {
            expect([2, 1]).toContain(b - a);
        } else {
            // It is a negative number after crossing the month
            expect([-27, -28, -29, -30]).toContain(b - a);
        }

    });

    test('CurrentTime', () => {
        const nycTime = kubevueUtils.CurrTime('Etc/GMT+4');
        const a = momentTZ.tz(nycTime, 'HH:mm:ss', 'Etc/GMT+4').hours();

        const shTime = kubevueUtils.CurrTime('America/Toronto');
        const b = momentTZ.tz(shTime, 'HH:mm:ss', 'America/Toronto').hours();

        const utcTime = kubevueUtils.CurrTime('UTC');
        const c = momentTZ.tz(utcTime, 'HH:mm:ss', 'UTC').hours();

        expect([12, -12]).toContain(b - a);
        expect([8, -16]).toContain(b - c);
        expect([4, -20]).toContain(c - a);
    });
});
