var Schema = require('../module/Schema.js');

module.exports = new Schema({
  changeBoolean: {
    body: {
      type: 'object',
      required: ['project_id', 'id', 'boolean'],
      properties: {
        project_id: {
            type: 'number'
        },
        id: {
            type: 'string'
        },
        boolean: {
            type: 'boolean'
        }
      }
    }
  },
  changeValue: {
    body: {
      type: 'object',
      required: ['project_id', 'id', 'value'],
      properties: {
        project_id: {
            type: 'number'
        },
        id: {
            type: 'string'
        },
        value: {
            type: ['object', 'string']
        }
      }
    }
  },
  get: {
    body: {
      type: 'object',
      required: ['project_id'],
      properties: {
        project_id: {
            type: 'number'
        }
      }
    }
  }


});
