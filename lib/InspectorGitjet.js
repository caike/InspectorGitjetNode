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
};

// Runs git commands and callbacks
InspectorGitjet.prototype.git = function(command, callback){
  var exec = require('child_process').exec;

  exec('cd ' + this.git_repo_path + '; git ' + command, function(err, hashList, stderr){
    if (err) throw err;
    return callback(hashList);
  });
};

InspectorGitjet.prototype.run = function(){

  var commitHashes = [],
      filesFromCommitHashes = [],
      currentHash;

  this.git('log --pretty="%h"', function(hashList){
    console.log('hashList: ' + hashList);
    console.log(hashList.split(/\n/));

    var _hashList = hashList.split(/\n/);

    for(i=0; i<_hashList.length; i++){

      // skips empty string hash
      if(_hashList[i].length == 0) continue;

      filesFromCommitHashes.push({hash: _hashList[i], fileList: 'TODO' });
      console.log({commitHash: _hashList[i], fileList: 'TODO' });
    }

    for(i=0; i<filesFromCommitHashes.length; i++){
      commitHash = filesFromCommitHashes[i];
      console.log('currentFileHash: ' + commitHash.hash);
    }
  });

  return 'done.';
}

exports.run = function(){
  var inspector = new InspectorGitjet('/Users/caike/Projects/inspector_gitjet');
  inspector.run();
}();

