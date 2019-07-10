var AWS = require('aws-sdk');
var AWSWrapper = require('./AWSWrapper');

class SQSService extends AWSWrapper{

    constructor(accessKeyId, secretAccessKey, defaultUrl=null) {
      super();
      //NeedPermisson IAMFullAccess
      this.prefix = 0;
      this.sqs_user = Object.assign({}, this.DEFAUL_CONFIG, Object.assign({}, {accessKeyId: accessKeyId, secretAccessKey: secretAccessKey} ));
      this.sqs_config = new AWS.Config(this.sqs_user);
      this.service = new AWS.SQS(this.sqs_config);
      this.defaultUrl = defaultUrl;
    }

    /**
     * [setDefaulURL set default QueueUrl]
     * @param {String} QueueUrl
     */
    setDefaulURL(QueueUrl){
      this.defaultUrl = QueueUrl;
    }

    /**
     * [create new Queue]
     * @param  {String}  QueueName       [default: '']
     * @param  {Boolean} setAsDefault    [default: false]
     * @return {Promise} String QueueUrl
     */
    create(QueueName='', setAsDefault=false){
      return new Promise(async (resolve, reject)=>{
          try {
            let r = await this._runService('createQueue', {QueueName: QueueName});
            this.defaultUrl = r.QueueUrl;
            resolve(r.QueueUrl)
          } catch (e) {
            reject(e)
          }
      });
    }

    /**
     * [get return all QueueUrls as list]
     * @return {Promise} Array
     */
    get(){
      return new Promise((resolve, reject)=>{
        this._runService('listQueues')
        .then(e => resolve(e.QueueUrls || []))
        .catch(reject)
      });
    }

    /**
     * [delete queue]
     * @param  {String} QueueUrl
     * @return {Promise} Object
     */
    delete(QueueUrl){
      return new Promise((resolve, reject)=>{
        this._runService('deleteQueue', {QueueUrl: QueueUrl})
          .then(e => resolve(e.QueueUrl))
          .catch(reject)
      });
    }

    /**
     * [sendMessage sending Data to the queue]
     * @param  {Object} param      [default: {}]
     * @return {Promise} Object
     */
    sendMessage(param={}){
      return new Promise((resolve, reject)=>{
        this._runService('sendMessage', Object.assign({}, {QueueUrl: this.defaultUrl}, param) )
          .then(resolve)
          .catch(reject)
      });
    }

    /**
     * [receiveMessage description]
     * @param  {Object} param      [default: {}]
     * @return {Promise} Array
     */
    receiveMessage(param={}){
      return new Promise((resolve, reject) => {
        this._runService('receiveMessage', Object.assign({}, {QueueUrl: this.defaultUrl}, param) )
          .then(e => resolve(e.Messages || []))
          .catch(reject)
      });
    }

    /**
     * [purge clear the data from the queue]
     * @param  {Object} param      [default: {}]
     * @return {Promise} Object
     */
    purge(param={}){
      return new Promise((resolve, reject)=>{
        this._runService('purgeQueue', Object.assign({}, {QueueUrl: this.defaultUrl}, param) )
          .then(resolve)
          .catch(reject)
      });
    }


  }//class


if(module!==undefined) module.exports = SQSService;
