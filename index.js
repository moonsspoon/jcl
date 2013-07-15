#!/usr/bin/env node

var commander = require('commander'),
    JiraApi = require('jira').JiraApi,
    basename = require('path').basename;

var show = require('./lib/show'),
    create = require('./lib/create'),
    list = require('./lib/list'),
    projects = require('./lib/projects'),
    issuetypes = require('./lib/issuetypes'),
    comment = require('./lib/comment'),
    comments = require('./lib/comments'),
    del = require('./lib/del'),
    transition = require('./lib/transition'),
    assign = require('./lib/assign');

require('./lib/config')(function (config) {
    var jira = new JiraApi(config.protocol, config.host, config.port, config.user, config.password, '2');
    commander
        .command('me')
        .description('all unresolved issues assigned to you\n')
        .action(function () {
            list(jira, {
                assignee: config.user,
                unresolved: true
            });
        });
    commander
        .command('projects')
        .description('list all projects')
        .action(function (args) {
            projects(jira, args);
        });
    commander
        .command('issuetypes')
        .description('list all issue types\n')
        .action(function (args) {
            issuetypes(jira, args);
        });
    commander
        .command('list')
        .description('list issues       ('+ basename(process.argv[1]) +' list --help)')
        .option('-o, --open', "show only open issues ")
        .option('-u, --unresolved', "show only unresolved issues (open, in progress, reopened")
        .option('-a, --assignee <user>', "filter list by assignee")
        .option('-p, --project <project>', "filter list by project")
        .option('-c, --creator <user>', "filter list by creator")
        .option('-s, --status <o|c|r|i>', "filter list by status")
        .action(function (args) {
            list(jira, args);
        });
    commander
        .command('create')
        .description('create an issue   ('+ basename(process.argv[1]) +' create --help)\n')
        .option('-i, --interactive', "interactive mode")
        .option('-a, --assignee <user>', "assignee")
        .option('-p, --project <project>', "project")
        .option('-s, --summary <summary>', "title/summary")
        .option('-d, --desc <desription>', "description")
        .option('-t, --type <issue type>', "name of issue type")
        .action(function (args) {
            create(jira, args);
        });
    commander
        .command('show <id>')
        .description('show an issue by id')
        .action(function (id) {
            show(jira, { id: id });
        });
    commander
        .command('take <id>')
        .description('assign an issue to yourself')
        .action(function (id) {
            assign(jira, {
                id: id,
                user: config.user
            });
        });
    commander
        .command('close <id>')
        .description('close an issue by id')
        .action(function (args) {
            transition(jira, { id: id, transitionId: 2 });
        });
    commander
        .command('resolve <id> ')
        .description('resolve an issue by id')
        .action(function (args) {
            transition(jira, { id: id, transitionId: 3 });
        });
    commander
        .command('start <id>')
        .description('assign to yourself and set an issue to in progress')
        .action(function (id) {
            transition(jira, { id: id, transitionId: 4 }, function () {
                assign(jira, { id: id, user: config.user });
            });
        });
    commander
        .command('stop <id>')
        .description("unassign and set an issue to open")
        .action(function (id) {
            transition(jira, { id: id, transitionId: 301 }, function () {
                assign(jira, { id: id, user: null});
            });
        });
    commander.command('delete <id>')
        .description('delete an issue by id\n')
        .action(function (id) {
            del(jira, {
                id: id
            });
        });
    commander
        .command('comments <id>')
        .description('view comments on an id')
        .action(function (id) {
            comments(jira, {
                id: id
            });
        });
    commander
        .command('comment <id> <text>')
        .description('comment on an issue\n')
        .action(function (id, text) {
            comment(jira, {
                id: id,
                comment: text
            });
        });
    commander
        .command('assign <id> <user>')
        .description('assign a user to an issue')
        .action(function (id, user) {
            assign(jira, {
                id: id,
                user: user
            });
        });

    commander
        .command('unassign <id>')
        .description('unassign a user from an issue\n')
        .action(function (id, user) {
            assign(jira, {
                id: id,
                user: null
            });
        });

    commander
        .command('* <id>')
        .description('show an issue by id')
        .action(function (id) {
            show(jira, { id: id });
        });

    commander.on('--help', function(){
        console.log('  Other:');
        console.log('');
        console.log('    $ custom-help --help');
        console.log('    $ custom-help -h');
        console.log('');
    });


    commander.parse(process.argv);

    if (!process.argv[2]) {
        console.log("\nUnresolved issues assigned to you: ");
        list(jira, {
            assignee: config.user,
            unresolved: true
        });
    }
});

