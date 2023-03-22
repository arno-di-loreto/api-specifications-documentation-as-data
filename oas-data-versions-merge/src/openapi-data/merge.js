const fileUtils = require('../utils/files');

function loadData(path, versions){
  const result = [];
  versions.forEach(version => {
    const filename = `${path}/${version}.json`;
    const content = fileUtils.loadJsonFile(filename);
    result.push(content);
  });
  return result;
}

function getShortVersionNumber(versionNumber){
  const match = versionNumber.match(/(?<short>\d\.\d)/);
  const result = match.groups.short;
  return result;
}

function getVersion(openapiData){
  const shortVersion = getShortVersionNumber(openapiData.version);
  const result = {
    name: openapiData.name,
    fullVersion: openapiData.version,
    version: shortVersion,
    fullName: `${openapiData.name} ${shortVersion}`
  };
  return result;
}

function sameSchema(schema1, schema2){
  let result;
  if(schema1.isRoot && schema2.isRoot){
    result = true;
  }
  else {
    result = schema1.name === schema2.name;
  }
  return result;
}

function getMergedSchemaName(sourceSchema){
  let result;
  if(sourceSchema.isRoot){
    result = 'Root Object'
  }
  else {
    result = sourceSchema.name;
  }
  return result;
}

function mergeSchemaLists(openapiDataList){
  const result = [];
  openapiDataList.forEach(openapiData => {
    const version = getVersion(openapiData);
    openapiData.schemas.forEach(schemaData => {
      let mergedSchemaData = result.find(mergedSchemaData => sameSchema(mergedSchemaData, schemaData));
      if(!mergedSchemaData){
        mergedSchemaData = {
          name: getMergedSchemaName(schemaData),
          isRoot: schemaData.isRoot,
          versions: [], 
          logs: []
        }
        result.push(mergedSchemaData);
      }
      mergedSchemaData.isExtensible = schemaData.isExtensible;
      mergedSchemaData.versions.push(version.version);
      mergedSchemaData.logs.push({
        version: version.version,
        isExtensible: schemaData.isExtensible
      });
    });
  });
  return result;
}



/*
function mergeData(contents){
  contents.forEach(content => {
    const version = getVersion(content);
  });
}*/

exports.loadData = loadData;
exports.getShortVersionNumber = getShortVersionNumber;
exports.getVersion = getVersion;
exports.sameSchema = sameSchema;
exports.getMergedSchemaName = getMergedSchemaName;
exports.mergeSchemaLists = mergeSchemaLists;