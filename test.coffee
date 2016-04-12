# From Halan to Annala
request = require 'superagent'
cheerio = require 'cheerio'
fs = require 'fs'

# Personal info
info =
  username: 'lihanyuan'
  password: 'xHC-o89-G3o-98F'

# http header for pretending browser
headers =
  Connection: 'keep-alive'
  'Cache-Control': 'max-age=0'
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  'Upgrade-Insecure-Requests': 1
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
  'Content-Type': 'application/x-www-form-urlencoded'
  # Referer: 'https://cas.xjtu.edu.cn/login'
  'Accept-Encoding': 'gzip, deflate, sdch'
  'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6'

next = (p, j) ->
  request
    .post "https://cas.xjtu.edu.cn/login"
    .set headers
    .set('Cookie', j)
    .type('form')
    .send p
    .redirects 0
    .end (err, res) ->
      if not err
        console.log res.headers['set-cookie'][1]
      else
        console.log err
        console.error "error"


request
  .get 'https://cas.xjtu.edu.cn/login'
  .set headers
  .redirects 0
  .end (err, res) ->
    if not err
      jsid = res.headers['set-cookie'][0].match(/^JSESSIONID=[\dA-Z]+/)[0]
      $ = cheerio.load(res.text)
      posthead =
        lt: $('input[name="lt"]').attr('value')
        execution: $('input[name="execution"]').attr('value')
        _eventId: $('input[name="_eventId"]').attr('value')
        submit: $('input[name="submit"]').attr('value')
        username: info.username
        password: info.password
        code: ''
      next(posthead, jsid)
    else
      # console.log err
      # console.error "error"
