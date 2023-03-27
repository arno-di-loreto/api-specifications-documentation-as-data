const assert = require('assert');
const merge = require('../../src/openapi-data/merge');


describe('merge', function() {

  describe('loadData', function() {
    it('should load data', function() {
      const result = merge.loadData(__dirname+'/../../../specifications-data', ['2.0', '3.0.3', '3.1.0']);
      assert.equal(result.length, 3);
    });
  }); 

  describe('getShortVersionNumber', function() {
    it('should return 2 levels number when feed with 3 levels number', function(){
      const result = merge.getShortVersionNumber('1.2.3');
      assert.equal(result, '1.2');
    });

    it('should return 2 levels number when feed with 2 levels number', function(){
      const result = merge.getShortVersionNumber('1.2');
      assert.equal(result, '1.2');
    });
  });

  describe('getVersion', function() {
    it('should return version object', function() {
      const data = {
        name: 'OpenAPI',
        version: '3.1.0'
      }
      const result = merge.getVersion(data);
      const expected = {
        name: 'OpenAPI',
        version: '3.1',
        fullVersion: '3.1.0',
        fullName: 'OpenAPI 3.1'
      };
      assert.deepEqual(result, expected);
    });
  });

  describe('sameSchema', function() {
    it('should return true if two root schemas', function() {
      const schema1 = {
        isRoot: true,
        name: 'Swagger Object'
      };
      const schema2 = {
        isRoot: true,
        name: 'OpenAPI Object'
      };
      const result = merge.sameSchema(schema1, schema2);
      assert.equal(result, true);
    });

    it('should return false if root and non schemas', function() {
      const schema1 = {
        isRoot: true,
        name: 'Swagger Object'
      };
      const schema2 = {
        isRoot: false,
        name: 'Schema Object'
      };
      const result = merge.sameSchema(schema1, schema2);
      assert.equal(result, false);
    });

    it('should return true if non root schemas with same name', function() {
      const schema1 = {
        isRoot: false,
        name: 'Schema Object'
      };
      const schema2 = {
        isRoot: false,
        name: 'Schema Object'
      };
      const result = merge.sameSchema(schema1, schema2);
      assert.equal(result, true);
    });

    it('should return false if non root schemas with same name', function() {
      const schema1 = {
        isRoot: false,
        name: 'Schema Object'
      };
      const schema2 = {
        isRoot: false,
        name: 'Paths Object'
      };
      const result = merge.sameSchema(schema1, schema2);
      assert.equal(result, false);
    });
  });

  describe('getMergedSchemaName', function() {
    it('should return Root Object for root schema', function() {
      const data = { name: 'OpenAPI Object', isRoot: true};
      const result = merge.getMergedSchemaName(data);
      assert.equal(result, 'Root Object');
    });

    it('should return name for non root schema', function() {
      const data = { name: 'Schema Object', isRoot: false};
      const result = merge.getMergedSchemaName(data);
      assert.equal(result, 'Schema Object');
    });
  });

  describe('getMergedSchemaFullName', function() {
    it('should return name with versions', function() {
      const data = {
        name: 'Schema Object',
        versions: ['2.0', '3.0', '3.1']
      }
      const result = merge.getMergedSchemaFullName(data);
      assert.equal(result, 'Schema Object (2.0, 3.0, 3.1)');
    });

    it('should return unmodified name if versions is empty', function() {
      const data = {
        name: 'Schema Object',
        versions: []
      }
      const result = merge.getMergedSchemaFullName(data);
      assert.equal(result, 'Schema Object');
    });
  });

  describe('mergeSchemaLists', function() {
    it('should merge schema lists keep unique schema', function() {
      const data = [
        {
          name: 'Swagger',
          version: '2.0',
          schemas: [
            { 
              name: 'A Swagger 2 schema', 
              isRoot: false, 
              isExtensible: true, 
              description: 'A Swagger 2 schema description'
            }
          ]
        },
        {
          name: 'OpenAPI',
          version: '3.0.3',
          schemas: [
            { 
              name: 'An OpenAPI 3.0 schema', 
              isRoot: false, 
              isExtensible: true,
              description: 'An OpenAPI 3.0 schema description'
            }
          ]
        },
        {
          name: 'OpenAPI',
          version: '3.1.0',
          schemas: [
            { 
              name: 'An OpenAPI 3.1 schema', 
              isRoot: false, 
              isExtensible: true,
              description: 'An OpenAPI 3.1 schema description'
            }
          ]
        }
      ];
      const result = merge.mergeSchemaLists(data);
      const expected = [
        { 
          name: 'A Swagger 2 schema', 
          fullName: 'A Swagger 2 schema (2.0)',
          isRoot: false, 
          isExtensible: true, 
          versions: ['2.0'], 
          description: 'A Swagger 2 schema description',
          logs: [{ version: '2.0', isExtensible: true, description: 'A Swagger 2 schema description'}]
        },
        { 
          name: 'An OpenAPI 3.0 schema', 
          fullName: 'An OpenAPI 3.0 schema (3.0)', 
          isRoot: false, 
          isExtensible: true, 
          versions: ['3.0'], 
          description: 'An OpenAPI 3.0 schema description',
          logs: [{ version: '3.0', isExtensible: true, description: 'An OpenAPI 3.0 schema description'}]
        },
        { 
          name: 'An OpenAPI 3.1 schema', 
          fullName: 'An OpenAPI 3.1 schema (3.1)', 
          isRoot: false, 
          isExtensible: true, 
          versions: ['3.1'], 
          description: 'An OpenAPI 3.1 schema description',
          logs: [{ version: '3.1', isExtensible: true, description: 'An OpenAPI 3.1 schema description'}]
        },
      ];
      assert.deepEqual(result, expected);
    });

    it('should merge schema lists merge same schema', function() {
      const data = [
        {
          name: 'Swagger',
          version: '2.0',
          schemas: [
            { 
              name: 'Schema Object', 
              isRoot: false, 
              isExtensible: true,
              description: 'A Swagger 2 schema description'
            }
          ]
        },
        {
          name: 'OpenAPI',
          version: '3.0.3',
          schemas: [
            { 
              name: 'Schema Object', 
              isRoot: false, 
              isExtensible: true,
              description: 'An OpenAPI 3.0 schema description'
            }
          ]
        },
        {
          name: 'OpenAPI',
          version: '3.1.0',
          schemas: [
            { 
              name: 'Schema Object', 
              isRoot: false, 
              isExtensible: true,
              description: 'An OpenAPI 3.1 schema description'
            }
          ]
        }
      ];
      const result = merge.mergeSchemaLists(data);
      assert.equal(result.length, 1)
      assert.equal(result[0].name, 'Schema Object');
      assert.equal(result[0].fullName, 'Schema Object (2.0, 3.0, 3.1)');
      assert.equal(result[0].isRoot, false);
      assert.equal(result[0].isExtensible, true);
      assert.deepEqual(result[0].versions, ['2.0', '3.0', '3.1']);
      assert.equal(result[0].logs.length, 3);
      assert.equal(result[0].description, 'An OpenAPI 3.1 schema description');
    });
  });

  describe('canBeReference', function(){
    it('should return true if can be reference', function() {
      const data = {
        type: {
          types: ['Schema Object', 'Reference Object']
        }
      };
      const result = merge.canBeReference(data);
      assert.equal(result, true);
    });

    it('should return false if can\'t be reference', function() {
      const data = {
        type: {
          types: ['Schema Object']
        }
      };
      const result = merge.canBeReference(data);
      assert.equal(result, false);
    });

  });

  describe('getMainType', function() {
    it('should return main type when 2 items', function(){
      const data = {
        type: {
          types: ['Schema Object', 'Reference Object']
        }
      };
      const result = merge.getMainType(data);
      assert.equal(result, 'Schema Object');
    });

    it('should return the type when one item', function() {
      const data = {
        type: {
          types: ['Schema Object']
        }
      };
      const result = merge.getMainType(data);
      assert.equal(result, 'Schema Object');
    });
  });

  describe('addToMergedFields', function() {
    let mergedFields = [] 
    it('should add new merged field', function() {
      const sourceField = [
        {
          name: 'aField',
          isRequired: true,
          richText: null,
          description: 'a field description',
          type: {
            parentType: 'array',
            types: ['Schema Object', 'Reference Object']
          }
        },
        {
          name: 'anotherField',
          isRequired: true,
          richText: null,
          description: 'a field description',
          type: {
            parentType: 'array',
            types: ['Schema Object', 'Reference Object']
          }
        }
      ];
      const sourceVersion = {version: '3.0' };
      const result = merge.addToMergedFields(mergedFields, sourceField, sourceVersion);
      assert.equal(result.length, 2, 'fields not added');
      assert.equal(result[0].name, 'aField', 'invalid name');
      assert.equal(result[0].mainType, 'Schema Object', 'invalid main type');
      assert.equal(result[0].parentType, 'array', 'invalid parentType');
      assert.equal(result[0].richText, false, 'invalid richText');
      assert.equal(result[0].isRequired, true, 'invalid isRequired');
      assert.equal(result[0].canBeReference, true, 'invalid canBeReference');
      assert.equal(result[0].description, 'a field description', 'invalid description');
      assert.deepEqual(result[0].versions, ['3.0'], 'invalid versions');
      assert.notEqual(result[0].logs, undefined, 'undefined logs');
      assert.equal(result[0].logs.length, 1, 'empty logs');
      assert.equal(result[0].logs[0].version, '3.0', 'wrong logged version');
      assert.equal(result[0].logs[0].mainType, result[0].mainType);
    });

    it('should merge fields', function() {
      const sourceField = [{
        name: 'aField',
        isRequired: true,
        richText: null,
        description: 'a field description from 3.1',
        type: {
          parentType: 'array',
          types: ['Schema Object', 'Reference Object']
        }
      }];
      const sourceVersion = {version: '3.1' };
      const result = merge.addToMergedFields(mergedFields, sourceField, sourceVersion);
      assert.equal(result.length, 2, 'fields not merged');
      assert.deepEqual(result[0].versions, ['3.0', '3.1']);
    });
  });

  describe('addMergeFieldsToMergedSchemaList', function() {
    const mergedSchemaList = [
      {
        name: 'Schema Object',
        versions: ['2.0', '3.0', '3.1']
      }
    ];
    const openapiDataList = [
      {
        name: 'Swagger',
        version: '2.0',
        schemas: [
          { 
            name: 'Schema Object', 
            isRoot: false, 
            isExtensible: true,
            description: 'A Swagger 2 schema description',
            fields: [{
              name: 'aField',
              type: {
                types: ['string'],
                parentType: null,
              }
            }]
          }
        ]
      },
      {
        name: 'OpenAPI',
        version: '3.0.3',
        schemas: [
          { 
            name: 'Schema Object', 
            isRoot: false, 
            isExtensible: true,
            description: 'An OpenAPI 3.0 schema description',
            fields: [{
              name: 'aField',
              type: {
                types: ['string'],
                parentType: null,
              }
            }]
          }
        ]
      },
      {
        name: 'OpenAPI',
        version: '3.1.0',
        schemas: [
          { 
            name: 'Schema Object', 
            isRoot: false, 
            isExtensible: true,
            description: 'An OpenAPI 3.1 schema description',
            fields: [{
              name: 'aField',
              type: {
                types: ['string'],
                parentType: null,
              }
            }]
          }
        ]
      }
    ];
    const result = merge.addMergeFieldsToMergedSchemaList(mergedSchemaList, openapiDataList);
    assert.notEqual(result[0].fields, undefined), 'fields not added';
    assert.equal(result[0].fields.length, 1, 'wrong fields length');
    assert.deepEqual(result[0].fields[0].versions, ['2.0', '3.0', '3.1'], 'wrong field versions');
  });

  describe('getMergedVersions', function() {
    it('should return versions list', function() {
      const openapiDataList = [
        {
          name: 'Swagger',
          version: '2.0',
        },
        {
          name: 'OpenAPI',
          version: '3.0.3',
        },
        {
          name: 'OpenAPI',
          version: '3.1.0',
        }
      ];
      const result = merge.getMergedVersions(openapiDataList);
      assert.equal(result.length, 3);
      assert.deepEqual(result[0], merge.getVersion(openapiDataList[0]));      
    });
  });

  describe('mergeData', function() {
    const openapiDataList = [
      {
        name: 'Swagger',
        version: '2.0',
        schemas: [
          { 
            name: 'Schema Object', 
            isRoot: false, 
            isExtensible: true,
            description: 'A Swagger 2 schema description',
            fields: [{
              name: 'aField',
              type: {
                types: ['string'],
                parentType: null,
              }
            }]
          }
        ]
      },
      {
        name: 'OpenAPI',
        version: '3.0.3',
        schemas: [
          { 
            name: 'Schema Object', 
            isRoot: false, 
            isExtensible: true,
            description: 'An OpenAPI 3.0 schema description',
            fields: [{
              name: 'aField',
              type: {
                types: ['string'],
                parentType: null,
              }
            }]
          }
        ]
      },
      {
        name: 'OpenAPI',
        version: '3.1.0',
        schemas: [
          { 
            name: 'Schema Object', 
            isRoot: false, 
            isExtensible: true,
            description: 'An OpenAPI 3.1 schema description',
            fields: [{
              name: 'aField',
              type: {
                types: ['string'],
                parentType: null,
              }
            }]
          }
        ]
      }
    ];
    const result = merge.mergeData(openapiDataList);
    assert.notEqual(result.versions, undefined, 'versions not defined');
    assert.equal(result.versions.length, 3, 'wrong versions length');
    assert.deepEqual(result.versions[0], merge.getVersion(openapiDataList[0]), 'wrong version item content');
    assert.notEqual(result.schemas, undefined, 'schemas not defined');
    assert.equal(result.schemas.length, 1, 'wrong schemas length');
    assert.equal(result.schemas[0].name, 'Schema Object', 'wrong schema');
    assert.notEqual(result.schemas[0].fields, undefined, 'No merged fields');
  });

});