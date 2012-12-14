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

  this.fs = require('fs');
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
  var getCommitFilesCommand = 'show --pretty="format:" --name-only ' + commitHash;
  var that = this;

  this.git(getCommitFilesCommand, function(files){
    that.currentCommitsCount++;

    files = files.split(/\n/).filter(function(fileName){ return fileName.length > 0; });

    for (idx in files) {
      var foo = files[idx];

      if (!that.indexFileStore[foo]){
        that.indexFileStore[foo] = [];
      }


      files.filter(function(fileName){
        if(fileName !== foo){
          that.indexFileStore[foo].push(fileName);
        }
      });
    }

    if (that.currentCommitsCount === that.totalCommitsCount) {
      for (idx in that.indexFileStore) {
        that.fs.writeFile(that.indexFileName, JSON.stringify(that.indexFileStore));
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
//
// TODO
// Export code above to a Writer module
//
// TODO
// Export code below to a Reader module
//
InspectorGitjet.prototype.calculateChangeRate = function(fileName) {
  var that = this;
  this.fs.readFile(that.indexFileName, function(err, data){
    that._calculateForFile(fileName, JSON.parse(data));
  });
}

InspectorGitjet.prototype._calculateForFile = function(fileName, allFiles){
  var filesForFile = allFiles[fileName];
  if(!filesForFile){
    console.log('Could not find file ' + fileName);
    return false;
  }
  var fileMap = this._buildOccurrences(fileName, filesForFile);
  return console.log(fileMap);
};

InspectorGitjet.prototype._buildOccurrences = function(fileName, filesForFile) {
  var fileMap = {};
  filesForFile.forEach(function(file){
    fileMap[file] = filesForFile.filter(function(f){ return f ===  file }).length;
  });
  return fileMap;
}

exports.run = function(){
  var path = (process.argv[2] || process.cwd());
  var inspector = new InspectorGitjet(path);
  inspector.run();
  // for the time being, Calculating the change rate requires
  // the path name to be given as well, like:
  // $ inspector_gitjet <project_path> <file_name>
  if(fileName = process.argv[3]){
    console.log('Calculating file change...');
    inspector.calculateChangeRate(fileName);
  }
}();

