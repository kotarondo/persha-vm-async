// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

'use strict'

process.chdir(__dirname)

global.fs = require('fs')
global.assert = require('assert')
global.VM = require('../index.js')

var exit_code = 1

process.on('beforeExit', function() {
    if (exit_code) {
        console.log("NG: unexpectedly exits")
        process.exit(exit_code)
    }
})

global.test_success = function() {
    exit_code = 0
    console.log("OK")
}

global.test_failed = function() {
    console.log("FAILED")
    process.exit(99)
}

global.sleep = function(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}
