var AWS = require('aws-sdk');
var AWSWrapper = require('./AWSWrapper');


module.exports = class IAMService extends AWSWrapper{

    constructor(accessKeyId, secretAccessKey) {
      super();
      //NeedPermisson IAMFullAccess
      this.prefix = 0;
      this.iam_user =  Object.assign({}, {accessKeyId: accessKeyId, secretAccessKey: secretAccessKey}, this.DEFAUL_CONFIG);
      this.iam_config = new AWS.Config(this.iam_user);
      this.service = new AWS.IAM(this.iam_config);
    }


    /**
     * [initSQSUser create user with policy and access data]
     * @return {Promise} Object
     */
    initSQSUser(){
      return new Promise(async (resolve, reject) => {
        let data = await this._runService('listUsers');
        let users = data.Users;
        try {


          var REQUIRE_USERS = {
            'WRITEONLY_USER': {
              UserName: 'S3_WRITEONLY_USER'+(this.prefix===0? '': '_'+this.prefix),
              policy: {
                PolicyName: "S3_WRITEONLY"+(this.prefix===0? '': '_'+this.prefix),
                PolicyDocument: JSON.stringify({
                  Version: '2012-10-17',
                  Statement: {
                    "Sid": "VisualEditor0",
                    "Effect": "Allow",
                    "Action": [
                        "s3:PutObject"
                    ],
                    "Resource": "*"
                  }
                })
              },
              accessKeyId: null,
              secretAccessKey: null,
            },

            'FULLRIGTH_USER': {
              UserName: 'S3_FULLRIGTH_USER'+(this.prefix===0? '': '_'+this.prefix),
              policy: {
                PolicyName: "S3_FULLRIGHT"+(this.prefix===0? '': '_'+this.prefix),
                PolicyDocument: JSON.stringify({
                  Version: '2012-10-17',
                  Statement: {
                    Effect: 'Allow',
                    Action: [
                      "s3:*"
                    ],
                    Resource: '*'
                  }
                })
              },
              accessKeyId: null,
              secretAccessKey: null,
            }

          };

        } catch (e) {
          console.log(e);
        }

        try {
          for (let User in REQUIRE_USERS) {
            let u = REQUIRE_USERS[User];
            if(!users.map(v=>v.UserName).includes(u.UserName)){
              try {
                await this._runService('createUser', {UserName: u.UserName});
                await this._runService('putUserPolicy', Object.assign({}, REQUIRE_USERS[User].policy, {UserName: u.UserName}) );
              } catch (e) {
                reject(e)
              }
            }
            let data = await this._runService('createAccessKey', {UserName: u.UserName});
            REQUIRE_USERS[User].accessKeyId = data.AccessKey.AccessKeyId;
            REQUIRE_USERS[User].secretAccessKey = data.AccessKey.SecretAccessKey;
            delete REQUIRE_USERS[User].policy
          }//for

          resolve(REQUIRE_USERS);
        } catch (e) {
          if(e.code === 'LimitExceeded'){
            this.prefix += 1
            this.initSQSUser().then(resolve).catch(reject);
          }else
            reject(e)
        }


      });
    }


  }//class
