import { AudioPlayerControls } from "./useAudioPlayer";
interface UseAudioPositionConfig {
    highRefreshRate?: boolean;
}
interface AudioPosition {
    position: number;
    duration: number;
    seek: AudioPlayerControls["seek"];
}
export declare const useAudioPosition: (config?: UseAudioPositionConfig) => AudioPosition;
export {};
