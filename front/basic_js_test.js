const io = require("socket.io-client");
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server");
  console.log("Socket ID:", socket.id);

  // Envoyer un message "hello"
  socket.emit("message", { message: "Hello from client", receiver: receiverID });
});

socket.on("server_message", (data) => {
  console.log("Received message from server:", data);

  // Se déconnecter après avoir reçu la réponse du serveur
  console.log("Disconnecting...");
  socket.disconnect();
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected from server. Reason:", reason);
});

socket.on("connect_error", (error) => {
  console.log("Connection error:", error);
});