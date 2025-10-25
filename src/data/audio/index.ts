import {
    NativeAudio
} from '@capacitor-community/native-audio';
import {
    Capacitor
} from "@capacitor/core";
import {
    store
} from '../../store.ts';

// Define audio asset types
type AudioAssetId = 'click' | 'correct' | 'unlocked' | 'mistake';

interface AudioAsset {
    assetId: AudioAssetId;
    assetPath: string;
    audioChannelNum: number;
    isUrl: boolean;
}

// Define audio assets configuration
const audioAssets: AudioAsset[] = [
    {
        assetId: "click",
        assetPath: "public/assets/audio/click.mp3",
        audioChannelNum: 1,
        isUrl: false
    },
    {
        assetId: "correct",
        assetPath: "public/assets/audio/correct.wav",
        audioChannelNum: 1,
        isUrl: false
    },
    {
        assetId: "unlocked",
        assetPath: "public/assets/audio/unlocked.mp3",
        audioChannelNum: 1,
        isUrl: false
    },
    {
        assetId: "mistake",
        assetPath: "public/assets/audio/wordMistake.wav",
        audioChannelNum: 1,
        isUrl: false
    }
];

/**
 * Initialize audio assets by preloading them
 */
export const initAudio = (): void => {
    if (Capacitor.getPlatform() === "web") {
        return;
    }
    
    audioAssets.forEach((asset: AudioAsset) => {
        NativeAudio.preload(asset);
    });
};

/**
 * Play a sound by asset ID
 * @param assetId - The ID of the audio asset to play
 */
export const playSound = (assetId: AudioAssetId): void => {
    if (Capacitor.getPlatform() === "web" || !store.getState().userSettings.sound) {
        return;
    }
    
    NativeAudio.play({
        assetId
    });
};