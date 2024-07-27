const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public"))); 
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const connectedUsers = new Map();

io.on("connection",(socket)=>{
   socket.on("join",(username)=>{
      socket.emit("existing-users", Array.from(connectedUsers.values()));
   });
   socket.on("send-position",(data)=>{
      const userData = { id: socket.id, ...data };
      connectedUsers.set(socket.id, userData);
      io.emit("receive-position",userData);
   })
   socket.on("disconnect",()=>{
      connectedUsers.delete(socket.id);
      io.emit("user-disconnect",{id:socket.id});
   })
})
app.get("/",(req,res)=>{
   res.render("name.ejs");
})
app.get("/map",(req,res)=>{
   let {username} = req.query;
   console.log(username);
   res.render("index",{username});
})
server.listen(3000,()=>{console.log("Listening on port 3000")});
















