/**
 * @file Actions
 * @author zhanglili
 */

import {thunkCreatorFor} from '../src';
import {getSummary} from './api';

export const FETCH_SUMMARY = 'FETCH_SUMMARY';
export const RECEIVE_SUMMARY = 'RECEIVE_SUMMARY';
export const ACCEPT_SUMMARY = 'ACCEPT_SUMMARY';

export const fetchSummary = thunkCreatorFor(
    getSummary,
    FETCH_SUMMARY,
    RECEIVE_SUMMARY,
    {
        // Since the summary is global, use a static key as param
        computeParams() {
            return 'all';
        },
        once: false,
        trustPending: true,
        selectQuerySet: ({queries: {summary = null}}) => summary,
    }
);

export const acceptSummary = () => ({type: ACCEPT_SUMMARY, payload: 'all'});
