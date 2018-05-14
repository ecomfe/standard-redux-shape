/**
 * @file 控制标准Redux Store结构的相关辅助工具
 * @author zhanglili
 */
import get from 'lodash.get';

const UNIQUE = '@@standard-redux-shape/NONE_USED';

export const createQueryPayload = (params, data) => {
    return {
        arrivedAt: Date.now(),
        params: params,
        data: data
    };
};

export const createQueryErrorPayload = (params, error) => {
    return {
        arrivedAt: Date.now(),
        params: params,
        error: {message: error.message, ...error}
    };
};

/**
 * 创建一个更新查询状态的reducer创建函数
 *
 * 该函数接受一个`reduceState`函数，当接收到特定的Action时，使用`(cacheItem, stage, payload)`调用该函数获取新的查询项，参数定义如下：
 *
 * - `{Object} cacheItem`：之前的查询项，包含了`pendingMutex`、`response`和`nextResponse`
 * - `{string} stage`：当前对该查询项的更新状态，可选值为`"fetch"`（开始查询）和`"receive"`（获得响应）
 * - `{Object} payload`：收到Action时获得的payload对象
 *
 * `reduceState`在收到以上三个参数后，必须返回一个新的查询项（即对`cacheItem`的更新）
 *
 * 在调用`reduceQueryBy`后，会得到一个reducer的创建函数，创建函数接收若干个Action类型并通过这些类型控制调用`reduceState`：
 *
 * - `{string} fetchActionType`：表达`"fetch"`状态的Action类型
 * - `{string} receiveActionType`：表达`"receive"`状态的Action类型
 * - `{string} acceptActionType`：表达使用`nextResponse`覆盖`response`的Action类型，如果不需要该功能则可以不传递参数
 *
 * 在接收3个Action类型后，会进而返回一个reducer用以更新一个查询项，一个查询项是以参数为key的对象，每个参数对应的结构如下：
 *
 * - `{number} pendingMutex`：表示当前正在进行的查询数目，通常用于判断是否有并行的请求发起，也可用于thunk判断是否要发新请求
 * - `{Object} response`：当前正在使用的响应
 * - `{Object} nextResponse`：当前最新的响应，如果选择始终使用最新响应则该属性永远为`null`，否则可以在此处获得比`response`更新的响应
 *
 * 每一个响应包含以下属性：
 *
 * - `{string} arrivedAt`：响应的到达时间
 * - `{*} params`：对应的参数
 * - `{*} data`：响应成功时的内容
 * - `{*} error`：响应失败时的内容
 *
 * @param {Function} reduceState 根据给定的查询状态返回新的查询状态
 * @return {Function} 一个reducer创建函数
 */
export const reduceQueryBy = reduceState => (fetchActionType, receiveActionType, acceptActionType = UNIQUE) => {
    const queryStageMapping = {
        [fetchActionType]: 'fetch',
        [receiveActionType]: 'receive',
        [acceptActionType]: 'accept'
    };

    const pendingMutexAddition = {
        fetch: 1,
        receive: -1,
        accept: 0
    };

    return (state = {}, {type, payload} = {}) => {
        const stage = queryStageMapping[type];

        if (!stage) {
            return state;
        }

        const params = stage === 'receive' ? payload.params : payload;
        const cacheKey = JSON.stringify(params);
        const cacheItem = state[cacheKey] || {pendingMutex: 0, params: params, response: null, nextResponse: null};

        if (stage === 'accept') {
            return {
                ...state,
                [cacheKey]: {
                    ...cacheItem,
                    response: cacheItem.nextResponse,
                    nextResponse: null
                }
            };
        }

        const nextPendingMutex = cacheItem.pendingMutex + pendingMutexAddition[stage];
        const newItem = nextPendingMutex === cacheItem.pendingMutex
            ? cacheItem
            : {...cacheItem, pendingMutex: nextPendingMutex};

        return {
            ...state,
            [cacheKey]: reduceState(newItem, stage, payload)
        };
    };
};

const alwaysOverride = (item, stage, response) => {
    if (stage === 'receive') {
        return {...item, response};
    }

    return item;
};

/**
 * 一个始终使用最新响应的查询状态reducer创建函数
 *
 * @param {string} fetchActionType 表达`"fetch"`状态的Action类型
 * @param {string} receiveActionType 表达`"receive"`状态的Action类型
 * @param {string} acceptActionType 表达使用`nextResponse`覆盖`response`的Action类型，如果不需要该功能则可以不传递参数
 * @return {Function} 返回一个reducer函数
 */
export const acceptLatest = reduceQueryBy(alwaysOverride);

const neverOverride = (item, stage, response) => {
    if (stage === 'receive') {
        return {
            ...item,
            response: item.response ? item.response : response,
            nextResponse: item.response ? response : null
        };
    }

    return item;
};

/**
 * 一个始终使用最早的响应（丢弃一切后到的响应）的查询状态reducer创建函数
 *
 * @param {string} fetchActionType 表达`"fetch"`状态的Action类型
 * @param {string} receiveActionType 表达`"receive"`状态的Action类型
 * @param {string} acceptActionType 表达使用`nextResponse`覆盖`response`的Action类型，如果不需要该功能则可以不传递参数
 * @return {Function} 返回一个reducer函数
 */
export const keepEarliest = reduceQueryBy(neverOverride);

const overrideOnError = (item, stage, response) => {
    const newItem = neverOverride(item, stage, response);

    if (stage === 'receive') {
        if (newItem.response.error && !response.error) {
            return {
                ...newItem,
                response: response,
                nextResponse: null
            };
        }

        return newItem;
    }

    return newItem;
};

/**
 * 一个始终使用最早的成功响应（旧响应是失败状态则用新的成功状态覆盖，否则丢弃新的）的查询状态reducer创建函数
 *
 * @param {string} fetchActionType 表达`"fetch"`状态的Action类型
 * @param {string} receiveActionType 表达`"receive"`状态的Action类型
 * @param {string} acceptActionType 表达使用`nextResponse`覆盖`response`的Action类型，如果不需要该功能则可以不传递参数
 * @return {Function} 返回一个reducer函数
 */
export const keepEarliestSuccess = reduceQueryBy(overrideOnError);

const overrideOnFree = (item, stage, response) => {
    if (item.pendingMutex === 0) {
        return {...item, response};
    }

    return item;
};

/**
 * 一个当有并行查询时使用最后一个响应的查询状态reducer创建函数
 *
 * @param {string} fetchActionType 表达`"fetch"`状态的Action类型
 * @param {string} receiveActionType 表达`"receive"`状态的Action类型
 * @param {string} acceptActionType 表达使用`nextResponse`覆盖`response`的Action类型，如果不需要该功能则可以不传递参数
 * @return {Function} 返回一个reducer函数
 */
export const acceptWhenNoPending = reduceQueryBy(overrideOnFree);

const head = array => array[0];

const getQuery = (state, selectQuerySet, paramsKey) => {
    const querySet = selectQuerySet(state);

    return querySet ? querySet[paramsKey] : null;
};

export const thunkCreatorFor = (api, fetchActionType, receiveActionType, options = {}) => {
    const {computeParams = head, once = false, trustPending = false, selectQuerySet} = options;
    const cache = trustPending ? new Map() : null;

    return (...args) => (dispatch, getState) => {
        const params = computeParams(args);
        const paramsKey = JSON.stringify(params);
        const availableData = once && get(getQuery(getState(), selectQuerySet, paramsKey), 'response.data', null);

        if (availableData) {
            return Promise.resolve(availableData);
        }

        if (trustPending) {
            const cachedPending = cache.get(paramsKey);

            if (cachedPending) {
                return cachedPending;
            }
        }

        dispatch({type: fetchActionType, payload: params});

        const removeCachedPending = () => {
            if (trustPending) {
                cache.delete(paramsKey);
            }
        };
        const handleResult = result => {
            removeCachedPending();
            dispatch({type: receiveActionType, payload: createQueryPayload(params, result)});
            return result;
        };
        const handleError = ex => {
            removeCachedPending();
            dispatch({type: receiveActionType, payload: createQueryErrorPayload(params, ex)});
            throw ex;
        };

        const pending = api(params).then(handleResult, handleError);

        if (trustPending) {
            cache.set(paramsKey, pending);
        }

        return pending;
    };
};
