'use strict';

const fs = require('fs');

let rawOpenapi = fs.readFileSync('../specifications-data/3.1.0.json');
let openapi = JSON.parse(rawOpenapi);

function getRootSchema(openapi){
  return openapi.schemas.find(schema => { return schema.isRoot});
}

function getSchema(openapi, schemaName) {
  return openapi.schemas.find(schema => {return schema.name === schemaName});
}

function getField(schema, fieldName) {
  return schema.fields.find(field => { return field.name === fieldName});
}

function getType(field) {
  return field.type.types.find(type => {
    return type !== "Reference Object"
  });
}


/*
openapi.schemas.forEach(schema => {
  console.log('schema', schema.name);
  schema.fields.forEach(field => {
    console.log('field', field.name, field.type.parentType, getType(field));
  });
});
*/

function getAllPaths(schema, previousPath, openapi){
  let result = [];
  // Schema
  const newSchemaPath = [...previousPath]
  newSchemaPath.push(schema.name);
  //console.log('Entering schema', schema.name, 'path is', newSchemaPath.join(','));
  const loop = previousPath.includes(schema.name);
  result.push({
    type: 'schema',
    name: schema.name,
    id: schema.name,
    loop: loop,
    path: newSchemaPath,
    jsonPath: getJsonPath(openapi, newSchemaPath)
  });
  if(!loop) {
    // Fields
    schema.fields.forEach(field => {
      const fieldPath = [...newSchemaPath]
      fieldPath.push(field.name);
      result.push({
        type: 'field',
        name: field.name,
        id: schema.name + '.' + field.name,
        loop: false,
        path: fieldPath,
        jsonPath: getJsonPath(openapi, fieldPath)
      });
      const fieldType = getType(field);
      const fieldTypeSchema = getSchema(openapi, fieldType);
      //console.log('Entering field', field.name, 'of type', fieldType, 'path is', fieldPath.join(','));
      if(fieldTypeSchema !== undefined){
        result = result.concat(getAllPaths(fieldTypeSchema, fieldPath, openapi));
      }
      else {
        //console.log('Path ends');
      }
    });
  }
  return result;
}

function getJsonPath(openapi, path){
  let jsonPath = '$';
  for(let i=0;i<path.length;i++){
    const segment = path[i];
    if(segment.includes(' Object')) {
      // Probably do nothing
      //if(i < path.length-1){
      //  jsonPath += '.';
      //}
      if(i>=2){
        const parentFieldName = path[i-1];
        const parentSchemaName = path[i-2];
        const parentSchema = getSchema(openapi, parentSchemaName);
        const parentField = getField(parentSchema, parentFieldName);
        if(parentField.type.parentType === 'array'){
          jsonPath += '[*]';
        }
        else if(parentField.type.parentType === 'map'){
          jsonPath += '.*';
        }  
      }
    }
    else { // field
      const parentSchemaName = path[i-1];
      const parentSchema = getSchema(openapi, parentSchemaName);
      const field = getField(parentSchema, segment);
      if(field.nameType === 'patterned'){
        const regex = segment
                        .replace(/(^.*)({.*})(.*$)/, '$1.*$3')
                        .replace(/^\//, '^\\/')
                        .replace('HTTP Status Code', '^[1-5][0-9X]{2}$');
        jsonPath += `[?(@property =~ /${regex}/)]`;
      }
      else {
        jsonPath += '.';
        jsonPath += segment;  
      }
    }
  }
  return jsonPath;
} 

function getAggregatePaths(openapi, allPaths){
  const aggregatedPaths = [];
  allPaths.forEach(path => {
    let elementAggregated = aggregatedPaths.find(element => {
      return element.id === path.id; 
    });
    if(elementAggregated === undefined){
      elementAggregated = {
        type: path.type,
        name: path.name,
        id: path.id,
        somePathsWithLoops: false,
        pathsCount: 0,
        paths: []
      }
      aggregatedPaths.push(elementAggregated);
    }
    elementAggregated.paths.push({
      loop: path.loop,
      path: path.path,
      jsonPath: path.jsonPath
    });
    elementAggregated.somePathsWithLoops =  elementAggregated.somePathsWithLoops || path.loop;
    elementAggregated.pathsCount =  elementAggregated.paths.length;
  });
  return aggregatedPaths;
}

function getCounts(openapi){
  const schemas = openapi.schemas.length;
  let fields = 0;
  openapi.schemas.forEach(schema => {
    fields+= schema.fields.length;
  });
  const total = schemas + fields;
  return {
    total: total,
    schemas: schemas,
    fields: fields,
  }
}

const openapiObject = getRootSchema(openapi);
const paths = getAllPaths(openapiObject, [], openapi);
const aggregatedPaths = getAggregatePaths(openapiObject, paths);

const result = {
  counts: {
    elements: getCounts(openapi),
    aggregatedPaths: aggregatedPaths.length,
    paths: paths.length
  },
  aggregatedPaths: aggregatedPaths
}
console.log(JSON.stringify(result, null, 2));