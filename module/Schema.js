var { Validator, ValidationError } = require('express-json-validator-middleware');
var validator = new Validator({allErrors: true});

const header = require('../schema/headers.js');

class Schema{

  constructor(schema) {
    this.schema = {};
    for (var i in schema){
      if(schema[i].hasOwnProperty('authorization') && schema[i].authorization===false){
        delete schema[i].authorization;
        this.schema[i] = schema[i];
      }else{
        this.schema[i] = Object.assign({}, header, schema[i]);
      }
    }
  }

  /**
   * [get return validator-Function with matching schema]
   * @param  {String} i [description]
   * @return {Function}
   */
  get(i){
    return validator.validate(this.schema[i])
  }

}

module.exports = Schema;
