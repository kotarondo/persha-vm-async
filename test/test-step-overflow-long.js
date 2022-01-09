// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

require('./harness')
process.chdir('step-overflow')

const SCALE = 10

var vm = new VM()

if (process.argv.length <= 2) {
    var filenames = fs.readdirSync(".")
} else {
    var filenames = process.argv.slice(2)
}

async function test2(realm, source, filename) {
    var begin = Date.now()
    var stepsLimit = SCALE * 1000 * 10000
    vm.context.stepsLimit = stepsLimit
    var { type, value } = await vm.evaluateProgram(realm, source, filename)
    if (!(type === 'throw' && String(value) === 'RangeError: steps overflow')) {
        console.log(value)
        assert(0)
    }
    var elapsed = Date.now() - begin
    if (elapsed > stepsLimit / 10000) {
        console.log('elapsed:', '\x1b[31m' + elapsed + '\x1b[0m', filename)
    } else {
        console.log('elapsed:' + elapsed, filename)
    }
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
