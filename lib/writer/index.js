var Git = require('./../git');
var fs = require('fs');

function Writer(repoPath, indexFileName){
  this.indexFileStore = {};
  this.indexFileName = indexFileName;
  this.currentCommitsCount = 0;
  this.git = new Git(repoPath);
}

Writer.prototype.run = function(){
  this.loadFromGitCommits();
  this.updateIndexFile();
};

Writer.prototype.loadFromGitCommits = function() {
  var listCommitsCommand = 'log --pretty="%h"';
  var that = this;

  this.git.run(listCommitsCommand, function(hashList){
    var commitHashes = hashList.split(/\n/).filter(function(sha){ return sha.length > 0; });
    that.totalCommitsCount = commitHashes.length;

    for(var i=0; i < commitHashes.length; i++){
      that.filesForCommit(commitHashes[i]);
    }

  });
};

Writer.prototype.filesForCommit = function(commitHash){
  var getCommitFilesCommand = 'show --pretty="format:" --name-only ' + commitHash;
  var that = this;

  return this.git.run(getCommitFilesCommand, function(files){
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

Writer.prototype.flushToFile = function(){
  fs.writeFile(this.indexFileName, JSON.stringify(this.indexFileStore));
};


Writer.prototype.updateIndexFile = function() {
  this.loadFromGitCommits();
};

exports = module.exports = Writer;

