var Schema = require('../module/Schema.js');

module.exports = new Schema({
  getAll: {},

  group_add: {
    body: {
      type: 'object',
      required: ['project_id', 'name'],
      properties: {
        project_id: {
            type: 'number'
        },
        name: {
            type: 'string'
        }
      }
    }
  },//{}

  group_delete: {
    body: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
            type: 'number'
        }
      }
    }
  },//{}


  group_change: {
    body: {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: {
            type: 'number'
        },
        name: {
            type: 'string'
        }
      }
    }
  },//{}

  group_getAll: {},


  add: {
    body: {
      type: 'object',
      required: ['group_id', 'name', 'colume', 'type', 'value'],
      properties: {
        group_id: {
            type: 'number'
        },
        name: {
            type: 'string'
        },
        colume: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        value: {
            type: 'string'
        }
      }
    }
  },//{}


  change: {
    body: {
      type: 'object',
      required: ['id', 'name', 'colume', 'type', 'value'],
      properties: {
        id: {
            type: 'number'
        },
        name: {
            type: 'string'
        },
        colume: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        value: {
            type: 'string'
        }
      }
    }
  },//{}


  delete: {
    body: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
            type: 'number'
        }
      }
    }
  },//{}







});
