let currentLang = 'de';
let isRadioPlaying = false;
let activeRadioStation = 'dlf_nova';
let activePlaybackRate = 1.0;
let activeLoopState = false;
const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5];
let lastDuration = 0;
let isUserDraggingProgress = false;
let isAudioSeeking = false;
let seekTimeout = null;

const radioStationsConfig = {
  de: [
    { category: 'radio', title: 'Live Radio (Learners)', stations: [{ id: 'dlf_nova', name: 'Deutschlandfunk Nova' }, { id: 'dlf_kultur', name: 'Deutschlandfunk Kultur' }] },
    { category: 'radio', title: 'Live Radio (Advanced)', stations: [{ id: 'dlf', name: 'Deutschlandfunk' }, { id: 'wdr5', name: 'WDR 5' }, { id: 'br24', name: 'BR24' }, { id: 'ndr_info', name: 'NDR Info' }] }
  ],
  es: [
    { category: 'radio', title: 'Radio en Vivo (Noticias y Debate)', stations: [{ id: 'ser', name: 'Cadena SER (Noticias y Debate)' }, { id: 'los40', name: 'LOS40 España (Música y Cultura)' }] },
    { category: 'radio', title: 'Radio en Vivo (Variedad y Cultura)', stations: [{ id: 'dial', name: 'Cadena Dial (Música en Español)' }, { id: 'los40_classic', name: 'LOS40 Classic (Grandes Éxitos)' }, { id: 'radiole', name: 'Radiolé (Cultura y Música)' }] }
  ],
  fr: [
    { category: 'radio', title: 'Radio en Direct (Actualités et Culture)', stations: [{ id: 'france_inter', name: 'France Inter' }, { id: 'france_info', name: 'France Info (24/7 News)' }, { id: 'france_culture', name: 'France Culture' }] },
    { category: 'radio', title: 'Musique et Divertissement', stations: [{ id: 'fip', name: 'FIP (Music)' }, { id: 'mouv', name: 'Mouv\' (Youth/Urban)' }] }
  ],
  ar: [
    { category: 'radio', title: 'راديو مباشر (Live Radio)', stations: [{ id: 'replay_news_ar', name: '24/7 News (MSA / Fusha)' }, { id: 'mc_doualiya', name: 'Monte Carlo Doualiya' }] }
  ],
  ja: [
    { category: 'radio', title: '日本のラジオ (Live Radio)', stations: [{ id: 'japan_city_pop', name: 'Japan City Pop' }, { id: 'jpop_project', name: 'J-Pop Project Radio' }] }
  ],
  tr: [
    { category: 'radio', title: 'Canlı Radyo (Türkçe Müzik & Yayın)', stations: [{ id: 'radyo_fenomen_turk', name: 'Radyo Fenomen Türk' }, { id: 'super_fm', name: 'Süper FM' }, { id: 'virgin_radio_tr', name: 'Virgin Radio Türkiye' }] },
    { category: 'radio', title: 'Canlı Radyo (Popüler & Dünya Müzikleri)', stations: [{ id: 'radyo_fenomen', name: 'Radyo Fenomen' }, { id: 'metro_fm', name: 'Metro FM' }, { id: 'joy_fm', name: 'Joy FM' }] }
  ],
  zh: [
    { category: 'radio', title: '中文电台 (Mandarin Music & Talk)', stations: [{ id: 'yes_933_mandarin', name: 'YES 933 (Mandarin Pop)' }, { id: 'eight_fm_mandarin', name: 'Eight FM (Music & Culture)' }, { id: 'shanghai_classics', name: 'Shanghai Radio (Classics)' }] },
    { category: 'radio', title: '新闻与文化 (News & Culture)', stations: [{ id: 'kunming_radio', name: 'Kunming Radio' }, { id: 'cityplus_fm', name: 'CITYPlus FM (Business)' }] }
  ],
  it: [
    { category: 'radio', title: 'Radio in Diretta (Musica & Intrattenimento)', stations: [{ id: 'radio_105', name: 'Radio 105 Network' }, { id: 'rtl_1025', name: 'RTL 102.5' }, { id: 'r101', name: 'R101 Italia' }] },
    { category: 'radio', title: 'Notizie & Cultura (News & Talk)', stations: [{ id: 'rai_radio2', name: 'Rai Radio 2' }, { id: 'radio_armisa', name: 'Radio Armisa Italia' }, { id: 'classic_hits_it', name: 'Classic Hits Italia' }] }
  ],
  pt: [
    { category: 'radio', title: 'Rádio em Direto (Música & Hits)', stations: [{ id: 'comercial_pt', name: 'Rádio Comercial' }, { id: 'cidade_fm', name: 'Cidade FM (Pop & Hits)' }, { id: 'antena_3_rtp', name: 'RTP Antena 3' }] },
    { category: 'radio', title: 'Notícias & Cultura (News & Variety)', stations: [{ id: 'antena_1_rtp', name: 'RTP Antena 1 (Notícias)' }, { id: 'm80_portugal', name: 'M80 Portugal' }, { id: 'smooth_fm', name: 'Smooth FM' }] }
  ]
};

const dialogueYoutubeUrls = {
  dialogue_level_0: 'https://www.youtube.com/watch?v=gDg7rMJ9Odg',
  dialogue_level_1: 'https://www.youtube.com/watch?v=6fnaS_gx66M',
  dialogue_level_2: 'https://www.youtube.com/watch?v=3rlnjRDj9Uo',
  dialogue_level_3: 'https://www.youtube.com/watch?v=c3qLm_QBtrM',
  dialogue_level_4: 'https://www.youtube.com/watch?v=7fQj-FNWETI',
  dialogue_level_5: 'https://www.youtube.com/watch?v=CAkXqhg__VQ',
  dialogue_level_6: 'https://www.youtube.com/watch?v=97qiPCMddY0',
  dialogue_level_7: 'https://www.youtube.com/watch?v=WBsOY6BDojs',
  dialogue_sit_0: 'https://www.youtube.com/watch?v=bi4NwEAzpY0',
  dialogue_sit_1: 'https://www.youtube.com/watch?v=90Bp-ILdhyE',
  dialogue_sit_2: 'https://www.youtube.com/watch?v=8BPjB7GqifQ',
  dialogue_sit_3: 'https://www.youtube.com/watch?v=eJEbC-8c3l4',
  dialogue_sit_4: 'https://www.youtube.com/watch?v=Ldg5jyj1o9o',
  dialogue_sit_5: 'https://www.youtube.com/watch?v=Sw_VojjXSew',
  dialogue_sit_6: 'https://www.youtube.com/watch?v=xgO8ht_7Rjo',
  dialogue_sit_7: 'https://www.youtube.com/watch?v=U67SAF0EAsw',
  dialogue_sit_8: 'https://www.youtube.com/watch?v=g2VKafYjUrw'
};

document.addEventListener('DOMContentLoaded', () => {
  // Sync dark mode style from new tab preference
  chrome.storage.local.get(['targetLang', 'darkMode'], (result) => {
    if (result.targetLang) {
      currentLang = result.targetLang;
    }
    if (result.darkMode) {
      document.body.classList.add('dark-mode');
    }
    initRadio();
  });
});

function initRadio() {
  document.getElementById('radioPlayBtn').addEventListener('click', toggleRadioPlay);
  document.getElementById('radioPrevBtn').addEventListener('click', () => switchRadioStation(-1));
  document.getElementById('radioNextBtn').addEventListener('click', () => switchRadioStation(1));
  document.getElementById('radioLoopBtn').addEventListener('click', toggleRadioLoop);
  
  const volumeIconBtn = document.getElementById('volumeIconBtn');
  const volumeSliderContainer = document.querySelector('.volume-slider-container');
  if (volumeIconBtn && volumeSliderContainer) {
    volumeIconBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      volumeSliderContainer.classList.toggle('show');
      const speedListContainer = document.querySelector('.speed-list-container');
      if (speedListContainer) speedListContainer.classList.remove('show');
    });
  }

  const speedBtn = document.getElementById('radioSpeedBtn');
  const speedListContainer = document.querySelector('.speed-list-container');
  if (speedBtn && speedListContainer) {
    speedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speedListContainer.classList.toggle('show');
      if (volumeSliderContainer) volumeSliderContainer.classList.remove('show');
    });
  }

  document.querySelectorAll('.speed-option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const speed = parseFloat(e.target.dataset.speed);
      setPlaybackSpeed(speed);
      if (speedListContainer) speedListContainer.classList.remove('show');
    });
  });

  document.addEventListener('click', (e) => {
    const insideVolume = e.target.closest('.volume-control-hover');
    const insideSpeed = e.target.closest('.speed-control-hover');
    if (!insideVolume && volumeSliderContainer) volumeSliderContainer.classList.remove('show');
    if (!insideSpeed && speedListContainer) speedListContainer.classList.remove('show');
  });

  renderRadioTrackListUI();

  document.querySelectorAll('.audio-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const selectedTab = e.target.dataset.tab;
      switchAudioTab(selectedTab);
    });
  });

  document.getElementById('radioVolume').addEventListener('input', changeRadioVolume);

  const progressBar = document.getElementById('progressBar');
  progressBar.addEventListener('input', (e) => {
    isUserDraggingProgress = true;
    if (seekTimeout) {
      clearTimeout(seekTimeout);
      seekTimeout = null;
    }
    if (lastDuration) {
      const targetTime = (parseFloat(e.target.value) / 100) * lastDuration;
      document.getElementById('currentTimeLabel').textContent = formatTime(targetTime);
    }
  });
  
  progressBar.addEventListener('change', (e) => {
    const percentage = parseFloat(e.target.value);
    isUserDraggingProgress = true;
    if (seekTimeout) clearTimeout(seekTimeout);
    seekTimeout = setTimeout(() => {
      isUserDraggingProgress = false;
    }, 800);

    chrome.runtime.sendMessage({
      target: 'background',
      type: 'seek',
      percentage: percentage
    });
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.target === 'newtab' || message.target === 'popup') {
      if (message.type === 'audioState') {
        isAudioSeeking = !!message.seeking;
        isRadioPlaying = !message.paused;
        updateRadioUI(isRadioPlaying, message.loading);
        updatePlaybackProgress(message.currentTime, message.duration, message.paused);
      }
    }
  });
  
  chrome.runtime.sendMessage({ target: 'background', type: 'getState' }, (response) => {
    if (response) {
      if (response.currentStation) {
        activeRadioStation = response.currentStation;
        setActiveTrack(activeRadioStation);
      }
      if (response.currentVolume !== undefined) {
        document.getElementById('radioVolume').value = response.currentVolume;
      }
      if (response.currentPlaybackRate !== undefined) {
        activePlaybackRate = parseFloat(response.currentPlaybackRate);
        updatePlaybackSpeedUI(activePlaybackRate);
      }
      if (response.isLooping !== undefined) {
        activeLoopState = !!response.isLooping;
        updateLoopUI(activeLoopState);
      }
      if (response.currentPlaybackTime !== undefined && response.currentDuration !== undefined) {
        updatePlaybackProgress(response.currentPlaybackTime, response.currentDuration, !response.isRadioPlaying);
      }
      isRadioPlaying = response.isRadioPlaying;
      updateRadioUI(isRadioPlaying);
    }
  });
}

function updateAudioTabsVisibility() {
  const isGerman = currentLang === 'de';
  const audioTabsContainer = document.getElementById('audioTabs');
  if (audioTabsContainer) {
    audioTabsContainer.style.display = isGerman ? 'flex' : 'none';
  }

  const activeTabBtn = document.querySelector('.audio-tab.active');
  if (!isGerman && activeTabBtn && (activeTabBtn.dataset.tab === 'levels' || activeTabBtn.dataset.tab === 'situations')) {
    switchAudioTab('radio');
  }
}

function renderRadioTrackListUI() {
  updateAudioTabsVisibility();
  const container = document.getElementById('radioCategoryContainer');
  if (!container) return;

  const currentTabBtn = document.querySelector('.audio-tab.active');
  const activeTab = currentTabBtn ? currentTabBtn.dataset.tab : 'radio';

  const configs = radioStationsConfig[currentLang] || radioStationsConfig.de;
  let html = '';

  configs.forEach(group => {
    const isHidden = activeTab !== 'radio';
    html += `<div class="audio-category ${isHidden ? 'hidden' : ''}" data-category="radio">
      <div class="audio-category-title">${group.title}</div>`;
    group.stations.forEach(st => {
      html += `<button class="audio-track-btn" data-station="${st.id}">${st.name}</button>`;
    });
    html += `</div>`;
  });

  container.innerHTML = html;
  attachAudioTrackListeners();

  const validStations = configs.flatMap(g => g.stations.map(s => s.id));
  if (!validStations.includes(activeRadioStation) && !activeRadioStation.startsWith('dialogue_')) {
    activeRadioStation = validStations[0] || (currentLang === 'es' ? 'ser' : 'dlf_nova');
  }
  setActiveTrack(activeRadioStation);
}

function handleAudioTrackClick(e) {
  const station = e.currentTarget.dataset.station;
  changeRadioStation(station);
}

function attachAudioTrackListeners() {
  document.querySelectorAll('.audio-track-btn').forEach(btn => {
    btn.removeEventListener('click', handleAudioTrackClick);
    btn.addEventListener('click', handleAudioTrackClick);
  });
}

function switchAudioTab(tabId) {
  document.querySelectorAll('.audio-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });
  
  document.querySelectorAll('.audio-category').forEach(cat => {
    cat.classList.toggle('hidden', cat.dataset.category !== tabId);
  });
}

function toggleRadioPlay() {
  const btn = document.getElementById('radioPlayBtn');
  btn.style.transform = 'scale(0.9)';
  setTimeout(() => btn.style.transform = '', 100);

  updateRadioUI(!isRadioPlaying, true);

  if (isRadioPlaying) {
    chrome.runtime.sendMessage({ target: 'background', type: 'pause' }, (response) => {
      if (response && response.success) {
        isRadioPlaying = false;
        updateRadioUI(false);
      }
    });
  } else {
    chrome.runtime.sendMessage({ 
      target: 'background', 
      type: 'play',
      station: activeRadioStation,
      volume: document.getElementById('radioVolume').value
    }, (response) => {
      if (response && response.success) {
        isRadioPlaying = true;
      } else {
        updateRadioUI(false);
      }
    });
  }
}

function changeRadioStation(station) {
  if (activeRadioStation === station && isRadioPlaying) {
    toggleRadioPlay();
    return;
  }
  
  activeRadioStation = station;
  setActiveTrack(station);
  updateRadioUI(true, true);

  chrome.runtime.sendMessage({
    target: 'background',
    type: 'setStation',
    station: activeRadioStation
  }, () => {
    isRadioPlaying = true;
    if (activeRadioStation.startsWith('dialogue_')) {
      chrome.runtime.sendMessage({ target: 'background', type: 'seek', percentage: 0 });
    }
  });
}

function switchRadioStation(direction) {
  const allTracks = Array.from(document.querySelectorAll('.audio-track-btn'));
  const currentIndex = allTracks.findIndex(btn => btn.dataset.station === activeRadioStation);
  
  if (currentIndex === -1) return;
  
  let nextIndex = currentIndex + direction;
  if (nextIndex >= allTracks.length) nextIndex = 0;
  if (nextIndex < 0) nextIndex = allTracks.length - 1;
  
  const nextStation = allTracks[nextIndex].dataset.station;
  
  // Ensure we switch to the correct tab if crossing boundaries
  const nextTrackElement = allTracks[nextIndex];
  const nextCategory = nextTrackElement.closest('.audio-category').dataset.category;
  const activeTabBtn = document.querySelector('.audio-tab.active');
  if (activeTabBtn && activeTabBtn.dataset.tab !== nextCategory) {
    switchAudioTab(nextCategory);
  }
  
  changeRadioStation(nextStation);
}

function setActiveTrack(station) {
  document.querySelectorAll('.audio-track-btn').forEach(btn => {
    if (btn.dataset.station === station) {
      btn.classList.add('active');
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      const trackName = btn.textContent;
      document.getElementById('nowPlayingTitle').textContent = trackName;
      chrome.runtime.sendMessage({ target: 'background', type: 'setTrackName', trackName: trackName });
      
      const creditLink = document.getElementById('nowPlayingCredit');
      const youtubeUrl = dialogueYoutubeUrls[station];
      
      if (youtubeUrl) {
        creditLink.href = youtubeUrl;
        creditLink.classList.remove('hidden');
      } else {
        creditLink.classList.add('hidden');
      }

      if (station.startsWith('dialogue_')) {
        document.getElementById('nowPlayingContainer').classList.remove('hidden');
        document.getElementById('timeDisplayPill').classList.remove('hidden');
        document.getElementById('radioLoopBtn').style.display = '';
      } else {
        document.getElementById('nowPlayingContainer').classList.add('hidden');
        document.getElementById('timeDisplayPill').classList.add('hidden');
        document.getElementById('radioLoopBtn').style.display = 'none';
      }
    } else {
      btn.classList.remove('active');
    }
  });
}

function changeRadioVolume(e) {
  const volume = e.target.value;
  chrome.storage.local.set({ radioVolume: volume });
  chrome.runtime.sendMessage({
    target: 'background',
    type: 'setVolume',
    volume: parseFloat(volume)
  });
}

function setPlaybackSpeed(speed) {
  activePlaybackRate = speed;
  updatePlaybackSpeedUI(speed);
  chrome.runtime.sendMessage({
    target: 'background',
    type: 'setPlaybackRate',
    playbackRate: speed
  });
}

function updatePlaybackSpeedUI(speed) {
  const speedBtn = document.getElementById('radioSpeedBtn');
  if (speedBtn) {
    speedBtn.textContent = speed.toFixed(2).replace(/\.?0+$/, '') + 'x';
  }
  document.querySelectorAll('.speed-option-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
  });
}

function toggleRadioLoop() {
  activeLoopState = !activeLoopState;
  updateLoopUI(activeLoopState);
  chrome.runtime.sendMessage({
    target: 'background',
    type: 'setLoop',
    loop: activeLoopState
  });
}

function updateLoopUI(isLooping) {
  const loopBtn = document.getElementById('radioLoopBtn');
  if (loopBtn) {
    loopBtn.classList.toggle('active', isLooping);
  }
}

function updateRadioUI(isPlaying, isLoading = false) {
  const animation = document.getElementById('radioAnimation');
  const playIcon = document.querySelector('.play-icon');
  const pauseIcon = document.querySelector('.pause-icon');
  const spinner = document.querySelector('.loading-spinner');

  if (isLoading) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.add('hidden');
    spinner.classList.remove('hidden');
    if (animation) animation.classList.remove('active');
  } else if (isPlaying) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    spinner.classList.add('hidden');
    if (animation) animation.classList.add('active');
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    spinner.classList.add('hidden');
    if (animation) animation.classList.remove('active');
  }
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function updatePlaybackProgress(currentTime, duration, isPaused) {
  if (isUserDraggingProgress || isAudioSeeking) return;

  const progressBar = document.getElementById('progressBar');
  const currentTimeLabel = document.getElementById('currentTimeLabel');
  const durationLabel = document.getElementById('durationLabel');
  
  if (duration && isFinite(duration)) {
    lastDuration = duration;
    durationLabel.textContent = formatTime(duration);
    
    if (currentTime !== undefined) {
      const percentage = (currentTime / duration) * 100;
      progressBar.value = percentage;
      progressBar.style.background = `linear-gradient(to right, #666 ${percentage}%, #e2e2e2 ${percentage}%)`;
      currentTimeLabel.textContent = formatTime(currentTime);
    }
  } else {
    progressBar.value = 0;
    progressBar.style.background = '#e2e2e2';
  }
}
