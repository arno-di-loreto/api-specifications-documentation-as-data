const merge = require('./merge');
const fileUtils = require('../utils/files');

function mergeCli(sourceDir, versions, outputFilename){
  console.log('Merging', versions)
  const dataList = merge.loadData(sourceDir, versions);
  const mergedData = merge.mergeData(dataList);
  fileUtils.saveJsonFile(mergedData, outputFilename);
}

let sourceDir, versions, outputFilename;

sourceDir = __dirname+'/../../../specifications-data';
versions = ['openapi-2.0', 'openapi-3.0.3', 'openapi-3.1.0'];
outputFilename = __dirname+'/../../../specifications-data/openapi-merged.json';
mergeCli(sourceDir, versions, outputFilename);

sourceDir = __dirname+'/../../../specifications-data';
versions = ['asyncapi-2.0.0', 'asyncapi-2.1.0', 'asyncapi-2.2.0', 'asyncapi-2.3.0', 'asyncapi-2.4.0', 'asyncapi-2.5.0', 'asyncapi-2.6.0']
outputFilename = __dirname+'/../../../specifications-data/asyncapi-merged.json';
mergeCli(sourceDir, versions, outputFilename);
