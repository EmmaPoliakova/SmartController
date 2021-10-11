import Peer from 'peerjs'
import QRCode from 'qrcode'
import EventEmitter2 from 'eventemitter2'

class Joystick{

 constructor(connection){

   this.peer = connection;  // the connection object from phone, this.peer.peer will give peer id
   this.isActive = false; // signals of joysticks is moving
   this.state = []; //all information sent from joystick [angle, direction, distance, position coordinates]
   this.lastPosition = {x:0, y:0} //last position on pc screen 
   this.processData();  //listen to new data incoming and store them 
 }

 processData = () => {
  var selfJ = this; //refers to the Joystick object -> temporary solution as using self = this in constructor was somehow overwriting self variable in SmartPeer class causing the dictionary and data emitting fail 
  this.peer.on("data", function(data){     // incoming data listener

    if (data[0]=="start"){    //decide if joystick is active or not
      selfJ.isActive = true;
    }

    if (data[0]=="end"){
      selfJ.isActive = false;
    }
    
    selfJ.state = data[1];  //store the joystick object information sent by phone
  
    var xunits = Math.cos(selfJ.state.angle.degree*Math.PI/180) * 10;
    var yunits = Math.sin(selfJ.state.angle.degree*Math.PI/180) * 10;

    selfJ.lastPosition.x += xunits
    selfJ.lastPosition.y += yunits
      
});
 }


}

class TouchPad{

 constructor(connection){
   
   this.peer = connection; // the connection object from phone, this.peer.peer will give peer id
   this.isActive = false;  // signals if touch is detected on the screen 
   this.state = [];  //coordinates for each finger, cant tell finger appart coordinates are recorded in order of tapping the screen
   this.finger_number = 0; //number of fingers touching the screen
   this.processData();
 }

 processData = () =>{
  var selfT = this; //refers to the Touchpad object -> temporary solution as using self = this in constructor was somehow overwriting self variable in SmartPeer class causing the dictionary and data emitting fail 
  this.peer.on("data", function(data){  //for not the data has following form [0] = start/end of touch, [1] = number of fingers, [2] = coordinates for each finger

    selfT.state = data[2];
    selfT.finger_number = data[1];

    if (data[0]=="start"){
      selfT.isActive = true;
    }

    if (data[0]=="end"){
      selfT.isActive = false;
    }

  });
}

}



export class SmartController extends EventEmitter2{

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


    export class TouchPadSmartController extends SmartController{
  
      constructor(peerid) {
          super(peerid);
          self = this;
          this.touchpadList = [];
          this.peerConnection.on("connection", this.touchpadOptions);
      }
      
      touchpadOptions = (conn) => {
          self.touchpadList[conn.peer] = new TouchPad(conn);
        }
  
  
        createQrCode = (url = "touch screen canvas url", canvasID) => {
          self.peerConnection.on("open" , function(id){
            QRCode.toCanvas(document.getElementById(canvasID), url +"?id="+self.peerConnection.id, function (error) {
              if (error) console.error(error)
              console.log('success!');
  
          })
      })
    }
  
  }

  
export class JoystickSmartController extends SmartController{

  constructor(peerid) {
      super(peerid);
      self = this;
      this.joystickList = {};


      this.peerConnection.on("connection", this.joystickOptions);
  }
  
  joystickOptions = (conn) => {
      self.joystickList[conn.peer] = new Joystick(conn);
    }


    createQrCode = (url = "joystick url", canvasID) => {
      self.peerConnection.on("open" , function(id){
        QRCode.toCanvas(document.getElementById(canvasID), url +"?id="+self.peerConnection.id, function (error) {
          if (error) console.error(error)
          console.log('success!');

      })
  })
}

}

  
  



