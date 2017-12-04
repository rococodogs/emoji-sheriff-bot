// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var emoji = require('emoji')

var client = require('./twitter-client')()
var emojiMap = emoji.EMOJI_MAP

var TWEET_LENGTH = 280

var tweetTemplate = function (e) {
  return `
⠀ ⠀      🤠
　   ${e} ${e} ${e}
    ${e}　${e}　${e}
   👇  ${e}${e} 👇
  　  ${e}　${e}
　   ${e}　  ${e}
　   👢     👢 
`.trim()
}

// for some reason the spacing on the HTML template needs
// to be a bit different from the tweet one?
var htmlTemplate = function (e) {
  return `
⠀ ⠀    🤠
　   ${e} ${e} ${e}
    ${e}　${e}　${e}
   👇  ${e}${e} 👇
  　  ${e}　${e}
　   ${e}　  ${e}
　   👢     👢 
`.trim()
}

app.get('/', function (req, res) {
  // getRandomSheriff() removes the chosen emoji from the map,
  // so we'll just duplicate the result for the site but not
  // actually delete it from the map
  var keys = Object.keys(emoji.EMOJI_MAP)
  var idx = Math.floor(Math.random() * keys.length)
  var result = keys[idx]
  var data = emoji.EMOJI_MAP[result]
  
  var sheriff = htmlTemplate(result)
  var text = `Howdy! I'm the ${data[1]} sheriff!`
  
  var html = `<!doctype html><pre>${sheriff}</pre><p>${text}</p>`
  
  res.send(html)
})

app.get('/tweet', function (req, res) {
  if (!hasKeys()) {
    return res.json({status: 'no keys! :('})
  }
  
  if (!req.query.secret) {
    return res.json({status: 'no secret! :('})
  }
  
  if (!req.query.secret === process.env.SECRET_HUSH) {
    return res.json({status: 'wrong secret! :('})
  }
  
  post(function () {
    res.json({status: 'ok!'})
  })
})

app.listen(process.env.PORT)

function hasKeys () {
  return process.env.TWITTER_CONSUMER
  && process.env.TWITTER_CONSUMER_SECRET
  && process.env.TWITTER_ACCESS_TOKEN
  && process.env.TWITTER_ACCESS_TOKEN_SECRET
}

function getRandomSheriff () {
  // refresh the object
  if (Object.keys(emojiMap).length === 0) {
    emojiMap = emoji.EMOJI_MAP
  }
  
  var keys = Object.keys(emojiMap)
  
  var idx = Math.floor(Math.random() * keys.length)
  var result = keys[idx]
  var data = emojiMap[result]
  
  delete emojiMap[result]
  
  var sheriff = tweetTemplate(result)
  var text = `Howdy! I'm the ${data[1]} sheriff!`
  
  return {sheriff, text, key: result}
}

function post (cb) {
  var status
  
  do {
    var random = getRandomSheriff()
    status = `${random.sheriff}\n\n${random.text}`
    
  } while (status.length > TWEET_LENGTH)
    
  return client.post('statuses/update', {status}, cb)
}
