const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = function override(config, env) {
    config.plugins.push(new MonacoWebpackPlugin({
        languages: ['json']
    }));
    // 三方包（@antv/* 等）发布的 .js.map 引用了未打包进 npm 的 .ts 源文件，
    // source-map-loader 解析失败产生的 WARNING 无实际影响，这里按模块过滤掉
    config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
            module: /node_modules[\\/]/,
            message: /Failed to parse source map/,
        },
    ];
    return config;
}