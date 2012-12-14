#! /usr/bin/env node

/*
 * InspectorGitjet
 *
 *
 * Copyright (c) 2012 Caike Souza
 * Licensed under the MIT license.
 */

var InspectorGitjet = function(path){
  // Configuration here
  this.git_repo_path = path;
  this.totalCommitsCount;
  this.currentCommitsCount = 0;
  this.indexFileStore = {};
  this.indexFileName = '.inspector_gitjet';
};

// Runs git commands and callbacks
InspectorGitjet.prototype.git = function(command, callback){
  var child_process = require('child_process')

  child_process.exec('cd ' + this.git_repo_path + ' && git ' + command, function(err, hashList, stderr){
    if (err) throw err;
    return callback(hashList);
  });
};


InspectorGitjet.prototype.filesForCommit = function(commitHash){
  var fs = require('fs');
  var getCommitFilesCommand = 'show --pretty="format:" --name-only ' + commitHash;
  var that = this;
  //console.log(getCommitFilesCommand);

  this.git(getCommitFilesCommand, function(files){
    that.currentCommitsCount++;
    //console.log('Files: ' + files);

    files = files.split(/\n/).filter(function(fileName){ return fileName.length > 0; });

    for (idx in files) {
      var foo = files[idx];

      if (!that.indexFileStore[foo]){
        that.indexFileStore[foo] = [];
      }

      that.indexFileStore[foo].push(files.filter(function(fileName){ return fileName !== foo; }))
    }

    if (that.currentCommitsCount == that.totalCommitsCount) {
      for (idx in that.indexFileStore) {
        fs.writeFile(that.indexFileName, JSON.stringify(that.indexFileStore));
      }
    }

  });

};

InspectorGitjet.prototype.updateIndexFile = function() {
  var listCommitsCommand = 'log --pretty="%h"';
      that = this;

  this.git(listCommitsCommand, function(hashList){
    var commitHashes = hashList.split(/\n/).filter(function(sha){ return sha.length > 0 });

    that.totalCommitsCount = commitHashes.length;
    for(var i=0; i<that.totalCommitsCount; i++){
      that.filesForCommit(commitHashes[i]);
    }
  });
};

InspectorGitjet.prototype.run = function(){
  this.updateIndexFile();
  return 'done.';
};

exports.run = function(){
  var path = (process.argv[2] || process.cwd());
  var inspector = new InspectorGitjet(path);
  inspector.run();
}();

