const express = require('express')
const app = express()
var machine;
const start = async function(o) {
  console.log("PLANARIUM", "initializing machine...")
  machine = await o.onstart()
  if (o.custom) {
    o.custom({
      core: machine,
      app: app
    })
  }
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views')
  app.use(express.static(__dirname + '/public'))
  const port = o.port || 3000
  const host = o.host
  app.get(/^\/q\/([^\/]+)/, function(req, res) {
    let b64= req.params[0]
    o.onquery({
      query: b64,
      res: res,
      core: machine
    })
  })
  app.get("/query", function(req, res) {
    let defaultQuery = o.default || { v: 3, q: { find: {}, limit: 10 } };
    let code = JSON.stringify(defaultQuery, null, 2);
    res.render('explorer', {
      name: o.name,
      code: code,
    })
  })
  app.get(/^\/query\/([^\/]+)/, function(req, res) {
    let b64= req.params[0]
    let code = Buffer.from(b64, 'base64').toString()
    res.render('explorer', {
      name: o.name, code: code,
    })
  })
  app.get('/', function(req, res) {
    res.sendFile(__dirname + "/public/index.html")
  })
  if (host) {
    app.listen(port, host, () => {
      console.log("PLANARIUM", `listening on ${host}:${port}!`)
    })
  } else {
    app.listen(port, () => {
      console.log("PLANARIUM", `listening on port ${port}!`)
    })
  }
}
module.exports = {
  start: start
}
