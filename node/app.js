const express = require('express');
const cors = require('cors')
const app = express();
const port = 3001;

var w2v = require('word2vec');
var model;

var currentWord = 'dictionnaire';
var lastWord = 'transpiration';

w2v.loadModel('./model.bin', function( error, modelLoaded ) {
  model = modelLoaded;
  console.log("Model loaded");
});  

let corsOptions = {
  origin : ['http://localhost:3000', 'http://51.38.48.94:3000'],
}

app.use(express.json());
app.use(cors(corsOptions))

app.get('/', (req, res) => {
  res.send('Welcome to Ojvindix')
});

app.get('/last', (req, res) => {
  res.send({value: lastWord});
});

app.post('/new', (req, res) => {
  console.log('New word');
  console.log(req.body);
  var newWord = req.body.trim().toLowerCase();
  currentWord = newWord;
  res.status(200).json({
    value: newWord
  });
});

app.post('/similarity', function (req, res) {
  console.log("Receive request");
  console.log(req.body);
  var word = req.body.value.trim().toLowerCase();
  var score = model.similarity(word,currentWord);
  console.log(score);
  res.status(200).json({
    value: score
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});