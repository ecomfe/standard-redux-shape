/**
 * @file Selectors
 * @author zhanglili
 */

import {createQuerySelector} from '../src';

export const selectSummaryQuery = createQuerySelector(
    state => state.queries.summary,
    () => 'all'
);
