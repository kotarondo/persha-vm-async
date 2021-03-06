#!/bin/bash
# Copyright (c) 2017, Kotaro Endo.
# All rights reserved.
# License: "BSD-3-Clause"

cd "$(dirname "$0")"

FAILED=0
SUCCESS=0

NAMEBASES=$*

if [ -z "$NAMEBASES" ]; then
	NAMEBASES="test- test262"
fi

for dir in $NAMEBASES
do
for file in ${dir}*.js
do
echo testing $file
node $file
if [ $? -ne 0 ]; then
	let "FAILED += 1"
else
	let "SUCCESS += 1"
fi
done
done

echo
echo "FAILED: $FAILED"
echo "SUCCESS: $SUCCESS"
echo

exit $FAILED
