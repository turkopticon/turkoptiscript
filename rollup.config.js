export default {
  entry: 'index.js',
  dest: 'dist/turkopticon.es5.user.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    babel({ exclude: 'node_modules/**' }),
  ]
};