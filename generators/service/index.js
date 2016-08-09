'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
let logo = require("moin-logo");
let fs = require("fs");

module.exports = yeoman.Base.extend({
    prompting: function () {
        logo();
        this.log("Welcome to the Moin service generator");

        var that = this;

        var prompts = [
            {
                type: 'list',
                name: 'target',
                message: 'Where should the Service be created?',
                default: "./node_modules",
                choices: ()=> {
                    let conf = require(this.destinationPath("config.json"));
                    let p = this.destinationRoot();
                    return conf["moin-fs-watcher"].serviceFolders.map(path=>path.replace(p, "."));
                }
            },
            {
                type: "input",
                name: "name",
                message: "Which should be the name of the service",
                validate: (val, props)=> {
                    if (/^[a-z][a-z0-9\._]{0,213}$/.exec(val)) {
                        return new Promise((resolve)=> {
                            fs.stat(that.destinationPath(props.target, val), (err)=> {
                                if (err) {
                                    resolve(true);
                                } else {
                                    resolve("there is already a service with this name.");
                                }
                            });
                        });
                    } else {
                        return "can only contain lowercase characters, numbers, underscores and dots. has to start with a character";
                    }
                }
            },
            {
                type: 'list',
                name: 'template',
                message: 'What type of bootstrap code do you want?',
                default: "index.js",
                choices: [
                    {name: "Event Example", value: "index.js"},
                    {name: "Basic Example", value: "index_2.js"}
                ]
            }
        ];

        return this.prompt(prompts).then(function (props) {
            // To access props later use this.props.someAnswer;
            this.props = props;
        }.bind(this));
    },

    writing: function () {
        this.fs.copy(
            this.templatePath(this.props.template),
            this.destinationPath(this.props.target, this.props.name, 'index.js')
        );
        this.fs.writeJSON(this.destinationPath(this.props.target, this.props.name, "package.json"), {
            name: this.props.name,
            moin: {
                type: "service"
            }
        })
    },

    install: function () {
    }
});
