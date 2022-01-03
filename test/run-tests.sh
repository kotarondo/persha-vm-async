#!/bin/bash
# Copyright (c) 2017-2022, Kotaro Endo.
# All rights reserved.
# License: "BSD-3-Clause"

cd "$(dirname "$0")"

FAILED=0
SUCCESS=0

for file in test-*.js v8bench.js
do
echo testing $file
node $file
if [ $? -ne 0 ]; then
	let "FAILED += 1"
else
	let "SUCCESS += 1"
fi
done

export SKIP_HEAVY_TESTS=true
for ts in ch0[67] ch08 ch09 ch10 ch11 ch12 ch13 ch14 ch15/15.1 ch15/15.2 ch15/15.3 ch15/15.4 ch15/15.5 ch15/15.[6789]
do
echo testing test262 $ts
node test262 $ts
if [ $? -ne 0 ]; then
	let "FAILED += 1"
else
	let "SUCCESS += 1"
fi
done

echo
echo "FAILED: $FAILED"
echo "SUCCESS: $SUCCESS"
echo

exit $FAILED
