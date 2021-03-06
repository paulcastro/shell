/*
 * Copyright 2017 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//
// read-only tests against the cli's list APIs
//
const common = require('../../../../lib/common'),
      openwhisk = require('../../../../lib/openwhisk'),
      ui = require('../../../../lib/ui'),
      cli = ui.cli

describe('Namespaces list', function() {
    before(common.before(this))
    after(common.after(this))

    it('should have an active repl', () => cli.waitForRepl(this.app))

    // implicit entity type
    ui.aliases.list.forEach(cmd => {
        it(`should list namespaces with "namespaces ${cmd}"`, () => cli.do(`namespaces ${cmd}`, this.app)
           .then(cli.expectOKWithOnly(ui.expectedNamespace())))
    })
})
