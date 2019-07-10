var Schema = require('../module/Schema.js');

module.exports = new Schema({
  login: {
    authorization: false,
    body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: {
            type: 'string'
        },
        password: {
            type: 'string'
        }
      }
    }
  },//login

  install: {
    authorization: false,
    body: {
      type: 'object',
      required: ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE', 'username', 'password'],
      properties: {
        MYSQL_HOST: {
            type: 'string'
        },
        MYSQL_USER: {
            type: 'string'
        },
        MYSQL_PASSWORD: {
            type: 'string'
        },
        MYSQL_DATABASE: {
            type: 'string'
        },
        username: {
            type: 'string'
        },
        password: {
            type: 'string'
        }
      }
    }
  }//install

});
