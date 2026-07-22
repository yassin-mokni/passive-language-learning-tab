let isRadioPlaying = false;
let currentStation = 'dlf_nova';
let currentVolume = 0.5;
let currentPlaybackRate = 1.0;
let isLooping = false;
let currentPlaybackTime = 0;
let currentDuration = 0;

const radioStations = {
  dlf_nova: 'https://st03.sslstream.dlf.de/dlf/03/128/mp3/stream.mp3',
  dlf_kultur: 'https://st02.sslstream.dlf.de/dlf/02/128/mp3/stream.mp3',
  dlf: 'https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3',
  wdr5: 'https://wdr-wdr5-live.icecastssl.wdr.de/wdr/wdr5/live/mp3/128/stream.mp3',
  br24: 'https://dispatcher.rndfnk.com/br/br24/live/mp3/mid',
  ndr_info: 'https://icecast.ndr.de/ndr/ndrinfo/hamburg/mp3/128/stream.mp3',
  ser: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3',
  los40: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40.mp3',
  dial: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CADENADIAL.mp3',
  los40_classic: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CLASSIC.mp3',
  radiole: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOLE.mp3',
  dialogue_level_0: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_level_0.mp3',
  dialogue_level_1: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_level_1.mp3',
  dialogue_level_2: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_level_2.mp3',
  dialogue_level_3: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_level_3.mp3',
  dialogue_level_4: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_level_4.mp3',
  dialogue_level_5: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_level_5.mp3',
  dialogue_level_6: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_level_6.mp3',
  dialogue_level_7: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_level_7.mp3',
  dialogue_sit_0: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_sit_0.mp3',
  dialogue_sit_1: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_sit_1.mp3',
  dialogue_sit_2: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_sit_2.mp3',
  dialogue_sit_3: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_sit_3.mp3',
  dialogue_sit_4: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_sit_4.mp3',
  dialogue_sit_5: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_sit_5.mp3',
  dialogue_sit_6: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_sit_6.mp3',
  dialogue_sit_7: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_sit_7.mp3',
  dialogue_sit_8: 'https://raw.githubusercontent.com/yassin-mokni/passive-language-learning-tab/main/audio/dialogue_sit_8.mp3'
};

// Load initial states from storage if they exist
chrome.storage.local.get(['radioStation', 'radioVolume', 'isRadioPlaying', 'radioPlaybackRate', 'radioLooping'], async (result) => {
  if (result.radioStation) currentStation = result.radioStation;
  if (result.radioVolume !== undefined) currentVolume = parseFloat(result.radioVolume);
  if (result.radioPlaybackRate !== undefined) currentPlaybackRate = parseFloat(result.radioPlaybackRate);
  if (result.radioLooping !== undefined) isLooping = !!result.radioLooping;
  
  // Since Manifest V3 service workers terminate when idle, we verify
  // if the offscreen document is actually running to restore play state.
  const hasDoc = await chrome.offscreen.hasDocument();
  if (hasDoc) {
    isRadioPlaying = result.isRadioPlaying || false;
  } else {
    isRadioPlaying = false;
    chrome.storage.local.set({ isRadioPlaying: false });
  }
});

async function createOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Play German radio stations in the background'
  });
}

async function closeOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) {
    await chrome.offscreen.closeDocument();
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'audioState') {
    currentPlaybackTime = message.currentTime;
    currentDuration = message.duration;
    isRadioPlaying = !message.paused;
    chrome.storage.local.set({ isRadioPlaying });
  }

  if (message.target === 'background') {
    handleMessage(message, sendResponse);
    return true; // Keep sendResponse channel open for async operations
  }
});

function getStationUrl(stationId) {
  const url = radioStations[stationId];
  if (url && !url.startsWith('http')) {
    return chrome.runtime.getURL(url);
  }
  return url;
}

async function handleMessage(message, sendResponse) {
  switch (message.type) {
    case 'play':
      currentStation = message.station;
      currentVolume = message.volume;
      isRadioPlaying = true;
      chrome.storage.local.set({ isRadioPlaying: true });
      try {
        await createOffscreenDocument();
        // Send play command to offscreen
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'play',
          url: getStationUrl(currentStation),
          volume: currentVolume,
          playbackRate: currentPlaybackRate,
          loop: isLooping
        });
        sendResponse({ success: true });
      } catch (error) {
        console.error("Failed to create offscreen document:", error);
        isRadioPlaying = false;
        chrome.storage.local.set({ isRadioPlaying: false });
        sendResponse({ success: false, error: error.message });
      }
      break;

    case 'pause':
      isRadioPlaying = false;
      chrome.storage.local.set({ isRadioPlaying: false });
      try {
        // Send pause command first to stop audio immediately
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'pause'
        });
        // Then close the offscreen document to free memory
        await closeOffscreenDocument();
        sendResponse({ success: true });
      } catch (error) {
        console.error("Failed to close offscreen document:", error);
        sendResponse({ success: false, error: error.message });
      }
      break;

    case 'setVolume':
      currentVolume = message.volume;
      if (await chrome.offscreen.hasDocument()) {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'setVolume',
          volume: currentVolume
        });
      }
      sendResponse({ success: true });
      break;

    case 'setStation':
      currentStation = message.station;
      if (await chrome.offscreen.hasDocument()) {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'setStation',
          url: getStationUrl(currentStation),
          playbackRate: currentPlaybackRate,
          loop: isLooping
        });
      }
      sendResponse({ success: true });
      break;

    case 'setPlaybackRate':
      currentPlaybackRate = message.playbackRate;
      chrome.storage.local.set({ radioPlaybackRate: currentPlaybackRate });
      if (await chrome.offscreen.hasDocument()) {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'setPlaybackRate',
          playbackRate: currentPlaybackRate
        });
      }
      sendResponse({ success: true });
      break;

    case 'setLoop':
      isLooping = message.loop;
      chrome.storage.local.set({ radioLooping: isLooping });
      if (await chrome.offscreen.hasDocument()) {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'setLoop',
          loop: isLooping
        });
      }
      sendResponse({ success: true });
      break;

    case 'seek':
      if (await chrome.offscreen.hasDocument()) {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'seek',
          percentage: message.percentage
        });
      }
      sendResponse({ success: true });
      break;

    case 'getState':
      sendResponse({
        isRadioPlaying,
        currentStation,
        currentVolume,
        currentPlaybackRate,
        isLooping,
        currentPlaybackTime,
        currentDuration
      });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
}
