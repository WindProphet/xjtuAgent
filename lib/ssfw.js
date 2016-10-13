const request = require('superagent')
const cheerio = require('cheerio')
const entities = require('entities');

module.exports = {
  name: `师生服务`,
  cls: "xjtuAgent", // Identify for xjtuAgent Module
  main: (xa, r) => {
    let url = "http://ssfw.xjtu.edu.cn/index.portal"
    require('./login.js').auth(xa, url, 'ssfw', /^http(s)?:\/\/ssfw\.xjtu\.edu\.cn/)
  },
  score: {
    main: (xa, r) => {
      console.error(`ssfw_score queue ${new Date().toJSON()}`);
      let url = "http://ssfw.xjtu.edu.cn/index.portal?.pn=p1142_p1144_p1156"
      xa.queue("ssfw", () => {
        console.error(`ssfw_score loading ${new Date().toJSON()}`);
        request
          .get(url)
          .redirects(0)
          .set('Cookie', xa.cookie(url))
          .end((err, res) => {
            let $ = cheerio.load(res.text)
            let thead = $(".portletFrame thead > tr > th").map((i, el) => {
              return $(el).text().trim()
            }).get()
            // console.log(thead);
            let scoretable = $(".portletFrame tbody > tr").map((i, el) => {
              let ans = {}
              $(el).children('td').each((i, el) => {
                ans[thead[i]] = $(el).text().trim()
              })
              return ans
            }).get()
            xa.result.score = scoretable
            xa.queue("ssfw_score", "clear")
            // let str = JSON.stringify(scoretable, null, 2);
            // console.log(str);
          })
      })
    }
  },
  evaluation: {
    main: (xa, r) => {
      console.error(`ssfw_evaluation queue ${new Date().toJSON()}`);
      url = "http://ssfw.xjtu.edu.cn/index.portal?.pn=p1142_p1182_p1183"
      xa.queue("ssfw", () => {
        console.error(`ssfw_evaluation loading ${new Date().toJSON()}`);
        request
          .get(url)
          .redirects(0)
          .set('Cookie', xa.cookie(url))
          .end((err, res) => {
            let $ = cheerio.load(res.text)
            let thead = $(".portletFrame table.portlet-table thead > tr > th").map((i, el) => {
              return $(el).text().trim()
            }).get()
            thead[7] = "operate"
            // console.log(thead);
            let table = $(".portletFrame table.portlet-table tbody > tr").map((i, el) => {
              let ans = {}
              $(el).children('td').each((i, el) => {
                ans[thead[i]] = $(el).text().trim()
              })
              ans.operate = $(el).children('td').eq(7).children('a').attr('href')
              return ans
            }).get()
            xa.result.teacher = table
            xa.queue("ssfw_evaluation", "clear")
            // let str = JSON.stringify(scoretable, null, 2);
            // console.log(str);
          })
      })
    },
    set: (xa, r) => {
      console.error(`ssfw_evaluation_set queue ${new Date().toJSON()}`);
      let url = "http://ssfw.xjtu.edu.cn/index.portal"
      let sel = r[0]
      let ans = r[1] ? r[1] : {
        eval: "good",                 // 总体评教
        advice: "good",               // 评教意见
        opts: [4,4,4,4,4,4,4,4,4,4]   // 评教分选项 [1, 5]
      }
      xa.queue("ssfw_evaluation", () => {
        console.error(`ssfw_evaluation_set queue ${new Date().toJSON()}`);
        if (typeof sel == "object") {
          request
            .get('http://ssfw.xjtu.edu.cn/index.portal' + r[0].operate)
            .redirects(0)
            .set('Cookie', xa.cookie(url))
            .end((err, res) => {
              let $ = cheerio.load(res.text)
              let ret = $('script').text().split(/doBack\(\)/)[1].match(/location\.href = "(.*)"/u)[1]
              let form = $('#pjform')
              let info = $('table', form).eq(0).text()
              let lessonname = info.match(/课程名称：(.*)/u)[1].trim()
              let lesteacher = info.match(/上课老师：(.*)/u)[1].trim()

              let query = [
                `wid_pgjxb=${entities.encodeXML($('input#wid_pgjxb', form).attr('value'))}`,
                "wid_pgyj=",
                "type=2",
                "sfytj=true",
                "pjType=4",
                `wid_pjzts=${entities.encodeXML($('input#wid_pjzts', form).attr('value'))}`,
                "status=0",
                `ztpj=${entities.encodeXML(ans.eval)}`,
                "sfmxpj=false"
              ]

              // console.log($('#zbdfTable tr', form).html());
              $('table#zbdfTable tr').each((i, el) => {
                if (i >= 2) {
                  let evalid   = $('td', el).eq(-7).text().trim()
                  let evalopt  = $('td', el).eq(-6).text().trim()
                  let evalname = $('td input', el).eq(-1).attr('name')

                  let str = $('input[type="hidden"]', el).map((i, el) => {
                    return `${$(el).attr('name')}=${$(el).attr('value')}`
                  }).get().join('&')
                  // let opts = [-5,-4,-3,-2,-1].map((x) => {
                  //   let opt = $('td input', el).eq(x)
                  //   return `${opt.attr('value')}`
                  // }).join('_')
                  // console.log(`${opts} ${evalid} ${evalopt} ${evalname}  `);
                  if (evalid) {
                    query.push(str);
                    query.push(`${evalname}=${$('td input', el).eq( -((i) => {
                      if (i > 5) {
                        return 5
                      }
                      else if (i < 1) {
                        return 1
                      }
                      return i
                    })(ans.opts[parseInt(evalid) - 1])).attr('value')}`)
                  }
                }
              })

              query.push(`pgyj=${entities.encodeXML(ans.advice)}`)
              query.push("actionType=2")

              // console.log(query.join('\n'));

              // let f = $('input', form).map((i, el) => {
              //   return {
              //     name: $(el).attr('name'),
              //     value: $(el).attr('value')?$(el).attr('value'):"",
              //     type: $(el).attr('type')
              //   }
              // }).get()
              // console.log(JSON.stringify(f, null, 2));

              request
                .post('http://ssfw.xjtu.edu.cn/index.portal' + form.attr('action'))
                .send(query.join('&'))
                .redirects(0)
                .set('Cookie', xa.cookie(url))
                .end((err, res) => {
                  if (!err) {
                    // hehe
                  }
                  else {
                    if (err.status == 302) {
                      console.error(`${lessonname} may be ok`);
                      request
                        .get('http://ssfw.xjtu.edu.cn/index.portal' + ret)
                        .redirects(0)
                        .set('Cookie', xa.cookie(url))
                        .end((err, res) => 0)
                    }
                    else {
                      // hehe
                    }
                  }
                })

            })
        }
      })
    }
  }
};
