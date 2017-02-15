import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

export default {
  entry    : 'index.js',
  format   : 'iife',
  sourceMap: 'inline',
  plugins  : [babel(babelrc())]
};