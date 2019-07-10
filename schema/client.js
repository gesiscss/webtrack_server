var Schema = require('../module/Schema.js');

module.exports = new Schema({
  checkid: {
    authorization: false,
    body: {
      type: 'object',
      required: ['client_hash', 'project_id'],
      properties: {
        client_hash: {
            type: 'string'
        },
        project_id: {
            type: 'number'
        }
      }
    }
  },//login


});
