// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: 'BSD-3-Clause'

const fs = require('fs')
const assert = require('assert')
const path = require('path')
const VM = require('../index.js')
const vm = new VM();

// for Tests S15.9.3.1_A5_T*.js
vm.context.LocalTZA = -8 * 3600000;
vm.context.LocalTZAString = "PDT";

process.chdir(path.join(__dirname, 'test262'))

const stopIfFailed = process.env.STOP_IF_FAILED
const skipHeavyTests = process.env.SKIP_HEAVY_TESTS

if (process.argv.length >= 3) {
    var specificTestPattern = process.argv[2]
}

var testSuites = ['ch06.json', 'ch07.json', 'ch08.json', 'ch09.json', 'ch10.json', //
    'ch11.json', 'ch12.json', 'ch13.json', 'ch14.json', 'ch15.json',
]

var HeavyTests = [ //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A2.5_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A2.5_T1.js', //
    'TestCases/ch07/7.4/S7.4_A5.js', //
    'TestCases/ch07/7.4/S7.4_A6.js', //
    'TestCases/ch07/7.8/7.8.5/S7.8.5_A1.1_T2.js', //
    'TestCases/ch07/7.8/7.8.5/S7.8.5_A1.4_T2.js', //
    'TestCases/ch07/7.8/7.8.5/S7.8.5_A2.1_T2.js', //
    'TestCases/ch07/7.8/7.8.5/S7.8.5_A2.4_T2.js', //
    'TestCases/ch15/15.1/15.1.2/15.1.2.2/S15.1.2.2_A8.js', //
    'TestCases/ch15/15.1/15.1.2/15.1.2.3/S15.1.2.3_A6.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A1.10_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A1.11_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A1.11_T2.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A1.12_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A1.12_T2.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A1.12_T3.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A1.2_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A1.2_T2.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A2.1_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.1/S15.1.3.1_A2.4_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A1.10_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A1.11_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A1.11_T2.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A1.12_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A1.12_T2.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A1.12_T3.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A1.2_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A1.2_T2.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A2.1_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.2/S15.1.3.2_A2.4_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.3/S15.1.3.3_A1.3_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.3/S15.1.3.3_A2.3_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.3/S15.1.3.3_A2.4_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.3/S15.1.3.3_A2.4_T2.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.3/S15.1.3.3_A2.5_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.4/S15.1.3.4_A1.3_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.4/S15.1.3.4_A2.3_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.4/S15.1.3.4_A2.4_T1.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.4/S15.1.3.4_A2.4_T2.js', //
    'TestCases/ch15/15.1/15.1.3/15.1.3.4/S15.1.3.4_A2.5_T1.js', //
]

var passCount = 0
var failCount = 0
var skipCount = 0
var fails = ''

var sta_source = fs.readFileSync('sta.js', 'utf8')
var sta_patch_source = fs.readFileSync('sta_patch.js', 'utf8')

async function doTest(test) {
    console.log(test.path)
    var source = new Buffer(test.code, 'base64').toString('binary')
    source = decodeURIComponent(escape(source)) // UTF-8 decoding trick
    var realm = await vm.createRealm()
    await vm.evaluateProgram(realm, sta_source, 'sta.js')
    await vm.evaluateProgram(realm, sta_patch_source, 'sta_patch.js')
    // console.log(source)
    try {
        var { type, value } = await vm.evaluateProgram(realm, source, test.path)
        if (type === 'normal') {
            if (test.negative === undefined) {
                return true
            }
            var err = test.negative
        } else {
            assert(type === 'throw')
            var err = value
            if (test.negative !== undefined) {
                try {
                    if (new RegExp(test.negative, 'i').test(err)) {
                        return true
                    }
                } catch (e) {
                    var err = e
                }
            }
        }
    } catch (e) {
        var err = e
    }
    console.log('ERROR:', err)
    console.log()
    console.log(test.description)
    console.log(test.path)
    console.log(source)
    return false
}

async function test() {
    main: for (var filename of testSuites) {
        var tests = JSON.parse(fs.readFileSync(filename, 'utf8')).testsCollection.tests
        for (var test of tests) {
            if (specificTestPattern && !test.path.match(specificTestPattern)) {
                continue
            }
            if (skipHeavyTests && HeavyTests.indexOf(test.path) >= 0) {
                continue
            }
            var begin = Date.now()
            var ok = await doTest(test)
            var end = Date.now()
            if (end - begin > 3000) {
                console.log('elapsed: ' + (end - begin) + ' ms')
            }
            if (ok === true) {
                passCount++;
            } else {
                failCount++;
                fails += 'FAILED: ' + test.path + '\n'
                if (stopIfFailed) break main;
            }
        }
    }
    console.log(fails)
    console.log('pass: ' + passCount)
    console.log('fail: ' + failCount)
    console.log('skip: ' + skipCount)
    if (failCount > 0) process.exit(1);
}

test().catch(err => {
    console.log(err)
    process.exit(1);
})
