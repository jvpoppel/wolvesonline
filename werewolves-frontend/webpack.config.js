const path = require('path');

module.exports = {
    devtool: "source-map",
    entry: {
        main: './build-tsc/src/main.js'
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: "development"
};