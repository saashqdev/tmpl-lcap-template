import { utils as u } from '@/plugins/utils/index.js';



describe('ListFilter', () => {
    test('Compatibility test, raw numbers', () => {
        {
            const ansAsc = [100, 100];
            const testArr1 = [-100, 0, 100, 0, 0, 100, -100];
            expect(ansAsc).toEqual(u.ListFilter(testArr1, (item) => item > 50));
        }
    });

    test('Numeric wrapper class', () => {
        {
            const ansAsc = [100, 100];
            const testArr1 = [-100, 0, 100, 0, 0, 100, -100];
            expect(ansAsc).toEqual(u.ListFilter(testArr1, (item) => item > 50));
        }

        {
            const ansAsc = [100, 100.00];
            const testArr1 = [-100.0, 0.0, 100, 0.00, 0.0, 100.00, -100.0];
            expect(ansAsc).toEqual(u.ListFilter(testArr1, (item) => item > 50));
        }
    });

    test('Numeric packaging class 2', () => {
        const obj1 = { name: "Homer Simpson", gender: "M", age: 19 };
        const obj2 = { name: "Ned Flanders", gender: "M", age: 20 };
        const obj3 = { name: "Marge Simpson", gender: "F", age: 19 };

        {
            const ansAsc = [obj1, obj2];
            const testArr1 = [obj1, obj2, obj3];
            expect(ansAsc).toEqual(u.ListFilter(testArr1, (item) => item.gender === 'M'));
        }

        {
            const ansAsc = [obj2];
            const testArr1 = [obj1, obj2, obj3];
            expect(ansAsc).toEqual(u.ListFilter(testArr1, (item) => item.age > 19));
            expect(ansAsc).toEqual(u.ListFilter(testArr1, (item) => item.age > 19));
        }
    });
});
