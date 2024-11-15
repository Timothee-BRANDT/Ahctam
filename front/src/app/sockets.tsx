import { io, Socket } from "socket.io-client";
import { serverIP } from "./constants";

let socket: Socket | null = null;

const setupSocketListeners = (): void => {
  if (socket) {
    

    socket.on("connect", () => {
      
    });

    socket.on("disconnect", () => {
      socket?.disconnect();
      socket = null;
      
    });

    socket.on("connect_error", (err) => {
      
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
    
    socket.disconnect();
    socket = null;
  }
};
