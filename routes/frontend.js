var express = require('express')
var fs = require("fs")
const wavebar = require('../wavebar')

var router = express.Router()


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('in')
  console.log(readFile('../template/home.html'))

  req.vessel.thing = {
    content: 123
  }
  
  res.send(readFile('../template/home.html'))
})

function readFile(filePath) {
  var content = new String();
  if(check()) {
    content = fs.readFileSync(this.filePath, 'utf8');
  }
  return content;
};

module.exports = router
