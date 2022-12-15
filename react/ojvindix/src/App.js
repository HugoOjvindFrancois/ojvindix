import logo from './logo.svg';
import winRegular from './media/win-regular.gif';
import doomLogo from './media/doom.svg';
import doomSong from './media/doom.ogg';
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import './css/vendors/reset.min.css';
import './css/main.min.css';
import io from 'socket.io-client';
import MicroModal from 'micromodal';

var words = [];
var multiplayer = {
  connected: false
};

var win = false;
var doomMode = false;

document.addEventListener('DOMContentLoaded', function(event) {
  document.body.classList.remove('no-transition');
  
});

function App() {
  MicroModal.init({
    openClass: 'is-open',
    disableScroll: true,
    disableFocus: true,
    awaitOpenAnimation: true,
    awaitCloseAnimation: true,
    debugMode: false
  });
  const [message, setMessage] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [mutiplayerCode, setMultiplayerCode] = useState('');
  const [count, setCount] = useState(0);
  const [lastWord, setLastWord] = useState(0);
  const [isConnected, setIsConnected] = useState(multiplayer.connected);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  var doomMusicState = {
    audio: new Audio(doomSong),
    isPlaying: false,
  };

  function resetTimer() {
    setSeconds(0);
    setTimerActive(false);
  }

  function switchTimerActive() {
    setTimerActive(!timerActive);
  }

  function playPause() {
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

    if (!body.value) {
      return;
    }

    if (body.value === 1) {
      win = true;
      if (timerActive === true) {
        switchTimerActive();
      }
    }

    if (timerActive === false) {
      switchTimerActive();
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
        number: wordNumber,
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
    multiplayer.socket.on("new-word", (body) => {
      console.log("new-word");
      resetTimer();
      words = [];
      win = false;
      sessionStorage.setItem("wordNumber", 0);
      setCount(0);
      setLastWord(body.lastWord);
    })
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

        if (score === 1) {
          win = true;
          if (timerActive === true) {
            switchTimerActive();
          }
        }

        if (timerActive === false) {
          switchTimerActive();
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
            number: wordNumber,
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

  /*function creditsModal() {
  }*/

  function activateDoomMode() {
    doomMode = !doomMode;
    
    const interfaceTitle = document.getElementsByClassName("oj-c-Interface-title");
    const doomTooltipContainer = document.getElementsByClassName("oj-c-Doom-tooltipContainer");
    const doomStatus = document.getElementsByClassName("s-doomStatus");
    const signature = document.getElementsByClassName("s-signature");
    const mouseEffectSquare = document.getElementsByClassName("container");
    const splash = document.querySelector(".oj-c-Splash");
    const splashContent = document.getElementsByClassName("oj-c-Splash-content");

    if (doomMode) {
      splash.classList.add('is-active');
      splash.classList.remove('is-regular');
      splash.classList.add('is-doom');
      document.body.classList.add('no-transition');
      splashContent[0].innerHTML = "😡";
      setTimeout(function(){
        splash.classList.remove('is-active');
        document.body.classList.add('s-doom');
        interfaceTitle[0].innerHTML = "<span>DOOM</span>jvindix";
        doomStatus[0].innerHTML = "ON";
        signature[0].innerHTML = "Réalisé avec haine par Øjvind";
        doomTooltipContainer[0].setAttribute('data-tooltip', 'Abréger ma souffrance');
      }, 400);
      setTimeout(function(){
        document.body.classList.remove('no-transition');
      }, 420);
    } else {
      splash.classList.add('is-active');
      splash.classList.remove('is-doom');
      splash.classList.add('is-regular');
      document.body.classList.add('no-transition');
      splashContent[0].innerHTML = "😊";
      setTimeout(function() {
        splash.classList.remove('is-active');
        document.body.classList.remove('s-doom');
        interfaceTitle[0].innerHTML = "Øjvindix";
        doomStatus[0].innerHTML = "OFF";
        signature[0].innerHTML = "Réalisé avec amour par Øjvind";
        doomTooltipContainer[0].setAttribute('data-tooltip', 'Activer le mode DOOM');
      }, 400);
      setTimeout(function(){
        document.body.classList.remove('no-transition');
      }, 420);

      for (let i = 0; i < mouseEffectSquare.length; i++) {
        mouseEffectSquare[i].remove();
      }
    }

    playPause();
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendWord();
    }
  };

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!timerActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, seconds]);

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

  function Timer() {
    // Source : https://codepen.io/jsstrn/pen/mMMmZB
    /*
    const getFontSize = (textLength) => {
      console.log('ftsize')
      const baseSize = 60
      if (textLength >= baseSize) {
        textLength = baseSize - 2
      }
      const fontSize = baseSize - textLength
      return `${fontSize}vw`
    }
    
    const boxes = document.querySelectorAll('.oj-c-Timer-time')

    console.log(document.querySelectorAll('.oj-c-Timer-time'));
      
    boxes.forEach(box => {
      box.style.fontSize = getFontSize(box.textContent.length)
    })
    */
    return (
      <div className="oj-c-Timer-time">
        {seconds}s
      </div>
    );
  }
  useEffect(() => {
    fetch('https://ojvindix.fr:3001/last', {
      method: 'GET', 
      mode: 'cors',
    }).then((response) => response.json()).then((data) => {
      let word = data.value;
      setLastWord(word);
    }).catch((err) => {
       console.log(err.message);
    });
  }, [lastWord]);
  function LastWordDisplay() {
    return (
      <div className="s-prevWord">Le mot précédent était : {lastWord}</div>
    )
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
                <span className="s-doomStatus">OFF</span>
              </button>
            </div>
          </div>
          <div className="oj-c-Interface">  
            { win && (<img src={winRegular} alt="win GIF" width="100%" className="oj-c-Interface-bg" />)}      
            <h1 className="oj-c-Interface-title">Øjvindix</h1>
            <div className="oj-c-Search">
              <div className="oj-c-Search-inner">
                <input className="oj-c-Search-input oj-c-Input" type="text" placeholder="Mot" onChange={handleChanges} onKeyDown={handleKeyDown} value={message}/>
                <button className="oj-c-Seach-btn oj-c-Btn" onClick={sendWord}>Envoyer</button>
              </div>
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
              { isConnected && (<button className="oj-c-Btn oj-c-Multi-btn s-disconnect" onClick={disconnectMultiplayer}>Quitter</button>) }
            </div>
            <footer className="oj-c-Interface-infos">
              <div className="s-signature">
                Réalisé avec amour par Øjvind
              </div>
            </footer>
          </div>
        </div>
        <div className="oj-c-Logo wrap">
          <div className="oj-c-Logo-inner">
            <svg height="500" viewBox="0 0 500 500" width="500" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="m250 0h208c23.195959 0 42 18.8040405 42 42v416c0 23.195959-18.804041 42-42 42h-208z" fill="#df4419"/><path d="m245.865793 499.966507c-136.164364-2.207697-245.865793-113.276031-245.865793-249.966507 0-138.071187 111.928813-250 250-250v500z" fill="#1b7ecf"/><path d="m206.49276 345.8 89.949916-201.231591-57.513169-13.348432-66.272206 32.279165-4.387189 55.195462v98.810754z" fill="#1b7ecf"/><path d="m301.559204 151.115724-77.205315 190.968209 33.329246 25.175434 59.517107-21.459367 10.889878-55.520034-3.013578-62.820747-7.8763-48.489171z" fill="#df4419"/><path d="m115.2 318c-35.2 0-63.2-9.666667-84-29s-31.2-47-31.2-83v-67.2c0-36 10.4-63.6666667 31.2-83s48.8-29 84-29 63.2 9.6666667 84 29 31.2 47 31.2 83v67.2c0 36-10.4 63.666667-31.2 83s-48.8 29-84 29zm0-47.2c19.733333 0 35.066667-5.733333 46-17.2s16.4-26.8 16.4-46v-70.4c0-19.2-5.466667-34.533333-16.4-46-10.933333-11.4666667-26.266667-17.2-46-17.2-19.4666667 0-34.7333333 5.7333333-45.8 17.2-11.0666667 11.466667-16.6 26.8-16.6 46v70.4c0 19.2 5.5333333 34.533333 16.6 46s26.3333333 17.2 45.8 17.2zm-52.4 78.8-33.2-13.6 138.4-336 33.2 13.6z" fill="#fff" fillRule="nonzero" transform="translate(135 75)"/></g></svg>
          </div>
        </div>
        <div className="oj-c-Timer wrap">
          <div className="oj-c-Timer-inner">
            <Timer/>
          </div>
        </div>
        <div className="oj-c-Credits wrap">
          <div className="oj-c-Credits-btnContainer">
            <div className="oj-c-Credits-tooltipContainer" data-tooltip="À propos de Øjvindix" data-tooltip-position="left" data-micromodal-trigger="about"></div>
            <button className="oj-c-Credits-btn">
              <span className="s-help">?</span>
            </button>
          </div>
        </div>
        <div className="oj-c-bottomMenu wrap"></div>
        <div className="oj-c-Fire">
          <div className="oj-c-Fire-animation"></div>
        </div>
        <div className="oj-c-Bottom"></div>
        <div className="oj-c-Splash">
          <div className="oj-c-Splash-inner">
            <div className="oj-c-Splash-content">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
