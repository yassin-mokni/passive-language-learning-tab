let phrases = {};
let currentLevel = 'A1';
let currentTopic = 'all';
let currentPhrase = null;
let isRadioPlaying = false;
let activeRadioStation = 'dlf_nova';
let activePlaybackRate = 1.0;
let activeLoopState = false;
const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5];
let lastDuration = 0;
let isUserDraggingProgress = false;
let isAudioSeeking = false;
let seekTimeout = null;

let quickLinks = [];
const DEFAULT_QUICK_LINKS = [
  { id: '2', name: 'YouTube', url: 'https://youtube.com' },
  { id: '3', name: 'GitHub', url: 'https://github.com' },
  { id: '4', name: 'ChatGPT', url: 'https://chatgpt.com' }
];

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

// Load phrases from JSON
fetch('phrases.json')
  .then(response => response.json())
  .then(data => {
    phrases = data;
    init();
  });

function init() {
  // Initialize favorite button state
  document.getElementById('favoriteBtn').classList.remove('favorited');
  
  // Load saved level and topic
  chrome.storage.local.get(['selectedLevel', 'selectedTopic'], (result) => {
    if (result.selectedLevel) {
      currentLevel = result.selectedLevel;
      updateActiveLevel();
    }
    if (result.selectedTopic) {
      currentTopic = result.selectedTopic;
      document.getElementById('topicSelect').value = currentTopic;
    }
    
    // Initialize level visibility based on topic
    if (currentTopic === 'slang') {
      hideLevelsExcept('A0');
      if (currentLevel !== 'A0') {
        currentLevel = 'A0';
        chrome.storage.local.set({ selectedLevel: currentLevel });
        updateActiveLevel();
      }
    } else {
      hideLevelsExcept('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
      if (currentLevel === 'A0') {
        currentLevel = 'A1';
        chrome.storage.local.set({ selectedLevel: currentLevel });
        updateActiveLevel();
      }
    }
    
    displayRandomPhrase();
  });

  // Level button listeners
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLevel = btn.dataset.level;
      chrome.storage.local.set({ selectedLevel: currentLevel });
      updateActiveLevel();
      displayRandomPhrase();
    });
  });
  
  // Topic dropdown listener
  document.getElementById('topicSelect').addEventListener('change', (e) => {
    currentTopic = e.target.value;
    chrome.storage.local.set({ selectedTopic: currentTopic });
    
    // Handle slang topic - show only A0
    if (currentTopic === 'slang') {
      currentLevel = 'A0';
      chrome.storage.local.set({ selectedLevel: currentLevel });
      updateActiveLevel();
      hideLevelsExcept('A0');
    } else {
      // Non-slang topic - hide A0, show others
      if (currentLevel === 'A0') {
        currentLevel = 'A1';
        chrome.storage.local.set({ selectedLevel: currentLevel });
        updateActiveLevel();
      }
      hideLevelsExcept('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
    }
    
    displayRandomPhrase();
  });

  // Control button listeners
  document.getElementById('nextBtn').addEventListener('click', displayRandomPhrase);
  document.getElementById('favoriteBtn').addEventListener('click', toggleFavorite);
  
  // Audio button listener
  document.getElementById('audioBtn').addEventListener('click', playPronunciation);
  
  // Translation toggle listener
  document.getElementById('translationToggle').addEventListener('click', toggleTranslation);
  
  // Dark mode toggle listener
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
  
  // Load translation preference
  chrome.storage.local.get(['showTranslation', 'darkMode'], (result) => {
    const showTranslation = result.showTranslation !== false;
    updateTranslationVisibility(showTranslation);
    
    const darkMode = result.darkMode || false;
    updateDarkMode(darkMode);
  });
  
  // Favorites popover listeners
  document.getElementById('favoritesBtn').addEventListener('click', toggleFavoritesPopover);
  document.getElementById('exportBtn').addEventListener('click', exportFavorites);
  
  // Shortcuts help listeners
  document.getElementById('shortcutsBtn').addEventListener('click', toggleShortcutsModal);
  document.getElementById('shortcutsModal').addEventListener('click', (e) => {
    if (e.target.id === 'shortcutsModal') {
      toggleShortcutsModal();
    }
  });
  
  // Radio listeners
  document.getElementById('radioBtn').addEventListener('click', toggleRadioPopover);
  document.getElementById('radioPlayBtn').addEventListener('click', toggleRadioPlay);
  document.getElementById('radioPrevBtn').addEventListener('click', () => switchRadioStation(-1));
  document.getElementById('radioNextBtn').addEventListener('click', () => switchRadioStation(1));
  document.getElementById('radioLoopBtn').addEventListener('click', toggleRadioLoop);
  // Click-to-toggle volume popover
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

  // Click-to-toggle speed popover
  const speedBtn = document.getElementById('radioSpeedBtn');
  const speedListContainer = document.querySelector('.speed-list-container');
  if (speedBtn && speedListContainer) {
    speedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speedListContainer.classList.toggle('show');
      if (volumeSliderContainer) volumeSliderContainer.classList.remove('show');
    });
  }

  // Click-to-select speed option
  document.querySelectorAll('.speed-option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const speed = parseFloat(e.target.dataset.speed);
      setPlaybackSpeed(speed);
      if (speedListContainer) speedListContainer.classList.remove('show');
    });
  });

  // Close popovers on click outside
  document.addEventListener('click', (e) => {
    const insideVolume = e.target.closest('.volume-control-hover');
    const insideSpeed = e.target.closest('.speed-control-hover');
    
    if (!insideVolume && volumeSliderContainer) {
      volumeSliderContainer.classList.remove('show');
    }
    if (!insideSpeed && speedListContainer) {
      speedListContainer.classList.remove('show');
    }
  });
  
  document.querySelectorAll('.audio-track-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const station = e.target.dataset.station;
      changeRadioStation(station);
    });
  });

  // Tab switching listeners
  document.querySelectorAll('.audio-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const selectedTab = e.target.dataset.tab;
      switchAudioTab(selectedTab);
    });
  });

  document.getElementById('radioVolume').addEventListener('input', changeRadioVolume);

  // Progress bar scrubbing listeners
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
    
    // Lock updates for 800ms to allow audio element to finish seeking
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

  // Receive audio state updates from offscreen document
  chrome.runtime.onMessage.addListener((message) => {
    if (message.target === 'newtab' && message.type === 'audioState') {
      isAudioSeeking = !!message.seeking;
      updatePlaybackProgress(message.currentTime, message.duration, message.paused);
    }
  });
  
  // Load radio preferences and sync state with background
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
  
  // Close popover when clicking outside
  document.addEventListener('click', (e) => {
    const favPopover = document.getElementById('favoritesPopover');
    const favTrigger = document.getElementById('favoritesBtn');
    if (!favPopover.contains(e.target) && !favTrigger.contains(e.target)) {
      favPopover.classList.remove('active');
    }

    const radioPopover = document.getElementById('radioPopover');
    const radioTrigger = document.getElementById('radioBtn');
    if (!radioPopover.contains(e.target) && !radioTrigger.contains(e.target)) {
      radioPopover.classList.remove('active');
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Close modals with Escape
    if (e.key === 'Escape') {
      const modal = document.getElementById('shortcutsModal');
      if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        return;
      }
    }
    
    // Ignore if a modifier key (Cmd, Ctrl, Alt) is pressed
    if (e.metaKey || e.ctrlKey || e.altKey) {
      return;
    }

    // Ignore if user is typing in an input/select
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    switch(e.key.toLowerCase()) {
      case ' ':
      case 'spacebar':
        e.preventDefault();
        displayRandomPhrase();
        break;
      case 'f':
        e.preventDefault();
        toggleFavorite();
        break;
      case 'a':
        e.preventDefault();
        playPronunciation();
        break;
      case 't':
        e.preventDefault();
        toggleTranslation();
        break;
      case 'r':
        e.preventDefault();
        toggleRadioPlay();
        break;
      case 'arrowleft':
        e.preventDefault();
        switchRadioStation(-1);
        break;
      case 'arrowright':
        e.preventDefault();
        switchRadioStation(1);
        break;
      case '?':
        e.preventDefault();
        toggleShortcutsModal();
        break;
    }
  });

  // Quick Links initialization
  initQuickLinks();
}

function updateActiveLevel() {
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === currentLevel);
  });
}

function hideLevelsExcept(...levelsToShow) {
  document.querySelectorAll('.level-btn').forEach(btn => {
    if (levelsToShow.includes(btn.dataset.level)) {
      btn.style.display = '';
    } else {
      btn.style.display = 'none';
    }
  });
}

function displayRandomPhrase() {
  let levelPhrases = phrases[currentLevel];
  
  // Filter by topic if not "all"
  if (currentTopic !== 'all') {
    levelPhrases = levelPhrases.filter(phrase => phrase.tags && phrase.tags.includes(currentTopic));
  }
  
  // If no phrases match the filter, show message
  if (levelPhrases.length === 0) {
    document.getElementById('germanPhrase').textContent = 'No phrases available';
    document.getElementById('englishTranslation').textContent = 'Try a different topic or level';
    return;
  }
  
  chrome.storage.local.get(['shownPhrases', 'favorites'], (result) => {
    let shownPhrases = result.shownPhrases || {};
    let shownKey = `${currentLevel}_${currentTopic}`;
    let shown = shownPhrases[shownKey] || [];
    
    // Get indices of filtered phrases in original array
    const originalIndices = levelPhrases.map(phrase => 
      phrases[currentLevel].findIndex(p => p.german === phrase.german)
    );
    
    // Reset if all phrases shown
    if (shown.length >= originalIndices.length) {
      shown = [];
    }
    
    // Get unshown phrases
    const unshownIndices = originalIndices.filter(idx => !shown.includes(idx));
    const randomOriginalIndex = unshownIndices[Math.floor(Math.random() * unshownIndices.length)];
    
    currentPhrase = { 
      ...phrases[currentLevel][randomOriginalIndex], 
      index: randomOriginalIndex,
      level: currentLevel 
    };
    
    // Mark as shown
    shown.push(randomOriginalIndex);
    shownPhrases[shownKey] = shown;
    chrome.storage.local.set({ shownPhrases });
    
    // Display phrase
    document.getElementById('germanPhrase').textContent = currentPhrase.german;
    document.getElementById('englishTranslation').textContent = currentPhrase.english;
    
    // Update favorite button
    updateFavoriteButton(result.favorites || {});
  });
}

function toggleFavorite() {
  if (!currentPhrase) return;
  
  const phraseLevel = currentPhrase.level || currentLevel;
  
  chrome.storage.local.get(['favorites'], (result) => {
    let favorites = result.favorites || {};
    if (!favorites[phraseLevel]) favorites[phraseLevel] = [];
    
    const index = currentPhrase.index;
    const favIndex = favorites[phraseLevel].indexOf(index);
    
    if (favIndex > -1) {
      favorites[phraseLevel].splice(favIndex, 1);
    } else {
      favorites[phraseLevel].push(index);
    }
    
    chrome.storage.local.set({ favorites });
    updateFavoriteButton(favorites);
  });
}

function updateFavoriteButton(favorites) {
  if (!currentPhrase) return;
  const btn = document.getElementById('favoriteBtn');
  const phraseLevel = currentPhrase.level || currentLevel;
  const isFavorited = favorites[phraseLevel]?.includes(currentPhrase.index) || false;
  btn.classList.toggle('favorited', isFavorited);
}

function toggleFavoritesPopover() {
  const popover = document.getElementById('favoritesPopover');
  popover.classList.toggle('active');
  
  if (popover.classList.contains('active')) {
    loadFavorites();
  }
}

function loadFavorites() {
  chrome.storage.local.get(['favorites'], (result) => {
    const favorites = result.favorites || {};
    const content = document.getElementById('favoritesContent');
    
    // Check if any favorites exist
    const hasFavorites = Object.values(favorites).some(arr => arr.length > 0);
    
    if (!hasFavorites) {
      content.innerHTML = '<div class="favorites-empty">No favorites yet</div>';
      return;
    }
    
    // Build favorites list grouped by level
    let html = '';
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach(level => {
      const levelFavorites = favorites[level] || [];
      if (levelFavorites.length > 0) {
        html += `<div class="favorite-level-group">`;
        html += `<div class="favorite-level-title">${level}</div>`;
        levelFavorites.forEach(index => {
          const phrase = phrases[level][index];
          html += `<div class="favorite-item" data-level="${level}" data-index="${index}">${phrase.german}</div>`;
        });
        html += `</div>`;
      }
    });
    
    content.innerHTML = html;
    
    // Add click listeners to favorite items
    content.querySelectorAll('.favorite-item').forEach(item => {
      item.addEventListener('click', () => {
        const level = item.dataset.level;
        const index = parseInt(item.dataset.index);
        displaySpecificPhrase(level, index);
        document.getElementById('favoritesPopover').classList.remove('active');
      });
    });
  });
}

function displaySpecificPhrase(level, index) {
  currentLevel = level;
  currentPhrase = { 
    ...phrases[level][index], 
    index: index,
    level: level 
  };
  
  document.getElementById('germanPhrase').textContent = currentPhrase.german;
  document.getElementById('englishTranslation').textContent = currentPhrase.english;
  
  updateActiveLevel();
  
  chrome.storage.local.get(['favorites'], (result) => {
    updateFavoriteButton(result.favorites || {});
  });
}

function playPronunciation() {
  if (!currentPhrase) return;
  
  // Cancel any ongoing speech
  speechSynthesis.cancel();
  
  // Get the German text (remove example part if it exists)
  let textToSpeak = currentPhrase.german;
  
  // For slang phrases with examples, extract just the main phrase
  if (textToSpeak.includes('(z.B.')) {
    textToSpeak = textToSpeak.split('(z.B.')[0].trim();
  }
  
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = 'de-DE';
  utterance.rate = 0.9; // Slightly slower for learning
  
  speechSynthesis.speak(utterance);
}

function toggleTranslation() {
  chrome.storage.local.get(['showTranslation'], (result) => {
    const currentState = result.showTranslation !== false; // default true
    const newState = !currentState;
    chrome.storage.local.set({ showTranslation: newState });
    updateTranslationVisibility(newState);
  });
}

function updateTranslationVisibility(show) {
  const translation = document.getElementById('englishTranslation');
  const toggleBtn = document.getElementById('translationToggle');
  
  if (show) {
    translation.classList.remove('hidden');
    toggleBtn.classList.add('active');
  } else {
    translation.classList.add('hidden');
    toggleBtn.classList.remove('active');
  }
}

function toggleShortcutsModal() {
  const modal = document.getElementById('shortcutsModal');
  modal.classList.toggle('active');
}

function toggleDarkMode() {
  chrome.storage.local.get(['darkMode'], (result) => {
    const currentState = result.darkMode || false;
    const newState = !currentState;
    chrome.storage.local.set({ darkMode: newState });
    updateDarkMode(newState);
  });
}

function updateDarkMode(enabled) {
  const toggleBtn = document.getElementById('darkModeToggle');
  
  if (enabled) {
    document.body.classList.add('dark-mode');
    toggleBtn.classList.add('active');
  } else {
    document.body.classList.remove('dark-mode');
    toggleBtn.classList.remove('active');
  }
}

function exportFavorites() {
  chrome.storage.local.get(['favorites', 'showTranslation'], (result) => {
    const favorites = result.favorites || {};
    const includeTranslations = result.showTranslation !== false; // default true
    
    // Check if there are any favorites
    const hasFavorites = Object.values(favorites).some(arr => arr.length > 0);
    if (!hasFavorites) {
      alert('No favorites to export!');
      return;
    }
    
    // Build export text
    let exportText = 'My German Favorites\n';
    exportText += '===================\n\n';
    
    ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach(level => {
      const levelFavorites = favorites[level] || [];
      if (levelFavorites.length > 0) {
        exportText += `${level} Level (${levelFavorites.length} phrases)\n`;
        exportText += '-'.repeat(30) + '\n';
        
        levelFavorites.forEach(index => {
          const phrase = phrases[level][index];
          exportText += `${phrase.german}\n`;
          if (includeTranslations) {
            exportText += `${phrase.english}\n`;
          }
          exportText += '\n';
        });
        
        exportText += '\n';
      }
    });
    
    // Create download
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const suffix = includeTranslations ? 'with-translations' : 'german-only';
    a.download = `german-favorites-${suffix}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Radio functions
function toggleRadioPopover() {
  const popover = document.getElementById('radioPopover');
  popover.classList.toggle('active');
}

function updateRadioUI(playing) {
  const playIcon = document.querySelector('.play-icon');
  const pauseIcon = document.querySelector('.pause-icon');
  const radioBtn = document.getElementById('radioBtn');
  const radioAnimation = document.getElementById('radioAnimation');
  
  if (playing) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    radioBtn.classList.add('playing');
    radioAnimation.classList.add('playing');
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    radioBtn.classList.remove('playing');
    radioAnimation.classList.remove('playing');
  }
}

function setActiveTrack(stationId) {
  document.querySelectorAll('.audio-track-btn').forEach(btn => {
    if (btn.dataset.station === stationId) {
      btn.classList.add('active');
      // Scroll into view gently
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Auto-switch to the tab containing this track
      const cat = btn.closest('.audio-category');
      if (cat && cat.dataset.category) {
        switchAudioTab(cat.dataset.category);
      }
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Now Playing title banner
  updateNowPlayingTitle(stationId);
}

function toggleRadioPlay() {
  const volumeSlider = document.getElementById('radioVolume');
  
  if (isRadioPlaying) {
    chrome.runtime.sendMessage({
      target: 'background',
      type: 'pause'
    }, (response) => {
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
      volume: parseFloat(volumeSlider.value)
    }, (response) => {
      if (response && response.success) {
        isRadioPlaying = true;
        updateRadioUI(true);
      }
    });
  }
}

function changeRadioStation(stationId) {
  if (!stationId) return;
  activeRadioStation = stationId;
  setActiveTrack(stationId);
  
  chrome.storage.local.set({ radioStation: stationId });
  
  const volumeSlider = document.getElementById('radioVolume');
  
  chrome.runtime.sendMessage({
    target: 'background',
    type: 'play',
    station: stationId,
    volume: volumeSlider ? parseFloat(volumeSlider.value) : 0.5
  }, (response) => {
    if (response && response.success) {
      isRadioPlaying = true;
      updateRadioUI(true);
    }
  });
}

function changeRadioVolume() {
  const volumeSlider = document.getElementById('radioVolume');
  
  chrome.storage.local.set({ radioVolume: volumeSlider.value });
  
  chrome.runtime.sendMessage({
    target: 'background',
    type: 'setVolume',
    volume: parseFloat(volumeSlider.value)
  });
}

function switchRadioStation(direction) {
  const buttons = Array.from(document.querySelectorAll('.audio-track-btn'));
  const stationKeys = buttons.map(btn => btn.dataset.station);
  
  let currentIndex = stationKeys.indexOf(activeRadioStation);
  if (currentIndex === -1) currentIndex = 0;
  
  let nextIndex = currentIndex + direction;
  if (nextIndex >= stationKeys.length) {
    nextIndex = 0; // Wrap around to first
  } else if (nextIndex < 0) {
    nextIndex = stationKeys.length - 1; // Wrap around to last
  }
  
  changeRadioStation(stationKeys[nextIndex]);
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

function updateLoopUI(loop) {
  const loopBtn = document.getElementById('radioLoopBtn');
  if (loopBtn) {
    if (loop) {
      loopBtn.classList.add('active');
    } else {
      loopBtn.classList.remove('active');
    }
  }
}

function setPlaybackSpeed(rate) {
  activePlaybackRate = rate;
  updatePlaybackSpeedUI(rate);
  
  chrome.runtime.sendMessage({
    target: 'background',
    type: 'setPlaybackRate',
    playbackRate: rate
  });
}

function updatePlaybackSpeedUI(rate) {
  const speedBtn = document.getElementById('radioSpeedBtn');
  if (speedBtn) {
    speedBtn.textContent = (rate % 1 === 0 ? rate.toFixed(1) : rate) + 'x';
    if (rate !== 1.0) {
      speedBtn.classList.add('active');
    } else {
      speedBtn.classList.remove('active');
    }
  }
  
  // Update active speed menu option
  document.querySelectorAll('.speed-option-btn').forEach(btn => {
    const speed = parseFloat(btn.dataset.speed);
    if (speed === rate) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function switchAudioTab(tabId) {
  // Update tab buttons
  document.querySelectorAll('.audio-tab').forEach(t => {
    if (t.dataset.tab === tabId) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  // Update category sections
  document.querySelectorAll('.audio-category').forEach(cat => {
    if (cat.dataset.category === tabId) {
      cat.classList.remove('hidden');
    } else {
      cat.classList.add('hidden');
    }
  });
}

function updateNowPlayingTitle(stationId) {
  const activeBtn = document.querySelector(`.audio-track-btn[data-station="${stationId}"]`);
  const container = document.getElementById('nowPlayingContainer');
  const titleEl = document.getElementById('nowPlayingTitle');
  const creditEl = document.getElementById('nowPlayingCredit');
  const progressContainer = document.getElementById('progressContainer');
  const loopBtn = document.getElementById('radioLoopBtn');
  const timeDisplayPill = document.getElementById('timeDisplayPill');
  
  if (activeBtn) {
    titleEl.textContent = activeBtn.textContent;
    container.classList.remove('hidden');
    
    const isDialogue = stationId.startsWith('dialogue');
    if (isDialogue) {
      if (progressContainer) progressContainer.classList.remove('hidden');
      if (timeDisplayPill) timeDisplayPill.classList.remove('hidden');
      if (loopBtn) loopBtn.classList.remove('hidden');
      if (creditEl) {
        const videoUrl = dialogueYoutubeUrls[stationId] || 'https://www.youtube.com/channel/UCFem29qvSf5GgYQlwUl4_Pg';
        creditEl.href = videoUrl;
        creditEl.classList.remove('hidden');
      }
    } else {
      if (progressContainer) progressContainer.classList.add('hidden');
      if (timeDisplayPill) timeDisplayPill.classList.add('hidden');
      if (loopBtn) loopBtn.classList.add('hidden');
      if (creditEl) {
        creditEl.classList.add('hidden');
        creditEl.href = '#';
      }
    }
  } else {
    container.classList.add('hidden');
    if (timeDisplayPill) timeDisplayPill.classList.add('hidden');
    if (creditEl) {
      creditEl.classList.add('hidden');
      creditEl.href = '#';
    }
  }
}

function updatePlaybackProgress(currentTime, duration, paused) {
  isRadioPlaying = !paused;
  updateRadioUI(isRadioPlaying);
  
  const isDialogue = activeRadioStation.startsWith('dialogue');
  if (!isDialogue) return;
  
  lastDuration = duration;
  
  if (!isUserDraggingProgress && !isAudioSeeking) {
    const progressBar = document.getElementById('progressBar');
    if (progressBar && duration && duration > 0) {
      const percentage = (currentTime / duration) * 100;
      progressBar.value = percentage;
    }
    
    const currentTimeEl = document.getElementById('currentTimeLabel');
    if (currentTimeEl) {
      currentTimeEl.textContent = formatTime(currentTime);
    }
  }
  
  const durationEl = document.getElementById('durationLabel');
  if (durationEl && duration && duration > 0) {
    durationEl.textContent = formatTime(duration);
  }
}

function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Quick Links functions
function initQuickLinks() {
  chrome.storage.local.get(['quickLinks'], (result) => {
    quickLinks = result.quickLinks || DEFAULT_QUICK_LINKS;
    renderQuickLinksDock();
  });

  // Event Listeners for Quick Links Modal
  const closeBtn = document.getElementById('closeQuickLinksBtn');
  if(closeBtn) closeBtn.addEventListener('click', toggleQuickLinksModal);
  
  const modal = document.getElementById('quickLinksModal');
  if(modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'quickLinksModal') {
        toggleQuickLinksModal();
      }
    });
  }

  const addBtn = document.getElementById('addLinkBtn');
  if(addBtn) addBtn.addEventListener('click', addQuickLink);
}

function renderQuickLinksDock() {
  const dock = document.getElementById('quickLinksDock');
  if (!dock) return;
  
  let html = '';
  quickLinks.forEach(link => {
    let domain = 'example.com';
    try { domain = new URL(link.url).hostname; } catch(e) {}
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    html += `
      <a href="${link.url}" class="quick-link-item" data-tooltip="${link.name}">
        <img src="${faviconUrl}" alt="${link.name}" class="quick-link-icon" onerror="this.style.display='none'">
      </a>
    `;
  });
  
  html += `
    <button class="add-quick-link-btn" id="openQuickLinksModalBtn" data-tooltip="Edit Links">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  `;
  
  dock.innerHTML = html;
  
  document.getElementById('openQuickLinksModalBtn').addEventListener('click', toggleQuickLinksModal);
}

function toggleQuickLinksModal() {
  const modal = document.getElementById('quickLinksModal');
  if(!modal) return;
  modal.classList.toggle('active');
  if (modal.classList.contains('active')) {
    const errorEl = document.getElementById('quickLinksError');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
    renderQuickLinksEditList();
  }
}

function renderQuickLinksEditList() {
  const listContainer = document.getElementById('quickLinksList');
  if (!listContainer) return;
  
  if (quickLinks.length === 0) {
    listContainer.innerHTML = '<div style="color: #999; text-align: center; font-size: 14px; padding: 10px;">No links added yet.</div>';
    return;
  }
  
  let html = '';
  quickLinks.forEach(link => {
    let domain = 'example.com';
    try { domain = new URL(link.url).hostname; } catch(e) {}
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    html += `
      <div class="quick-link-edit-item">
        <div class="quick-link-edit-info">
          <img src="${faviconUrl}" class="quick-link-edit-icon" onerror="this.style.display='none'">
          <span class="quick-link-edit-name">${link.name}</span>
        </div>
        <button class="delete-link-btn" data-id="${link.id}">Delete</button>
      </div>
    `;
  });
  listContainer.innerHTML = html;
  
  // Add delete listeners
  document.querySelectorAll('.delete-link-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      deleteQuickLink(id);
    });
  });
}

function addQuickLink() {
  const nameInput = document.getElementById('newLinkName');
  const urlInput = document.getElementById('newLinkUrl');
  const errorEl = document.getElementById('quickLinksError');
  let name = nameInput.value.trim();
  let url = urlInput.value.trim();
  
  if (!name || !url) {
    if (errorEl) {
      errorEl.textContent = 'Please enter both a name and a URL.';
      errorEl.classList.remove('hidden');
    }
    return;
  }
  
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  
  try {
    new URL(url); // Validate URL
  } catch (e) {
    if (errorEl) {
      errorEl.textContent = 'Please enter a valid URL.';
      errorEl.classList.remove('hidden');
    }
    return;
  }
  
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  
  const newLink = {
    id: Date.now().toString(),
    name: name,
    url: url
  };
  
  quickLinks.push(newLink);
  saveQuickLinks();
  
  nameInput.value = '';
  urlInput.value = '';
  renderQuickLinksEditList();
  renderQuickLinksDock();
}

function deleteQuickLink(id) {
  quickLinks = quickLinks.filter(link => link.id !== id);
  saveQuickLinks();
  renderQuickLinksEditList();
  renderQuickLinksDock();
}

function saveQuickLinks() {
  chrome.storage.local.set({ quickLinks: quickLinks });
}
