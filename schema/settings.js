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
  },
  urllist_get: {
    body: {
      type: 'object',
      required: ['project_id', 'range'],
      properties: {
        project_id: {
           type: 'number'
        },
        range: {
           type: 'array'
        },
        sorted: {
           type: 'array'
        },
        filtered: {
           type: 'array'
        }
      }
    }
  },
  urllist_add: {
    body: {
      type: 'object',
      required: ['project_id', 'url'],
      properties: {
        project_id: {
           type: 'number'
        },
        url: {
           type: 'array'
        }
      }
    }
  },
  urllist_change: {
    body: {
      type: 'object',
      required: ['project_id', 'id', 'url'],
      properties: {
        project_id: {
           type: 'number'
        },
        id: {
           type: 'number'
        },
        url: {
           type: 'string'
        }
      }
    }
  },
  urllist_delete: {
    body: {
      type: 'object',
      required: ['project_id', 'id'],
      properties: {
        project_id: {
           type: 'number'
        },
        id: {
           type: 'number'
        }
      }
    }
  },

  urllist_is_project_id: {
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
