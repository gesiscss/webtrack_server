var Schema = require('../module/Schema.js');

module.exports = new Schema({
  add: {
    body: {
      type: 'object',
      required: ['name', 'description'],
      properties: {
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        }
      }
    }
  },

  change: {
    body: {
      type: 'object',
      required: ['id', 'name', 'description'],
      properties: {
        id: {
            type: 'number'
        },
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        }
      }
    }
  },

  getAll: {},

  is_id: {
    body: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
            type: 'number'
        }
      }
    }
  },

  getClientPages: {
    body: {
      type: 'object',
      required: ['id', 'client_id'],
      properties: {
        id: {
            type: 'number'
        },
        client_id: {
            type: 'number'
        }
      }
    }
  },

  deletePage: {
    body: {
      type: 'object',
      required: ['id', 'page_ids'],
      properties: {
        id: {
            type: 'number'
        },
        page_ids: {
            type: 'array'
        }
      }
    }
  },

  pageContentParameter: {
    body: {
      type: 'object',
      required: ['id', 'page_id', 'version'],
      properties: {
        id: {
            type: 'number'
        },
        page_id: {
            type: 'number'
        },
        version: {
            type: 'number'
        }
      }
    }
  },

  permissionParameter: {
    body: {
      type: 'object',
      required: ['id', 'user_id'],
      properties: {
        id: {
            type: 'number'
        },
        user_id: {
            type: 'number'
        }
      }
    }
  },

  changeUserPermission: {
    body: {
      type: 'object',
      required: ['id', 'user_id', 'boolean'],
      properties: {
        id: {
            type: 'number'
        },
        user_id: {
            type: 'number'
        },
        boolean: {
            type: 'boolean'
        }
      }
    }
  },

  getColumns: {
    body: {
      type: 'object',
      required: ['project_id'],
      properties: {
        project_id: {
            type: 'number'
        }
      }
    }
  },//{}

  client_get: {
    body: {
      type: 'object',
      required: ['id', 'range'],
      properties: {
        id: {
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

  client_getCount: {
    body: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
            type: 'number'
        }
      }
    }
  },

  client_create: {
    body: {
      type: 'object',
      required: ['id', 'list'],
      properties: {
        id: {
            type: 'number'
        },
        list: {
            type: 'array'
        }
      }
    }
  },

  client_delete: {
    body: {
      type: 'object',
      required: ['id', 'client_id', 'onlyLink'],
      properties: {
        id: {
            type: 'number'
        },
        client_id: {
            type: 'number'
        },
        onlyLink: {
            type: 'boolean'
        }
      }
    }
  },

  client_change: {
    body: {
      type: 'object',
      required: ['id', 'client_id', 'name'],
      properties: {
        id: {
            type: 'number'
        },
        client_id: {
            type: 'number'
        },
        name: {
            type: 'string'
        }
      }
    }
  },


  client_clean: {
    body: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
            type: 'number'
        }
      }
    }
  },

});
