import { utils as u, convertJSDateInTargetTimeZone } from '@/plugins/utils/index.js';

describe('Date and time formatting helper functions', () => {
    test('convertJSDateInTargetTimeZone', () => {
        const dateStr1 = '2000-10-10 10:11:12'
        const dateStr2 = '2000-10-10 10:11:12.123'
        const dateStr3 = '2000/10/10 10:11:12'
        const dateStr4 = '2000/10/10 10:11:12.123'
        const curTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

        expect(['Invalid Date', 'Invalid time value', 'invalid date'].includes(
            convertJSDateInTargetTimeZone(dateStr1, curTZ).toString())).toBe(false);
        expect(['Invalid Date', 'Invalid time value', 'invalid date'].includes(
            convertJSDateInTargetTimeZone(dateStr2, curTZ).toString())).toBe(false);
        expect(['Invalid Date', 'Invalid time value', 'invalid date'].includes(
            convertJSDateInTargetTimeZone(dateStr3, curTZ).toString())).toBe(false);
        expect(['Invalid Date', 'Invalid time value', 'invalid date'].includes(
            convertJSDateInTargetTimeZone(dateStr4, curTZ).toString())).toBe(false);
    });
});
