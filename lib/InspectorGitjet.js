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
  this.totalCommitsCount = null;
  this.currentCommitsCount = 0;
  this.indexFileStore = {};
  this.indexFileName = '.inspector_gitjet';

  this.fs = require('fs');
  this.projectName = null;
  this._ = require('underscore');
};

// Runs git commands and callbacks
InspectorGitjet.prototype.git = function(command, callback){
  var child_process = require('child_process');

  child_process.exec('cd ' + this.git_repo_path + ' && git ' + command, function(err, hashList, stderr){
    if (err){ throw err; }
    return callback(hashList);
  });
};

InspectorGitjet.prototype.updateIndexFile = function() {
  this.loadFromGitCommits();
};

InspectorGitjet.prototype.loadFromGitCommits = function() {
  var listCommitsCommand = 'log --pretty="%h"';
  var that = this;

  this.git(listCommitsCommand, function(hashList){
    var commitHashes = hashList.split(/\n/).filter(function(sha){ return sha.length > 0; });
    that.totalCommitsCount = commitHashes.length;

    for(var i=0; i < commitHashes.length; i++){
      that.filesForCommit(commitHashes[i]);
    }

  });
};

InspectorGitjet.prototype.filesForCommit = function(commitHash){
  var getCommitFilesCommand = 'show --pretty="format:" --name-only ' + commitHash;
  var that = this;

  return this.git(getCommitFilesCommand, function(files){
    that.currentCommitsCount++;

    files = files.split(/\n/).filter(function(fileName){ return fileName.length > 0; });

    var index = null;
    for (index in files) {
      var fileName = files[index];

      if (!that.indexFileStore[fileName]){
        that.indexFileStore[fileName] = [];
      }

      files.filter(function(fileFromCommit){
        if(fileFromCommit !== fileName){
          that.indexFileStore[fileName].push(fileFromCommit);
        }
      });
    }

    if(that.currentCommitsCount >= that.totalCommitsCount){
      that.flushToFile();
    }

    return 'done.';
  });
};

InspectorGitjet.prototype.flushToFile = function(){
  //console.log(this.indexFileStore);
  this.fs.writeFile(this.indexFileName, JSON.stringify(this.indexFileStore));
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
  return this.fs.readFile(that.indexFileName, function(err, data){
    var project = JSON.parse(data);
    //that.projectName = project['name'];
    //that._calculateForFile(fileName, project['data']);
    that._calculateForFile(fileName, project);
  });
};

InspectorGitjet.prototype._calculateForFile = function(fileName, allFiles){
  var filesForFile = allFiles[fileName];
  if(!filesForFile){
    console.log('Invalid file (' + fileName + ') for ' + this.projectName + '. Please check the name.');
    return false;
  }

  var occurrenceList = this._buildOccurrenceList(fileName, filesForFile);
  //occurrenceList is array of hashes
  // [
  //  {name: 'file.rb', occurrences: 5},
  //  {name: 'file.rb', occurrences: 5},
  //  {name: 'file.rb', occurrences: 5},
  // ]
  //
  var groupedByOccurrence = this._.groupBy(occurrenceList, 'occurrences');
  var mostImportantFile = this._mostImportantFiles(groupedByOccurrence);
  console.log(mostImportantFile);
  return mostImportantFile;
};

InspectorGitjet.prototype._mostImportantFiles = function(groupedByOccurrence){
  var highestOccurrence = this._.max(groupedByOccurrence, function(allFiles, mostImportant){
    return mostImportant;
  });
  var importantWithDuplicate = this._.map(highestOccurrence, function(fileList){
    return fileList['name'];
  });

  return highestOccurrence;
};

InspectorGitjet.prototype._buildOccurrenceList = function(fileName, filesForFile) {
  var occurrenceList = [];
  var occurrenceCount = null;

  filesForFile.forEach(function(file){
    occurrenceCount = filesForFile.filter(function(f){ return f ===  file; }).length;
    occurrenceList.push({ name: file, occurrences: occurrenceCount });
  });
  return occurrenceList;
};

exports.run = (function(){
  var path = (process.argv[2] || process.cwd());
  var inspector = new InspectorGitjet(path);
  inspector.run();
  // for the time being, Calculating the change rate requires
  // the path name to be given as well, like:
  // $ inspector_gitjet <project_path> <file_name>
  var fileName = null;
  if(fileName = process.argv[3]){
    console.log('Calculating file change...');
    inspector.calculateChangeRate(fileName);
  }

  return 'done.';
});

