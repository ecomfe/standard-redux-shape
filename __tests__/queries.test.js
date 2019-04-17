import {isFunction} from 'lodash';
import stringify from 'json-stable-stringify';
import {
    createQueryPayload,
    createQueryErrorPayload,
    reduceQueryBy,
    acceptLatest,
    keepEarliest,
    keepEarliestSuccess,
    acceptWhenNoPending,
} from '../src';
// types
const FETCH = 'FETCH';
const RECEIVE = 'RECEIVE';
const ACCEPT = 'ACCEPT';

describe('createQueryPayload should', () => {

    test('be existed', () => {
        expect(createQueryPayload).not.toBeUndefined();
        expect(createQueryPayload).not.toBeNull();
    });

    test('retun correct data', () => {
        const mockParams = {p: 1, q: 2};
        const mockData = {a: 1, b: 2};
        const now = Date.now();
        Date.now = jest.fn().mockReturnValue(now);

        const mockResult = {
            arrivedAt: now,
            params: {p: 1, q: 2},
            data: {a: 1, b: 2},
        };

        const result = createQueryPayload(mockParams, mockData);

        expect(result).toEqual(mockResult);
    });
});

describe('createQueryErrorPayload should', () => {

    test('be existed', () => {
        expect(createQueryErrorPayload).not.toBeUndefined();
        expect(createQueryErrorPayload).not.toBeNull();
    });

    test('retun error data', () => {
        const mockParams = {p: 1, q: 2};
        const mockError = {message: 'test message', a: 1, b: 2};
        const now = Date.now();
        Date.now = jest.fn().mockReturnValue(now);

        const mockResult = {
            arrivedAt: now,
            params: {p: 1, q: 2},
            error: {message: 'test message', a: 1, b: 2},
        };

        const result = createQueryErrorPayload(mockParams, mockError);

        expect(result).toEqual(mockResult);
    });
});

describe('reduceQueryBy should', () => {
    test('be in signature: a -> b', () => {
        expect(isFunction(reduceQueryBy())).toBe(true);
    });

    test('be in signature: a -> b -> c', () => {
        expect(isFunction(reduceQueryBy()())).toBe(true);
    });

    test('use default state and default action', () => {
        // Actions can not be undefined, otherwise stage will be 'receive',
        // due to queryStageMapping:
        // {undefined: 'fetch', undefined: 'receive', UNIQUE: 'accept'}.
        // Not sure this behavior is expected
        const reducer = reduceQueryBy()(FETCH, RECEIVE);
        const newState = reducer();
        expect(newState).toEqual({});
    });

    test('return state if stage not exist', () => {
        const state = {};
        const reducer = reduceQueryBy()(FETCH, RECEIVE);
        const newState = reducer(state, {type: 'UNKNOWN'});
        expect(newState).toBe(state);
    });

    test('pending when fetch with fresh state', () => {
        const state = {};

        const reduceState = s => s;
        const reducer = reduceQueryBy(reduceState)(FETCH, RECEIVE);

        const params = {animal: 'cat'};
        const action = {type: FETCH, payload: params};

        const newState = reducer(state, action);
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        });
    });

    test('pending increased when fetch again', () => {
        const params = {animal: 'dog'};
        const state = {
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        };

        const reduceState = s => s;
        const reducer = reduceQueryBy(reduceState)(FETCH, RECEIVE);

        const action = {type: FETCH, payload: params};

        const newState = reducer(state, action);

        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 2, params, response: null, nextResponse: null},
        });
    });

    test('accept after received', () => {
        const params = {animal: 'cat'};
        const payload = createQueryPayload(params, {say: 'meow'});
        const nextPayload = createQueryPayload(params, {say: 'woof'});

        const state = {
            [stringify(params)]: {pendingMutex: 0, params, response: payload, nextResponse: nextPayload},
        };

        const reducer = keepEarliest(FETCH, RECEIVE, ACCEPT);

        const action = {type: ACCEPT, payload: params};

        const newState = reducer(state, action);

        // if there is response, then always use the response
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 0, params, response: nextPayload, nextResponse: null},
        });
    });
});

describe('acceptLatest when', () => {
    test('fetch', () => {
        const state = {};

        const reducer = acceptLatest(FETCH, RECEIVE);

        const params = {animal: 'cat'};
        const action = {type: FETCH, payload: params};

        const newState = reducer(state, action);

        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        });
    });

    test('receive', () => {
        const params = {animal: 'cat'};
        const state = {
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        };

        const reducer = acceptLatest(FETCH, RECEIVE);

        const payload = createQueryPayload(params, {say: 'meow'});
        const action = {type: RECEIVE, payload};

        const newState = reducer(state, action);
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 0, params, response: payload, nextResponse: null},
        });
    });
});


describe('keepEarliest when', () => {
    test('fetch', () => {
        const state = {};

        const reducer = keepEarliest(FETCH, RECEIVE);

        const params = {animal: 'cat'};
        const action = {type: FETCH, payload: params};

        const newState = reducer(state, action);
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        });
    });

    test('first time receive', () => {
        const params = {animal: 'cat'};

        const state = {
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        };

        const reducer = keepEarliest(FETCH, RECEIVE);

        const payload = createQueryPayload(params, {say: 'meow'});
        const action = {type: RECEIVE, payload};

        const newState = reducer(state, action);
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 0, params, response: payload, nextResponse: null},
        });
    });

    test('further receive', () => {
        const params = {animal: 'cat'};
        const payload = createQueryPayload(params, {say: 'meow'});
        const nextPayload = createQueryPayload(params, {say: 'woof'});

        const state = {
            [stringify(params)]: {pendingMutex: 1, params, response: payload, nextResponse: nextPayload},
        };

        const reducer = keepEarliest(FETCH, RECEIVE);

        const action = {type: RECEIVE, payload};

        const newState = reducer(state, action);
        // if there is response, then always use the response
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 0, params, response: payload, nextResponse: payload},
        });
    });
});

describe('keepEarliestSuccess when', () => {
    test('fetch', () => {
        const state = {};

        const reducer = keepEarliestSuccess(FETCH, RECEIVE);

        const params = {animal: 'cat'};
        const action = {type: FETCH, payload: params};

        const newState = reducer(state, action);
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        });
    });

    test('receive success', () => {
        const params = {animal: 'cat'};

        const state = {
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        };

        const reducer = keepEarliestSuccess(FETCH, RECEIVE);
        const payload = createQueryPayload(params, {say: 'meow'});
        const action = {type: RECEIVE, payload};

        const newState = reducer(state, action);
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 0, params, response: payload, nextResponse: null},
        });
    });

    test('receive success after error', () => {
        const params = {animal: 'cat'};

        const errorResponse = createQueryErrorPayload(params, {say: 'meow'});
        const state = {
            [stringify(params)]: {pendingMutex: 1, params, response: errorResponse, nextResponse: null},
        };

        const reducer = keepEarliestSuccess(FETCH, RECEIVE);

        const payload = createQueryPayload(params, {say: 'meow'});
        const action = {type: RECEIVE, payload};

        const newState = reducer(state, action);
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 0, params, response: payload, nextResponse: null},
        });
    });
});

describe('acceptWhenNoPending', () => {
    test('fetch', () => {
        const state = {};

        const reducer = acceptWhenNoPending(FETCH, RECEIVE);

        const params = {animal: 'cat'};
        const action = {type: FETCH, payload: params};

        const newState = reducer(state, action);
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        });
    });

    test('should receive when no pending', () => {
        const params = {animal: 'cat'};

        const state = {
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        };

        const reducer = acceptWhenNoPending(FETCH, RECEIVE);
        const payload = createQueryPayload(params, {say: 'meow'});
        const action = {type: RECEIVE, payload};

        const newState = reducer(state, action);
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 0, params, response: payload, nextResponse: null},
        });
    });

    test('should not receive when has pending', () => {
        const params = {animal: 'cat'};

        const state = {
            [stringify(params)]: {pendingMutex: 2, params, response: null, nextResponse: null},
        };

        const reducer = acceptWhenNoPending(FETCH, RECEIVE);
        const payload = createQueryPayload(params, {say: 'meow'});
        const action = {type: RECEIVE, payload};

        const newState = reducer(state, action);
        expect(newState).toEqual({
            [stringify(params)]: {pendingMutex: 1, params, response: null, nextResponse: null},
        });
    });
});
