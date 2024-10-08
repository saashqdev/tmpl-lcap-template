import { utils as u } from '@/plugins/utils/index.js';



describe('Map Test', () => {
    test('MapGet MapPut', () => {
        {
            const testMap = { };
            u.MapPut(testMap, 1.0, '123');
            u.MapPut(testMap, 1.00, '456');
            expect(u.Length(testMap)).toBe(1);
            expect(u.MapGet(testMap, 1)).toBe('456');
        }
    });
});
