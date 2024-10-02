import { utils as kubevueUtils } from '@/plugins/utils/index.js';

describe('Date and time formatting function', () => {
    const curTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (curTZ === 'Asia/Shanghai') {
        test('FormatDateTime, no time zone, compatibility test', () => {
            expect(kubevueUtils.FormatDateTime(new Date('2023-09-18T01:01:56Z'), 'yyyy-MM-dd HH:mm:ss', 'user'))
                .toBe('2023-09-18 09:01:56');
        });
    } else if (curTZ === 'America/New_York') {
        test('FormatDateTime, no time zone, compatibility test', () => {
            expect(kubevueUtils.FormatDateTime(new Date('2023-09-18T01:01:56Z'), 'yyyy-MM-dd HH:mm:ss', 'user'))
                .toBe('2023-09-17 21:01:56');
        });
    }

    test('FormatDateTime, time zone', () => {
        expect(kubevueUtils.FormatDateTime(new Date('2023-09-18T01:01:56Z'), 'yyyy-MM-dd HH:mm:ss', 'Asia/Shanghai'))
            .toBe('2023-09-18 09:01:56');
        expect(kubevueUtils.FormatDateTime(new Date('2023-09-18T01:01:56Z'), 'yyyy-MM-dd HH:mm:ss', 'America/New_York'))
            .toBe('2023-09-17 21:01:56');
    });
});
