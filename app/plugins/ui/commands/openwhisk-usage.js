/*
 * Copyright 2018 IBM Corporation
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

const all = ['wsk action', 'wsk activation', 'wsk package', 'wsk rule', 'wsk trigger' ]
all.except = str => all.filter(_ => _ !== str)

const aliases = {
    get: ['open'],
    list: ['ls']
}

const context = type => [{ command: 'wsk' }, { command: `wsk ${type}` }]

/** deployed variant of an entity name */
const deployed = entity => [ Object.assign({}, entity[0], { entity: entity[0].name }) ]

/** required action parameter */
const action = [{ name: 'action', docs: 'an action name' }],
      deployedAction = deployed(action),
      actionImplicitOK = [ Object.assign({}, deployedAction[0], { implicitOK: ['actions', 'activations'] }) ]

/** required package parameter */
const package = [{ name: 'package', docs: 'a package name' }],
      deployedPackage = deployed(package),
      maybeDeployedPackage = deployedPackage // nothing special for now; this is for update, which takes either a name or an entity

/** required trigger parameter */
const trigger = [{ name: 'trigger', docs: 'a trigger name' }],
      deployedTrigger = deployed(trigger),
      maybeDeployedTrigger = deployedTrigger // nothing special for now; this is for update, which takes either a name or an entity

/** required rule parameter */
const rule = [{ name: 'rule', docs: 'a rule name' }],
      deployedRule = deployed(rule),
      maybeDeployedRule = deployedRule // nothing special for now; this is for update, which takes either a name or an entity

/** required source file parameter */
const sourceFile = [{ name: 'sourceFile', positional: true, file: true, docs: 'a local path to the action source' }]

/** required activationId parameter */
const activationID = [{ name: 'activationId', docs: 'an activation ID', entity: 'activation' }]

/** optional parameters having to do with parameter bindings */
const params = [{ name: '--param', alias: '-p', example: 'key value', docs: 'bind a variable to a value', narg: 2, key: 'parameters' },
                { name: '--param-file', alias: '-P', advanced: true, docs: 'a local path to a bindings file', file: true }]

/** optional parameters having to do with annotations */
const annotations = [{ name: '--annotation', alias: '-a', example: 'key value', docs: 'annotate a variable with a value', narg: 2, key: 'annotations' },
                     { name: '--annotation-file', alias: '-A', advanced: true, docs: 'a local path to a bindings file' }]

/** optional parameters and annotations */
const paramsAndAnnotations = params.concat(annotations)

/** package sharing scope parameter */
const shared = [{ name: '--shared', docs: 'package visibility', allowed: ['yes', 'no' ] }]

/** feed annotation for triggers */
const feed = [{ name: '--feed', alias: '-f', docs: 'create a feed', entity: 'action' }]

/** timeout parameter */
const timeout = [{ name: '--timeout', alias: '-t', docs: 'max milliseconds to wait for blocking invoke', defaultValue: 60000 }]

/** resource limit parameters */
const limits = timeout.concat([
    { name: '--memory', alias: '-m', numeric: true, docs: 'the maximum memory in MB', defaultValue: 256 },
    { name: '--logsize', alias: '-l', numeric: true, docs: 'the maximum log size in MB', defaultValue: 10 }
])

/** common action parameters */
const actionMix = params.concat(annotations).concat(limits).concat([
    { name: '--kind', allowed: ['nodejs', 'python', 'swift', 'php'], allowedIsPrefixMatch: true, defaultValue: 'nodejs', docs: 'the action runtime' },
    { name: '--sequence', boolean: true, example: 'a1,a2,a3', docs: 'create a sequence of the given actions' },
    { name: '--copy', boolean: true, advanced: true, docs: 'copy the action named by the second parameter to a new action named by the first' },
    { name: '--web', boolean: true, docs: 'web export the action' },
    { name: '--content-type', hidden: true }
])

/** optional skip and limit parameters */
const skipAndLimit = [{ name: '--limit', alias: '-l', numeric: true, docs: 'show at most N'},
                      { name: '--skip', alias: '-s', numeric: true, docs: 'start from N'}]

/**
 * Usage strings. TODO externalize
 *
 */
module.exports = {
    skipAndLimit,

    // this is the ascii art for OpenWhisk, with backslashes escaped
    wsk: { //header: `        ____      ___                   _    _ _     _     _\r\n       /\\   \\    / _ \\ _ __   ___ _ __ | |  | | |__ (_)___| | __\r\n  /\\  /__\\   \\  | | | | '_ \\ / _ \\ '_ \\| |  | | '_ \\| / __| |/ /\r\n /  \\____ \\  /  | |_| | |_) |  __/ | | | |/\\| | | | | \\__ \\   <\r\n \\   \\  /  \\/    \\___/| .__/ \\___|_| |_|__/\\__|_| |_|_|___/_|\\_\\\r\n  \\___\\/ tm           |_|`,
        breadcrumb: 'OpenWhisk',
        command: 'wsk',
        title: 'The fundamental OpenWhisk operations',
        header: 'These commands will help you work with OpenWhisk assets.',
        example: 'wsk <command>',
        nRowsInViewport: 6, // list all six, since we have a short list
        available: [{ command: 'action', docs: 'work with actions', dir: true, commandPrefix: 'wsk' },
                    { command: 'activation', docs: 'work with activations', dir: true, aliases: ['$'], commandPrefix: 'wsk' },
                    { command: 'package', docs: 'work with packages', dir: true, commandPrefix: 'wsk' },
                    { command: 'rule', docs: 'work with rules', dir: true, commandPrefix: 'wsk' },
                    { command: 'trigger', docs: 'work with triggers', dir: true, commandPrefix: 'wsk' },
                    { command: 'list', docs: 'list all entities in the current namespace', aliases: aliases.list, commandPrefix: 'wsk' }],
    },

    bind: 'Usage: bind <packageName> <bindName> [-p key value]...',

    // ACTION OPERATIONS
    actions: { title: 'Action operations',
               header: 'These commands will help you to work with actions.',
               example: 'wsk action <command>',
               commandPrefix: 'wsk action',
               available: [
                   // ACTION CREATE
                   { command: 'create', docs: 'create a new action', strict: 'create',
                     example: 'wsk action create <action> <sourceFile>',
                     required: [{ name: 'name', docs: 'the name of your new action' }].concat(sourceFile),
                     optional: actionMix,
                     parents: context('action')
                   },
                   // ACTION UPDATE
                   { command: 'update', docs: 'update an existing action, or create one if it does not exist', strict: 'update',
                     example: 'wsk action update <action> [sourceFile]',
                     required: deployedAction,
                     optional: sourceFile.concat(actionMix),
                     parents: context('action')
                   },
                   // ACTION INVOKE
                   { command: 'invoke', docs: 'invoke a given action', strict: 'invoke',
                     example: 'wsk action invoke <action>',
                     required: actionImplicitOK,
                     optional: params.concat([
                         { name: '--blocking', alias: '-b', boolean: true, docs: 'blocking invocation' },
                         { name: '--result', alias: '-r', boolean: true, docs: 'return only the activation result' }].concat(timeout)),
                     parents: context('action')
                   },
                   // ACTION GET
                   { command: 'get', fn: (command, syn='action') => ({
                       strict: command,
                       breadcrumb: 'get',
                       command,
                       aliases: aliases.get,
                       docs: 'get the details of a given action',
                       example: `wsk ${syn} ${command} <action>`,
                       required: deployedAction,
                       parents: context('action')
                   }) },
                   // ACTION DELETE
                   { command: 'delete', docs: 'delete a given action', strict: 'delete',
                     example: 'wsk action delete <action>',
                     required: deployedAction,
                     parents: context('action')
                   },
                   // ACTION LIST
                   { command: 'list', fn: (command, syn='action') => ({
                       breadcrumb: 'list',
                       command, docs: 'list all actions', aliases: aliases.list, strict: command,
                       example: `wsk ${syn} ${command}`,
                       optional: [{ name: 'package', positional: true,
                                    entity: 'package',
                                    docs: 'list all actions in a given package' }].concat(skipAndLimit),
                       parents: context('action')
                   }) }
               ],
               parents: [{ command: 'wsk' }],
               related: all.except('wsk action')
             },

    rules: { title: 'Rule operations',
             header: 'These commands will help you to work with rules.',
             example: 'wsk rule <command>',
             commandPrefix: 'wsk rule',
             available: [{ command: 'create', strict: 'create', docs: 'create a new rule',
                           example: 'wsk rule create <rule> <trigger> <action>',
                           required: rule.concat(deployedTrigger).concat(deployedAction),
                           parents: context('rule')
                         },
                         { command: 'enable', strict: 'enable',
                           docs: 'enable a given rule',
                           example: 'wsk rule enable <rule>',
                           required: deployedRule,
                           parents: context('rule')
                         },
                         { command: 'disable', strict: 'disable',
                           docs: 'disable a given rule',
                           example: 'wsk rule disable <rule>',
                           required: deployedRule,
                           parents: context('rule')
                         },
                         { command: 'status', strict: 'status',
                           docs: 'get the status (enabled or disabled) of given rule',
                           example: 'wsk rule status <rule>',
                           required: deployedRule,
                           parents: context('rule')
                         },
                         { command: 'update', strict: 'update',
                           docs: 'update an existing rule, or create one if it does not exist',
                           example: 'wsk rule update <rule> <trigger> <action>',
                           required: maybeDeployedRule.concat(deployedTrigger).concat(deployedAction),
                           parents: context('rule')
                         },
                         { command: 'get', strict: 'get',
                           docs: 'get the details of a given rule',
                           example: 'wsk rule get <rule>',
                           required: deployedRule,
                           parents: context('rule')
                         },
                         { command: 'delete', strict: 'delete',
                           docs: 'delete a given rule',
                           example: 'wsk rule delete <rule>',
                           required: deployedRule,
                           parents: context('rule')
                         },
                         { command: 'list', fn: (command, syn='action') => ({
                             command, strict: command, aliases: aliases.list,
                             example: `wsk ${syn} ${command}`,
                             docs: 'list all rules',
                             optional: skipAndLimit,
                             parents: context('rule')
                         })
                         }],
             parents: [{ command: 'wsk' }],                
             related: all.except('wsk rule')
           },

    triggers: { title: 'Trigger operations',
                header: 'These commands will help you to work with triggers.',
                example: 'wsk trigger <command>',
                commandPrefix: 'wsk trigger',
                available: [{ command: 'fire', strict: 'fire',
                              docs: 'fire a trigger',
                              example: 'wsk trigger fire <trigger>',
                              required: deployedTrigger,
                              optional: params,
                              parents: context('trigger')
                            },
                            { command: 'create', strict: 'create',
                              docs: 'create new trigger',
                              example: 'wsk trigger create <trigger>',
                              required: trigger,
                              optional: feed.concat(paramsAndAnnotations),
                              parents: context('trigger')
                            },
                            { command: 'update', strict: 'update',
                              docs: 'update an existing an trigger, or create one if it does not exist',
                              example: 'wsk trigger update <trigger>',
                              required: maybeDeployedTrigger,
                              optional: feed.concat(paramsAndAnnotations),
                              parents: context('trigger')
                            },
                            { command: 'get', strict: 'get',
                              docs: 'get the details of a trigger',
                              example: 'wsk trigger get <trigger>',
                              required: deployedTrigger,
                              parents: context('trigger')
                            },
                            { command: 'delete', strict: 'delete',
                              docs: 'delete a given trigger',
                              example: 'wsk trigger delete <trigger>',
                              required: deployedTrigger,
                              parents: context('trigger')
                            },
                            { command: 'list', fn: (command, syn='trigger') => ({
                                breadcrumb: 'list',
                                command, strict: command, aliases: aliases.list,
                                docs: 'list all triggers',
                                example: `wsk ${syn} ${command}`,
                                optional: skipAndLimit,
                                parents: context('trigger')
                            })
                            }],
                parents: [{ command: 'wsk' }],                
                related: all.except('wsk trigger')
           },

    packages: { title: 'Package operations',
                header: 'These commands will help you to work with packages.',
                example: 'wsk package <command>',
                commandPrefix: 'wsk package',
                available: [{ command: 'bind', strict: 'bind',
                              docs: 'bind parameters to a package',
                              example: 'wsk package bind <package> <bindName>',
                              required: deployedPackage.concat(package),
                              optional: paramsAndAnnotations,
                              parents: context('package')
                            },
                            { command: 'create', strict: 'create',
                              docs: 'create a new package',
                              example: `wsk package create <package>`,
                              required: package,
                              optional: paramsAndAnnotations.concat(shared),
                              parents: context('package')
                            },
                            { command: 'update', strict: 'update',
                              docs: 'update an existing package, or create one if it does not exist',
                              example: `wsk package update <package>`,
                              required: maybeDeployedPackage,
                              optional: paramsAndAnnotations.concat(shared),
                              parents: context('package')
                            },
                            { command: 'get', strict: 'get',
                              docs: 'get the details of a given package',
                              example: `wsk package get <package>`,
                              required: deployedPackage,
                              parents: context('package')
                            },
                            { command: 'delete', strict: 'delete',
                              docs: 'delete a given package',
                              example: `wsk package delete <package>`,
                              required: deployedPackage,
                              parents: context('package')
                            },
                            { command: 'list', strict: 'list', fn: (command, syn='package') => ({
                                breadcrumb: 'list', command, strict: command,
                                example: `wsk ${syn} ${command}`,
                                docs: 'list all packages', aliases: aliases.list,
                                optional: [{ name: 'namespace', docs: 'list all packages in a given namespace', positional: true }]
                                    .concat(skipAndLimit),
                                parents: context('package')
                            })
                            },
                            //{ command: 'refresh', docs: 'refresh package bindings' }
                           ],
                parents: [{ command: 'wsk' }],
                related: all.except('wsk package')
              },

    activations: alias => ({ title: 'Activation operations',
                             header: 'These commands will help you to work with activations.',
                             example: `wsk ${alias} <command>`,
                             commandPrefix: `wsk ${alias}`,
                             available: [{ command: 'get', fn: (command, syn='activation') => ({
                                 command, docs: 'get the full details of an activation', strict: command,
                                 example: `wsk ${syn} get <activationID>`,
                                 oneOf: [activationID,
                                         { name: '--last [actionName]', booleanOK: true, docs: 'show the last activation [of the given action]' }],
                                 parents: [{ command: 'wsk' }, { command: 'wsk activation' }]
                             })
                             },
                                         { command: 'list', docs: 'list recent activations', aliases: aliases.list },
                                         { command: 'logs', docs: 'get the logs of an activation', partial: '<activationId>' },
                                         { command: 'result', docs: 'get the result, i.e. return value, of an activation', partial: '<activationId>' },
                                         //{ command: 'poll', docs: 'poll continuously for log messages from currently running actions' },
                                        ],
                             parents: [{ command: 'wsk' }],
                             related: all.except('wsk activation')
                           })
}

module.exports.feeds = module.exports.triggers
