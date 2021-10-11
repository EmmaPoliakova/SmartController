import Peer from 'peerjs'
import QRCode from 'qrcode'
import EventEmitter2 from 'eventemitter2'


class SmartController extends EventEmitter2{

        constructor(peerid) {
            super();
            this.peerConnection = new Peer(peerid); 
            self = this;
            this.remotePeers = [];
      
            this.peerConnection.on('open', function(id) {  //logs the browser peer id
                console.log('My peer ID is: ' + id);
                self.emit('open', "hello");
                
            });
      
            this.peerConnection.on("connection", this.peerOnConnection);  //opens the data connection between 2 peers once a connection is established
            
        }
            
          peerOnConnection = (conn) => {
            this.remotePeers[conn.peer] = conn;  //add to current connected peers 
            

            self.emit('connection', conn.peer);

            conn.on("data", function(data){
              
                var message = [conn.peer, data]  //send data received from phone/remote peer + the player number/ index from the peer list
                self.emit('data', message);
            });
      
            conn.on('close',function(){  //send a number of a player who disconnected 
                self.emit('close', conn.peer);
                delete self.remotePeers[conn.peer];
            });
          }

          createQrCode = (url, canvasID) => {
            self.peerConnection.on("open" , function(id){
              QRCode.toCanvas(document.getElementById(canvasID), url +"?id="+self.peerConnection.id, function (error) {
                if (error) console.error(error)
                console.log('success!');
    
            })
        })
      }

    }



  


  
  



