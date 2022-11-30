import logo from './logo.svg';
import winGif from './win.gif';
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import './App.css';
import io from 'socket.io-client';

const words = [];
var multiplayer = {
  connected: false
};

var win = false;

function App() {

  const [message, setMessage] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [mutiplayerCode, setMultiplayerCode] = useState('');
  const [count, setCount] = useState(0);
  const [lastWord, setLastWord] = useState(0);
  const [isConnected, setIsConnected] = useState(multiplayer.connected);


  const handleChanges = event => {
    setMessage(event.target.value);
  }
  
  const handlePseudoChange = event => {
    setPseudo(event.target.value);
  }

  const handleMultiplayerCodeChange = event => {
    setMultiplayerCode(event.target.value);
  }

  function onBroadcastWord(body) {
    console.log('Receive new word from multiplayer team');
    console.log(body);

    if (!body.value) {
      return;
    }

    if (!isDuplicate(body.word)) {

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
        value: body.word,
        score: body.value,
        username: body.username
      });
    }
  }

  function isDuplicate(word) {
    const formatedWord = word.trim().toLowerCase();
    for (var i = 0; i < words.length; i++) {
      if (words[i].value === formatedWord) {
        return true;
      }
    }
    return false;
  }

  function connectMultiplayer() {
    multiplayer.socket = io.connect('https://ojvindix.fr:3001', {
      reconnectionDelayMax: 1000000,
      extraHeaders: {
        "x-multiplayer-code": mutiplayerCode
      }
    });
    multiplayer.socket.on('connect', () => {
      multiplayer.connected = true;
      setIsConnected(true);
    });
    multiplayer.socket.on('word', onBroadcastWord);
  }

  function disconnectMultiplayer() {
    multiplayer.socket.disconnect();
    multiplayer.connected = false;
    setIsConnected(false);
  }

  function sendWord() {

    const wordMessage = message.trim().toLowerCase();

    if (!message || wordMessage === '') {
      alert('Pas de mot, pas de chocolat');
      return;
    }

    if (!isDuplicate(wordMessage)) {

      fetch('https://ojvindix.fr:3001/similarity', {
        method: 'POST', 
        mode: 'cors', 
        body: JSON.stringify({
          value: message
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'x-multiplayer-code': mutiplayerCode,
          'x-multiplayer-username': pseudo
        },
      }).then((response) => response.json()).then((data) => {

        let score = data.value;

        if (score == 1) {
          win = true;
        }

        if (!score) {
          //alert("On ne connais pas ce mot, déso (ntm pop)");
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
    
        if (!isDuplicate(wordMessage)) {
          words.push({
            number: count,
            value: wordMessage,
            score: score,
            username: pseudo
          });
        }

        setMessage("");

        console.log(words);
      }).catch((err) => {
        console.log(err.message);
      });
    }
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
          {sortedWord.map((item,index) => <tr key={index} className={item.score === 1 ? 'goodAnswer' : ''}><td>{item.number}</td><td>{item.value}</td><td>{(item.score * 100).toFixed(2)}</td><td>{item.username ? item.username : ''}</td></tr> )}
        </tbody>
      </table>
    )
  }

  function LastWordDisplay() {
    fetch('https://ojvindix.fr:3001/last', {
      method: 'GET', 
      mode: 'cors',
    }).then((response) => response.json()).then((data) => {
  
      let word = data.value;
      setLastWord(word);
  
    }).catch((err) => {
       console.log(err.message);
    });
    return (
      <h5>Le mot précédent était : {lastWord}</h5>
    )
  }

  return (
    <div className="App">
      <h1>Ojvindix</h1>
      <div className="oj-c-MainInput">
        <input type="text" placeholder="Mot" onChange={handleChanges} onKeyDown={handleKeyDown} value={message}/>
        <button onClick={sendWord}>Envoyer</button>
      </div>
      <TableFormList
            headers={["N°", "Mot", "Score", "Pseudo"]}
            formElements={words}
          />
      { win && (<img src={winGif} alt="win GIF" width="100%" className="oj-c-WinGif" />)}
      <LastWordDisplay/>
      <input type="text" placeholder="Code" onChange={handleMultiplayerCodeChange} value={mutiplayerCode} disabled={isConnected} />
      <input type="text" placeholder="Pseudo" onChange={handlePseudoChange} value={pseudo} />
      { !isConnected && (<button onClick={connectMultiplayer}>Connect</button>) }
      { isConnected && (<button onClick={disconnectMultiplayer}>Disconnect</button>) }
      <h6>Made with love by Ojvind</h6>
    </div>
  );
}

export default App;
