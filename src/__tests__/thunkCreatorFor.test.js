/* eslint-disable import/no-unresolved */
import stringify from 'json-stable-stringify';
import {thunkCreatorFor, createQueryPayload, createQueryErrorPayload} from '../../src';

const FETCH = 'FETCH';
const RECEIVE = 'RECEIVE';

describe('thunkCreatorFor', () => {
    test('basic success', async () => {
        const api = ({animal}) => {
            if (animal === 'cat') {
                return Promise.resolve({say: 'meow'});
            }
            if (animal === 'fox') {
                return Promise.reject(new Error('I dont know'));
            }
            return Promise.reject(new Error('error'));
        };

        const params = {animal: 'cat'};
        const dispatch = jest.fn();

        const fetchData = thunkCreatorFor(api, FETCH, RECEIVE);
        const thunk = fetchData(params);
        //   mock now
        jest.spyOn(Date, 'now').mockImplementation(() => 1555496661751);

        await thunk(dispatch, () => ({}));

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0]).toEqual({type: FETCH, payload: params});
        expect(dispatch.mock.calls[1][0]).toEqual({type: RECEIVE, payload: createQueryPayload(params, {say: 'meow'})});
    });

    test('basic error', async () => {
        const api = ({animal}) => {
            if (animal === 'cat') {
                return Promise.resolve({say: 'meow'});
            }
            if (animal === 'fox') {
                return Promise.reject(new Error('I dont know'));
            }
            return Promise.reject(new Error('error'));
        };

        const params = {animal: 'fox'};
        const dispatch = jest.fn();

        const fetchData = thunkCreatorFor(api, FETCH, RECEIVE);
        const thunk = fetchData(params);
        //   mock now
        jest.spyOn(Date, 'now').mockImplementation(() => 1555496661751);
        try {
            await thunk(dispatch, () => ({}));
        } catch {
            expect(dispatch.mock.calls.length).toBe(2);
            expect(dispatch.mock.calls[0][0]).toEqual({type: FETCH, payload: params});
            expect(dispatch.mock.calls[1][0]).toEqual({
                type: RECEIVE,
                payload: createQueryErrorPayload(params, {message: 'I dont know'}),
            });
        }
    });

    test('with avaiable data', async () => {
        const data = [{name: 'Lucy'}];
        const api = jest.fn(() => Promise.resolve(data));
        const params = {page: 1};
        const dispatch = jest.fn();
        const state = {
            users: {
                [stringify(params)]: {
                    pendingMutex: 0,
                    params,
                    response: createQueryPayload(params, data),
                    nextResponse: null,
                },
            },
        };

        const fetchData = thunkCreatorFor(api, FETCH, RECEIVE, {
            once: true,
            selectQuerySet: state => state.users,
        });
        const thunk = fetchData(params);
        const result = await thunk(dispatch, () => state);
        expect(result).toEqual(data);
        expect(api).not.toHaveBeenCalled();
    });

    test('with trust pending', async () => {
        const data = [{name: 'Lucy'}];
        const api = jest.fn(() => Promise.resolve(data));
        const params = {page: 1};
        const dispatch = jest.fn();
        const state = {};

        const fetchData = thunkCreatorFor(api, FETCH, RECEIVE, {
            once: true,
            trustPending: true,
            selectQuerySet: state => state.users,
        });
        const thunk = fetchData(params);
        thunk(dispatch, () => state); // call twice
        const result = await thunk(dispatch, () => state);
        expect(result).toEqual(data);
        expect(api.mock.calls.length).toBe(1);
    });
});
