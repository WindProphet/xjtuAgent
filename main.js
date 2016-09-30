class xjtuAgent {
  constructor() {
    this.state  = {}
    this.queues = []
    this.token  = {}
  }

  info(
    u, // set username
    p  // set password
  ) {
    this.username = u
    this.password = p
    return this
  }

  login() {
    this.state.login = "loading"
    if (this.username && this.password) {
      require('./lib/login.js').login(this)
      return this
    }
    else {
      // have no username and password
      console.error("username and password needed");
      console.error("use info() to set username and password");
      this.state = {}
    }
  }

  use(
    mod,         // module use
    ...options   // option given
  ) {
    if (mod == "login") {
      return this.login()
    }
    try {
      let level = mod.split(/[-_ ]/)
      let r = require(`./lib/${level.shift()}.js`)
      if (r.cls != "xjtuAgent") {
        console.error("this is not a xjtuAgent module")
        return
      }

      let lefunc = (l, obj, iter) => { // level function
        try {
          let cl = l.shift() // current level
          if (!cl) { // no sub function name and use main function
            (typeof obj.main == "function")?
              obj.main(this, options):
              console.error(`${level[0]} module ${iter}level has no main function`);
          }
          else {
            if (typeof obj[cl] == "function") {
              obj[cl](this, options)
            }
            else if (typeof obj[cl] == "object") {
              lefunc(l, obj[cl], iter + 1)
            }
            else {
              console.error(`${level[0]} module ${iter}level "${cl}" function unavailable`);
            }
          }
        } catch (e) {
          console.error("function unavailable");
          console.error(e);
        } finally {

        }
      }

      lefunc(level, r, 0)

    } catch (e) {
      // error when loading module
      console.error("no such module");
      console.error(e);
      return
    } finally {

    }
    return this
  }

  queue(type, next) {

    // clear the mission queue
    if (next == "clear") {
      this.queues.map(v => {
        (v.depend == type) ? v.func() : void(0)
      })
      this.queues.forEach((v, i, a) => {
        if (v.depend == type) {a.splice(i,1)}
      })
      this.state[type] = "done"
      console.log(`${type} done ${new Date().toJSON()}`);
      return
    }

    if (!this.state[type]) { // use the dependent module
      this.use(type)
    }
    else if (this.state[type] == "done") {
      next()
      return this
    }

    // if no queue provided
    if (!this.queues) {
      this.queues = Array()
    }

    // add the mission
    this.queues.push({
      depend: type,
      func: next
    })

    return this
  }

  cookie(url, coo) {
    if (coo) {
      return this
    }
    else {
      for (let t in this.token) {
        if (this.token[t]) {
          if (this.token[t].url.test(url)) {
            // console.log(`${t}---${url}`);
            return this.token[t].cookie
          }
        }
      }
      return ""
    }
  }
}

module.exports = xjtuAgent;
