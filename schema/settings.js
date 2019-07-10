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
  },


  schedule_is_project_id: {
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

  schedule_set: {
    body: {
      type: 'object',
      required: ['project_id', 'options'],
      properties: {
        project_id: {
           type: 'number'
        },
        options: {
           type: 'object'
        }
      }
    }
  },


  storage: {
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

  storage_set: {
    body: {
      type: 'object',
      required: ['project_id', 'destination', 'credentials'],
      properties: {
        project_id: {
           type: 'number'
        },
        destination: {
           type: 'string'
        },
        credentials: {
          type: 'object'
        }
      }
    }
  },

  storage_change: {
    body: {
      type: 'object',
      required: ['project_id', 'settings'],
      properties: {
        project_id: {
           type: 'number'
        },
        settings: {
           type: 'object'
        }
      }
    }
  }



});
