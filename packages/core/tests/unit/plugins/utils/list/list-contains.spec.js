import fc from 'fast-check';

import { utils as u } from '@/plugins/utils/index.js';



describe('Test List Contains', () => {
    test('Test abnormal input', () => {
        expect(u.Contains(undefined, 1)).toBe(false);
        expect(u.Contains(null, 1)).toBe(false);
        expect(u.Contains([], 1)).toBe(false);
        expect(u.Contains([undefined, null], 1)).toBe(false);
    });

    test('Normal input', () => {
        const list = [1, 4, null, -2, null, undefined];

        expect(u.Contains(list, 1)).toBe(true);
        expect(u.Contains(list, 4)).toBe(true);
        expect(u.Contains(list, -2)).toBe(true);
        expect(u.Contains(list, 3)).toBe(false);
        expect(u.Contains(list, null)).toBe(true);
        expect(u.Contains(list, undefined)).toBe(true);
    });

    test('Normal input string', () => {
        const list = ['1', '4', null, '-2', null, undefined];

        expect(u.Contains(list, '1')).toBe(true);
        expect(u.Contains(list, '4')).toBe(true);
        expect(u.Contains(list, '-2')).toBe(true);
        expect(u.Contains(list, '3')).toBe(false);
        expect(u.Contains(list, null)).toBe(true);
        expect(u.Contains(list, undefined)).toBe(true);
    });
});

describe('ListContains property-based check', () => {
    it('ListContains always contains element 0 and the last element', () => {
        fc.assert(
            fc.property(fc.array(fc.integer(), { minLength: 1 }), (list) =>
                u.Contains(list, list[0]) && u.Contains(list, list[list.length - 1])),
        );
    });
});
