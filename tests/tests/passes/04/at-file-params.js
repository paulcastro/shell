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
// tests that create an action and test that it shows up in the list UI
//    this test also covers toggling the sidecar
//
const common = require('../../../lib/common'),
      openwhisk = require('../../../lib/openwhisk'),
      ui = require('../../../lib/ui'),
      assert = require('assert'),
      paramsFileContent = require('../../../data/params.json'),
      keys = ui.keys,
      cli = ui.cli,
      sidecar = ui.sidecar,
      actionName = 'foo',
      actionName2 = 'foo2',
      actionName3 = 'foo3',
      seqName = 'sss'

describe('@file params and annotations', function() {
    before(common.before(this))
    after(common.after(this))

    it('should have an active repl', () => cli.waitForRepl(this.app))

    // action via wsk action create
    it('should create an action with --param-file', () => cli.do(`wsk action create ${actionName2} ./data/foo.js --param-file ./data/params.json`, this.app)
	.then(cli.expectJustOK)
       .then(sidecar.expectOpen)
       .then(sidecar.expectShowing(actionName2)))
    it('should switch to parameters mode via "params" and show the @file params', () => cli.do('params', this.app)
        .then(cli.expectJustOK)
       .then(sidecar.expectOpen)
       .then(sidecar.expectShowing(actionName2))
       .then(app => app.client.getText(`${ui.selectors.SIDECAR_CONTENT} .action-source`))
       .then(ui.expectStruct(paramsFileContent)))

    // action via wsk action create -P
    it('should create an action with -P', () => cli.do(`wsk action create ${actionName3} ./data/foo.js -P ./data/params.json`, this.app)
	.then(cli.expectJustOK)
       .then(sidecar.expectOpen)
       .then(sidecar.expectShowing(actionName3)))
    it('should switch to parameters mode via "params" and show the @file params', () => cli.do('params', this.app)
        .then(cli.expectJustOK)
       .then(sidecar.expectOpen)
       .then(sidecar.expectShowing(actionName3))
       .then(app => app.client.getText(`${ui.selectors.SIDECAR_CONTENT} .action-source`))
       .then(ui.expectStruct(paramsFileContent)))

    // action via let
    it('should create an action via let with @file parameters', () => cli.do(`let ${actionName} = x=>x -p xxx @./data/params.json`, this.app)
	.then(cli.expectJustOK)
       .then(sidecar.expectOpen)
       .then(sidecar.expectShowing(actionName)))
    it('should switch to parameters mode via "params" and show the @file params', () => cli.do('params', this.app)
        .then(cli.expectJustOK)
       .then(sidecar.expectOpen)
       .then(sidecar.expectShowing(actionName))
       .then(app => app.client.getText(`${ui.selectors.SIDECAR_CONTENT} .action-source`))
       .then(ui.expectStruct({ "xxx": paramsFileContent })))

    // sequence
    it('should create a sequence via let with @file annotations', () => cli.do(`let ${seqName} = x=>x -> x=>x -a xxx @./data/params.json`, this.app)
	.then(cli.expectJustOK)
       .then(sidecar.expectOpen)
       .then(sidecar.expectShowing(seqName)))
    it('should switch to annotations mode via "annotations" and show the @file annotations', () => cli.do('annotations', this.app)
        .then(cli.expectJustOK)
       .then(sidecar.expectOpen)
       .then(sidecar.expectShowing(seqName))
       .then(app => app.client.getText(`${ui.selectors.SIDECAR_CONTENT} .action-source`))
       .then(ui.expectSubset({ "xxx": paramsFileContent })))
})
