'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var howler = require('howler');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var Actions;

(function (Actions) {
  Actions[Actions["START_LOAD"] = 0] = "START_LOAD";
  Actions[Actions["ON_LOAD"] = 1] = "ON_LOAD";
  Actions[Actions["ON_PLAY"] = 2] = "ON_PLAY";
  Actions[Actions["ON_END"] = 3] = "ON_END";
  Actions[Actions["ON_PAUSE"] = 4] = "ON_PAUSE";
  Actions[Actions["ON_STOP"] = 5] = "ON_STOP";
  Actions[Actions["ON_PLAY_ERROR"] = 6] = "ON_PLAY_ERROR";
  Actions[Actions["ON_LOAD_ERROR"] = 7] = "ON_LOAD_ERROR";
})(Actions || (Actions = {}));

var initialState = {
  loading: true,
  playing: false,
  stopped: true,
  error: null,
  duration: 0,
  ready: false
};
function reducer(state, action) {
  switch (action.type) {
    case Actions.START_LOAD:
      return _extends({}, state, {
        loading: true,
        stopped: true,
        ready: false,
        error: null,
        duration: 0
      });

    case Actions.ON_LOAD:
      return _extends({}, state, {
        loading: false,
        duration: action.duration,
        ready: true
      });

    case Actions.ON_PLAY:
      return _extends({}, state, {
        playing: true,
        stopped: false
      });

    case Actions.ON_STOP:
    case Actions.ON_END:
      return _extends({}, state, {
        stopped: true,
        playing: false
      });

    case Actions.ON_PAUSE:
      return _extends({}, state, {
        playing: false
      });

    case Actions.ON_PLAY_ERROR:
      return _extends({}, state, {
        playing: false,
        stopped: true,
        error: action.error
      });

    case Actions.ON_LOAD_ERROR:
      return _extends({}, state, {
        playing: false,
        stopped: true,
        loading: false,
        error: action.error
      });

    default:
      return state;
  }
}

var AudioPlayerContext =
/*#__PURE__*/
React__default.createContext(null);

function AudioPlayerProvider(_ref) {
  var children = _ref.children,
      value = _ref.value;

  var _useState = React.useState(null),
      player = _useState[0],
      setPlayer = _useState[1];

  var _useReducer = React.useReducer(reducer, initialState),
      _useReducer$ = _useReducer[0],
      loading = _useReducer$.loading,
      error = _useReducer$.error,
      playing = _useReducer$.playing,
      stopped = _useReducer$.stopped,
      duration = _useReducer$.duration,
      ready = _useReducer$.ready,
      dispatch = _useReducer[1];

  var playerRef = React.useRef();
  var constructHowl = React.useCallback(function (_ref2) {
    var src = _ref2.src,
        format = _ref2.format,
        autoplay = _ref2.autoplay,
        howlOpts = _objectWithoutPropertiesLoose(_ref2, ["src", "format", "autoplay"]);

    return new howler.Howl(_extends({
      src: src,
      format: format,
      autoplay: autoplay
    }, howlOpts));
  }, []);
  var load = React.useCallback(function (_ref3) {
    var src = _ref3.src,
        format = _ref3.format,
        _ref3$autoplay = _ref3.autoplay,
        autoplay = _ref3$autoplay === void 0 ? false : _ref3$autoplay,
        howlOpts = _objectWithoutPropertiesLoose(_ref3, ["src", "format", "autoplay"]);

    dispatch({
      type: Actions.START_LOAD
    });
    var wasPlaying = false;

    if (playerRef.current) {
      // don't do anything if we're asked to reload the same source
      // @ts-ignore the _src argument actually exists
      if (playerRef.current._src === src) return;
      wasPlaying = playerRef.current.playing();

      if (wasPlaying) {
        playerRef.current.stop(); // remove event handlers from player that is about to be replaced

        playerRef.current.off();
        playerRef.current = undefined;
      }
    } // create a new player


    var howl = constructHowl(_extends({
      src: src,
      format: format,
      autoplay: wasPlaying || autoplay
    }, howlOpts)); // if this howl has already been loaded (cached) then fire the load action
    // @ts-ignore _state exists

    if (howl._state === "loaded") {
      dispatch({
        type: Actions.ON_LOAD,
        duration: howl.duration()
      });
    }

    howl.on("load", function () {
      return void dispatch({
        type: Actions.ON_LOAD,
        duration: howl.duration()
      });
    });
    howl.on("play", function () {
      return void dispatch({
        type: Actions.ON_PLAY
      });
    });
    howl.on("end", function () {
      return void dispatch({
        type: Actions.ON_END
      });
    });
    howl.on("pause", function () {
      return void dispatch({
        type: Actions.ON_PAUSE
      });
    });
    howl.on("stop", function () {
      return void dispatch({
        type: Actions.ON_STOP
      });
    });
    howl.on("playerror", function (_id, error) {
      dispatch({
        type: Actions.ON_PLAY_ERROR,
        error: new Error("[Play error] " + error)
      });
    });
    howl.on("loaderror", function (_id, error) {
      dispatch({
        type: Actions.ON_LOAD_ERROR,
        error: new Error("[Load error] " + error)
      });
    });
    setPlayer(howl);
    playerRef.current = howl;
  }, [constructHowl]);
  React.useEffect(function () {
    // unload the player on unmount
    return function () {
      if (playerRef.current) playerRef.current.unload();
    };
  }, []);
  var contextValue = React.useMemo(function () {
    return value ? value : {
      player: player,
      load: load,
      error: error,
      loading: loading,
      playing: playing,
      stopped: stopped,
      ready: ready,
      duration: duration
    };
  }, [loading, error, playing, stopped, load, value, player, ready, duration]);
  return React__default.createElement(AudioPlayerContext.Provider, {
    value: contextValue
  }, children);
}

var noop = function noop() {};

var useAudioPlayer = function useAudioPlayer(props) {
  var _useContext = React.useContext(AudioPlayerContext),
      player = _useContext.player,
      load = _useContext.load,
      context = _objectWithoutPropertiesLoose(_useContext, ["player", "load"]);

  var _ref = props || {},
      src = _ref.src,
      format = _ref.format,
      autoplay = _ref.autoplay;

  React.useEffect(function () {
    // if useAudioPlayer is called without arguments
    // don't do anything: the user will have access
    // to the current context
    if (!src) return;
    load({
      src: src,
      format: format,
      autoplay: autoplay
    });
  }, [src, format, autoplay, load]);
  var togglePlayPause = React.useCallback(function () {
    if (!player) return;

    if (player.playing()) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);
  return _extends({}, context, {
    play: player ? player.play.bind(player) : noop,
    pause: player ? player.pause.bind(player) : noop,
    stop: player ? player.stop.bind(player) : noop,
    mute: player ? player.mute.bind(player) : noop,
    seek: player ? player.seek.bind(player) : noop,
    volume: player ? player.volume.bind(player) : noop,
    load: load,
    togglePlayPause: togglePlayPause
  });
};

var useAudioPosition = function useAudioPosition(config) {
  if (config === void 0) {
    config = {};
  }

  var _config = config,
      _config$highRefreshRa = _config.highRefreshRate,
      highRefreshRate = _config$highRefreshRa === void 0 ? false : _config$highRefreshRa;

  var _useContext = React.useContext(AudioPlayerContext),
      player = _useContext.player,
      playing = _useContext.playing,
      stopped = _useContext.stopped,
      duration = _useContext.duration;

  var _useAudioPlayer = useAudioPlayer(),
      seek = _useAudioPlayer.seek;

  var _useState = React.useState(0),
      position = _useState[0],
      setPosition = _useState[1];

  var animationFrameRef = React.useRef(); // sets position on player initialization and when the audio is stopped

  React.useEffect(function () {
    if (player) {
      setPosition(player.seek());
    }
  }, [player, stopped]); // updates position on a one second loop for low refresh rate default setting

  React.useEffect(function () {
    var timeout;
    if (!highRefreshRate && player && playing) timeout = window.setInterval(function () {
      return setPosition(player.seek());
    }, 1000);
    return function () {
      return clearTimeout(timeout);
    };
  }, [highRefreshRate, player, playing]); // updates position on a 60fps loop for high refresh rate setting

  React.useLayoutEffect(function () {
    var animate = function animate() {
      setPosition(player === null || player === void 0 ? void 0 : player.seek());
      animationFrameRef.current = requestAnimationFrame(animate);
    }; // kick off a new animation cycle when the player is defined and starts playing


    if (highRefreshRate && player && playing) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return function () {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [highRefreshRate, player, playing]);
  return {
    position: position,
    duration: duration,
    seek: seek
  };
};

exports.AudioPlayerProvider = AudioPlayerProvider;
exports.useAudioPlayer = useAudioPlayer;
exports.useAudioPosition = useAudioPosition;
//# sourceMappingURL=react-use-audio-player.cjs.development.js.map
