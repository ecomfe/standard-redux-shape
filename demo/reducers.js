/**
 * @file Reducers
 * @author zhanglili
 */

import {combineReducers} from 'redux';
import {createTableUpdateReducer, keepEarliest} from '../src';
import {FETCH_SUMMARY, RECEIVE_SUMMARY, ACCEPT_SUMMARY} from './actions';

const queryReducers = {
    summary: keepEarliest(FETCH_SUMMARY, RECEIVE_SUMMARY, ACCEPT_SUMMARY)
};

export default combineReducers({queries: combineReducers(queryReducers), entities: createTableUpdateReducer()});
