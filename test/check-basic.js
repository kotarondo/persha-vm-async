// Copyright (c) 2017-2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

require('./harness')
process.chdir('basic')

var vm = require('vm');

if (process.argv.length <= 2) {
    var filenames = fs.readdirSync(".")
} else {
    var filenames = process.argv.slice(2)
}

async function test() {
    while (filenames.length) {
        var filename = filenames.pop()
        if (!/^test.*\.js$/.test(filename)) continue
        if ([
                "test-line-directive.js",
                "test-compound-changing-scope.js",
                "test-completion-value.js",
            ].includes(filename)) continue
        console.log(filename)
        var source = fs.readFileSync(filename, 'utf8')
        try {
            var script = new vm.Script(source, { filename })
            var value = script.runInNewContext()
        } catch (err) {
            if (Array.isArray(err) && err[2] === "DONE") {
                assert.deepStrictEqual(err[0], err[1])
                continue;
            } else {
                throw err;
            }
        }
        throw value;
    }
}

test().then(test_success).catch(test_failed);
