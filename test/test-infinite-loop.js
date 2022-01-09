// Copyright (c) 2017-2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

require('./harness')

var vm = new VM()

async function test() {
    var realm = await vm.createRealm()
    await test1(realm, '', 'for(;;);', [])
    await test1(realm, '', 'eval("for(;;);")', [])
    await test1(realm, '', 'for(var i=0;;i++);', [])
    await test1(realm, '', 'eval("for(var i=0;;i++);")', [])
    await test1(realm, '', 'for(var i=0;;);', [])
    await test1(realm, '', 'eval("for(var i=0;;);")', [])
    await test1(realm, '', 'while(true);', [])
    await test1(realm, '', 'eval("while(true);")', [])
    await test1(realm, '', 'with({})for(;;);', [])
    await test1(realm, '', 'eval("with({})for(;;);")', [])
    await test1(realm, '', 'try{for(;;);}finally{x=1;throw 1}', [])

    await test2(realm, '', 'for(;;);', [])
    await test2(realm, '', 'eval("for(;;);")', [])
    await test2(realm, '', 'for(var i=0;;i++);', [])
    await test2(realm, '', 'eval("for(var i=0;;i++);")', [])
    await test2(realm, '', 'for(var i=0;;);', [])
    await test2(realm, '', 'eval("for(var i=0;;);")', [])
    await test2(realm, '', 'while(true);', [])
    await test2(realm, '', 'eval("while(true);")', [])
    await test2(realm, '', 'with({})for(;;);', [])
    await test2(realm, '', 'eval("with({})for(;;);")', [])
    await test2(realm, '', 'try{for(;;);}finally{x=1;throw 1}', [])
}

async function test1(realm, para, text, args) {
    vm.context.stepsLimit = 10000000
    var begin = Date.now()
    var { type, value } = await vm.evaluateFunction(realm, para, text, 'test.js', args)
    var elapsed = Date.now() - begin
    assert(type === 'throw' && String(value) === 'RangeError: steps overflow')
    console.log('elapsed:' + elapsed, text)
}

async function test2(realm, para, text, args) {
    var begin = Date.now()
    stepsLimit = 0
    var steps = 0
    while (steps < 10000000) {
        vm.context.stepsLimit = stepsLimit
        var { type, value } = await vm.evaluateFunction(realm, para, text, 'test.js', args)
        assert(type === 'throw' && String(value) === 'RangeError: steps overflow')
        stepsLimit -= vm.context.stepsLimit
        steps += stepsLimit
    }
    var elapsed = Date.now() - begin
    console.log('elapsed:' + elapsed, ' steps:', steps)
}

test().then(test_success).catch(test_failed)
