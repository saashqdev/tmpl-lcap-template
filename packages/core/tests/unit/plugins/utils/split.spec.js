import { utils as kubevueUtils } from '@/plugins/utils/index.js';


describe('Split function', () => {
    test('Split function retains the empty string at the end', () => {
        expect(kubevueUtils.Split('', '.', true))
            .toEqual(['']);
        expect(kubevueUtils.Split('', '', true))
            .toEqual([]);
        expect(kubevueUtils.Split('1.', '.', true))
            .toEqual(['1','']);
        expect(kubevueUtils.Split('1..', '.', true))
            .toEqual(['1','','']);
        expect(kubevueUtils.Split('1', '.', true))
            .toEqual(['1']);
    });

    test('Split function discards the empty string at the end', () => {
        expect(kubevueUtils.Split('', '.', false))
            .toEqual([]);
        expect(kubevueUtils.Split('', '', false))
            .toEqual([]);
        expect(kubevueUtils.Split('1.', '.', false))
            .toEqual(['1']);
        expect(kubevueUtils.Split('1..', '.', false))
            .toEqual(['1','']);
        expect(kubevueUtils.Split('1', '.', false))
            .toEqual(['1']);
    });
});
