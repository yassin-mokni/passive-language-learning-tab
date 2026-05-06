let phrases = {};
let currentLevel = 'A1';
let currentTopic = 'all';
let currentPhrase = null;

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
  
  // Favorites popover listeners
  document.getElementById('favoritesBtn').addEventListener('click', toggleFavoritesPopover);
  
  // Close popover when clicking outside
  document.addEventListener('click', (e) => {
    const popover = document.getElementById('favoritesPopover');
    const trigger = document.getElementById('favoritesBtn');
    if (!popover.contains(e.target) && !trigger.contains(e.target)) {
      popover.classList.remove('active');
    }
  });
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
