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
            await vm.evaluateProgram(realm, source, filename)
            console.log('failed')
            process.exit(1);
        } catch (err) {
            if (Array.isArray(err) && err[2] === "DONE") {
                assert.deepStrictEqual(err[0], err[1])
            } else {
                throw err;
            }
        }
    }
    console.log('success')
}

test().catch(err => {
    console.log(err)
    process.exit(1);
})
