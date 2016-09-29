class xjtuAgent {
  constructor() {

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
    if (!this.state) {
      this.state = {
        login: "loading"
      }
    }
    if (this.username && this.password) {
      require('./lib/login.js').login(this)
      return this
    }
    else {
      // have no username and password
      console.error("username and password needed");
      console.error("use info() to set username and password");
    }
  }

  use(
    mod,         // module use
    ...options   // option given
  ) {
    if (mod == "login") {
      return this.login()
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
      return
    }

    if (!this.state) {
      login()
    }

    if (this.state[type] == "done") {
      next()
      return this
    }
    else if (!this.state[type]) { // use the dependent module
      use(type)
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
  }
}

module.exports = xjtuAgent;
