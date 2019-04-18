import {createQuerySelector} from '../src';

describe('createQuerySelector should', () => {
    const query = {};

    const state = {
        foo: {
            [JSON.stringify({x: 1, y: 2})]: query
        }
    };

    test('get query by params', () => {
        const selector = createQuerySelector(
            state => state.foo,
            () => ({x: 1, y: 2})
        );

        expect(selector(state)).toBe(query);
    });

    test('params with keys in different order', () => {
        const selector = createQuerySelector(
            state => state.foo,
            () => ({y: 2, x: 1})
        );

        expect(selector(state)).toBe(query);
    });

    test('return undefined when not found', () => {
        const selector = createQuerySelector(
            state => state.foo,
            () => ({z: 3})
        );

        expect(selector(state)).toBeUndefined();
    });
});
