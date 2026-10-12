import socket from "socket.io-client";

let socketInstance = null;

export const intializeSocket = (projectId) => {
  // Disconnect previous instance if exists to avoid zombie connections
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  // Normalize URL to host root (e.g. http://localhost:3000) so socket.io connects to root namespace '/'
  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, "")
      : "http://localhost:3000");

  socketInstance = socket(socketUrl, {
    auth: {
      token: localStorage.getItem("token")
    },
    query: {
      projectId
    }
  });

  return socketInstance;
};

// Aliases for correct spelling
export const initializeSocket = intializeSocket;

export const recieveMessage = (eventName, callback) => {
  if (!socketInstance) {
    return;
  }

  socketInstance.on(eventName, callback);
};

export const receiveMessage = recieveMessage;

export const removeListener = (eventName, callback) => {
  if (!socketInstance) return;
  if (callback) {
    socketInstance.off(eventName, callback);
  } else {
    socketInstance.off(eventName);
  }
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) {
    return;
  }

  socketInstance.emit(eventName, data);
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const getSocket = () => socketInstance;
