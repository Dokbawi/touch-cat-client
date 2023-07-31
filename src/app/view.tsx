"use client";
import { useEffect, useRef, useState } from "react";
import { Cat } from "./cat/cat";
import Draggable from "react-draggable";
import "./view.css";
import { Cursor } from "./cursor/cursor";
import Image from "next/image";

import { socket } from "./socket/socket";
import { RoomInfo, deleteCookie, getCookie, setCookie } from "./common/common";
import { Cookies } from "react-cookie";
import { Canvas } from "./canvas/canvas";

interface DrageItemType {
  name: string;
}

const DrageItem = ({ name }: DrageItemType) => {
  const nodeRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [Opacity, setOpacity] = useState(false);
  const handleDrag = (e: any, data: { x: any; y: any }) => {
    setPos({ x: data.x, y: data.y });
    setOpacity(true);
  };
  const handleDragStop = (e: any) => {
    setPos({ x: 0, y: 0 });
    setOpacity(false);
    const cats = document.getElementsByClassName("cat");

    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i] as HTMLElement;
      const rect1 = {
        x: Number(cat.style.left.replace("px", "")),
        y: Number(cat.style.top.replace("px", "")),
        width: Number(200),
        height: Number(150),
      };
      const rect2 = {
        x: pos.x,
        y: pos.y,
        width: pos.x + imgInfo.width,
        height: pos.y + imgInfo.height,
      };
      console.log("rect1 : ", rect1);
      if (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      ) {
        const list = [...cat.classList];
        if (!list.includes("event")) {
          if (!list.includes("my-cat")) {
            const nickName = list
              .find((v) => v.includes("cat-"))
              ?.replace("cat-", "");

            socket.emit("give-motion-info", { nickName, type: name });
          }
          cat.classList.add("event", name);
        }
      }
    }
  };
  const setImage = (name: string) => {
    if (name === "food") {
      return {
        src: "/img/item/food-item.png",
        width: 100,
        height: 64,
      };
    } else if (name === "stick") {
      return {
        src: "/img/item/stick-item.png",
        width: 90.2,
        height: 72,
      };
    }
  };
  const imgInfo = setImage(name) as {
    src: string;
    width: number;
    height: number;
  };
  const className = "play-" + name;

  return (
    <Draggable
      nodeRef={nodeRef}
      onDrag={(e, data) => handleDrag(e, data)}
      onStop={handleDragStop}
      position={pos}
    >
      <div
        ref={nodeRef}
        className={className}
        style={{
          opacity: Opacity ? "0.6" : "1",
          width: imgInfo.width,
          height: imgInfo.height,
        }}
      >
        <Image src={imgInfo.src} alt="" fill />
      </div>
    </Draggable>
  );
};

export const UI = () => {
  const [cats, setCats] = useState([{ nickName: "my-cat", image: {} }]);
  const [cursors, setCursors] = useState([{ nickName: "my-cat" }]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo[]>([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isMulti, setIsMulti] = useState(false);
  const [isOpenCreateRoom, setIsOpenCreateRoom] = useState(false);
  const [isOpenJoinRoom, setIsOpenJoinRoom] = useState(false);
  const [isOpenCanvas, setIsOpenCanvas] = useState(false);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("socket : ", socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onGetRoomInfo(data: any) {
      console.log("onGetRoomInfo : ", data);
      const myNickName = getCookie("nickName");
      console.log("my nickname : ", myNickName);
      const tempRoomInfo = data.filter((v: any) => v.nickName !== myNickName);

      console.log("tempRoomInfo : ", tempRoomInfo);

      setRoomInfo(data);

      for (const idx of tempRoomInfo) {
        if (cats.filter((v) => v.nickName !== idx.nickName)) {
          setCats([
            ...cats,
            {
              nickName: idx.nickName,
              image: idx.image,
            },
          ]);
        }

        if (cursors.filter((v) => v.nickName !== idx.nickName)) {
          setCursors([
            ...cursors,
            {
              nickName: idx.nickName,
            },
          ]);
        }
      }
    }

    function onAlert(info: any) {
      const { type, data } = info;
      console.log("onAlert: ", info);
      switch (type) {
        case "join-room":
          break;
        case "leave-   room":
          setCats(cats.filter((v) => v.nickName !== data.nickName));
          setCursors(cursors.filter((v) => v.nickName !== data.nickName));
          break;
        case "update-image":
          const catDiv = document.getElementsByClassName(
            `cat-${info?.nickName}`
          )[0];

          for (const classname of Object.keys(info?.image)) {
            console.log("classname : ", classname);
            console.log("data[classname] : ", info?.image[classname]);
            if (info?.image[classname]) {
              const img = catDiv.getElementsByClassName(
                classname
              )[0] as HTMLImageElement;
              img.srcset = info?.image[classname];
            }
          }

          break;
      }
      socket.emit("get-room-info");
    }

    function onGetMousePoint(data: any) {
      const { x, y, nickName } = data;
      const cursorDom = document.getElementsByClassName(
        `cursor-${nickName}`
      )[0] as HTMLElement;

      if (cursorDom) {
        cursorDom.style.transform = `translate(${x}px, ${y}px)`;
      }
    }

    function onMotionInfo(data: any) {
      const cats = document.getElementsByClassName(
        "cat"
      ) as unknown as HTMLElement[];
      const myNickName = getCookie("nickName");
      const cat = [...cats].find((v) => {
        const list = [...v?.classList];
        return myNickName === data.nickName || list.includes(data.nickName);
      }) as HTMLElement;
      cat.classList.add("event", data.type);
    }

    const handleMouseMove = (event: any) => {
      if (isConnected) {
        if (isMulti) {
          const nickName = getCookie("nickName");
          socket.emit("get-mouse-point", {
            x: event.clientX,
            y: event.clientY,
            nickName,
          });
        }
      }
    };

    socket.on("connect", onConnect);
    socket.on("get-room-info", onGetRoomInfo);
    socket.on("alert", onAlert);
    socket.on("give-point", onGetMousePoint);
    socket.on("give-motion-info", onMotionInfo);
    socket.on("disconnect", onDisconnect);

    window.addEventListener("mousemove", handleMouseMove);

    document.getElementById("createRoomCode")?.focus();
    return () => {
      socket.off("connect", onConnect);
      socket.off("get-room-info", onGetRoomInfo);
      socket.off("alert", onAlert);
      socket.off("give-point", onGetMousePoint);
      socket.off("give-motion-info", onMotionInfo);
      socket.off("disconnect", onDisconnect);

      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isConnected, isMulti]);

  function openCanvas() {
    setIsOpenCanvas(true);
  }

  function closeCanvas() {
    setIsOpenCanvas(false);
  }

  function createRoom(type: string) {
    const roomCode =
      type === "create"
        ? (document.getElementById("createRoomCode") as HTMLInputElement).value
        : (document.getElementById("joinRoomCode") as HTMLInputElement).value;
    const nickName = (
      document.getElementById("room-nickName") as HTMLInputElement
    ).value;

    console.log("type : ", type);
    console.log("create room Code : ", roomCode);
    console.log("create nickName : ", nickName);

    if (!nickName) {
      alert(" required nickname ");
      return;
    }

    const dom = document.getElementsByClassName(`cat-my-cat`);
    const children = dom[0].getElementsByTagName("img");
    const image = {} as { [index: string]: string };

    for (const child of children) {
      console.log(child.className);
      image[child.className] = child.srcset;
    }
    console.log("image : ", image);
    socket.emit("join-room", {
      roomCode,
      nickName,
      image,
    });
    setCookie("nickName", nickName);
    setCookie("roomCode", roomCode);
    setIsMulti(true);
    setIsOpenCreateRoom(false);
    setIsOpenJoinRoom(false);
    socket.emit("get-room-info");
  }

  function leaveRoom() {
    deleteCookie("nickName");
    deleteCookie("roomCode");
    setIsMulti(false);
    socket.emit("leave-room");

    setCats(cats.filter((v) => v.nickName === "my-cat"));
    setCursors([]);
  }

  function openCreateRoomDiv() {
    setIsOpenCreateRoom(true);
  }
  function openJoinRoomDiv() {
    setIsOpenJoinRoom(true);
  }

  return (
    <div className="main-div">
      {isOpenCanvas && <Canvas onClose={closeCanvas} socket={socket} />}
      {!isOpenCanvas && <button onClick={openCanvas}>고양이 그리기</button>}
      <div className="play-menu">
        <DrageItem name="food" />
        <DrageItem name="stick" />
      </div>

      {!isMulti && (
        <>
          <div>
            {!isOpenCreateRoom && !isOpenJoinRoom && (
              <>
                <button style={{ float: "right" }} onClick={openJoinRoomDiv}>
                  방 참가
                </button>
                <button style={{ float: "right" }} onClick={openCreateRoomDiv}>
                  방 만들기
                </button>
              </>
            )}

            {(isOpenCreateRoom || isOpenJoinRoom) && (
              <div id="createRoomDiv">
                <div>
                  {isOpenCreateRoom && (
                    <input
                      id="createRoomCode"
                      readOnly
                      defaultValue="ddsd"
                    ></input>
                  )}

                  {isOpenJoinRoom && <input id="joinRoomCode"></input>}
                  <label>방코드</label>
                  <span></span>
                </div>

                <div style={{ marginBottom: "0px" }}>
                  <input id="room-nickName"></input>
                  <label>닉네임</label>
                  <span></span>
                </div>
                {isOpenCreateRoom && (
                  <button
                    style={{
                      position: "absolute",
                      right: "3.5%",
                    }}
                    onClick={(e) => {
                      createRoom("create");
                    }}
                  >
                    방 만들기
                  </button>
                )}

                {isOpenJoinRoom && (
                  <button
                    style={{
                      position: "absolute",
                      right: "3.5%",
                    }}
                    onClick={(e) => {
                      createRoom("join");
                    }}
                  >
                    방 참가
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {isMulti && (
        <>
          <div>
            <button style={{ float: "right" }} onClick={leaveRoom}>
              방 나가기
            </button>
          </div>
          <div id="roomInfoDiv">
            <div>접속 인원</div>
            {roomInfo.map((idx: RoomInfo) => (
              <div key={idx.nickName}>{idx.nickName}</div>
            ))}
          </div>
        </>
      )}

      {cats.map((idx) => (
        <Cat key={idx.nickName} nickName={idx.nickName} image={idx.image} />
      ))}
      {cursors.map((idx) => (
        <Cursor key={idx.nickName} nickName={idx.nickName} />
      ))}
    </div>
  );
};
