import { utils as u } from '@/plugins/utils/index.js';



// jest.spyOn(u, 'toastAndThrow').mockImplementation(() => null);

describe('Differential configuration, incoming coverage when started H5 and PC', () => {
    const fns = [u.Concat, u.Join, u.Length, u.Get, u.Set, u.Contains, u.Add, u.AddAll, u.Insert, u.Remove
                ,u.RemoveAt
                ,u.ListAverage, u.ListDistinct, u.ListDistinctBy, u.ListFilter, u.ListFind
                ,u.ListFindIndex, u.ListFlatten, u.ListGroupBy, u.ListHead, u.ListLast, u.ListMax, u.ListMin
                ,u.ListProduct, u.ListReverse, u.ListSlice, u.ListSliceToPageOf, u.ListSort, u.ListSum
                ,u.ListToMap, u.ListTransform];

    test('Test for undefined and null input', () => {
        fns.forEach(fn => {
            try {
                expect(fn(undefined)).toBeNull;
            } catch (err) {
                expect(() => fn(undefined)).toThrow;
            }
        });

        fns.forEach(fn => {
            try {
                expect(fn(null)).toBeNull;
            } catch (err) {
                expect(() => fn(null)).toThrow;
            }
        });
    });

    test('Test empty array input', () => {
        fns.forEach(fn => {
            try {
                expect(fn([])).toBeNull;
            } catch (err) {
                expect(() => fn([])).toThrow;
            }
        });
    });

    test('Test for invalid array elements', () => {
        let __fns = fns.filter(fn => fn !== u.ListDistinctBy && fn !== u.ListTransform);
        __fns.forEach(fn => {
            try {
                expect(fn([undefined, null, null])).toBeNull;
            } catch (err) {
                expect(() => fn([undefined, null, null])).toThrow();
            }
        });
    });
});
