import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  // create a reference state for a web worker instance
  const worker = useRef(null);
  const channel = new MessageChannel();
  const recceivePort = channel.port1;
  const sendPort = useRef(null);
  const [count, setCount] = useState(1);
  const consoleRef = useRef(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Прокрутка вниз при обновлении содержимого
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [message]);


  
  useEffect(() => {

    // if there is no web worker instance working, make a new one
    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      })
      console.log("New worker Created!")
      handleMessageUpdate("<span style='color:blue'>New worker Created!</span>")


      recceivePort.onmessage = function (event) {
        const message = event.data;
        if (message.type === "port") {
          sendPort.current = message.port
          console.log("Main: sentPort recceived and set")
          handleMessageUpdate("<span style='color:blue'>Main: sentPort recceived and set</span>")
        } else if (message.type === "message") {
          console.log("Message from Worker: " + message.message)
          handleMessageUpdate("<span style='color:red'>Message from Worker: " + message.message +  "</span>")
        } else if (message.type === "redirect") {
          console.log("Worker redirected:: " + message.message)
          handleMessageUpdate("<span style='color:red'>Message from Worker <b>redirected:</b> </span><span style='color:blue'>" + message.message +  "</span>")
        }
      };

    //Sending the port to the worker via the regular channel to send messages to the MAIN 
    console.log("Sending the Main port to the Worker")     
      worker.current.postMessage({ type: "port", port: channel.port2 }, [channel.port2]);
      handleMessageUpdate("<span style='color:blue'>Main: recceivedPort sent</span>")
    };
  }, []);

  const handleMessageUpdate = (message) => {
    setMessage(prevMessage =>  (prevMessage ? prevMessage + "\n" : '') + message)
  }

  const handleClick = () => {
    setCount(prevCount => prevCount + 1);    
   
    sendPort.current.postMessage({type: "message", message: "Test message from Main № " + count}); 
  }


  return (
    <>
      <div>
      <div
      ref={consoleRef}
      style={{
        width: '100%',
        minWidth: '500px',
        height: '300px', 
        border: '1px solid black',
        padding: '5px',
        overflowY: 'auto', 
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        textAlign: "left"
      }}
      dangerouslySetInnerHTML={{ __html: message }} // Используйте HTML-разметку
    />
        <p><button  type="button" onClick={handleClick}>Send to Worker</button></p>
      </div>
     
    </>
  )
}

export default App
