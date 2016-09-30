// login module
let request = require('superagent')
let cheerio = require('cheerio')

let recursive = (xa, url, service, web, iter) => {
  console.log(`i: ${iter}  url: ${url}  t: ${new Date().toJSON()}`);
  request
    .get(url)
    .set('Cookie', xa.cookie(url))
    .redirects(0)
    .end((err, res) => {
      if (!err) {
        // 200 response
        if (res.headers.location.match(xa.token.login.url)) {
          // cas redirects
          let $ = cheerio.load(res.text)
          let direct = (r) => {
            recursive(xa, r, service, web, iter + 1)
          }
          eval($('.popup-with-zoom-anim').attr('onclick'));
        }
        else if (res.headers.location.match(xa.token[service].url)) {
          // may be success
          xa.queue(service, "clear")
        }
        else {
          // error, redirects to unknown website
        }
      }
      else {
        if (res.status == 302) {
          // 302 redirects
          if (url.match(xa.token[service].url)) {
            if (res.headers['set-cookie'] && res.headers['set-cookie'].length > 0) {
              xa.token[service] = {
                cookie: res.headers['set-cookie'][0],
                url: web
              }
            }
          }
          // redirects
          recursive(xa, res.headers.location, service, web, iter + 1)
        }
        else {
          // other error occur
          console.error(`iter: ${iter}`);
          console.error(err.status);
        }
      }
    })
}

module.exports = {
  login: (xa) => {
    let url = "https://cas.xjtu.edu.cn/login"
    console.log(`login loading ${new Date().toJSON()}`);
    request
      .get(url)
      .redirects(0)
      .end((err, res) => {
        if (!err) {
          let fc = res.headers['set-cookie'][0]; // Cookie the first time given before login, to get the login additional information
          // console.log(res.headers['set-cookie'][0]);
          $ = cheerio.load(res.text)
          let posthead = {
            lt: $('input[name="lt"]').attr('value'),
            execution: $('input[name="execution"]').attr('value'),
            _eventId: $('input[name="_eventId"]').attr('value'),
            submit: $('input[name="submit"]').attr('value'),
            username: xa.username,
            password: xa.password,
            code: ''
          }
          request
            .post(url)
            .set('Cookie', fc)
            .type('form')
            .send(posthead)
            .redirects(0)
            .end((err, res) => {
              if (!err) {
                if (!xa.token) { xa.token = {} }
                xa.token.login = {
                  cookie: res.headers['set-cookie'][1],
                  web: /http(s)?:\/\/cas\.xjtu\.edu\.cn/
                }
                xa.state.login = "done"
                xa.queue("login", "clear")
                // console.log(xa.token.login);
              }
              else {
                let error = `
                cannot post the user info
                may be the wrong username and password
                `
                console.error(error);
              }
            })
        }
        else {
          let error = `
          cannot get to the Unified authentication system for the first time
          may be the network problem.
          `
          console.error(error);
        }
      })
  },

  auth: (
    xa,      // xjtuAgent Object
    url,     // authentication URL
    service, // type of service
    web      // regexp of web url
  ) => {
    `
    three times redirects
    service => cas ===(click)==> service with ticket => got token
    `
    xa.state[service] = "loading"
    console.log(`${service} loading ${new Date().toJSON()}`);
    xa.queue("login", () => {
      request
        .get(url)
        .redirects(0)
        .end((err, res) => {
          if (!err) {
            // may be success
            xa.queue(service, "clear")
          }
          else {
            if (res.status == 302) {
              request
                .get(res.headers.location)
                .set('Cookie', xa.token.login.cookie)
                .redirects(0)
                .end((err, res) => {
                  if (!err) {
                    let $ = cheerio.load(res.text)
                    let direct = (r) => {
                      request
                        .get(r)
                        .redirects(0)
                        .end((err, res) => {
                          if (!err) {
                            // no access
                          }
                          else {
                            if (res.status == 302) {
                              let c = res.headers['set-cookie'][0]
                              xa.token[service] = {
                                cookie: c,
                                url: web
                              }
                              xa.queue(service, "clear")
                              console.log(res.url);
                            }
                            else {
                              let error = `
                              get cookie error
                              `
                              console.log(error);
                            }
                          }
                        })
                    }
                    eval($('.popup-with-zoom-anim').attr('onclick'));
                  }
                  else {
                    if (res.status == 302) {
                      request
                        .get(res.headers.location)
                        .redirects(0)
                        .end((err, res) => {
                          if (!err) {
                            // no access
                          }
                          else {
                            if (res.status == 302) {
                              let c = res.headers['set-cookie'][0]
                              xa.token[service] = {
                                cookie: c,
                                url: web
                              }
                              xa.queue(service, "clear")
                            }
                            else {
                              let error = `
                              get cookie error
                              `
                              console.log(error);
                            }
                          }
                        })
                    }
                    else {
                      let error = `
                      redirects error
                      `
                      console.error(error);
                    }
                  }
                })
            }
            let error = `
            service cannot reach
            maybe there are problems with sub system
            `
            // console.error(error);
            // console.error(err);
          }
        })
    })
  }
};
