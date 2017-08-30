/**
 * @file 管理Store Nomalization的相关逻辑
 * @author zhanglili
 */

import {immutable} from 'san-update';

const UPDATE_ENTITY_TABLE = '@@standard-redux-shape/UPDATE_ENTITY_TABLE';

const isEmpty = o => {
    for (const key in o) {
        if (o.hasOwnProperty(key)) {
            return false;
        }
    }

    return true;
};

const reduce = (object, iteratee, initialValue) => {
    const keys = Object.keys(object);
    return keys.reduce((result, key) => iteratee(result, object[key], key), initialValue);
};

/**
 * 创建一个用于在请求结束后更新Normalized Store中的实体数据的高阶函数
 *
 * 当传递一个`store`后，会返回一个`withTableUpdate`函数，这个函数的用法如下：
 *
 * ```javascript
 * const apiWithTableUpdate = withTableUpdate(tableName, selectEntities)(api);
 * const response = await apiWithTableUpdate(args);
 * ```
 *
 * 当一个用于获取后端数据的API函数被这个高阶函数包装后，会在响应返回时额外做以下行为：
 *
 * 1. 调用`selectEntities`函数，将`response`传入并得到一个对象，该对象是一系列需要更新的实体，以实体的索引属性（比如id）为键
 * 2. 派发一个类型为`UPDATE_ENTITY_TABLE`的Action，并通过`payload`提供`tableName`和`entity`属性
 *
 * 当reducer包含了对这个Action的处理时，会有以下逻辑：
 *
 * 1. 根据`tableName`从`state`中获取到对应的表
 * 2. 将当前从响应中获取的实体一一合并到表中
 *
 * 通过这种方式，可以将后端的接口与Normalized Store中的实体信息建立关联，保持所有实体更新在实体表中，其它地方通过id的方式引用保持信息同步
 *
 * 如果一个响应同时返回多个实体，也同样可以调用多次`withTableUpdate`来进行包装：
 *
 * ```javascript
 * import {property, keyBy} from 'lodash';
 *
 * const withUsersTableUpdate = withTableUpdate('usersByName', res => keyBy(res.users, 'username'));
 * const withCommitsTableUpdate = withTableUpdate('commitsById', res => keyBy(res.commits, 'id'));
 * const apiWithTableUpdate = withUsersTableUpdate(withCommitsTableUpdate(api));
 * ```
 *
 * @param {Object} store Redux store
 */
export const createTableUpdater = ({dispatch}) => (tableName, selectEntities) => {
    const dispatchTableUpdate = (responseData, ...args) => {
        const entities = selectEntities(responseData, ...args);
        dispatch({type: UPDATE_ENTITY_TABLE, payload: {tableName, entities}});
        return responseData;
    };

    return fetchFunction => (...args) => fetchFunction(...args).then(data => dispatchTableUpdate(data, ...args));
};

/**
 * 与`createTableUpdater`合作使用的reducer函数，具体参考上面的注释说明
 *
 * @param {Function} nextReducer 后续处理的reducer
 */
export const createTableUpdateReducer = (nextReducer = s => s) => (state = {}, action) => {
    if (action.type !== UPDATE_ENTITY_TABLE) {
        return nextReducer(state, action);
    }

    const {payload: {tableName, entities}} = action;

    // 在第一次调用`withTableUpdate`的时候，会触发对当前表的初始化，
    // 当然如果一个表对应多个API的话，初始化会触发多次，在按需加载的时候也可能在任意时刻触发（通过`replaceReducer`），
    // 所以当表不存在的时候才进行赋值
    if (!entities && !state[tableName]) {
        return {...state, [tableName]: {}};
    }

    const table = state[tableName] || {};

    // 因为当前的系统前后端接口并不一定会返回一个完整的实体，
    // 如果之前有一个比较完整的实体已经在`state`中，后来又来了一个不完整的实体，直接覆盖会导致字段丢失，
    // 因此针对每个实体，使用的是浅合并的策略，保证第一级的字段是不会丢的
    const merging = reduce(entities, (chain, value, key) => chain.merge(key, value), immutable(table));
    const [mergedTable, diff] = merging.withDiff();
    const newState =  isEmpty(diff) ? state : {...state, [tableName]: mergedTable};
    return nextReducer(newState, action);
};
