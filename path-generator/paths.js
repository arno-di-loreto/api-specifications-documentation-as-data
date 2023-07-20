const fs = require('fs');
const _ = require('lodash');


const OPENAPI_31 = '../specifications-data/openapi-3.1.0.json';

function loadSchemas(dataFile){
  let rawOpenapi = fs.readFileSync(dataFile);
  let openapi = JSON.parse(rawOpenapi);
  const result = openapi.schemas;
  return result;
}

function getRootSchema(schemas){
  return schemas.find(schema => { return schema.isRoot});
}

function getSchema(name, schemas){
  const result = schemas.find(schema => schema.name === name);
  return result;
}

function getField(fieldName, schema) {
  return schema.fields.find(field => { return field.name === fieldName});
}

function isFieldSchema(field){
  const result = field.type.types.find(t => t.includes('Object')) !== undefined;
  return result;
}

function detectLoop(node){
  const result = node.path.find( n => n.type === node.type && n.name === node.name) !== undefined;
  return result;
}

function getNode(schema, type, parentPath) {
  const result = {
    name: schema.name,
    type: type,
    path: parentPath,
    pathSignature: pathSignature(parentPath),
    data: schema,
  }
  return result;
}


function listPathsFrom(schema, schemas, parentPath=[]){
  //console.log('Entering schema', schema.name);
  const currentNode = {
    name: schema.name,
    type: 'schema',
    path: parentPath,
    pathSignature: pathSignature(parentPath),
    data: schema,
  }
  currentNode.loop = detectLoop(currentNode);
  let result = [currentNode];
  if(!currentNode.loop){
    const currentPath = parentPath.concat([currentNode]); // Path to this node children
    schema.fields .filter(field => isFieldSchema(field))
                  .forEach(field => {
      //console.log('Field', field.name);
      const fieldNode = {
        name: field.name,
        type: 'field',
        path: currentPath,
        pathSignature: pathSignature(currentPath),
        data: field
      }
      const fieldPath = currentPath.concat([fieldNode]);
      field.type.types.forEach(t => {
        const fieldSchema = getSchema(t, schemas);
        result = result.concat(listPathsFrom(fieldSchema, schemas, fieldPath, result))
      });

    });
  }
  return result;
}

function pathSignature(path){
  // Generate a string where all fields are replace by X except the last one (or not?)
  let normalizedPath = [];
  for(let i=0;i<path.length;i++){
    const node = path[i];
    if(node.type === 'field' && i < path.length-1){
      //normalizedPath.push('field');
    }
    else {
      normalizedPath.push(node.name);
    }
  }
  const result = normalizedPath.join(',');
  return result;
}

function groupBySignature(paths){
  const result = [];
  paths.forEach(path => {
    const signatureFound = result.find( r => r.pathSignature === path.pathSignature);
    if(!signatureFound){
      const groupedPath = {
        name: path.name,
        loop: path.loop,
        pathSignature: path.pathSignature,
        paths: [path.path],
      }
      result.push(groupedPath)
    }
    else {
      signatureFound.paths.push(path.path);
    }
  });
  return result;
}

function simplifyPath(path){
  return path.map(node => node.name).join(',');
}

function simplifyGroupedPaths(paths){
  const result = paths.map(p => { 
    const result = {
      name: p.name,
      loop: p.loop,
      pathSignature: p.pathSignature,
      paths: p.paths.map(x => simplifyPath(x)),
    }
    return result;
  });
  return result;
}


function getAllPathsForSchemaName(schemaName, schemas, paths) {
  const targetSchema = getSchema(schemaName, schemas);
  let result = [];
  targetSchema.usages.forEach(usage => {
    const usageObjectSchema = getSchema(usage.schemaName, schemas);
    const usageFieldSchema = getField(usage.fieldName, usageObjectSchema);
    const usagePaths = paths.filter(p => p.name === usage.schemaName);
    usagePaths.forEach(up => {
      const usageNodes = [getNode(usageObjectSchema, 'object', up), getNode(usageFieldSchema, 'field', up)];

    });
  });
  // Need to add usage.fieldname
  return result;
}

/*
const schemas = loadSchemas(OPENAPI_31);
const schema = getRootSchema(schemas);
const paths = listPathsFrom(schema, schemas);
const groupedBySignature = groupBySignature(paths);
const targetSchemaName = 'Schema Object';


//const filteredPaths = groupedBySignature.filter( p => p.name === targetSchema)
//const filteredPaths = groupedBySignature.filter( p => p.loop)
const filteredPaths = getAllPathsForSchemaName(targetSchemaName, schemas, groupedBySignature);
const result = simplifyGroupedPaths(filteredPaths)
//console.log('filteredPaths', targetSchema, filteredPaths.length);

console.log(JSON.stringify(result, null, 2));
//console.log('count', result.length)
*/

function setVisited(node, visited){
  if(!visited[node]){
    visited[node] = 0;
  }
  visited[node]++;
}

function setUnvisited(node, visited){
  if(visited[node] > 0){
    visited[node]--;
  }
}

function endFound(start, end){
  return start === end;
}

function dfs(start, end, schemas, currentPath=[], visited={}){
  let result = [];
  if(visited[start] > 1) { // "1" to get the actual loop at least once in some cases 🤔 (0 doesn't give all loops)
    // loop 
  }
  else {
    setVisited(start, visited);
    currentPath.push(start);
    if(endFound(start, end)){
      result.push([...currentPath]);
      setUnvisited(start, visited);
      //currentPath.pop();//remove last element added
    }
    // Scanning children
    const schema = getSchema(start, schemas); // undefined if string, boolean, .., hence not an actual defined object
    if(schema){
      schema.fields.forEach(field => {
        field.type.types.forEach(t => {
          const childSchema = getSchema(t, schemas);
          if(childSchema){
            const childResults = dfs(childSchema.name, end, schemas, currentPath, visited);
            if(childResults.length > 0){
              result = result.concat(childResults);
            }
          }
        });
      });
      //
      currentPath.pop();//remove last element added
      setUnvisited(start, visited);
    }
  }
  return cleanDfsResult(result);
}



function cleanDfsResult(paths){
  const result = [];
  const signatures = [];
  paths.forEach(p => {
    const s = signature(p);
    if(!signatures.includes(s) && !containsLoop(p, 2)){
      signatures.push(s);
      result.push(p);
    };
  });
  return result;
}

function toJsonPath(path, schemas){
  let pathArray = [[{value:'$', type: 'field'}]];
  path.forEach( (node, index) => {
    if(index < path.length-1){
      const schema = getSchema(node, schemas);
      const fields = []
      schema.fields
        .filter(field => field.type.types.includes(path[index+1]))
        // Buggy if an object contains a: Object X and b: [Object X]
        .forEach(field => {
          if(field.type.parentType === null){
            fields.push({value: field.name, type: 'field'});
          }
          else {
            fields.push({value: field.name, type: field.type.parentType})
          }
      });
      pathArray.push(fields);
      // Add control to ensure field are of the same type (temp. check before having full path returned by DFS)
    }
  });
  let jsonPath = '';
  pathArray.forEach( (node, index) => {
    let noPoint = false;
    if(node.length === 1){
      if(node[0].value.match(/^{.*}$/)){
        jsonPath+= '.*';  
      }
      else if(node[0].value === '/{path}'){
        jsonPath+='[?(@property.match(/^\\//))]';
        noPoint = true;
      }
      else{
        if(index > 0){
          jsonPath+= '.' + node[0].value;
        }
        else {
          jsonPath+= node[0].value;
        }
      }
    }
    else {
      let filter = '[' + node.map( v => v.value).join(',') + ']';
      if(filter === '[default,{HTTP Status Code}]'){
        filter = '[?(@property.match(/^(default|[0-9][0-9X]{2})$/))]';
      }
      jsonPath += filter;
    }
    if(node[0].type !== 'field'){ // map or array
      jsonPath+= '.*'
    }
  });
  /*
  const result = {
    array: pathArray, 
    path: jsonPath,
  }*/
  const result = jsonPath;
  return result;
}

function getLoop(node, path){
  const start = path.indexOf(node);
  const end = path.lastIndexOf(node);
  const loop = path.slice(start, end+1);
  return loop;
}

function signature(path){
  return path.join(',');
}

function containsLoop(path, level=1){
  let result = false;
  path.forEach(x => {
    if(path.filter(y => x===y).length > level){
      result = true;      
    }
  });
  return result;
}

function listLoops(paths){
  const found = {};
  const simplifiedFound = {}
  paths.forEach(p => {
    p.forEach(x => {
      if(p.filter(y => x===y).length > 1){
        if(!found[x]){
          found[x] = [];
          simplifiedFound[x] = [];
        }
        found[x].push(p);
        const loop = getLoop(x, p);
        if(!simplifiedFound[x].map(p=>signature(p)).includes(signature(loop))){
          simplifiedFound[x].push(loop);
        }
      }
    });
  });
  const loopSchemas = Object.keys(found);
  const result = {
    schemas: loopSchemas,
    schemasCount: loopSchemas.length,
    simplifiedLoops: simplifiedFound,
    //loops: found,
  }
  return result;
}

function dfsAll(schemas){
  const result = [];
  const start = getRootSchema(schemas).name;
  schemas.forEach( s => {
    const end = s.name;
    const paths = dfs(start, end, schemas);
    result.push({ target: end, paths: paths});
  });
  return result;
}

function buildDfsResult(target, paths, schemas){
  const result = {
    target: target,
    usages: getSchema(target, schemas).usages,
    count: paths.length,
    jsonPaths: paths.map(p => { return { path: p.join(',').replaceAll(' Object', ''), jsonPath: toJsonPath(p, schemas)}}).sort(),
    //paths: paths.map(p => p.join(',').replaceAll(' Object', '')).sort(),
    paths: paths
  }
  return result;
}

function buildFlatGraph(schemas){

}

function cli(args){
  const schemas = loadSchemas(OPENAPI_31);
  const end = args[2];
  let namedPaths;
  if(end === '*'){
    namedPaths = dfsAll(schemas);
  }
  else {
    const start = getRootSchema(schemas).name;
    const paths = dfs(start, end, schemas);
    namedPaths = [ {target: start, paths: paths}];
  }
  const paths = namedPaths.map(p => buildDfsResult(p.target, p.paths, schemas));
  let flatPaths = [];
  paths.map( p => p.paths).forEach(a => {
    flatPaths = flatPaths.concat(a);
  });
  //console.log(flatPaths)
  const result = {
    loops:listLoops(flatPaths),
    paths: paths,
  }
  console.log(JSON.stringify(result, null, 2));
}

cli(process.argv);
