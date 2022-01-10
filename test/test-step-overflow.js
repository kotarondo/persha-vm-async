// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

require('./harness')
process.chdir('step-overflow')

var vm = new VM()

if (process.argv.length <= 2) {
    var filenames = fs.readdirSync(".")
} else {
    var filenames = process.argv.slice(2)
}

async function test2(realm, source, filename) {
    var begin = Date.now()
    var stepsLimit = 0
    var steps = 0
    while (steps < 1000 * 10000) {
        vm.context.stepsLimit = stepsLimit
        var { type, value } = await vm.evaluateProgram(realm, source, filename)
        if (!(type === 'throw' && String(value) === 'RangeError: steps overflow')) {
            console.log(filename, value)
            assert(0)
        }
        stepsLimit -= vm.context.stepsLimit
        steps += stepsLimit
    }
    var elapsed = Date.now() - begin
    console.log('elapsed:' + elapsed, steps, filename)
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
