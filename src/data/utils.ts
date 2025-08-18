import {
    Capacitor
} from "@capacitor/core";
import CONSTANTS from "./constants";

export const getUrl = (): string => {
    return Capacitor.getPlatform() === "ios" ? CONSTANTS.IOS_URL : CONSTANTS.ANDROID_URL;
}