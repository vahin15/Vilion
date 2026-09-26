import { io } from "socket.io-client";
import { API_BASE } from "./api.js";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(API_BASE.replace("/api", ""), {
      auth: { token: localStorage.getItem("velion_token") },
      autoConnect: true
    });
  }
  return socket;
}
