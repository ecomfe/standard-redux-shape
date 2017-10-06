/**
 * @file API
 * @author zhanglili
 */

import {random} from 'lodash';

export const getSummary = () => {
    const randomData = {
        search: random(1000, 3000),
        video: random(1000, 3000),
        union: random(1000, 3000),
        email: random(1000, 3000),
        direct: random(1000, 3000)
    };

    return Promise.resolve(randomData);
};
