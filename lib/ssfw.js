let request = require('superagent')
let cheerio = require('cheerio')

module.exports = {
  name: `师生服务`,
  cls: "xjtuAgent", // Identify for xjtuAgent Module
  main: (xa, r) => {
    let url = "http://ssfw.xjtu.edu.cn/index.portal"
    require('./login.js').auth(xa, url, 'ssfw', /^http(s)?:\/\/ssfw\.xjtu\.edu\.cn/)
  }
};
