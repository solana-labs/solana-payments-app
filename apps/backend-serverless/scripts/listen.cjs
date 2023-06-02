var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.post('/', function (req, res) {
  console.log(req.body);
  res.sendStatus(200);
});

app.listen(5005, function () {
  console.log('Listening on port 5005');
});
