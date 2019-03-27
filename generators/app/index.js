'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const glob = require('glob');
const { resolve } = require('path');
const remote = require('yeoman-remote');
const yoHelper = require('yeoman-generator-helper');
const replace = require('replace-in-file');
const fs = require('fs');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the stunning ${chalk.red(
          'generator-vuepress-lite'
        )} generator!`
      )
    );

    const prompts = [
      {
        type: 'input',
        name: 'project_name',
        message: 'Your project_name?',
        default: yoHelper.discoverRoot
      },
      {
        type: 'input',
        name: 'description',
        message: 'Your description?'
      }
    ];

    return this.prompt(prompts).then(
      function(props) {
        // To access props later use this.props.someAnswer;
        this.props = props;
        yoHelper.rewriteProps(props);
      }.bind(this)
    );
  }

  writing() {
    const done = this.async();
    const self = this;
    remote(
      'afeiship',
      'boilerplate-vuepress',
      function(err, cachePath) {
        // copy files:
        self.cachePath = cachePath;
        this.fs.copy(
          glob.sync(resolve(cachePath, '{docs,deploy.sh}')),
          this.destinationPath()
        );
        done();
      }.bind(this)
    );
  }

  end() {
    const { project_name, description, ProjectName } = this.props;
    const destPath = this.destinationPath();
    const files = glob.sync(resolve(destPath, '{docs,deploy.sh}'));
    const boilerplatePkg = require(resolve(this.cachePath, './package.json'));
    const hasPkgJson = fs.existsSync(`${destPath}/package.json`);
    if (hasPkgJson){
      const destPkg = require(`${destPath}/package.json`);
      destPkg.scripts = Object.assign(destPkg.scripts, boilerplatePkg.scripts);
      console.log('dest pkg json:->', destPkg);
      fs.writeFileSync(`${destPath}/package.json`, JSON.stringify(destPkg, null, 2))
    }else{
      fs.writeFileSync(`${destPath}/docs/docs-scripts.json`, JSON.stringify(boilerplatePkg.scripts, null,2))
    }
    replace.sync({
      files,
      from: [
        /boilerplate-vuepress-description/g,
        /boilerplate-vuepress/g,
        /BoilerplateVuepress/g
      ],
      to: [description, project_name, ProjectName]
    });
  }
};
