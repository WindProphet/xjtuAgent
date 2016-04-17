# xjtuAgent

xjtuAgent is an API for accessing XJTU net service by node.js

It works by simulating HTTP calls, but It can avoid redundant operation and can be done automatically.

## Installation

```bash
$ npm install xjtuagent
```

## Usage

```js
var xjtuagent = require('xjtuagent');
var ssfw = require('xjtu-ssfw');

info = {
  username: "myNetID", // your XJTU NetID
  password: "myIDpass" // your NetID's password
}

var xjtu = new xjtuagent();

xjtu
  .set(info)
  .login(function(status) {
    if (!status.err) {
      console.log('login success');
    }
    else {
      console.log('login error');
      this.repeat = true;
    }
  })
  .use(ssfw)
  .ssfw
  .start()

```

## Plugin
