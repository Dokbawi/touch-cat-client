import Image from "next/image";
import { useEffect, useState } from "react";
import "./cursor.css";
interface CatType {
  nickName: string;
}

export const Cursor = ({ nickName }: CatType) => {
  const point = { x: 0, y: 0 };

  const [style, setStyle] = useState({
    left: 0,
    top: 0,
  });
  const src = "/img/cursor/green-cursor.png";
  const size = {
    w: 25,
    h: 25,
  };
  useEffect(() => {}, []);
  return (
    <div className={`cursor cursor-${nickName}`} style={style}>
      <Image src={src} alt="" width={size.w} height={size.h}></Image>
    </div>
  );
};
