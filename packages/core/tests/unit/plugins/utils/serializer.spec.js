import { utils as kubevueUtils } from '@/plugins/utils/index.js';
import momentTZ from 'moment-timezone';

describe('serialization function', () => {
    test('JSON serialization compatibility test, no time zone', () => {
        const cur = new Date('2023-09-21T09:01:56.000Z');
        //Existing display method of zero time zone
        expect(kubevueUtils.JsonSerialize(cur, 'UTC')).toBe('"2023-09-21T09:01:56.000Z"');
        // In the future, I want to use "+00:00" to display the zero time zone
        expect(kubevueUtils.JsonSerialize(cur, 'Etc/GMT')).toBe('"2023-09-21T09:01:56.000+00:00"');
    });

    test('JSON serialization compatibility test, no time zone 2, string input', () => {
        const cur = '2023-09-21T09:01:56Z';
        //Existing display method of zero time zone
        expect(kubevueUtils.JsonSerialize(cur, 'UTC')).toBe('"2023-09-21T09:01:56.000Z"');
        // In the future, I want to use "+00:00" to display the zero time zone
        expect(kubevueUtils.JsonSerialize(cur, 'Etc/GMT')).toBe('"2023-09-21T09:01:56.000+00:00"');
    });

    test('JSON serialization test with time zone', () => {
        {
            const summerTime1 = new Date('2016-03-13T07:00:01.000Z');
            expect(kubevueUtils.JsonSerialize(summerTime1, 'America/New_York'))
                .toBe('"2016-03-13T03:00:01.000-04:00"');
            expect(kubevueUtils.JsonSerialize(summerTime1, 'Asia/Shanghai'))
                .toBe('"2016-03-13T15:00:01.000+08:00"');
        }

        {
            const noSummerTime1 = new Date('2016-03-13T06:59:59.000Z');
            expect(kubevueUtils.JsonSerialize(noSummerTime1, 'America/New_York'))
                .toBe('"2016-03-13T01:59:59.000-05:00"');
            expect(kubevueUtils.JsonSerialize(noSummerTime1, 'Asia/Shanghai'))
                .toBe('"2016-03-13T14:59:59.000+08:00"');
        }
    });

    test('JSON serialization test, time zone 2, string input', () => {
        {
            const summerTime1 = '2016-03-13T07:00:01.000Z';
            expect(kubevueUtils.JsonSerialize(summerTime1, 'America/New_York'))
                .toBe('"2016-03-13T03:00:01.000-04:00"');
            expect(kubevueUtils.JsonSerialize(summerTime1, 'Asia/Shanghai'))
                .toBe('"2016-03-13T15:00:01.000+08:00"');
        }

        {
            const noSummerTime1 = '2016-03-13T06:59:59Z';
            expect(kubevueUtils.JsonSerialize(noSummerTime1, 'America/New_York'))
                .toBe('"2016-03-13T01:59:59.000-05:00"');
            expect(kubevueUtils.JsonSerialize(noSummerTime1, 'Asia/Shanghai'))
                .toBe('"2016-03-13T14:59:59.000+08:00"');
        }
    });

    test('ToString compatibility test', () => {
        const curTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const cur = new Date('2023-09-21T17:01:56+08:00');
        expect(kubevueUtils.ToString('nasl.core.DateTime', cur))
            .toBe(momentTZ.tz('2023-09-21T17:01:56+08:00', curTZ).format('YYYY-MM-DD HH:mm:ss'));
    });

    test('ToString compatibility test 2, string input', () => {
        const curTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const cur = '2023-09-21T17:01:56+08:00';
        expect(kubevueUtils.ToString('nasl.core.DateTime', cur))
            .toBe(momentTZ.tz('2023-09-21T17:01:56+08:00', curTZ).format('YYYY-MM-DD HH:mm:ss'));
    });

    test('ToString time zone format test', () => {
        {
            const summerTime1 = new Date('2016-03-13T07:00:01Z');
            expect(kubevueUtils.ToString('nasl.core.DateTime', summerTime1, 'America/New_York'))
                .toBe('2016-03-13 03:00:01');
            expect(kubevueUtils.ToString('nasl.core.DateTime', summerTime1, 'Asia/Shanghai'))
                .toBe('2016-03-13 15:00:01');
        }

        {
            const noSummerTime1 = new Date('2016-03-13T06:59:59Z');
            expect(kubevueUtils.ToString('nasl.core.DateTime', noSummerTime1, 'America/New_York'))
                .toBe('2016-03-13 01:59:59');
            expect(kubevueUtils.ToString('nasl.core.DateTime', noSummerTime1, 'Asia/Shanghai'))
                .toBe('2016-03-13 14:59:59');
        }

        {
            expect(kubevueUtils.ToString('nasl.core.Time', '01:59:59'))
                .toBe('01:59:59');
            expect(kubevueUtils.ToString('nasl.core.Time', '14:59:59'))
                .toBe('14:59:59');
        }

        {
            expect(kubevueUtils.ToString('nasl.core.Time', '2016-03-13 01:59:59'))
                .toBe('01:59:59');
            expect(kubevueUtils.ToString('nasl.core.Time', '2016-03-13 14:59:59'))
                .toBe('14:59:59');
        }
    });

    test('ToString time zone format test 2, string input', () => {
        {
            const summerTime1 = '2016-03-13T07:00:01Z';
            expect(kubevueUtils.ToString('nasl.core.DateTime', summerTime1, 'America/New_York'))
                .toBe('2016-03-13 03:00:01');
            expect(kubevueUtils.ToString('nasl.core.DateTime', summerTime1, 'Asia/Shanghai'))
                .toBe('2016-03-13 15:00:01');
        }

        {
            const noSummerTime1 = '2016-03-13T06:59:59Z';
            expect(kubevueUtils.ToString('nasl.core.DateTime', noSummerTime1, 'America/New_York'))
                .toBe('2016-03-13 01:59:59');
            expect(kubevueUtils.ToString('nasl.core.DateTime', noSummerTime1, 'Asia/Shanghai'))
                .toBe('2016-03-13 14:59:59');
        }
    });
});
