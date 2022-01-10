// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

require('./harness')
process.chdir('long-string')

var vm = new VM()

if (process.argv.length <= 2) {
    var filenames = fs.readdirSync(".")
} else {
    var filenames = process.argv.slice(2)
}

async function test2(realm, source, filename) {
    console.log(filename)
    var begin = Date.now()
    var { type, value } = await vm.evaluateProgram(realm, source, filename)
    if (type === 'throw' && String(value) === 'RangeError: Invalid string length') return;
    console.log(value)
    assert(0)
}

async function test() {
    while (filenames.length) {
        var filename = filenames.pop()
        if (!/\.js$/.test(filename)) continue
        var source = fs.readFileSync(filename, 'utf8')
        var realm = await vm.createRealm()
        await test2(realm, source, filename)
    }
}

test().then(test_success).catch(test_failed)
