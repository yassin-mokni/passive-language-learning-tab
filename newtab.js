let phrases = {};
let currentLevel = 'A1';
let currentPhrase = null;

// Load phrases from JSON
fetch('phrases.json')
  .then(response => response.json())
  .then(data => {
    phrases = data;
    init();
  });

function init() {
  // Load saved level
  chrome.storage.local.get(['selectedLevel'], (result) => {
    if (result.selectedLevel) {
      currentLevel = result.selectedLevel;
      updateActiveLevel();
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

  // Control button listeners
  document.getElementById('nextBtn').addEventListener('click', displayRandomPhrase);
  document.getElementById('favoriteBtn').addEventListener('click', toggleFavorite);
  
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

function displayRandomPhrase() {
  const levelPhrases = phrases[currentLevel];
  
  chrome.storage.local.get(['shownPhrases', 'favorites'], (result) => {
    let shownPhrases = result.shownPhrases || {};
    let shown = shownPhrases[currentLevel] || [];
    
    // Reset if all phrases shown
    if (shown.length >= levelPhrases.length) {
      shown = [];
    }
    
    // Get unshown phrases
    const unshown = levelPhrases.filter((_, index) => !shown.includes(index));
    const randomIndex = levelPhrases.indexOf(unshown[Math.floor(Math.random() * unshown.length)]);
    
    currentPhrase = { ...levelPhrases[randomIndex], index: randomIndex };
    
    // Mark as shown
    shown.push(randomIndex);
    shownPhrases[currentLevel] = shown;
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
  
  chrome.storage.local.get(['favorites'], (result) => {
    let favorites = result.favorites || {};
    if (!favorites[currentLevel]) favorites[currentLevel] = [];
    
    const index = currentPhrase.index;
    const favIndex = favorites[currentLevel].indexOf(index);
    
    if (favIndex > -1) {
      favorites[currentLevel].splice(favIndex, 1);
    } else {
      favorites[currentLevel].push(index);
    }
    
    chrome.storage.local.set({ favorites });
    updateFavoriteButton(favorites);
  });
}

function updateFavoriteButton(favorites) {
  const btn = document.getElementById('favoriteBtn');
  const isFavorited = favorites[currentLevel]?.includes(currentPhrase.index);
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
  currentPhrase = { ...phrases[level][index], index };
  
  document.getElementById('germanPhrase').textContent = currentPhrase.german;
  document.getElementById('englishTranslation').textContent = currentPhrase.english;
  
  updateActiveLevel();
  
  chrome.storage.local.get(['favorites'], (result) => {
    updateFavoriteButton(result.favorites || {});
  });
}
