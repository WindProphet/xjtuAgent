# xjtuAgent

xjtuAgent is an API for accessing XJTU net service by node.js

It works by simulating HTTP calls, but It can avoid redundant operation and can be done automatically.

## Installation

```bash
$ npm install xjtuagent
```

## Usage

一键选课

```js
const xjtuagent = require('xjtuagent');

var my = new xjtuagent();

my.info(
  "username", // your XJTU NetID
  "password" // your NetID's password
)

my.queue("ssfw_evaluation", () => {
  my.result.teacher.forEach((v, i, a) => {
    if (1) {
      console.log(i, v['课程名称']);
      my.use("ssfw_evaluation_set", v, {
        eval: "先生ちゃん大好き",
        advice: "希望老师多和学生互动",
        opts: [4,4,4,4,4,4,4,4,4,4]
      })
    }
  })
})

```

## Plugin
