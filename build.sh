#!/usr/bin/env bash

if [[ $# -eq 0 ]]; then $0 -a; exit 0; fi

rollup="./node_modules/.bin/rollup"
banner=$(<metadata.txt)

while [[ $# -gt 0 ]]; do
  case $1 in
  --es6)
    echo "building es6"
    ${rollup} -i index.js -o ./dist/turkoptiscript.es6.user.js -f iife --banner "$banner"
    shift ;;
  --es5)
    echo "building es5"
    # piping to cat here to get rid of extraneous new lines added during transpiling
    ${rollup} -c --banner "$banner" | cat -s > ./dist/turkoptiscript.es5.user.js
    shift ;;
  -a|--all)
    $0 --es6 --es5; exit 0;;
  *)
    echo "invalid option: '$1'"; exit 1;;
  esac
done

exit 0