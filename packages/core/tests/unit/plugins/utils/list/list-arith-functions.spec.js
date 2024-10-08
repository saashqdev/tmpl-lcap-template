import { utils } from '@/plugins/utils/index.js';



describe('List arithmetic (aggregation) functions', () => {
    const fns = [utils.ListMax, utils.ListMin, utils.ListSum, utils.ListProduct, utils.ListAverage];
    test('Test abnormal input', () => {
        fns.forEach(fn => {
            expect(fn(undefined)).toBeNull;
        });

        fns.forEach(fn => {
            expect(fn(null)).toBeNull;
        });

        fns.forEach(fn => {
            expect(fn([])).toBeNull;
        });

        fns.forEach(fn => {
            expect(fn([undefined, null, null])).toBeNull;
        });
    });

    test('Test normal input', () => {
        {
            const list = [1, 4, null, -2, null];

            expect(utils.ListMax(list)).toBe(4);
            expect(utils.ListMin(list)).toBe(-2);
            expect(utils.ListAverage(list)).toBe(1);
            expect(utils.ListProduct(list)).toBe(-8);
            expect(utils.ListSum(list)).toBe(3);
        }

        {
            const list = [1, 4, null, -2, null];
            expect(utils.ListMax(list)).toBe(4);
            expect(utils.ListMin(list)).toBe(-2);
            expect(utils.ListAverage(list)).toBe(1);
            expect(utils.ListProduct(list)).toBe(-8);
            expect(utils.ListSum(list)).toBe(3);
        }

        {
            const list = ['123', 'abc', 'abb'];
            expect(utils.ListMax(list)).toBe('abc');
            expect(utils.ListMin(list)).toBe('123');
        }

        {
            const list = ['111', 'aa', 'ab'];
            expect(utils.ListMax(list)).toBe('ab');
            expect(utils.ListMin(list)).toBe('111');
        }
    });

    test('Test numerical accuracy', () => {
        const list = [undefined, 0.8, 1.2, null, null];

        expect(utils.ListSum(list)).toBe(2.0);
        expect(utils.ListProduct(list)).toBe(0.96);
        expect(utils.ListAverage(list)).toBe(1.0);

        const list2 = ['1.2', '2.4', '6.4'];
        expect(utils.ListSum(list2)).toBe(10.0);
    });

    test('Use case given by QA', () => {
        expect(utils.ListMax([-1.1, null, null, -2.2])).toBe(-1.1);
        expect(utils.ListAverage([null, 1.5, 2.5, 3.5])).toBe(2.5);
        expect(utils.ListAverage([-1.1, null, null, -2.2])).toBe(-1.65);
        expect(utils.ListProduct([-1.1, null, null, -2.2])).toBe(2.42);
        expect(utils.ListAverage([0.2, 0.2, 0.2, null, null])).toBe(0.2);
    });
});
