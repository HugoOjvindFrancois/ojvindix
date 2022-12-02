import logo from './logo.svg';
import winRegular from './media/win-regular.gif';
import doomLogo from './media/doom.svg';
import doomSong from './media/doom.ogg';
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import './css/vendors/reset.min.css';
import './css/main.min.css';
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
  const [doomMode, setDoomMode] = useState(false);
  var doomMusicState = {
    audio: new Audio(doomSong),
    isPlaying: false,
  };

  const playPause = () => {
    let isPlaying = doomMusicState.isPlaying;
    if (isPlaying) {
      doomMusicState.audio.pause();
    } else {
      doomMusicState.audio.play();
      doomMusicState.audio.loop = true;
    }
    doomMusicState.isPlaying = !isPlaying;
  }

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

    if (body.score == 1) {
      win = true;
    }

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
        // PORT=443 

        setMessage("");

        console.log(words);
      }).catch((err) => {
        console.log(err.message);
      });
    }
  }

  function activateDoomMode() {
    document.body.classList.add('s-doom');
    playPause();
    setDoomMode(doomMusicState.isPlaying);
    start();
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
      <table className="oj-c-Table-content">
        <thead>
          <tr>
            {props.headers.map((item,index) => <th key={index}>{item}</th>)}
          </tr>
        </thead>
        <tbody>
          {sortedWord.map((item,index) => <tr key={index} id={item.score === 1 ? 's-correctWord' : ''}><td>{item.number}</td><td>{item.value}</td><td>{(item.score * 100).toFixed(2)}</td><td>{item.username ? item.username : ''}</td></tr> )}
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
      <div className="s-prevWord">Le mot précédent était : {lastWord}</div>
    )
  }

  

const firePixels = [];
const fireWidth  = 400;
const fireHeight = 40;
const pixelSize  = 10;
var elCanvas;
var canvas;
  
function start() {
  elCanvas   = document.getElementById('fire');
  canvas     = elCanvas.getContext("2d");
	defineCanvasSize();
	createFireDataStructure();
	createFireSource();
	calculateFirePropagation();
}

function createFireDataStructure() {
	const numberOfPixels = fireWidth * fireHeight;
	
	for (let i=0; i < numberOfPixels; i++) {
		firePixels[i] = 0;
	}
}

function calculateFirePropagation() {
	for (let col = 0; col < fireWidth; col++) {
		for (let row = 0; row < fireHeight; row++) {
			const pixelIndex = col + (fireWidth * row);
			
			updateFireIntensityPerPixel(pixelIndex);
		}
	}
	
	randerFire();
	
	requestAnimationFrame(calculateFirePropagation);
}

function updateFireIntensityPerPixel(currentPixelIndex) {
	const belowPixelIndex = currentPixelIndex + fireWidth;
	
	if (belowPixelIndex >= fireWidth * fireHeight)
		return;
	
	const decay = Math.floor(Math.random() * 7);
	const wind =  Math.floor(Math.random() * 1.3);
	const belowPixelFireIntensity = firePixels[belowPixelIndex];
	let newFireIntensity = belowPixelFireIntensity - decay;
	
	if (newFireIntensity <= 0)
		newFireIntensity = 0;
	
	firePixels[currentPixelIndex - wind] = newFireIntensity;
}

function defineCanvasSize() {
	elCanvas.width = fireWidth * pixelSize;
	elCanvas.height = fireHeight * pixelSize;
}

function createFireSource() {
	for (let col = 0; col < fireWidth; col++) {
		const overflowPixelIndex = fireWidth * fireHeight;
		const pixelIndex = (overflowPixelIndex - fireWidth) + col;

		firePixels[pixelIndex] = 100;
	}
}

function randerFire() {
	let x = 0;
	let y = 0;
	let index = 0;
	
  	canvas.clearRect(0,0, pixelSize * fireWidth, pixelSize * fireHeight);

	for (let row = 0; row < fireHeight; row++) {
		y = row * pixelSize;
		
		for (let col = 0; col < fireWidth; col++) {
			x = col * pixelSize;
			index = col + (fireWidth * row);

			const colorH = Math.round(firePixels[index] * 40 / 100);
			const colorS = 100;
			const colorL = firePixels[index];

			const color = `hsl(${colorH}, ${colorS}%, ${colorL}%)`;

			canvas.beginPath();
			canvas.fillStyle = color;
			canvas.rect(x, y, pixelSize, pixelSize);
			canvas.fill();
		}
	}
}

  return (
    <div className="oj-c-App">
      <div className="oj-c-Page">
        <div className="oj-c-Page-container wrap">
          <div className="oj-c-Doom">
            <div className="oj-c-Doom-btnContainer">
              <div className="oj-c-Doom-tooltipContainer" data-tooltip="Activer le mode DOOM" data-tooltip-position="right" data-tooltip-style="doom" onClick={activateDoomMode}></div>
              <button className="oj-c-Doom-btn">
                <img className="oj-c-Doom-logo" src={doomLogo} />
              </button>
            </div>
          </div>
          <div className="oj-c-Interface">  
            { win && (<img src={winRegular} alt="win GIF" width="100%" className="oj-c-Interface-bg" />)}      
            <h1 className="oj-c-Interface-title">Ojvindix</h1>
            <div className="oj-c-Search">
              <input className="oj-c-Search-input oj-c-Input" type="text" placeholder="Mot" onChange={handleChanges} onKeyDown={handleKeyDown} value={message}/>
              <button className="oj-c-Seach-btn oj-c-Btn" onClick={sendWord}>Envoyer</button>
            </div>
            <div className="oj-c-Table">
              <TableFormList headers={["N°", "Mot", "Score", "Pseudo"]} formElements={words}/>
            </div>
            <div className="oj-c-Interface-footer">
              <LastWordDisplay/>
            </div>
            <div className="oj-c-Multi">
              <input className="oj-c-Input oj-c-Multi-input s-code" type="text" placeholder="Code" onChange={handleMultiplayerCodeChange} value={mutiplayerCode} disabled={isConnected} />
              <input className="oj-c-Input oj-c-Multi-input s-pseudo" type="text" placeholder="Pseudo" onChange={handlePseudoChange} value={pseudo} />
              { !isConnected && (<button className="oj-c-Btn oj-c-Multi-btn s-connect" onClick={connectMultiplayer}>Connexion</button>) }
              { isConnected && (<button className="oj-c-Btn oj-c-Multi-btn s-disconnect" onClick={disconnectMultiplayer}>Déconnexion</button>) }
            </div>
            <footer className="oj-c-Interface-infos">
              <div className="s-signature">
                Made with love by Ojvind
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
