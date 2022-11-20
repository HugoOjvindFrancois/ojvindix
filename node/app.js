const express = require('express');
const cors = require('cors')
const app = express();
const port = 3001;

var w2v = require('word2vec');
var model;

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


app.post('/similarity', function (req, res) {
  console.log("Receive request");
  console.log(req.body);
  var word = req.body.value.toLowerCase();
  var score = model.similarity(word,'dictionnaire');
  console.log(score);
  res.status(200).json({
    message: score
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});