const channel = new MessageChannel();
const recceivePort = channel.port1;
let sendPort;


// Processing messages from the main thread
self.onmessage = function(event) {
    const message = event.data;
    // console.log(event)
    if (message.type === "port") {
        // Getting the port from the main thread
        sendPort = message.port
        console.log("sendPort received and set")
        sendPort.postMessage({type: "message", message: "sendPort received and set"});  
        
        sendPort.postMessage({ type: "port", port: channel.port2 }, [channel.port2]);
        
        console.log("Worker: receivedPort sent")        
        sendPort.postMessage({type: "message", message: "receivedPort sent"});  
        
    } 
};


recceivePort.onmessage = async function(event) {
    const message = event.data;
    if (message.type === "message") {
        console.log("Message from the Main: " + message.message)
        sendPort.postMessage({type: "redirect", message: message.message});
    }
}


let count = 0;
const testSending = setInterval(() => {
    if (sendPort) {
        count += 1
        sendPort.postMessage({type: "message", message: "Test message from worker № " + count});  
    }                  
}, 15000);

testSending;