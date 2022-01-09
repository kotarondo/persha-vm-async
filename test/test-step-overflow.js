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
    stepsLimit = 0
    var steps = 0
    while (steps < 10000000) {
        vm.context.stepsLimit = stepsLimit
        var { type, value } = await vm.evaluateProgram(realm, source, filename)
        assert(type === 'throw' && String(value) === 'RangeError: steps overflow')
        stepsLimit -= vm.context.stepsLimit
        steps += stepsLimit
    }
    var elapsed = Date.now() - begin
    console.log('elapsed:' + elapsed, ' steps:', steps, filename)
}

async function test() {
    while (filenames.length) {
        var filename = filenames.pop()
        if (!/\.js$/.test(filename)) continue
        console.log(filename)
        var source = fs.readFileSync(filename, 'utf8')
        var realm = await vm.createRealm()
        await test2(realm, source, filename)
    }
}

test().then(test_success).catch(test_failed)
