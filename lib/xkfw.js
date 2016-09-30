let request = require('superagent')
let cheerio = require('cheerio')

module.exports = {
  name: `选课服务`,
  cls: "xjtuAgent", // Identify for xjtuAgent Module
  main: (xa, r) => {
    let url = "http://xkfw.xjtu.edu.cn/xsxk/index.xk"
    require('./login.js').auth(xa, url, 'xkfw', /^http(s)?:\/\/xkfw\.xjtu\.edu\.cn/)
  }
};
