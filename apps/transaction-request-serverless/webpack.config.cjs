const path = require('path');
const slsw = require('serverless-webpack');

module.exports = {
    entry: slsw.lib.entries,
    target: 'node',
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    stats: 'minimal',
    devtool: 'nosources-source-map',
    externals: [{ 'aws-sdk': 'commonjs aws-sdk' }],
    resolve: {
        extensions: ['.js', '.json', '.ts'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js',
        sourceMapFilename: '[file].map',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                    experimentalWatchApi: true,
                },
            },
        ],
    },
};
