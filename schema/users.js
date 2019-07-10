var Schema = require('../module/Schema.js');

module.exports = new Schema({
  getAll: {},

  add: {
    body: {
      type: 'object',
      required: ['loginname', 'password', 'admin', 'enable'],
      properties: {
        loginname: {
            type: 'string'
        },
        password: {
            type: 'string'
        },
        admin: {
            type: 'boolean'
        },
        enable:{
            type: 'boolean'
        }
      }
    }
  },//{}

  del: {
    body: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
            type: 'number'
        }
      }
    }
  },//del

  changePw: {
    body: {
      type: 'object',
      required: ['id', 'pw'],
      properties: {
        id: {
            type: 'number'
        },
        pw:{
            type: 'string'
        }

      }
    }
  },//changePw

  setEnable: {
    body: {
      type: 'object',
      required: ['id', 'boolean'],
      properties: {
        id: {
            type: 'number'
        },
        boolean:{
            type: 'boolean'
        }

      }
    }
  },//setEnable

  setAdmin: {
    body: {
      type: 'object',
      required: ['id', 'boolean'],
      properties: {
        id: {
            type: 'number'
        },
        boolean:{
            type: 'boolean'
        }

      }
    }
  },//setAdmin

});
