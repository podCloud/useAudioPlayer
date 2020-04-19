import React from "react";
import { AudioPlayer } from "./types";
interface AudioPlayerProviderProps {
    children: React.ReactNode;
    value?: AudioPlayer;
}
export declare function AudioPlayerProvider({ children, value }: AudioPlayerProviderProps): JSX.Element;
export {};
