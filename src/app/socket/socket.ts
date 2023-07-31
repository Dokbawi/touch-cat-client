import io, { Socket } from "socket.io-client";

interface JoinRoom {
  roomCode: string;
  nickName: string;
  catImgData: Blob;
}

// const url = "http://15.164.0.100:12321";
const url = "http://localhost:12321";

export const socket: Socket = io(url, {
  path: "/socket.io",
});

// export class SocketClient {
//   socket: Socket;
//   constructor() {
//     this.socket = io("http://localhost:3000", {
//       path: "/socket.io",
//     });

//     this.events();
//   }

//   public events() {
//     this.socket.on("alert", (info) => {
//       const { type, data } = info;
//       switch (type) {
//         case "join-room":
//           this.callbackJoinRoom(data);
//           break;
//       }
//     });

//     this.socket.on("get-room-Info", (info) => {});
//   }

//   public callbackJoinRoom(data: { nickName: string }) {
//     const { nickName } = data;

//     this.socket.emit("getRoomInfo");
//   }

//   public joinRoom(data: JoinRoom) {
//     const { catImgData, nickName, roomCode } = data;

//     this.socket.emit("join-room", data);
//   }
// }
