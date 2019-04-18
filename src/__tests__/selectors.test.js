/* eslint-disable import/no-unresolved */
import {
    createQuerySelector,
    createQueryResponseSelector,
    createQueryDataSelector,
    createQueryErrorSelector,
} from '../index.ts';

describe('createQuerySelector should', () => {
    const query = {};

    const state = {
        foo: {
            [JSON.stringify({x: 1, y: 2})]: query,
        },
    };

    test('get query by params', () => {
        const selector = createQuerySelector(state => state.foo, () => ({x: 1, y: 2}));

        expect(selector(state)).toBe(query);
    });

    test('params with keys in different order', () => {
        const selector = createQuerySelector(state => state.foo, () => ({y: 2, x: 1}));

        expect(selector(state)).toBe(query);
    });

    test('return undefined when not found', () => {
        const selector = createQuerySelector(state => state.foo, () => ({z: 3}));

        expect(selector(state)).toBeUndefined();
    });
});

describe('createQueryResponseSelector should', () => {
    const response = {};
    const query = {response};

    const state = {
        foo: {
            [JSON.stringify({x: 1, y: 2})]: query,
        },
    };

    test('get query by params', () => {
        const selector = createQueryResponseSelector(state => state.foo, () => ({x: 1, y: 2}));

        expect(selector(state)).toBe(response);
    });

    test('params with keys in different order', () => {
        const selector = createQueryResponseSelector(state => state.foo, () => ({y: 2, x: 1}));

        expect(selector(state)).toBe(response);
    });

    test('return undefined when not found', () => {
        const selector = createQueryResponseSelector(state => state.foo, () => ({z: 3}));

        expect(selector(state)).toBeUndefined();
    });
});

describe('createQueryDataSelector should', () => {
    const data = {};
    const response = {data};
    const query = {response};

    const state = {
        foo: {
            [JSON.stringify({x: 1, y: 2})]: query,
        },
    };

    test('get query by params', () => {
        const selector = createQueryDataSelector(state => state.foo, () => ({x: 1, y: 2}));

        expect(selector(state)).toBe(data);
    });

    test('params with keys in different order', () => {
        const selector = createQueryDataSelector(state => state.foo, () => ({y: 2, x: 1}));

        expect(selector(state)).toBe(data);
    });

    test('return undefined when not found', () => {
        const selector = createQueryDataSelector(state => state.foo, () => ({z: 3}));

        expect(selector(state)).toBeUndefined();
    });
});

describe('createQueryErrorSelector should', () => {
    const error = {};
    const response = {error};
    const query = {response};

    const state = {
        foo: {
            [JSON.stringify({x: 1, y: 2})]: query,
        },
    };

    test('get query by params', () => {
        const selector = createQueryErrorSelector(state => state.foo, () => ({x: 1, y: 2}));

        expect(selector(state)).toBe(error);
    });

    test('params with keys in different order', () => {
        const selector = createQueryErrorSelector(state => state.foo, () => ({y: 2, x: 1}));

        expect(selector(state)).toBe(error);
    });

    test('return undefined when not found', () => {
        const selector = createQueryErrorSelector(state => state.foo, () => ({z: 3}));

        expect(selector(state)).toBeUndefined();
    });
});
