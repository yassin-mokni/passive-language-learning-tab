let audio = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  switch (message.type) {
    case 'play':
      playAudio(message.url, message.volume);
      break;
    case 'pause':
      pauseAudio();
      break;
    case 'setVolume':
      setVolume(message.volume);
      break;
    case 'setStation':
      setStation(message.url);
      break;
  }
});

function playAudio(url, volume) {
  if (!audio) {
    audio = new Audio(url);
  } else if (audio.src !== url) {
    audio.src = url;
  }
  audio.volume = volume;
  audio.play().catch(e => console.error("Error playing offscreen audio:", e));
}

function pauseAudio() {
  if (audio) {
    audio.pause();
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
    if (isPlaying) {
      audio.play().catch(e => {
        console.error("Error playing offscreen audio on station change:", e.name, e.message, "URL:", url);
      });
    }
  }
}
