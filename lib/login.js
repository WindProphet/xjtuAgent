// login module
let request = require('superagent')
let cheerio = require('cheerio')

let recursive = (xa, url, service, web, iter) => {
  console.log(`i: ${iter}  url: ${url}  t: ${new Date().toJSON()}`);
  // console.log(xa.cookie(url));
  request
    .get(url)
    .set('Cookie', xa.cookie(url))
    .redirects(0)
    .end((err, res) => {
      if (!err) {
        // 200 response
        // console.log(res);
        if ( (!xa.token[service]) && web.test(url) ) {
          if (res.headers['set-cookie'] && res.headers['set-cookie'].length > 0) {
            xa.token[service] = {
              cookie: res.headers['set-cookie'][0],
              url: web
            }
          }
        }
        if (xa.token.login.url.test(url)) {
          // cas redirects
          let $ = cheerio.load(res.text)
          let direct = (r) => {
            recursive(xa, r, service, web, iter + 1)
          }
          eval($('.popup-with-zoom-anim').attr('onclick'));
        }
        else if (xa.token[service].url.test(url)) {
          // may be success
          console.log("maybe success");
          xa.queue(service, "clear")
        }
        else {
          // error, redirects to unknown website
          console.log("why");
        }
      }
      else {
        if (err.status == 302) {
          // 302 redirects
          if ( (!xa.token[service]) && web.test(url) ) {
            if (res.headers['set-cookie'] && res.headers['set-cookie'].length > 0) {
              xa.token[service] = {
                cookie: res.headers['set-cookie'][0],
                url: web
              }
            }
          }
          // redirects
          recursive(xa, ((u) => {
            if (!(/^http(s)?:\/\//.test(u))) {
              return url.match(/^http(s)?:\/\/.*?\//)[0] + u.replace(/^\//, '')
            }
            else {
              return u
            }
          })(res.headers.location), service, web, iter + 1)
        }
        else {
          // other error occur
          console.error(`iter: ${iter}`);
          console.error(err.status);
          xa.state[service] = void(0)
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
                  url: /http(s)?:\/\/cas\.xjtu\.edu\.cn/
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
                console.error(err.status);
                xa.state.login = void(0)
              }
            })
        }
        else {
          let error = `
          cannot get to the Unified authentication system for the first time
          may be the network problem.
          `
          console.error(error);
          console.error(err);
          xa.state.login = void(0)
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
      recursive(xa, url, service, web, 0)
    })
  }
};
