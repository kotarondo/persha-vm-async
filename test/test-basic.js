// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const VM = require('../index.js')

process.chdir(path.join(__dirname, 'basic'))

var filenames = fs.readdirSync(".")

async function test() {
    while (filenames.length) {
        var filename = filenames.pop()
        if (!/^test.*\.js$/.test(filename)) continue
        console.log(filename)
        var source = fs.readFileSync(filename, 'utf8')
        var vm = new VM()
        await vm.initialize()
        try {
            await vm.evaluateProgram(source, filename)
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
