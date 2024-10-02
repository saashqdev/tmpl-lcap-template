import { utils as kubevueUtils } from '@/plugins/utils/index.js';
import momentTZ from 'moment-timezone';



describe('Convert function', () => {
    test('Convert function, string to string', () => {

    });

    test('Convert function, string to Integer', () => {
        expect(kubevueUtils.Convert('123.4', { typeKind: 'primitive', typeName: 'Long' }))
            .toBe(123);
        expect(kubevueUtils.Convert('1234.5', { typeKind: 'primitive', typeName: 'Long' }))
            .toBe(1235);
    });

    test('Convert function, string to Decimal', () => {
        expect(kubevueUtils.Convert('123.4', { typeKind: 'primitive', typeName: 'Decimal' }))
            .toBe(123.4);
        expect(kubevueUtils.Convert('1.01', { typeKind: 'primitive', typeName: 'Decimal' }))
            .toBe(1.01);
    });
//      test('Convert function, string to DateTime', () => {
//         const str = '2023-09-09 11:00:00';

//         expect(kubevueUtils.Convert(str, { typeKind: 'primitive', typeName: 'DateTime' }))
//             .toBe('2023-09-09T11:00:00+08:00');

//         expect(kubevueUtils.ToString('nasl.core.DateTime',
//                 kubevueUtils.Convert(str, { typeKind: 'primitive', typeName: 'DateTime' })))
//             .toBe('2023-09-09 11:00:00');
//      });

//      test('Convert function, string to Date', () => {
//      const str = '2023-09-09 11:00:00';

//      expect(kubevueUtils.Convert(str, { typeKind: 'primitive', typeName: 'Date' }))
//      .toBe('2023-09-09');

//      expect(kubevueUtils.ToString('nasl.core.Date',
//      kubevueUtils.Convert(str, { typeKind: 'primitive', typeName: 'Date' })))
//      .toBe('2023-09-09');
//      });

//      test('Convert function, string to Time', () => {
//         const str = '2023-09-09 11:00:00';

//         expect(kubevueUtils.Convert(str, { typeKind: 'primitive', typeName: 'Time' }))
//             .toBe('11:00:00');

//         expect(kubevueUtils.ToString('nasl.core.Time',
//                 kubevueUtils.Convert(str, { typeKind: 'primitive', typeName: 'Time' })))
//             .toBe('11:00:00');
//      });
});
