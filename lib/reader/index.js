var fs = require('fs');
var _ = require('underscore');

function Reader(indexFileName){
  this.indexFileName = indexFileName;
}

Reader.prototype.run = function(fileName){
  var that = this;
  console.log('Reading ' + that.indexFileName);

  fs.readFile(that.indexFileName, 'utf8', function(err, data){
    if(err){ console.log('Error reading ' + that.indexFileName + ': ' + err); return false; }

    var occurrenceData = JSON.parse(data);
    return that._calculateForFile(fileName, occurrenceData);
  });

};

Reader.prototype._calculateForFile = function(fileName, allFiles){
  var filesForFile = allFiles[fileName];
  if(!filesForFile){
    console.log('Invalid file (' + fileName + '). Please check the name.');
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
  var groupedByOccurrence = _.groupBy(occurrenceList, 'occurrences');
  var mostImportantFile = this._mostImportantFiles(groupedByOccurrence);
  console.log(mostImportantFile);
  return mostImportantFile;
};

Reader.prototype._mostImportantFiles = function(groupedByOccurrence){
  var highestOccurrence = _.max(groupedByOccurrence, function(allFiles, mostImportant){
    return mostImportant;
  });
  var importantWithDuplicate = _.map(highestOccurrence, function(fileList){
    return fileList['name'];
  });

  return highestOccurrence;
};

Reader.prototype._buildOccurrenceList = function(fileName, filesForFile) {
  var occurrenceList = [];
  var occurrenceCount = null;

  filesForFile.forEach(function(file){
    occurrenceCount = filesForFile.filter(function(f){ return f ===  file; }).length;
    occurrenceList.push({ name: file, occurrences: occurrenceCount });
  });

  return occurrenceList;
};

exports = module.exports = Reader;

