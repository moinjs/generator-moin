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
