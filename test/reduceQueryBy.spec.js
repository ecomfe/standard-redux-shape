import {reduceQueryBy, createQuerySelector, keepEarliest, keepEarliestSuccess, acceptWhenNoPending} from '../src';

describe('createQuerySelector should', () => {
    const FETCH_ENTITIES = 'FETCH_TEST_ENTITY';
    const RECEIVE_ENTITIES = 'RECEIVE_ENTITIES';
    const ACCEPT_NEXT = 'ACCEPT_NEXT';
    const OTHER_TYPE = 'OTHER_TYPE';
    const params = {
        id: '^&*%^&*(UJK<>>'
    };
    const result = ['key1', 'key2', 'key3', 'key3'];
    const now = Date.now();
    const payload = {
        arrivedAt: now,
        params: params,
        data: result,
        error: true
    };
    const receiveAction = {
        type: RECEIVE_ENTITIES,
        payload
    };
    const fetchAction = {
        type: FETCH_ENTITIES,
        payload: params
    };
    const state = {
        entityList: {
            [JSON.stringify({x: 1, y: 2})]: {}
        }
    };

    const alwaysOverride = (item, stage, response) => {
        if (stage === 'receive') {
            return {...item, response};
        }

        return item;
    };

    const acceptLatest = reduceQueryBy(alwaysOverride);

    test('other action type', () => {
        const reducer = acceptLatest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);

        expect(reducer(state, {type: OTHER_TYPE, payload})).toBe(state);
        expect(reducer(state.entityList, {type: OTHER_TYPE, payload})).toBe(state.entityList);
    });

    test('fetch action type: first', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptLatest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);

        state.entityList = reducer(state.entityList, {type: FETCH_ENTITIES, payload: {id: '^&*%^&*(UJK<>>'}});

        expect(selector(state).pendingMutex).toBe(1);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBeNull();
        expect(selector(state).nextResponse).toBeNull();
    });

    test('fetch action type: second', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptLatest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);

        state.entityList = reducer(state.entityList, {type: FETCH_ENTITIES, payload: {id: '^&*%^&*(UJK<>>'}});

        expect(selector(state).pendingMutex).toBe(2);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBeNull();
        expect(selector(state).nextResponse).toBeNull();
    });

    test('fetch action type: third', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptLatest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);

        state.entityList = reducer(state.entityList, {type: FETCH_ENTITIES, payload: {id: '^&*%^&*(UJK<>>'}});

        expect(selector(state).pendingMutex).toBe(3);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBeNull();
        expect(selector(state).nextResponse).toBeNull();
    });

    test('fetch action type: fourth', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptLatest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);

        state.entityList = reducer(state.entityList, {type: FETCH_ENTITIES, payload: {id: '^&*%^&*(UJK<>>'}});

        expect(selector(state).pendingMutex).toBe(4);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBeNull();
        expect(selector(state).nextResponse).toBeNull();
    });

    test('fetch action type: fifth', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptLatest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);

        state.entityList = reducer(state.entityList, {type: FETCH_ENTITIES, payload: {id: '^&*%^&*(UJK<>>'}});

        expect(selector(state).pendingMutex).toBe(5);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBeNull();
        expect(selector(state).nextResponse).toBeNull();
    });

    test('receive action type: acceptLatest', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptLatest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);

        state.entityList = reducer(state.entityList, receiveAction);

        expect(selector(state).pendingMutex).toBe(4);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBe(receiveAction.payload);
        expect(selector(state).nextResponse).toBeNull();
    });

    test('receive action type: keepEarliest', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = keepEarliest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);
        const tempReceiveAction = {
            type: RECEIVE_ENTITIES,
            payload: {
                arrivedAt: now,
                params: params,
                data: result
            }
        };

        state.entityList = reducer(state.entityList, tempReceiveAction);

        expect(selector(state).pendingMutex).toBe(3);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBe(receiveAction.payload);
        expect(selector(state).nextResponse).toBe(tempReceiveAction.payload);
    });

    test('receive action type: keepEarliestSuccess', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = keepEarliestSuccess(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);
        const tempReceiveAction = {
            type: RECEIVE_ENTITIES,
            payload: {
                arrivedAt: now,
                params: params,
                data: result
            }
        };

        state.entityList = reducer(state.entityList, tempReceiveAction);

        expect(selector(state).pendingMutex).toBe(2);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBe(tempReceiveAction.payload);
        expect(selector(state).nextResponse).toBeNull();
    });

    test('fetch action type: sixth', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptLatest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);

        state.entityList = reducer(state.entityList, {type: FETCH_ENTITIES, payload: {id: '^&*%^&*(UJK<>>'}});

        expect(selector(state).pendingMutex).toBe(3);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).not.toBe(receiveAction.payload);
        expect(selector(state).nextResponse).toBeNull();
    });

    test('receive action type: acceptLatest-reset-response-1', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptLatest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);

        state.entityList = reducer(state.entityList, receiveAction);

        expect(selector(state).pendingMutex).toBe(2);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBe(receiveAction.payload);
        expect(selector(state).nextResponse).toBeNull();
    });

    test('receive action type: acceptWhenNoPending-pendingMutex-1', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptWhenNoPending(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);
        const tempReceiveAction = {
            type: RECEIVE_ENTITIES,
            payload: {
                arrivedAt: now,
                params: params,
                data: result
            }
        };

        state.entityList = reducer(state.entityList, tempReceiveAction);

        expect(selector(state).pendingMutex).toBe(1);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBe(receiveAction.payload);
        expect(selector(state).nextResponse).toBeNull();
    });

    test('receive action type: acceptWhenNoPending-pendingMutex-0', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptWhenNoPending(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);
        const tempReceiveAction = {
            type: RECEIVE_ENTITIES,
            payload: {
                arrivedAt: now,
                params: params,
                data: result.concat('key5')
            }
        };

        state.entityList = reducer(state.entityList, tempReceiveAction);

        expect(selector(state).pendingMutex).toBe(0);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).toBe(tempReceiveAction.payload);
        expect(selector(state).nextResponse).toBeNull();
    });

    test('fetch action type: seventh', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = acceptLatest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);

        state.entityList = reducer(state.entityList, {type: FETCH_ENTITIES, payload: {id: '^&*%^&*(UJK<>>'}});

        expect(selector(state).pendingMutex).toBe(1);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).not.toBe(receiveAction.payload);
        expect(selector(state).nextResponse).toBeNull();
    });

    test('receive action type: set nextResponse', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = keepEarliest(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);
        const tempReceiveAction = {
            type: RECEIVE_ENTITIES,
            payload: {
                arrivedAt: now,
                params: params,
                data: result.concat('key6')
            }
        };

        state.entityList = reducer(state.entityList, tempReceiveAction);

        expect(selector(state).pendingMutex).toBe(0);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).not.toBe(receiveAction.payload);
        expect(selector(state).response.data).toEqual(result.concat('key5'));
        expect(selector(state).nextResponse).toBe(tempReceiveAction.payload);
        expect(selector(state).nextResponse.data).toEqual(result.concat('key6'));
    });

    test('accept action type', () => {
        const selector = createQuerySelector(state => state.entityList, () => ({id: '^&*%^&*(UJK<>>'}));
        const reducer = reduceQueryBy()(FETCH_ENTITIES, RECEIVE_ENTITIES, ACCEPT_NEXT);
        const tempReceiveAction = {
            type: ACCEPT_NEXT,
            payload: params
        };

        state.entityList = reducer(state.entityList, tempReceiveAction);

        expect(selector(state).pendingMutex).toBe(0);
        expect(selector(state).params).toEqual(params);
        expect(selector(state).response).not.toBe(receiveAction.payload);
        expect(selector(state).response.data).toEqual(result.concat('key6'));
        expect(selector(state).nextResponse).toBeNull();
    });
});
