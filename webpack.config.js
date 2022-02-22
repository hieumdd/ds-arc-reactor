const path = require('path');
require('webpack-dev-server');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const CSS_FILE_NAME = process.env.npm_package_dsccViz_cssFile;
const cssFilePath = path.join('src', CSS_FILE_NAME);

const plugins = [];

let body = '<script src="main.js"></script>';
if (fs.existsSync(cssFilePath)) {
    body = body + '\n<link rel="stylesheet" href="index.css">';
    plugins.push(new CopyWebpackPlugin([{ from: cssFilePath, to: '.' }]));
}
const iframeHTML = `
<!doctype html>
<html><body>
${body}
</body></html>
`;

fs.writeFileSync(path.resolve(__dirname, 'dist', 'vizframe.html'), iframeHTML);

module.exports = [
    {
        mode: 'development',
        entry: './src/index.ts',
        module: {
            rules: [
                {
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        devServer: {
            contentBase: './dist',
        },
        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: plugins,
        resolve: {
            extensions: ['.ts', '.js'],
        },
    },
];
