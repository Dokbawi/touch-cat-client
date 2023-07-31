import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "./cat.css";
import { CatStatus } from "./../common/common";
interface CatType {
  nickName: string;
  image: any;
}

export const Cat = ({ nickName, image }: CatType) => {
  const nodeRef = useRef(null);
  const [pos, setPos] = useState({
    x: 0,
    y: 0,
  });
  const [style, setStyle] = useState({
    left: 0,
    top: 0,
  });
  const [status, setStatus] = useState(CatStatus.IDLE);

  const catImg = {
    head: "/img/cat/cat-head.png",
    face: "/img/cat/cat-face-idle.png",
    bodyIdle: "/img/cat/cat-body-idle.png",
    bodyRun: "/img/cat/cat-body-run.png",
  };
  const size = {
    w: 200,
    h: 150,
  };

  const speed = 0.5;
  const [ani, setAni] = useState(0);

  const [isLoad, setIsLoad] = useState(false);

  useEffect(() => {
    if (!isLoad) {
      setIsLoad(true);
      if (image["cat-head"]) {
        const catDiv = document.getElementsByClassName(`cat-${nickName}`)[0];
        const images = catDiv.getElementsByTagName("img");
        for (const img of images) {
          img.srcset = image[img.className];
        }
      }
    }
    function animation() {
      const catDiv = document.getElementsByClassName(`cat-${nickName}`)[0];
      const catBodyIdleDom = catDiv.getElementsByClassName(
        "cat-body"
      )[0] as HTMLImageElement;
      const catBodyRunDom = catDiv.getElementsByClassName(
        "cat-body-run"
      )[0] as HTMLImageElement;

      if (ani > 40) {
        setAni(0);

        const display = catBodyIdleDom.style.display;

        if (!display || display === "none") {
          catBodyIdleDom.style.display = "inline";
          catBodyRunDom.style.display = "none";
        } else {
          catBodyIdleDom.style.display = "none";
          catBodyRunDom.style.display = "inline";
        }
      } else {
        setAni(ani + 1);
      }
    }

    function update() {
      checkEvent();
      if (status === CatStatus.WALK) {
        if (getDistance(style.left, style.top, pos.x, pos.y) < 6) {
          setStatus((status) => CatStatus.IDLE);
        } else {
          moveToPosition(pos);
          animation();
        }
      } else if (status === CatStatus.IDLE) {
        const catDiv = document.getElementsByClassName(`cat-${nickName}`)[0];
        const catBodyIdleDom = catDiv.getElementsByClassName(
          "cat-body"
        )[0] as HTMLImageElement;
        const catBodyRunDom = catDiv.getElementsByClassName(
          "cat-body-run"
        )[0] as HTMLImageElement;

        const display = catBodyIdleDom.style.display;
        if (!display || display === "none") {
          catBodyIdleDom.style.display = "inline";
          catBodyRunDom.style.display = "none";
        }
      }
    }

    function getDistance(x1: number, y1: number, x2: number, y2: number) {
      let x = x2 - x1;
      let y = y2 - y1;

      return Math.sqrt(x * x + y * y);
    }

    function moveToPosition(target: { x: number; y: number }) {
      const copy = { ...style };
      if (copy.left > target.x) {
        copy.left -= speed;
      }
      if (copy.left < target.x) {
        copy.left += speed;
      }

      if (copy.top < target.y) {
        copy.top += speed * 0.8;
      }
      if (copy.top > target.y) {
        copy.top -= speed * 0.8;
      }

      setStyle(copy);
    }

    function randomMove() {
      if (status === CatStatus.IDLE) {
        const randomW = Math.floor(Math.random() * window.innerWidth);
        const randomH = Math.floor(Math.random() * window.innerHeight);

        if (style.left < randomW) {
          const dom = document.getElementsByClassName(`cat-${nickName}`);
          const children = dom[0].children;

          for (const child of children) {
            child.style.transform = "scaleX(-1)";
          }
        } else {
          const dom = document.getElementsByClassName(`cat-${nickName}`);
          const children = dom[0].children;

          for (const child of children) {
            child.style.transform = "scaleX(1)";
          }
        }

        setPos({
          x: randomW,
          y: randomH,
        });

        setStatus((status) => CatStatus.WALK);
      }
    }

    function checkEvent() {
      const self = nodeRef.current as unknown as HTMLElement;
      const classList = [...self.classList];

      if (classList.includes("event")) {
        setStatus((status) => {
          status = CatStatus.PLAY;
          return status;
        });

        setTimeout(() => {
          self.classList.remove("event", classList[classList.length]);
          setStatus((status) => CatStatus.IDLE);
        }, 1500);
      }
    }

    const intervals = [
      setInterval(update, 1000 / 144),
      setInterval(randomMove, 3000),
    ];

    return () => {
      intervals.map((v) => clearInterval(v));
    };
  }, [status, setStatus, pos, style, ani]);

  return (
    <div ref={nodeRef} className={`cat cat-${nickName}`} style={style}>
      <Image
        className="cat-body"
        src={catImg.bodyIdle}
        alt=""
        width={size.w}
        height={size.h}
      ></Image>
      <Image
        className="cat-body-run"
        src={catImg.bodyRun}
        alt=""
        width={size.w}
        height={size.h}
      ></Image>
      <Image
        className="cat-head"
        src={catImg.head}
        alt=""
        width={size.w}
        height={size.h}
      ></Image>
      <Image
        className="cat-face"
        src={catImg.face}
        alt=""
        width={size.w}
        height={size.h}
      ></Image>
    </div>
  );
};
