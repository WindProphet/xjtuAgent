let request = require('superagent')
let cheerio = require('cheerio')

module.exports = {
  name: `考勤服务`,
  cls: "xjtuAgent", // Identify for xjtuAgent Module
  main: (xa, r) => {
    let url = "http://202.117.1.152:8080/User/Index"
    require('./login.js').auth(xa, url, 'kqfw', /^http(s)?:\/\/202\.117\.1\.152/)
  }
};
