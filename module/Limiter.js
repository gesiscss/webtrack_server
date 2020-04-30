var log = require('./lib/log');

const RateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const bannedIPs = {};
const banned_ms = 60*60*1000; //   minutes
const window_secs = 60; 
const max_requests = 120;

function Limiter() {

  this.limiter = new RateLimit({
    store: new RedisStore({
      expiry: window_secs
      // see Configuration
    }),
    onLimitReached: function(req, res, options) {
      log.msg('Limit reached!') // req.ip
      bannedIPs[req.ip] = +new Date() + banned_ms;
    },
    max: max_requests, // limit each IP to 100 requests per windowMs
    windowMs: window_secs * 1000
  });

  this.banner = function(req, res, next) {
    if (bannedIPs[req.ip] >= +new Date()) {
      res.status(429).send("Processing until: " + new Date(bannedIPs[req.ip]));
    } else {
      next();
    }
  }
}

module.exports = new Limiter(); 