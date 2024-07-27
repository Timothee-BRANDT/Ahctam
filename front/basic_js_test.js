const io = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server");
  // Vous pouvez ajouter ici d'autres actions ou assertions
  socket.disconnect();
});
