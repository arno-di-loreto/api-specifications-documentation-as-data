const fs = require('fs');
const yaml = require('js-yaml');
const glob = require('glob');
const resolve = require('path').resolve;

function listFiles(pattern) {
  const paths = glob.sync(pattern);
  // Turning relative path in absolute ones
  const absolutePaths = paths.map(path => resolve(path));
  return absolutePaths;
}

function loadYamlFile(filename) {
  const fileContents = fs.readFileSync(filename, 'utf8');
  const data = yaml.load(fileContents);
  return data;
}

function saveYamlFile(data, filename) {
  const yml = yaml.dump(data, {lineWidth: -1, noRefs: true});
  fs.writeFileSync(filename, yml, 'utf8');
}

function loadJsonFile(filename){
  const data = fs.readFileSync(filename);
  const result = JSON.parse(data);
  return result;
}

function saveJsonFile(data, filename){
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filename, json, 'utf8');
}

function dirname(filenameOrUrl){
  return filenameOrUrl.replace(/(\/[^\/]*$)/,'');
}

function filename(filenameOrUrl){
  const match = filenameOrUrl.match(/(?<filename>[^\/]*)$/);
  const result = match.groups.filename;
  return result;
}

exports.listFiles = listFiles;
exports.loadJsonFile = loadJsonFile;
exports.saveJsonFile = saveJsonFile;
exports.loadYamlFile = loadYamlFile;
exports.saveYamlFile = saveYamlFile;
exports.dirname = dirname;
exports.filename = filename;