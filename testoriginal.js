var request = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');

var info = {
  'username': 'lihanyuan',
  'password':'xHC-o89-G3o-98F',
  'code': '',
  'lt': 'LT-723269-0JBbJKZluFDmvTY3MepzbmCqIPGqXG',
  'execution': 'e1s1',
  '_eventId': 'submit',
  'submit': '登录'
}

var cc = {

}

// login

var headers = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  Origin: 'https://cas.xjtu.edu.cn',
  'Upgrade-Insecure-Requests': 1,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36',
  'Content-Type': 'application/x-www-form-urlencoded',
  // Referer: 'https://cas.xjtu.edu.cn/login',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6'
}

var cookie;

function xkfw() {
  request
    .get('http://xkfw.xjtu.edu.cn/xsxk/index.xk')
    .set(headers)
    // .set('Cookie', cookie)
    // .redirects(0)
    .end(function(err, res) {
      // console.log(res.text);
      if (err) {
        console.log(err.status);
        console.log(err.response.headers['set-cookie']);
        // throw err;
      }
      else {
        // console.log(res);
        $ = cheerio.load(res.text);
        console.log($('title').text());
        fs.writeFile("tmp_files/" + "jctslkc.html", res.text, function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
      }
    })
}

// request
//   .post('https://cas.xjtu.edu.cn/login')
//   .set(headers)
//   .send(info)
//   // .send(cc)
//   .redirects(0)
//   .end(function(err, res) {
//     cookie = res.headers['set-cookie'];
//     // cookie = cookie.match(/^JSESSIONID=[\dA-Z]+/)[0];
//     // cookie = cookie + ':16eigv6n0';
//     console.log(cookie);
//     // xkfw();
//   });


cookie = "JSESSIONID=0000E-NIMhJiUVpKYuf6hpD06Ew:16eigv77n;";



xkfw();
