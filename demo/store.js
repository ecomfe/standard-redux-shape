/**
 * @file Store
 * @author zhanglili
 */

import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers';

export default createStore(
    reducer,
    {},
    compose(
        applyMiddleware(thunk),
        typeof window.devToolsExtension === 'function' ? window.devToolsExtension() : f => f
    )
);
