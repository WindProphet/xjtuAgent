const request = require('superagent')
const cheerio = require('cheerio')

entities = new require('html-entities').XmlEntities;

module.exports = {
  name: `师生服务`,
  cls: "xjtuAgent", // Identify for xjtuAgent Module
  main: (xa, r) => {
    let url = "http://ssfw.xjtu.edu.cn/index.portal"
    require('./login.js').auth(xa, url, 'ssfw', /^http(s)?:\/\/ssfw\.xjtu\.edu\.cn/)
  },
  score: {
    main: (xa, r) => {
      let url = "http://ssfw.xjtu.edu.cn/index.portal?.pn=p1142_p1144_p1156"
      xa.queue("ssfw", () => {
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
      url = "http://ssfw.xjtu.edu.cn/index.portal?.pn=p1142_p1182_p1183"
      xa.queue("ssfw", () => {
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
      xa.queue("ssfw_evaluation", () => {
        if (typeof r[0] == "object") {
          request
            .get('http://ssfw.xjtu.edu.cn/index.portal' + r[0].operate)
            .redirects(0)
            .set('Cookie', xa.cookie(url))
            .end((err, res) => {
              let $ = cheerio.load(res.text)
              let form = $('#pjform')
              console.log(form.attr('action'))
              let f = $('input', form).map((i, el) => {
                return {
                  name: $(el).attr('name'),
                  value: $(el).attr('value')?$(el).attr('value'):"",
                  type: $(el).attr('type')
                }
              }).get()
              console.log(JSON.stringify(f, null, 2));
            })
        }
      })
    }
  }
};
