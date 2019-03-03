/* eslint-disable import/unambiguous, import/no-commonjs, import/no-nodejs-modules */
exports.featureMatrix = {
    dev: {},
};

exports.build = {
    appTitle: 'standard-redux-shape',
};

exports.devServer = {
    port: 9010,
};

exports.rollup = {
    namedDependencyExports: {
        'san-update': ['immutable'],
    },
};
