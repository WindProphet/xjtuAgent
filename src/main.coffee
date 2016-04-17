# From Halan to Annala
request = require 'superagent'
cheerio = require 'cheerio'
fs = require 'fs'

# Personal info
pinfo =
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
  'Accept-Encoding': 'gzip, deflate, sdch'
  'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6'

cookieinfo = [
  {
    tag: 'xkfw'
    urlhead: /^http:\/\/xkfw\.xjtu\.edu\.cn/
    cookie: null
  }
  {
    tag: 'ssfw'
    urlhead: /^http:\/\/ssfw\.xjtu\.edu\.cn/
    cookie: null
  }
  {
    tag: 'cas'
    urlhead: /^https:\/\/cas\.xjtu\.edu\.cn/
    cookie: null
  }
]

cookie = (url, coo) ->
  # console.log "This the cookie query"
  # console.log "  URL: " + url
  if not url
    return cookieinfo
  else
    for c in cookieinfo
      if c.urlhead.test url
        if not coo
          if c.cookie
            # console.log "  Return: " + c.cookie
            return c.cookie
          else
            # console.log "  Return: [blank]"
            return ''
        else
          # console.log "  Set: " + coo
          c.cookie = String(coo).match(/^[^;]*;/)[0]

ac = (url, next, stack) ->
  if not stack
    stack = 0
  console.log "Get url#{stack++}: #{url}"
  request
    .get url
    .set 'Cookie', cookie url
    .set headers
    .redirects 0
    .end (err, res) ->
      if err
        if err.status == 302
          console.log "  >> Set-Cookie:" + String err.response.headers['set-cookie']
          cookie url, err.response.headers['set-cookie']
          console.log "  >> Redirects:" + err.response.headers['location']
          ac err.response.headers['location'], next, stack
        else
          console.log if err.status then err.status else 'error'
      else
        console.log '200'
        if typeof next is 'function'
          next(res)
        else
          console.error 'ac:Next function is not a function'

main = (info, next) ->
  url = "https://cas.xjtu.edu.cn/login"
  request
    .get url
    .set headers
    .redirects 0
    .end (err, res) ->
      if not err
        cookie url, res.headers['set-cookie'][0]
        $ = cheerio.load(res.text)
        posthead =
          lt: $('input[name="lt"]').attr('value')
          execution: $('input[name="execution"]').attr('value')
          _eventId: $('input[name="_eventId"]').attr('value')
          submit: $('input[name="submit"]').attr('value')
          username: info.username
          password: info.password
          code: ''
        # next
        request
          .post url
          .set headers
          .set 'Cookie', cookie url
          .type 'form'
          .send posthead
          .redirects 0
          .end (err, res) ->
            if not err
              cookie url, res.headers['set-cookie'][1]
              console.log cookie url
              if typeof next is 'function'
                next()
              else
                console.error 'Next Function is not a function'
            else
              # console.log err
              console.error "error"
      else
        throw "Can not connect to the https://cas.xjtu.edu.cn/login"


# Example
# ac('http://xkfw.xjtu.edu.cn/xsxk/index.xk')
main pinfo, () ->
  ac 'http://xkfw.xjtu.edu.cn/xsxk/index.xk', (res) ->
    $ = cheerio.load res.text
    console.log $('title').text()
    ac 'http://xkfw.xjtu.edu.cn/xsxk/jctslkc.xk', (res) ->
      $ = cheerio.load res.text
      console.log $('#dialog-ysb').html()
