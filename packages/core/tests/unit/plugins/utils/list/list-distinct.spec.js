import { utils as u } from '@/plugins/utils/index.js';



describe('ListDistinct', () => {
    test('Compatibility test, remove duplicate raw numbers', () => {
        {
            const ansAsc = [-100, 0, 100];
            const testArr1 = [-100, 0, 100, 0, 0, 100, -100];
            u.ListDistinct(testArr1);
            expect(ansAsc).toEqual(testArr1);
        }
    });

    test('Remove complex objects', () => {
        const obj1 = { name: "Zhang San", gender: "M", age: 18 };
        const obj2 = { name: "Li Si", gender: "M", age: 20 };
        const obj3 = { name: "Wang Wu", gender: "F", age: 19 };

        // name ascending order
        const ansAsc = [obj1, obj2, obj3];
        // TODO: Currently only supports deduplication by Reference memory address
        const testArr1 = [obj1, obj2, obj3, obj2];
        u.ListDistinct(testArr1);
        expect(ansAsc).toEqual(testArr1);
    });

    test('Remove duplicate string', () => {
        {
            const ansAsc = ['abc', 'ab'];
            const testArr1 = ['abc', 'ab', 'abc'];
            u.ListDistinct(testArr1);
            expect(ansAsc).toEqual(testArr1);
        }
    });
});

describe('ListDistinctBy', () => {
    test('Compatibility test, remove duplicate raw numbers', () => {
        {
            const ansAsc = [-100, 0, 100];
            const testArr1 = [-100, 0, 100, 0, 0, 100, -100];
            expect(ansAsc).toEqual(u.ListDistinctBy(testArr1, [(item) => item]));
        }
    });

    test('Remove complex objects', () => {
        const obj1 = { name: "Homer Simpson", gender: "M", age: 19 };
        const obj2 = { name: "Ned Flanders", gender: "M", age: 20 };
        const obj3 = { name: "Marge Simpson", gender: "F", age: 19 };

        {
            const ansAsc = [obj1, obj3];
            const testArr1 = [obj1, obj2, obj3];
            expect(ansAsc).toEqual(u.ListDistinctBy(testArr1, [(item) => item.gender]));
        }

        {
            const ansAsc = [obj1, obj2];
            const testArr1 = [obj1, obj2, obj3];
            expect(ansAsc).toEqual(u.ListDistinctBy(testArr1, [(item) => item.age]));
        }
    });
});
