import isEqual from 'lodash/isEqual';
import fc from 'fast-check';

import { utils as u } from '@/plugins/utils/index.js';


describe('List sort functions', () => {
    test('List sort integers', () => {
        // Test point 1, ascending order
        {
            const ansAsc = [-100,-100,0,0,0,100,100]
            const testArr1 = [-100, 0, 100, 0, 0, 100, -100]
            const testArr1SortedAsc = u.ListSort(testArr1, item => item, true)
            expect(JSON.stringify(ansAsc)).toEqual(JSON.stringify(testArr1))
            expect(testArr1SortedAsc).toBeUndefined
        }

        // Test point 2, descending order
        {
            const ansDes = [100,100,0,0,0,-100,-100]
            const testArr2 = [-100, 0, 100, 0, 0, 100, -100]
            const testArr2SortedDes = u.ListSort(testArr2, item => item, false)
            expect(JSON.stringify(ansDes)).toEqual(JSON.stringify(testArr2))
            expect(testArr2SortedDes).toBeUndefined
        }
    });

    test('List sort integers', () => {
    // Test point 3, ascending order
        const obj1 = {name : "Zhang San", gender: "M"}
        const obj2 = {name : "Li Si", gender: "M"}
        const obj3 = {name : "Wang Wu", gender: "F"}

        // name ascending order
        const ansAsc = [obj2, obj3, obj1]
        const testArr1 = [obj1, obj2, obj3]
        u.ListSort(testArr1, item => item.name, true)
        expect(JSON.stringify(ansAsc)).toEqual(JSON.stringify(testArr1))
    });
});

describe('ListSort property-based check', () => {
    it('List sort idempotence', () => {
        fc.assert(
            fc.property(fc.array(fc.integer()), (arr) => {
                const arrCopy = JSON.parse(JSON.stringify(arr));
                return isEqual(u.ListSort(arr), u.ListSort(u.ListSort(arrCopy)));
            }),
        );
    });

    it('The minimum value of ListSort in ascending order is equal to element 0', () => {
        fc.assert(
            fc.property(fc.array(fc.integer(), { minLength: 1 }), (arr) => {
                u.ListSort(arr, item => item, true);
                return u.ListMin(arr) === arr[0];
            }),
        );
    });

    it('The maximum value of ListSort in descending order is equal to element 0', () => {
      fc.assert(
          fc.property(fc.array(fc.integer(), { minLength: 1 }), (arr) => {
              u.ListSort(arr, item => item, false);
              return u.ListMax(arr) === arr[0];
          }),
      );
  });
});
