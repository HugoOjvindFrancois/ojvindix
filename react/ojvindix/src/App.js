import logo from './logo.svg';
import winGif from './win.gif';
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import './App.css';

const words = [];

var win = false;

function App() {

  const [message, setMessage] = useState('');
  const [count, setCount] = useState(0);
  const [lastWord, setLastWord] = useState(0);

  const handleChanges = event => {
    setMessage(event.target.value);
  }

  function sendWord() {

    if (!message || message.trim() === '') {
      alert('Pas de mot, pas de chocolat');
      return;
    }

    fetch('http://51.38.48.94:3001/similarity', {
      method: 'POST', 
      mode: 'cors', 
      body: JSON.stringify({
        value: message
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((response) => response.json()).then((data) => {

      let score = data.value;

      if (score == 1) {
        win = true;
      }

      if (!score) {
        alert("On ne connais pas ce mot, déso (ntm pop)");
        return;
      }

      var wordNumber = sessionStorage.getItem("wordNumber");

      if (wordNumber == null) {
        wordNumber = 1;
      } else {
        wordNumber = Number(wordNumber) + 1;
      }
  
      sessionStorage.setItem("wordNumber", wordNumber)
      setCount(wordNumber);
  
      words.push({
        number: count,
        value: message,
        score: score
      });

      setMessage("");

      console.log(words);
    }).catch((err) => {
       console.log(err.message);
    });
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendWord();
    }
  };

  function TableFormList(props) {
    let sortedWord = [...props.formElements];
    sortedWord.sort((a, b) => {
      if (a.score > b.score) {
        return -1;
      }
      if (a.score < b.score) {
        return 1;
      }
      return 0;
    });
    return(
      <table>
        <thead>
          <tr>
            {props.headers.map((item,index) => <th key={index}>{item}</th>)}
          </tr>
        </thead>
        <tbody>
          {sortedWord.map((item,index) => <tr key={index}><td>{item.number}</td><td>{item.value}</td><td>{(item.score * 100).toFixed(2)}</td></tr> )}
        </tbody>
      </table>
    )
  }

  useEffect(() => {
    fetch('http://51.38.48.94:3001/last', {
      method: 'GET', 
      mode: 'cors',
    }).then((response) => response.json()).then((data) => {

      let word = data.value;
      setLastWord(word);

    }).catch((err) => {
       console.log(err.message);
    });
  });

  return (
    <div className="App">
      <h1>Ojvindix</h1>
      <input type="text" placeholder="Mot" onChange={handleChanges} onKeyDown={handleKeyDown} value={message}/>
      <button onClick={sendWord}>Envoyer</button>
      <TableFormList
            headers={["N°", "Mot", "Score"]}
            formElements={words}
          />
      { win && (<img src={winGif} alt="win GIF" width="100%" />)}
      <h5>Le mot d'hier était : {lastWord}</h5>
      <h6>Made with love by Ojvind</h6>
    </div>
  );
}

export default App;
