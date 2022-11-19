const express = require('express');
const app = express();
const port = 3001;

var w2v = require('word2vec');
var model;

w2v.loadModel('./model.bin', function( error, modelLoaded ) {
  model = modelLoaded;
  console.log("Model loaded");
});  

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Ojvindix')
});


app.post('/similarity', function (req, res) {
  console.log("Receive request");
  console.log(req.body);
  var word = req.body.value;
  var score = model.similarity(word,'pute');
  console.log(score);
  res.status(200).json({
    message: score
  });
});

app.listen(port, () => {
  console.log('Example app listening on port ${port}')
});