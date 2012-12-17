#! /usr/bin/env node

/*
 * InspectorGitjet
 *
 *
 * Copyright (c) 2012 Caike Souza
 * Licensed under the MIT license.
 */

var Writer = require('./writer');
var Reader = require('./reader');

/*
 * Top level class that wraps config
 * and issues read/write commands.
 */
var InspectorGitjet = function(repoPath){
  this.indexFileName = '.inspector_gitjet';
  this.totalCommitsCount = null;

  this.writer = new Writer(repoPath, this.indexFileName);
  this.reader = new Reader(this.indexFileName);
};

InspectorGitjet.prototype.calculateChangeRate = function(fileName) {
  this.reader.run(fileName);
};

InspectorGitjet.prototype.updateIndex = function(){
  this.writer.run();
};

exports.run = (function(){
  var path = (process.argv[2] || process.cwd());

  var inspector = new InspectorGitjet(path);
  inspector.updateIndex();
  // for the time being, Calculating the change rate requires
  // the path name to be given as well, like:
  // $ inspector_gitjet <project_path> <file_name>
  var fileName = null;
  if(fileName = process.argv[3]){
    console.log('Calculating file change...');
    inspector.calculateChangeRate(fileName);
  }

  return 'done.';
})();

