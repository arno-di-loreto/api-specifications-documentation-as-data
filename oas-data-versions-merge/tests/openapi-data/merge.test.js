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

  describe('mergeSchemaLists', function() {
    it('should merge schema lists keep unique schema', function() {
      const data = [
        {
          name: 'Swagger',
          version: '2.0',
          schemas: [
            { name: 'A Swagger 2 schema', isRoot: false, isExtensible: true}
          ]
        },
        {
          name: 'OpenAPI',
          version: '3.0.3',
          schemas: [
            { name: 'A OpenAPI 3.0 schema', isRoot: false, isExtensible: true}
          ]
        },
        {
          name: 'OpenAPI',
          version: '3.1.0',
          schemas: [
            { name: 'A OpenAPI 3.1 schema', isRoot: false, isExtensible: true}
          ]
        }
      ];
      const result = merge.mergeSchemaLists(data);
      const expected = [
        { 
          name: 'A Swagger 2 schema', 
          isRoot: false, 
          isExtensible: true, 
          versions: ['2.0'], 
          logs: [{ version: '2.0', isExtensible: true}]
        },
        { 
          name: 'A OpenAPI 3.0 schema', 
          isRoot: false, 
          isExtensible: true, 
          versions: ['3.0'], 
          logs: [{ version: '3.0', isExtensible: true}]
        },
        { 
          name: 'A OpenAPI 3.1 schema', 
          isRoot: false, 
          isExtensible: true, 
          versions: ['3.1'], 
          logs: [{ version: '3.1', isExtensible: true}]
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
            { name: 'Schema Object', isRoot: false, isExtensible: true}
          ]
        },
        {
          name: 'OpenAPI',
          version: '3.0.3',
          schemas: [
            { name: 'Schema Object', isRoot: false, isExtensible: true}
          ]
        },
        {
          name: 'OpenAPI',
          version: '3.1.0',
          schemas: [
            { name: 'Schema Object', isRoot: false, isExtensible: true}
          ]
        }
      ];
      const result = merge.mergeSchemaLists(data);
      assert.equal(result.length, 1)
      assert.equal(result[0].name, 'Schema Object');
      assert.equal(result[0].isRoot, false);
      assert.equal(result[0].isExtensible, true);
      assert.deepEqual(result[0].versions, ['2.0', '3.0', '3.1']);
      assert.equal(result[0].logs.length, 3);
      assert.deepEqual(result[0].logs, [
        { version: '2.0', isExtensible: true},
        { version: '3.0', isExtensible: true},
        { version: '3.1', isExtensible: true}
      ]);
    });
  });
});