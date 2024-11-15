const io = require("socket.io-client");
const socket = io("127.0.0.1:5000");

socket.on("connect", () => {
  // Envoyer un message "hello"
  socket.emit("message", {
    message: "Hello from client",
    receiver: receiverID,
  });
});

socket.on("server_message", (data) => {
  // Se déconnecter après avoir reçu la réponse du serveur

  socket.disconnect();
});

socket.on("disconnect", (reason) => {});

socket.on("connect_error", (error) => {});

socket.on("notification", (data) => {
  // Handle this shit
});
