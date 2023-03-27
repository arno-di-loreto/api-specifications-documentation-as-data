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

<<<<<<< HEAD
=======

/*
openapi.schemas.forEach(schema => {
  console.log('schema', schema.name);
  schema.fields.forEach(field => {
    console.log('field', field.name, field.type.parentType, getType(field));
  });
});
*/

>>>>>>> fb4566a95dc3a113a9f841e4d67403c451b549de
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
<<<<<<< HEAD
    //jsonPath: getJsonPath(openapi, newSchemaPath)
=======
    jsonPath: getJsonPath(openapi, newSchemaPath)
>>>>>>> fb4566a95dc3a113a9f841e4d67403c451b549de
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

<<<<<<< HEAD
function getTypeAggregatedFields(schema) {
  const result = [];
  // Object Fields
  const objectFields = schema.fields.filter(field => 
      { return getType(field).includes('Object') }
  );
  objectFields.forEach(field => {
    let aggregatedField = result.find( aggField => { return aggField.type === getType(field)});
    if(aggregatedField === undefined){
      aggregatedField = {
        type: getType(field),
        fields: []
      }
      result.push(aggregatedField);
    }
    aggregatedField.fields.push(field); 
  });
  // Non Object fields
  const nonObjectFields = schema.fields.filter(field => 
      { return !getType(field).includes('Object') }
  );
  nonObjectFields.forEach(field => {
    result.push({
      type: getType(field),
      fields: [field]
    });
  });
  
  return result;
}

function getAllPathsV2(schema, previousPath, openapi) {
  let result = [];
  // Schema
  const newSchemaPath = [...previousPath]
  newSchemaPath.push(schema.name);
  const loop = previousPath.includes(schema.name);
  result.push({
    type: 'schema',
    names: [schema.name],
    ids: [schema.name],
    loop: loop,
    path: newSchemaPath
  });
  if(!loop) {
    // Fields
    // 1 - Group by Object Type to reduce number of paths
    const aggregatedFields = getTypeAggregatedFields(schema);
    //console.log(JSON.stringify(aggregatedFields, null, 2))
    aggregatedFields.forEach(aggregatedField => {
      const names = []
      const ids = [];
      aggregatedField.fields.forEach(field => {
        names.push(field.name);
        ids.push(schema.name+'.'+field.name);
      });
      const fieldPath = [...newSchemaPath]
      fieldPath.push(names);
      result.push({
        type: 'field',
        names: names,
        ids: ids,
        loop: loop,
        path: fieldPath
      });
      const fieldTypeSchema = getSchema(openapi, aggregatedField.type);
      if(fieldTypeSchema !== undefined){
        result = result.concat(getAllPathsV2(fieldTypeSchema, fieldPath, openapi));
      }
    });
  }
  return result;
}

function sameIds(id1, id2){
  return JSON.stringify(id1) === JSON.stringify(id2); 
}

function getAggregatedPathsV2(openapi, paths) {
  const aggregatedPaths = [];
  allPaths.forEach(path => {
    if(path.type === 'schema'){
      let elementAggregated = aggregatedPaths.find(element => {
        return sameIds(element.ids, path.ids); 
      });
      if(elementAggregated === undefined){
        elementAggregated = {
          type: path.type,
          names: path.names,
          ids: path.ids,
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
    }
  });
  return aggregatedPaths;
}

=======
>>>>>>> fb4566a95dc3a113a9f841e4d67403c451b549de
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

<<<<<<< HEAD
function getPathCounts(paths) {
  const schemas = paths.filter(path => { return path.type === 'schema'}).length;
  const fields = paths.filter(path => { return path.type === 'field'}).length;
  const total = paths.length;
  return {
    total: total,
    schemas: schemas,
    fields: fields,
  }
}

const openapiObject = getRootSchema(openapi);
//const paths = getAllPaths(openapiObject, [], openapi);
//const aggregatedPaths = getAggregatePaths(openapiObject, paths);
const allPaths = getAllPathsV2(openapiObject, [], openapi);

const aggregatedPaths = getAggregatedPathsV2(openapiObject, allPaths);

=======
const openapiObject = getRootSchema(openapi);
const paths = getAllPaths(openapiObject, [], openapi);
const aggregatedPaths = getAggregatePaths(openapiObject, paths);
>>>>>>> fb4566a95dc3a113a9f841e4d67403c451b549de

const result = {
  counts: {
    elements: getCounts(openapi),
<<<<<<< HEAD
    paths: getPathCounts(allPaths),
    aggregatedSchemaPaths : aggregatedPaths.length,
  },
  aggregatedSchemaPaths: aggregatedPaths // 1 schema without any path 🤔 -> it's Reference Object
=======
    aggregatedPaths: aggregatedPaths.length,
    paths: paths.length
  },
  aggregatedPaths: aggregatedPaths
>>>>>>> fb4566a95dc3a113a9f841e4d67403c451b549de
}
console.log(JSON.stringify(result, null, 2));