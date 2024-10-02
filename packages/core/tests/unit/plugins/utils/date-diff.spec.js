import { utils as cwUtils } from '@/plugins/utils/index.js';


describe('Date interpolation DateDiff', () => {

    test('DateDiff by month', () => {
        expect(cwUtils.DateDiff('2023-01-31', '2023-04-05', 'M')).toBe(2);
    });

    test('DateDiff by day', () => {
        expect(cwUtils.DateDiff('2022-12-31', '2023-01-01', 'd')).toBe(1);
    });

    test('DateDiff by day', () => {
        expect(cwUtils.DateDiff('2022-12-31 00:00:01', '2023-01-01 00:00:00', 'd')).toBe(0);
    });

    test('DateDiff by day', () => {
        expect(cwUtils.DateDiff('2022-12-31 00:00:01', '2023-01-01 00:00:01', 'd')).toBe(1);
    });
});
