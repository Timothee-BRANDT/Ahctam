import { io, Socket } from "socket.io-client";
import { serverIP } from "./constants";

let socket: Socket | null = null;

const setupSocketListeners = (): void => {
  if (socket) {
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    socket.on("connect_error", (err) => {
      console.log("Socket connection error:", err);
    });

    socket.on("notification", (data) => {
      console.log("New notif!!");
      console.log(data.message);
    });
  }
};

export const initializeSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(`http://${serverIP}:5000`, { query: { token } });
  setupSocketListeners();
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    console.log("disconnecting socket: ", socket.id);
    socket.disconnect();
    socket = null;
  }
};
