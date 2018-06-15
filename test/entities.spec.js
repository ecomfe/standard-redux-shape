import {createTableUpdater} from '../src';
import {isFunction, noop} from 'lodash';

describe('createTableUpdater should', () => {
    test('be in signature: a -> b', () => {
        expect(isFunction(createTableUpdater)).toBe(true);
    });

    test('be in signature: a -> b -> c', () => {
        const withTableUpdate = createTableUpdater();
        expect(isFunction(createTableUpdater())).toBe(true);
    });

    test('be in signature: a -> b -> c -> d', () => {
        expect(isFunction(createTableUpdater()())).toBe(true);
    });

    test('be in signature: a -> b -> c -> d -> e', () => {
        expect(isFunction(createTableUpdater()()())).toBe(true);
    });

    test('return Promise in the inner most call', () => {
        expect.assertions(1);

        const resolveStore = () => Promise.resolve({dispatch: noop});
        const fetchFunction = () => Promise.resolve({});
        const selectEntities = () => ({});
        const tableName = 'foo';
        const innerMostFunction = createTableUpdater(resolveStore)(selectEntities, tableName)(fetchFunction);
        return innerMostFunction().then(data => expect(data).toEqual({}));
    });

    test('dispatches only once when TableName is exists', () => {
        expect.assertions(1);

        const dispatch = jest.fn(noop);
        const resolveStore = () => Promise.resolve({dispatch});
        const fetchFunction = () => Promise.resolve({});
        const selectEntities = () => ({});
        const tableName = 'foo';
        const innerMostFunction = createTableUpdater(resolveStore)(selectEntities, tableName)(fetchFunction);
        return innerMostFunction().then(data => {
            expect(dispatch).toHaveBeenCalledTimes(1);
        });
    });

    test('dispatches the same times with number of keys in selected entities when Tablename is absent', () => {
        expect.assertions(1);

        const dispatch = jest.fn(noop);
        const selectedEntities = {a: null, b: null, c: null};

        const resolveStore = () => Promise.resolve({dispatch});
        const fetchFunction = () => Promise.resolve({});
        const selectEntities = () => selectedEntities;
        const innerMostFunction = createTableUpdater(resolveStore)(selectEntities)(fetchFunction);
        return innerMostFunction().then(data => {
            expect(dispatch).toHaveBeenCalledTimes(Object.keys(selectedEntities).length);
        });
    });

    test('dispatches with correct action when Tablename is provided', () => {
        expect.assertions(1);

        const dispatch = jest.fn(noop);
        const selectedEntities = {};

        const resolveStore = () => Promise.resolve({dispatch});
        const fetchFunction = () => Promise.resolve({});
        const selectEntities = () => selectedEntities;
        const tableName = 'foo';
        const action = {
            type: '@@standard-redux-shape/UPDATE_ENTITY_TABLE',
            payload: {tableName, entities: selectedEntities},
        };
        const innerMostFunction = createTableUpdater(resolveStore)(selectEntities, tableName)(fetchFunction);
        return innerMostFunction().then(data => {
            expect(dispatch).toHaveBeenCalledWith(action);
        });
    });

    test('dispatches with correct action when no Tablename is provided', () => {
        expect.assertions(3);

        const dispatch = jest.fn(noop);
        const selectedEntities = {a: null, b: null, c: null};

        const resolveStore = () => Promise.resolve({dispatch});
        const fetchFunction = () => Promise.resolve({});
        const selectEntities = () => selectedEntities;
        const innerMostFunction = createTableUpdater(resolveStore)(selectEntities)(fetchFunction);
        const actions = [
            {
                type: '@@standard-redux-shape/UPDATE_ENTITY_TABLE',
                payload: {tableName: 'a', entities: null},
            },
            {
                type: '@@standard-redux-shape/UPDATE_ENTITY_TABLE',
                payload: {tableName: 'b', entities: null},
            },
            {
                type: '@@standard-redux-shape/UPDATE_ENTITY_TABLE',
                payload: {tableName: 'c', entities: null},
            },
        ];
        return innerMostFunction().then(data => {
            expect(dispatch).toHaveBeenNthCalledWith(1, actions[0]);
            expect(dispatch).toHaveBeenNthCalledWith(2, actions[1]);
            expect(dispatch).toHaveBeenNthCalledWith(3, actions[2]);
        });
    });
});
