/**
 * @file API
 * @author zhanglili
 */

import {random} from 'lodash';

const wait = time => new Promise(resolve => setTimeout(resolve, time));

export const getSummary = () => {
    const randomData = {
        search: random(1000, 3000),
        video: random(1000, 3000),
        union: random(1000, 3000),
        email: random(1000, 3000),
        direct: random(1000, 3000)
    };

    return wait(2000).then(() => randomData);
};
