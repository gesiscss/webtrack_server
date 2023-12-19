const inspector = require('schema-inspector');
const validUrl = require('valid-url');
var log = require('./log');

const stringDate = function (schema, post) {
  if (typeof post === 'string' && (new Date(post) === "Invalid Date" || isNaN(new Date(post)) )) {
       this.report('must be a string date (e.g. 2019-04-02T07:16:25.879Z)');
       return '_INVALID_';
  }
  return post;
}

const numericDate = function (schema, post) {
  if (typeof post === 'number' && (new Date(post) === "Invalid Date" || isNaN(new Date(post)) )) {
       this.report('must be a string date (e.g. 2019-04-02T07:16:25.879Z)');
       return '_INVALID_';
  }
  return post;
}

const stringUrl = function (schema, post) {
  try {
    if (!validUrl.isUri(post)) throw new Error('undefined');
    return post;
  } catch (_) {
    this.report(post+' is no URL');
    return '_INVALID_';
  }
}

const schemaPages = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            close: {
              type: 'string',
              exec: stringDate
            },
            content: {
              type: 'array',
              items: {
                create: {
                  type: 'string',
                  exec: stringDate
                },
                html: {
                  type: 'string',
                  minLength: 1
                },
              }
            },
            content_url: {
              type: 'string',
            },
            elapsed: {
              type: 'integer',
            },
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  event: {
                    type: 'string',
                  },
                  timestamp: {
                    type: 'integer',
                  },
                  type: {
                    type: 'string',
                  },
                  values: {
                    type: 'array',
                    properties: {
                      name: {
                        type: 'string',
                      },
                      value: {
                        type: ['string', 'number'],
                      },
                    }
                  },
                }
              }
            },
            id: {
              type: ['string'],
              minLength: 1
            },
            hashes: {
              type: 'array',
            },
            hostname: {
              type: 'string',
            },
            landing_url: {
              type: 'string',
            },
            links: {
              type: 'array',
            },
            meta: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                },
                keywords: {
                  type: 'string',
                },
              }
            },
            precursor_id: {
              type: ['number', 'string', 'null']
            },
            send: {
              type: 'boolean',
            },
            sendTime: {
              type: 'string',
              exec: stringDate
            },
            source: {
              type: 'array',
              items: {
                url: {
                  type: 'string',
                },
                data: {
                  type: 'string',
                },
              }
            },
            start: {
              type: 'string',
              exec: stringDate
            },
            startTime: {
              type: 'number',
              exec: stringDate
            },
            tabId: {
              type: ['integer', 'null'],
            },
            title: {
              type: 'string',
            },
            unhashed_url: {
              type: 'string',
            }
        }//properties
    }
};



class Inspector {

  /**
   * [validatePage check the validation of a page object]
   * @param  {Object} pages
   * @return {Promise}
   */
  validatePage(pages){
    return new Promise((resolve, reject) =>{
      inspector.validate(schemaPages, pages, (err, result) => {
          if(!result.valid){
            log.error(result.format())
          } 
          resolve();
      });
    });
  }

}

module.exports = Inspector;
