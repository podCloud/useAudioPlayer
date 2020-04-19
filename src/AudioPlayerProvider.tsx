import React, {
    useState,
    useCallback,
    useEffect,
    useRef,
    useReducer,
    useMemo
} from "react"
import { Howl } from "howler"
import { initialState, reducer, Actions } from "./audioPlayerState"
import { AudioPlayerContext } from "./context"
import { AudioPlayer, AudioSrcProps } from "./types"

interface AudioPlayerProviderProps {
    children: React.ReactNode
    value?: AudioPlayer
}

export function AudioPlayerProvider({
    children,
    value
}: AudioPlayerProviderProps) {
    const [player, setPlayer] = useState<Howl | null>(null)
    const [
        { loading, error, playing, stopped, duration, ready },
        dispatch
    ] = useReducer(reducer, initialState)

    const playerRef = useRef<Howl>()

    const constructHowl = useCallback(
        ({ src, format, autoplay, ...howlOpts }: AudioSrcProps): Howl => {
            return new Howl({
                src,
                format,
                autoplay,
                ...howlOpts
            })
        },
        []
    )

    const load = useCallback(
        ({ src, format, autoplay = false, ...howlOpts }: AudioSrcProps) => {
            dispatch({ type: Actions.START_LOAD })

            let wasPlaying = false
            if (playerRef.current) {
                // don't do anything if we're asked to reload the same source
                // @ts-ignore the _src argument actually exists
                if (playerRef.current._src === src) return
                wasPlaying = playerRef.current.playing()
                if (wasPlaying) {
                    playerRef.current.stop()
                    // remove event handlers from player that is about to be replaced
                    playerRef.current.off()
                    playerRef.current = undefined
                }
            }

            // create a new player
            const howl = constructHowl({
                src,
                format,
                autoplay: wasPlaying || autoplay, // continues playing next song
                ...howlOpts
            })

            // if this howl has already been loaded (cached) then fire the load action
            // @ts-ignore _state exists
            if (howl._state === "loaded") {
                dispatch({ type: Actions.ON_LOAD, duration: howl.duration() })
            }

            howl.on(
                "load",
                () =>
                    void dispatch({
                        type: Actions.ON_LOAD,
                        duration: howl.duration()
                    })
            )
            howl.on("play", () => void dispatch({ type: Actions.ON_PLAY }))
            howl.on("end", () => void dispatch({ type: Actions.ON_END }))
            howl.on("pause", () => void dispatch({ type: Actions.ON_PAUSE }))
            howl.on("stop", () => void dispatch({ type: Actions.ON_STOP }))
            howl.on("playerror", (_id, error) => {
                dispatch({
                    type: Actions.ON_PLAY_ERROR,
                    error: new Error("[Play error] " + error)
                })
            })
            howl.on("loaderror", (_id, error) => {
                dispatch({
                    type: Actions.ON_LOAD_ERROR,
                    error: new Error("[Load error] " + error)
                })
            })

            setPlayer(howl)
            playerRef.current = howl
        },
        [constructHowl]
    )

    useEffect(() => {
        // unload the player on unmount
        return () => {
            if (playerRef.current) playerRef.current.unload()
        }
    }, [])

    const contextValue: AudioPlayer = useMemo(() => {
        return value
            ? value
            : {
                  player,
                  load,
                  error,
                  loading,
                  playing,
                  stopped,
                  ready,
                  duration
              }
    }, [loading, error, playing, stopped, load, value, player, ready, duration])

    return (
        <AudioPlayerContext.Provider value={contextValue}>
            {children}
        </AudioPlayerContext.Provider>
    )
}
