import { Cookies } from "react-cookie";

export const CatStatus = {
  IDLE: 1,
  WALK: 2,
  PLAY: 3,
};

export const toBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    // const fileReader = new FileReader();
    // fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};

export interface RoomInfo {
  nickName: string;
  catImg: Blob;
}

const cookies = new Cookies();

export const setCookie = (name: string, value: string, options?: any) => {
  return cookies.set(name, value, { ...options });
};

export const getCookie = (name: string) => {
  return cookies.get(name);
};

export const deleteCookie = (name: string) => {
  return cookies.remove(name);
};
