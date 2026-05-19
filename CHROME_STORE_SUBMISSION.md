# Chrome Web Store Submission Guide
## Passive Language Learning - German Edition

---

## 1. BASIC INFORMATION

### Extension Name
**Passive Language Learning - German**

### Short Description (132 characters max)
Learn German naturally through passive exposure. Every new tab shows a phrase matched to your level—effortless micro-learning.

### Detailed Description (16,000 characters max)

Transform your browser into a German learning companion! Every time you open a new tab, you'll see a carefully selected German phrase with its English translation, matched to your proficiency level.

**Why Passive Language Learning Works**

As a heavy browser user, you open dozens of tabs daily. Instead of staring at a blank page, why not use those micro-moments for language learning? Passive exposure is proven to improve vocabulary retention and language familiarity without the pressure of formal study sessions.

**Features**

🎯 **CEFR Level System (A0-C2)**
- A0: Slang & colloquial expressions
- A1-A2: Beginner phrases for everyday situations
- B1-B2: Intermediate conversational German
- C1-C2: Advanced academic and professional language
- 578+ phrases across all levels

📚 **9 Contextual Topics**
- Everyday Life
- Social Interactions
- Food & Dining
- Travel
- Shopping
- Housing (flat hunting, rent, utilities)
- Work & Business
- Health & Medical
- Slang (modern German street language)

⭐ **Smart Learning Tools**
- Favorite phrases for later review
- Export favorites as text file (with/without translations)
- Audio pronunciation (native German voice)
- Toggle translations on/off for immersion
- Phrase tracking (no repetition until you've seen all)
- Keyboard shortcuts for power users

🎨 **Beautiful, Minimalist Design**
- Clean interface that doesn't distract
- Matches your workflow seamlessly
- Instant loading, zero performance impact

**Perfect For**
- English speakers learning German
- Students preparing for German exams
- Professionals working with German colleagues
- Travelers planning trips to Germany
- Anyone wanting to maintain/improve their German

**How It Works**
1. Install the extension
2. Select your CEFR level (A1-C2)
3. Choose topics you're interested in
4. Every new tab shows a new phrase
5. Click the speaker icon to hear pronunciation
6. Star your favorites for later review

**Privacy First**
- All data stored locally on your device
- No tracking, no analytics, no data collection
- Works completely offline after installation
- Open source and transparent

**Keyboard Shortcuts**
- Space: Next phrase
- F: Toggle favorite
- A: Play audio
- T: Toggle translation
- ?: Show shortcuts help

Start learning German naturally, one tab at a time!

---

## 2. CATEGORY

**Primary Category:** Education

**Secondary Category (if available):** Productivity

---

## 3. LANGUAGE

**Primary Language:** English

---

## 4. SCREENSHOTS (Required: 1-5 screenshots, 1280x800 or 640x400)

### Screenshot 1: Main Interface
**Caption:** "Learn German with every new tab - clean, minimalist interface"
**Description:** Shows the main phrase display with German text, English translation, and audio button

### Screenshot 2: Level Selection
**Caption:** "Choose your CEFR level from A0 (slang) to C2 (advanced)"
**Description:** Highlights the level selector with all options visible

### Screenshot 3: Topics
**Caption:** "Filter by topic - everyday life, travel, food, work, and more"
**Description:** Shows the topic dropdown with various categories

### Screenshot 4: Favorites
**Caption:** "Save and export your favorite phrases for offline study"
**Description:** Shows the favorites popover with saved phrases

### Screenshot 5: Keyboard Shortcuts
**Caption:** "Power user? Use keyboard shortcuts for lightning-fast learning"
**Description:** Shows the keyboard shortcuts modal

---

## 5. PROMOTIONAL IMAGES (Optional but recommended)

### Small Promotional Tile (440x280)
- Extension icon with tagline: "Learn German, One Tab at a Time"

### Large Promotional Tile (920x680)
- Feature showcase with screenshots

### Marquee Promotional Tile (1400x560)
- Hero image with key features listed

---

## 6. ICON

**128x128 icon required**
- Use the German flag emoji 🇩🇪 or a stylized "DE" logo
- Clean, recognizable design
- Works well at small sizes

---

## 7. PRIVACY PRACTICES

### Data Usage
**Does this extension collect user data?**
No

**Data handling practices:**
- No user data is collected
- No personal information is transmitted
- All preferences stored locally using Chrome Storage API
- No third-party services or analytics
- No cookies or tracking

---

## 8. PERMISSIONS JUSTIFICATION

### Required Permission: `storage`
**Justification:** 
Used to save user preferences locally (selected level, topic, favorites, shown phrases, translation toggle state). All data stays on the user's device and is never transmitted.

### Chrome URL Override: `newtab`
**Justification:**
Replaces the new tab page to display German learning phrases. This is the core functionality of the extension.

---

## 9. PRICING

**Free** (no in-app purchases, no subscriptions)

---

## 10. DISTRIBUTION

**Visibility:** Public

**Regions:** All regions

---

## 11. WEBSITE & SUPPORT

### Official Website (optional)
[Your website URL or GitHub repository]

### Support Email (required)
[Your support email]

### Support URL (optional)
[GitHub Issues page or support documentation]

---

## 12. VERSION INFORMATION

### Version Number
1.0.0

### Version Description
Initial release with 578 German phrases across all CEFR levels (A0-C2), 9 contextual topics, favorites system, audio pronunciation, and keyboard shortcuts.

---

## 13. MANIFEST DETAILS

### Manifest Version
3 (latest)

### Host Permissions
None required

### Content Security Policy
Default (no custom CSP needed)

---

## 14. SINGLE PURPOSE DESCRIPTION

**What is the single purpose of your extension?**

This extension replaces the new tab page with German language learning content, displaying one phrase at a time matched to the user's proficiency level. The single purpose is passive language learning through repeated exposure during normal browsing activity.

---

## 15. ADDITIONAL INFORMATION

### Why should users install this extension?

Users who are learning German often struggle to find time for consistent practice. This extension turns "dead time" (opening new tabs) into productive micro-learning moments. With 50-100+ tab opens per day for heavy browser users, this creates 50-100+ exposures to German phrases without any extra effort or time commitment.

### What makes this extension unique?

Unlike traditional language learning apps that require dedicated study sessions, this extension integrates seamlessly into existing browsing habits. The passive learning approach, combined with CEFR-aligned content and contextual topics, makes it both effortless and effective. The minimalist design ensures it enhances rather than interrupts workflow.

---

## 16. TESTING INSTRUCTIONS FOR REVIEWERS

1. Install the extension
2. Open a new tab - you should see a German phrase with English translation
3. Click the level buttons (A0-C2) to switch difficulty levels
4. Select different topics from the dropdown
5. Click the speaker icon to hear audio pronunciation
6. Click the star icon to favorite a phrase
7. Click "Favorites" in bottom-right to view saved phrases
8. Click the export icon in favorites to download as text file
9. Click the translation toggle (globe icon) to hide/show English
10. Click "?" in bottom-left to see keyboard shortcuts
11. Test keyboard shortcuts: Space (next), F (favorite), A (audio), T (translation)

---

## 17. PACKAGE PREPARATION

### Files to Include in ZIP:
```
manifest.json
newtab.html
newtab.js
styles.css
phrases.json
README.md (optional)
```

### Files to Exclude:
```
.git/
.gitignore
node_modules/
*.md (except README if desired)
image.png (reference image)
```

### Create Package:
```bash
zip -r passive-language-learning-german-v1.0.0.zip manifest.json newtab.html newtab.js styles.css phrases.json -x "*.git*" "*.md" "image.png"
```

---

## 18. POST-SUBMISSION CHECKLIST

- [ ] Extension package uploaded
- [ ] All screenshots uploaded (5 images)
- [ ] Icon uploaded (128x128)
- [ ] Privacy practices declared
- [ ] Support email verified
- [ ] Single purpose clearly stated
- [ ] Permissions justified
- [ ] Testing instructions provided
- [ ] Pricing set to Free
- [ ] Distribution set to Public
- [ ] Version information complete

---

## 19. EXPECTED REVIEW TIME

- Initial review: 1-3 business days
- Updates: 1-2 business days

---

## 20. COMMON REJECTION REASONS TO AVOID

✅ **We've addressed these:**
- Clear single purpose (language learning)
- Minimal permissions (only storage)
- No data collection or tracking
- No misleading functionality
- Clean, professional design
- Proper manifest v3 implementation
- No external code or libraries
- All content is original

---

## NOTES

- Chrome Web Store requires a one-time $5 developer registration fee
- Keep this document updated for future versions
- Monitor user reviews and feedback for improvements
- Consider adding more languages in future versions if successful

---

**Good luck with your submission! 🚀**
