var child_process = require('child_process');

function Git(path){
  this.path = path;
}

Git.prototype.run = function(command, callback){
  child_process.exec('cd ' + this.path + ' && git ' + command, function(err, hashList, stderr){
    if (err){ throw 'Error running git command ' + err; }
    return callback(hashList);
  });
};

exports = module.exports = Git;
