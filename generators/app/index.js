'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
let path = require("path");
let logo = require("moin-logo");

module.exports = yeoman.Base.extend({
    prompting: function () {
        // Have Yeoman greet the user.
        logo();
        this.log("Welcome to the Moin generator");
        let that = this;
        this.log("Moin modules and services are automatically loaded from within the node_modules folder.");
        var prompts = [
            {
                type: 'confirm',
                name: 'service',
                message: 'Would you like to have an additional Moin-service folder?',
                default: true
            },
            {
                type: 'input',
                name: 'servicePath',
                when: ({service})=> service,
                message: 'Which folder should hold the Moin-services?',
                default: "services"
            },
            /*{
             type: 'confirm',
             name: 'reload',
             message: 'Do you want auto-reloading of services, when you edit the file?',
             default: true
             },*/
            {
                type: 'confirm',
                name: 'module',
                message: 'Would you like to have an additional Moin-module folder?',
                default: false
            },
            {
                type: 'input',
                name: 'modulePath',
                when: ({module})=> module,
                message: 'Which folder should hold the Moin-modules?',
                default: "modules"
            },
            {
                type: 'confirm',
                name: 'remote',
                message: 'Do you want to activate the interconnection between moin instances?',
                default: false
            },
            {
                type: 'list',
                name: 'netMode',
                message: 'Client or Server Mode?',
                default: "client",
                when: ({remote})=>remote,
                choices: ["client", "server"]
            },
            {
                type: 'input',
                name: 'host',
                when: ({remote,netMode})=> remote && netMode == "client",
                message: "Which is the host of the Server?",
                default: "localhost"
            },
            {
                type: 'input',
                name: 'port',
                when: ({remote})=> remote,
                validate: (val)=> {
                    val = parseInt(val);
                    return val > 1024 && val < 65535 ? true : "Port must be an Integer between 1024 and 65535";
                },
                filter: (val)=>parseInt(val),
                message: ({netMode})=> {
                    if (netMode == "client") {
                        return "Which port is the Server running on?";
                    } else {
                        return "On which Port should the server listen for connections?";
                    }
                },
                default: 2987
            }
        ];

        return this.prompt(prompts).then(function (props) {
            // To access props later use this.props.someAnswer;
            this.props = props;
        }.bind(this));
    },
    configuring(){
        return new Promise((resolve, reject)=> {
            var exec = require('child_process').exec;
            exec("moin init", ()=> {
                let configPath = path.join(process.cwd(), "config.json");
                let config = require(configPath);
                config.moin.modulePaths = [
                    this.destinationPath('node_modules')
                ];

                this.create = [this.destinationPath('node_modules')];

                if (this.props.module) {
                    config.moin.modulePaths.push(this.destinationPath(this.props.modulePath));
                    this.create.push(this.destinationPath(this.props.modulePath));
                }

                config["moin-fs-watcher"].serviceFolders = [
                    this.destinationPath('node_modules')
                ];
                if (this.props.service) {
                    config["moin-fs-watcher"].serviceFolders.push(this.destinationPath(this.props.servicePath));
                    this.create.push(this.destinationPath(this.props.servicePath));
                }

                if (!this.props.remote) {
                    config["moin-remote-dispatcher"].active = false;
                } else {
                    config["moin-remote-dispatcher"].active = true;
                    config["moin-remote-dispatcher"].mode = this.props.netMode;
                    config["moin-remote-dispatcher"].host = this.props.host;
                    config["moin-remote-dispatcher"].port = this.props.port;
                }

                this.config = config;
                resolve();
            });
        });
    },
    writing: function () {
        let fs = require("fs");
        return Promise.all(this.create.map(p=>new Promise((resolve)=> {
            fs.stat(p, (err, stat)=> {
                if (err) {
                    fs.mkdir(p, resolve);
                } else {
                    resolve();
                }
            })
        })).concat([new Promise((res)=>fs.writeFile(this.destinationPath("config.json"), JSON.stringify(this.config, null, 2), res))]));
    },

    end: function () {
        this.log("You're all set up. Generate a service with " + chalk.cyan("yo moin:service") + " and run the app with " + chalk.cyan("moin"));
    }
});
