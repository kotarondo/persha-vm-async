// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

require('./harness')
process.chdir("v8bench")

var plugin = `

var old_initializeRealm = initializeRealm;
initializeRealm = new_initializeRealm;

function new_initializeRealm() {
    old_initializeRealm();
    defineFunction(realm.theGlobalObject, "print", 1, Global_print);
}

async function Global_print(thisValue, argumentsList) {
    var a = [];
    var map = createDefaultExportMap();
    for (var i = 0; i < argumentsList.length; i++) {
        a[i] = exportValue(argumentsList[i], map);
    }
    console.log(a);
}

`;

var vm, realm;

async function load(f) {
    await vm.evaluateProgram(realm, fs.readFileSync(f, 'utf8'), f)
}

async function run() {
    vm = new VM([{text: plugin}])
    realm = await vm.createRealm()
    await load('base.js')
    await load('richards.js')
    await load('deltablue.js')
    await load('crypto.js')
    await load('raytrace.js')
    await load('earley-boyer.js')
    await load('regexp.js')
    await load('splay.js')
    await load('navier-stokes.js')
    await load("run.js")
    test_success()
}

run();
