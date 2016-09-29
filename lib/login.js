// login module
let request = require('superagent')
let cheerio = require('cheerio')

module.exports = {
  login: (xa) => {
    let url = "https://cas.xjtu.edu.cn/login"
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
                  cookie: res.headers['set-cookie'][1]
                }
                xa.state.login = "done"
                xa.queue("login", "clear")
                console.log(xa.token.login);
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
  }
};
