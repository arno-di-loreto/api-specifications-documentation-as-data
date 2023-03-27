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

function getMergedSchemaFullName(mergedSchema) {
  let result = mergedSchema.name;
  if(mergedSchema.versions.length > 0){
    result = `${result} (${mergedSchema.versions.join(', ')})`
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
      const log = {
        version: version.version,
        isExtensible: schemaData.isExtensible,
        description: schemaData.description,
      }
      mergedSchemaData.isExtensible = log.isExtensible;
      mergedSchemaData.description = log.description;
      mergedSchemaData.versions.push(version.version);
      mergedSchemaData.logs.push(log);
    });
  });
  result.forEach(mergedSchema => {
    mergedSchema.fullName = getMergedSchemaFullName(mergedSchema);
  });
  return result;
}

// TODO should be done at data generation level
function canBeReference(field){
  const result = field.type.types.includes('Reference Object');
  return result;
}

// TODO fic generated data to avoid null value
function isRichText(field){
  return field.richText === true;
}

// TODO should be done at data generation level
function getMainType(field){
  const result =  field.type.types.find(type => type !== 'Reference Object');
  return result;
}

function addToMergedFields(mergedFields, sourceFields, sourceVersion){
  sourceFields.forEach(sourceField => {
    let mergedField = mergedFields.find( mergedField => mergedField.name === sourceField.name);
    if(!mergedField){
      mergedField = {
        name: sourceField.name,
        versions: [],
        logs: []
      }
      mergedFields.push(mergedField);
    };
    const log = {
      version: sourceVersion.version,      
      mainType: getMainType(sourceField),
      parentType: sourceField.type.parentType,
      nameType: sourceField.nameType,
      richText: isRichText(sourceField),
      isRequired: sourceField.isRequired,
      canBeReference: canBeReference(sourceField),
      description: sourceField.description,
    };
    mergedField.mainType = log.mainType,
    mergedField.parentType = log.parentType,
    mergedField.nameType = log.nameType,
    mergedField.richText = log.richText,
    mergedField.isRequired = log.isRequired,
    mergedField.canBeReference = log.canBeReference,
    mergedField.description = log.description;
    mergedField.versions.push(sourceVersion.version);
    mergedField.logs.push(log);
  });
  return mergedFields;
}

function addMergeFieldsToMergedSchemaList(mergedSchemaList, openapiDataList){
  openapiDataList.forEach(openapiData => {
    const version = getVersion(openapiData);
    openapiData.schemas.forEach(schemaData => {
      const mergedSchemaData = mergedSchemaList.find(mergedSchemaData => sameSchema(mergedSchemaData, schemaData));
      if(!mergedSchemaData.fields){
        mergedSchemaData.fields = [];
      }
      addToMergedFields(mergedSchemaData.fields, schemaData.fields, version);
    });
  });
  return mergedSchemaList
}

function getMergedVersions(openapiDataList){
  const result = [];
  openapiDataList.forEach(openapiData => {
    result.push(getVersion(openapiData));
  });
  return result;
}

function mergeData(openapiDataList){
  const versions = getMergedVersions(openapiDataList);
  const schemas = mergeSchemaLists(openapiDataList);
  addMergeFieldsToMergedSchemaList(schemas, openapiDataList);
  const result = {
    versions: versions,
    schemas: schemas
  }
  return result;
}

exports.loadData = loadData;
exports.getShortVersionNumber = getShortVersionNumber;
exports.getVersion = getVersion;
exports.sameSchema = sameSchema;
exports.getMergedSchemaName = getMergedSchemaName;
exports.mergeSchemaLists = mergeSchemaLists;
exports.getMergedSchemaFullName = getMergedSchemaFullName;
exports.canBeReference = canBeReference;
exports.getMainType = getMainType;
exports.addToMergedFields = addToMergedFields;
exports.addMergeFieldsToMergedSchemaList = addMergeFieldsToMergedSchemaList;
exports.getMergedVersions = getMergedVersions;
exports.mergeData = mergeData;