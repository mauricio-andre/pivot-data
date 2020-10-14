const { terser } = require('rollup-plugin-terser');
const commonjs = require('@rollup/plugin-commonjs');
const pkg = require('./package.json');

const banner = `/* @license pivotData.js v${pkg.version} | by mauricio-andre | (c) Infinitidata 2020 */`;
module.exports = [
  {
    input: 'src/pivotData.js',
    output: [
      {
        file: 'dist/pivotData.js',
        name: 'pivotData',
        format: 'umd',
        banner,
      },
      {
        file: 'dist/pivotData.min.js',
        name: 'pivotData',
        format: 'umd',
        banner,
        plugins: [terser()],
      },
    ],
    plugins: [commonjs()],
  },
];
