import {
    acceptLatest,
    keepEarliest,
    keepEarliestSuccess,
    acceptWhenNoPending
} from '../src';

describe('acceptLatest', () => {
    const FETCH_TYPE = 'FETCH_TYPE';
    const RECEIVE_TYPE = 'RECEIVE_TYPE';
    const ACCEPT_TYPE = 'ACCEPT_TYPE';
    const OTHER_TYPE = 'OTHER_TYPE';

    const params = {page: 1};
    const fetchAction = {type: FETCH_TYPE, payload: params};
    const stateAfterFetch = {
        '{"page":1}': {
            'pendingMutex': 1,
            'response': null,
            'nextResponse': null,
            params
        }
    };

    const responsePayload = {
        arrivedAt: Date.now(),
        params,
        data: {
            ids: [123, 234, 345],
            total: 3
        }
    };

    const receiveAction = {
        type: RECEIVE_TYPE,
        payload: responsePayload
    };

    const stateAfterReceive = {
        '{"page":1}': {
            pendingMutex: 0,
            response: responsePayload,
            params,
            nextResponse: null
        }
    };

    const acceptLatestReducer = acceptLatest(FETCH_TYPE, RECEIVE_TYPE);

    test('reduce first fetch action', () => {
        const state = acceptLatestReducer({}, fetchAction);
        expect(state).toEqual(stateAfterFetch);
    });

    test('reduce a receive action after fetch', () => {
        const state = acceptLatestReducer(stateAfterFetch, receiveAction);
        expect(state).toEqual(stateAfterReceive);
    });

    const emptyResponsePayload = {
        arrivedAt: Date.now(),
        params,
        data: null
    };

    const emptyReceiveAction = {
        type: RECEIVE_TYPE,
        payload: emptyResponsePayload
    };

    const stateAfterReceiveEmptyAction = {
        '{"page":1}': {
            pendingMutex: 0,
            response: emptyResponsePayload,
            params,
            nextResponse: null
        }
    };

    test('receive a null response', () => {
        const state = acceptLatestReducer(stateAfterFetch, emptyReceiveAction);
        expect(state).toEqual(stateAfterReceiveEmptyAction);
    });

    const stateAfterFetch1 = {
        '{"page":1}': {
            pendingMutex: 1,
            response: responsePayload,
            params,
            nextResponse: null
        }
    };

    const stateAfterFetch2 = {
        '{"page":1}': {
            pendingMutex: 2,
            response: responsePayload,
            params,
            nextResponse: null
        }
    };

    const responsePayload2 = {
        arrivedAt: Date.now(),
        params,
        data: {
            ids: [123, 234, 345, 4565],
            total: 4
        }
    };

    const receiveAction2 = {
        type: RECEIVE_TYPE,
        payload: responsePayload2
    };

    const stateAfterReceive2 = {
        '{"page":1}': {
            pendingMutex: 1,
            response: responsePayload2,
            params,
            nextResponse: null
        }
    };

    test('latest response data will replace the previous one', () => {
        let state = stateAfterReceive;
        state = acceptLatestReducer(state, fetchAction);
        expect(state).toEqual(stateAfterFetch1);
        state = acceptLatestReducer(state, fetchAction);
        expect(state).toEqual(stateAfterFetch2);
        state = acceptLatestReducer(state, receiveAction2);
        expect(state).toEqual(stateAfterReceive2);
    });

    test('not react to unknown action', () => {
        const state = stateAfterReceive2;
        const newState = acceptLatestReducer(state, {type: OTHER_TYPE});
        expect(newState).toBe(state);
    })
});
