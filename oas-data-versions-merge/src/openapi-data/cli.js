const merge = require('./merge');
const fileUtils = require('../utils/files');

const openapiDataList = merge.loadData(__dirname+'/../../../specifications-data', ['2.0', '3.0.3', '3.1.0']);
const mergedData = merge.mergeData(openapiDataList);
fileUtils.saveYamlFile(mergedData, __dirname+'/../../../specifications-data/merged.yaml');