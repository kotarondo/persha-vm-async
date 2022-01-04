// Copyright (c) 2017-2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

require('./harness')
process.chdir('basic')

var vm = new VM()
vm.context.LocalTZA = +9 * 3600000
vm.context.LocalTZAString = "JST"

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
        var { type, value } = await vm.evaluateProgram(realm, source, filename)
        if (type === "throw" && Array.isArray(value) && value[2] === "DONE") {
            assert.deepStrictEqual(value[0], value[1])
        } else {
            throw value
        }
    }
}

test().then(test_success).catch(test_failed)
