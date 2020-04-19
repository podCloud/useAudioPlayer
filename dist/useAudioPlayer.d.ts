/// <reference types="howler" />
import { AudioPlayer, AudioSrcProps } from "./types";
declare const noop: () => void;
export declare type AudioPlayerControls = Omit<AudioPlayer, "player"> & {
    play: Howl["play"] | typeof noop;
    pause: Howl["pause"] | typeof noop;
    stop: Howl["stop"] | typeof noop;
    mute: Howl["mute"] | typeof noop;
    seek: Howl["seek"] | typeof noop;
    volume: Howl["volume"] | typeof noop;
    togglePlayPause: () => void;
};
export declare const useAudioPlayer: (props?: AudioSrcProps | undefined) => AudioPlayerControls;
export {};
