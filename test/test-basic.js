// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const VM = require('../index.js')
var vm = new VM()

process.chdir(path.join(__dirname, 'basic'))

if (process.argv.length <= 2) {
    var filenames = fs.readdirSync(".")
} else {
    var filenames = process.argv.slice(2)
}

async function test() {
    while (filenames.length) {
        var filename = filenames.pop()
        if (!/^test.*\.js$/.test(filename)) continue
        console.log(filename)
        var source = fs.readFileSync(filename, 'utf8')
        var realm = await vm.createRealm()
        try {
            var { type, value } = await vm.evaluateProgram(realm, source, filename)
            if (type === "throw" && Array.isArray(value) && value[2] === "DONE") {
                assert.deepStrictEqual(value[0], value[1])
            } else {
                throw value;
            }
        } catch (err) {
            console.log('failed', err)
            process.exit(1);
        }
    }
    console.log('success')
}

test().catch(err => {
    console.log(err)
    process.exit(1);
})
