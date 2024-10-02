import { utils as kubevueUtils } from '@/plugins/utils/index.js';



describe('Date time counting function', () => {
    test('Revise the calendar for the Emperor and QA, a new calendar', () => {
        expect(kubevueUtils.GetDateCount('2024-06-01', 'week-month')).toBe(1);
        expect(kubevueUtils.GetDateCount('2024-06-02', 'week-month')).toBe(1);
        expect(kubevueUtils.GetDateCount('2024-06-03', 'week-month')).toBe(2);
        expect(kubevueUtils.GetDateCount('2024-06-24', 'week-month')).toBe(5);
        expect(kubevueUtils.GetDateCount('2024-06-30', 'week-month')).toBe(5);
    });

    test('Revise the calendar for the Emperor and QA, the old calendar', () => {
        expect(kubevueUtils.GetDateCountOld('2024-06-01', 'week-month')).toBe(1);
        expect(kubevueUtils.GetDateCountOld('2024-06-02', 'week-month')).toBe(2);
        expect(kubevueUtils.GetDateCountOld('2024-06-03', 'week-month')).toBe(2);
        expect(kubevueUtils.GetDateCountOld('2024-06-24', 'week-month')).toBe(5);
        expect(kubevueUtils.GetDateCountOld('2024-06-30', 'week-month')).toBe(6);
    });

    test('GetDateCount, Date type, no time zone information, compatibility test', () => {
        expect(kubevueUtils.GetDateCount('2023-09-21', 'day-month')).toBe(21);
        expect(kubevueUtils.GetDateCount('2023-09-21', 'day-week')).toBe(4);
    });

    test('GetDateCount, DateTime type, time zone information', () => {
        const d1 = new Date('2023-09-21T01:01:56.000Z');
        expect(kubevueUtils.GetDateCount(d1, 'day-month', 'Asia/Shanghai')).toBe(21);
        expect(kubevueUtils.GetDateCount(d1, 'day-month', 'America/New_York')).toBe(20);
        expect(kubevueUtils.GetDateCount(d1, 'day-week', 'Asia/Shanghai')).toBe(4);
        expect(kubevueUtils.GetDateCount(d1, 'day-week', 'America/New_York')).toBe(3);
    });

    test('GetDateCount, DateTime type, time zone information, string input', () => {
        const d1 = '2023-09-21T01:01:56.000Z';
        expect(kubevueUtils.GetDateCount(d1, 'day-month', 'Asia/Shanghai')).toBe(21);
        expect(kubevueUtils.GetDateCount(d1, 'day-month', 'America/New_York')).toBe(20);
        expect(kubevueUtils.GetDateCount(d1, 'day-week', 'Asia/Shanghai')).toBe(4);
        expect(kubevueUtils.GetDateCount(d1, 'day-week', 'America/New_York')).toBe(3);
    });

    test('GetSpecificDaysOfWeek, Date type, no time zone information, compatibility test', () => {
        expect(kubevueUtils.GetSpecificDaysOfWeek('2023-09-18', '2023-09-24', [1, 7, 8]))
            .toEqual(['2023-09-18', '2023-09-24']);
    });

    test('GetSpecificDaysOfWeek, DateTime type, time zone information', () => {
        const d1 = new Date('2023-09-18T01:01:56.000Z');
        const d2 = new Date('2023-09-24T01:01:56.000Z');

        expect(kubevueUtils.GetSpecificDaysOfWeek(d1, d2, [1, 7, 8], 'Asia/Shanghai'))
            .toEqual(['2023-09-18 00:00:00', '2023-09-24 00:00:00']); // Shanghai time is from the 18th to the 24th

        expect(kubevueUtils.GetSpecificDaysOfWeek(d1, d2, [1, 7, 8], 'America/New_York'))
            .toEqual(['2023-09-17 00:00:00', '2023-09-18 00:00:00']); // New York time is from the 17th to the 23rd
    });

    test('GetSpecificDaysOfWeek, DateTime type, time zone information 2, string input', () => {
        const d1 = '2023-09-18T01:01:56.000Z';
        const d2 = '2023-09-24T01:01:56.000Z';

        expect(kubevueUtils.GetSpecificDaysOfWeek(d1, d2, [1, 7, 8], 'Asia/Shanghai'))
            .toEqual(['2023-09-18 00:00:00', '2023-09-24 00:00:00']); // Shanghai time is from the 18th to the 24th

        expect(kubevueUtils.GetSpecificDaysOfWeek(d1, d2, [1, 7, 8], 'America/New_York'))
            .toEqual(['2023-09-17 00:00:00', '2023-09-18 00:00:00']); // New York time is from the 17th to the 23rd
    });
});
