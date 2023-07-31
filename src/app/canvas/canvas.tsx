import React, { useRef, useState, useEffect } from "react";
import "./canvas.css";
import head from "/public/img/cat/cat-head.png";
import face from "/public/img/cat/cat-face-idle.png";
import body from "/public/img/cat/cat-body-idle.png";
import Image from "next/image";
import { getCookie } from "./../common/common";

export const Canvas = ({ onClose, socket }) => {
  // useRef
  const canvasRef = useRef(null);
  // getCtx
  const [getCtx, setGetCtx] = useState(null);
  // painting state
  const [painting, setPainting] = useState(false);

  const [imageType, setImageType] = useState("head");

  const catImg = {
    head: "/img/cat/cat-head.png",
    face: "/img/cat/cat-face-idle.png",
    bodyIdle: "/img/cat/cat-body-idle.png",
    bodyRun: "/img/cat/cat-body-run.png",
  };
  const canvasSize = {
    w: 500,
    h: 350,
  };

  const size = {
    w: canvasSize.w,
    h: canvasSize.h,
  };

  useEffect(() => {
    // canvas useRef
    const canvas = canvasRef.current;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;
    const ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#000000";
    ctx.globalAlpha = 0.1;
    setGetCtx(ctx);
  }, []);

  const drawFn = (e) => {
    // mouse position
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    // drawing
    if (!painting) {
      getCtx.beginPath();
      getCtx.moveTo(mouseX, mouseY);
    } else {
      getCtx.lineTo(mouseX, mouseY);
      getCtx.globalCompositeOperation = "source-over";
      getCtx.lineJoin = getCtx.lineCap = "round";
      getCtx.lineWidth = 10;
      getCtx.globalAlpha = "0.2";
      getCtx.beginPath();
      getCtx.moveTo(mouseX, mouseY);
      getCtx.lineTo(mouseX, mouseY);
      getCtx.closePath();
      getCtx.stroke();
      getCtx.globalAlpha = "1";
      getCtx.lineWidth = 6;
      getCtx.beginPath();
      getCtx.moveTo(mouseX, mouseY);
      getCtx.lineTo(mouseX, mouseY);
      getCtx.closePath();
      getCtx.stroke();
    }
  };

  const changeType = (type: string) => {
    getCtx.clearRect(0, 0, canvasSize.w, canvasSize.h);
    setImageType(type);
  };

  const clearRect = () => {
    getCtx.clearRect(0, 0, canvasSize.w, canvasSize.h);
  };

  const applyCanvas = () => {
    const img = canvasRef.current.toDataURL("image/png");
    console.log(img);

    const catDiv = document.getElementsByClassName(`cat-my-cat`)[0];

    const data = {
      "cat-body": "",
      "cat-body-run": "",
      "cat-face": "",
      "cat-head": "",
    } as any;

    const name = getClassName(imageType);
    const dom = catDiv.getElementsByClassName(name)[0] as HTMLImageElement;
    dom.srcset = img;
    data[name] = img;
    socket.emit("update-image", {
      nickName: getCookie("nickName"),
      image: data,
    });
  };

  function getClassName(imageType: string): string {
    if (imageType === "head") {
      return "cat-head";
    } else if (imageType === "body") {
      return "cat-body";
    } else if (imageType === "face") {
      return "cat-face";
    } else if (imageType === "body-run") {
      return "cat-body-run";
    }
    return "";
  }

  return (
    <div className="view">
      <button className="close-btn" onClick={onClose}>
        닫기
      </button>
      <div className="canvasWrap">
        <canvas
          className="canvas"
          ref={canvasRef}
          onMouseDown={() => setPainting(true)}
          onMouseUp={() => setPainting(false)}
          onMouseMove={(e) => drawFn(e)}
          onMouseLeave={() => setPainting(false)}
        ></canvas>
        <div className="canvas-background-div">
          <Image
            src={catImg.bodyIdle}
            alt=""
            width={size.w}
            height={size.h}
          ></Image>
          <Image
            src={catImg.head}
            alt=""
            width={size.w}
            height={size.h}
          ></Image>
          <Image
            src={catImg.face}
            alt=""
            width={size.w}
            height={size.h}
          ></Image>
        </div>
      </div>

      <div className="canvas-paint-menu">
        <button onClick={clearRect}>지우기</button>
      </div>

      <div className="canvas-menu-bar">
        <button onClick={() => changeType("head")}>머리</button>
        <button onClick={() => changeType("body")}>몸통</button>
        <button onClick={() => changeType("body-run")}>달리기</button>
        <button onClick={() => changeType("face")}>얼굴</button>
      </div>

      <div>
        <button onClick={applyCanvas} style={{ float: "right" }}>
          적용하기
        </button>
      </div>
    </div>
  );
};
