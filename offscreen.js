let audio = null;
let currentPlaybackRate = 1.0;
let isLooping = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  switch (message.type) {
    case 'play':
      if (message.playbackRate !== undefined) currentPlaybackRate = message.playbackRate;
      if (message.loop !== undefined) isLooping = !!message.loop;
      playAudio(message.url, message.volume);
      break;
    case 'pause':
      pauseAudio();
      break;
    case 'setVolume':
      setVolume(message.volume);
      break;
    case 'setStation':
      if (message.playbackRate !== undefined) currentPlaybackRate = message.playbackRate;
      if (message.loop !== undefined) isLooping = !!message.loop;
      setStation(message.url);
      break;
    case 'setPlaybackRate':
      currentPlaybackRate = message.playbackRate;
      setPlaybackRate(message.playbackRate);
      break;
    case 'setLoop':
      isLooping = !!message.loop;
      setLoop(message.loop);
      break;
    case 'seek':
      seek(message.percentage);
      break;
  }
});

function setupAudioListeners() {
  if (!audio) return;
  audio.ontimeupdate = () => sendAudioState();
  audio.ondurationchange = () => sendAudioState();
  audio.onplay = () => sendAudioState();
  audio.onpause = () => sendAudioState();
  audio.onended = () => sendAudioState();
  audio.onseeking = () => sendAudioState();
  audio.onseeked = () => sendAudioState();
  
  // Loading states
  audio.onloadstart = () => sendAudioState(true);
  audio.onwaiting = () => sendAudioState(true);
  audio.onplaying = () => sendAudioState(false);
  audio.oncanplay = () => sendAudioState(false);
}

function sendAudioState(isLoading = false) {
  if (!audio) return;
  
  // If we haven't received enough data to play, we're loading. readyState < 3 means HAVE_CURRENT_DATA or less.
  const isBuffering = isLoading || (audio.networkState === 2 && audio.readyState < 3 && !audio.paused);
  
  chrome.runtime.sendMessage({
    target: 'newtab',
    type: 'audioState',
    currentTime: audio.currentTime,
    duration: audio.duration,
    paused: audio.paused,
    seeking: audio.seeking,
    loading: isBuffering
  });
}

function playAudio(url, volume) {
  if (!audio) {
    audio = new Audio(url);
    setupAudioListeners();
  } else if (audio.src !== url) {
    audio.src = url;
  }
  audio.volume = volume;
  audio.playbackRate = currentPlaybackRate;
  audio.loop = isLooping;
  audio.play()
    .then(() => sendAudioState())
    .catch(e => console.error("Error playing offscreen audio:", e));
}

function pauseAudio() {
  if (audio) {
    audio.pause();
    sendAudioState();
  }
}

function setVolume(volume) {
  if (audio) {
    audio.volume = volume;
  }
}

function setStation(url) {
  if (audio) {
    const isPlaying = !audio.paused;
    audio.src = url;
    audio.playbackRate = currentPlaybackRate;
    audio.loop = isLooping;
    if (isPlaying) {
      audio.play()
        .then(() => sendAudioState())
        .catch(e => {
          console.error("Error playing offscreen audio on station change:", e.name, e.message, "URL:", url);
        });
    } else {
      sendAudioState();
    }
  }
}

function setPlaybackRate(rate) {
  if (audio) {
    audio.playbackRate = rate;
  }
}

function setLoop(loop) {
  if (audio) {
    audio.loop = loop;
  }
}

function seek(percentage) {
  if (audio && audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
    audio.currentTime = (percentage / 100) * audio.duration;
    sendAudioState();
  }
}
