const fs = require('fs');

function getSpectralFormatForVersion(openapiVersion){
  let format;
  if(openapiVersion.startsWith('2')){
    format = 'oas2';
  }
  else if(openapiVersion.startsWith('3.0')){
    format = 'oas3_0';
  }
  else if(openapiVersion.startsWith('3.1')){
    format = 'oas3_1';
  }
  else {
    throw new Error(`Unknown OpenAPI version ${openapiVersion}`);
  }
  return format;
}

function getSpectralAliasNameForObjectName(objectName) {
  return objectName.replaceAll(/\s/g, '');
}

function getSpectralAliasForObjectName(objectName) {
  return `#${getSpectralAliasNameForObjectName(objectName)}`;
}

function generateSpectralAliasForObject(openapiVersion, objectSchema){
  const target = {
    formats: [getSpectralFormatForVersion(openapiVersion)],
    given: []
  }

  const alias = {
    name: getSpectralAliasNameForObjectName(objectSchema.name),
    alias: { targets: [target] }
  };

  if(objectSchema.isRoot){
    target.given.push('$');
  }
  else {
    objectSchema.usages.forEach(usage => {
      const parentAlias = getSpectralAliasForObjectName(usage.schemaName);
      const given = `${parentAlias}.${usage.fieldName}`
      target.given.push(given);
    });
  }
  return alias;
}

function compareSchemaByName(a, b) {
  if ( a.name < b.name ){
    return -1;
  }
  if ( a.name > b.name ){
    return 1;
  }
  return 0;
}

function generateSpectralAliasesForObjects(openapiData){
  const aliases = {};
  openapiData.schemas.sort(compareSchemaByName).forEach(schema => {
    const aliasData = generateSpectralAliasForObject(openapiData.version, schema);
    aliases[aliasData.name] = aliasData.alias;
  });
  return aliases;
}

let rawOpenapi = fs.readFileSync('../specifications-data/3.1.0.json');
let openapi = JSON.parse(rawOpenapi);
const aliases = generateSpectralAliasesForObjects(openapi);
console.log(JSON.stringify(aliases, null, 2));
