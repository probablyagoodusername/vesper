# UI Redesign TODO

## 1. Bottom nav simplification
- Current: Home, Bible, Breathe, Meditate, Sleep, Settings
- New: Home, Breathe, Meditate, Sleep, Settings
- Move Bible into Home: under verse of the day, add a bottom-right "Bible" button

## 2. Bible layout rework
- Lent / current liturgical event at top
- Search bar under that
- Bible content below
- Remove "continuous" mode by default
- Listen button cycles: Listen → Listen on → Listen continuous (find icon)
- On scroll: everything hides except sticky navbar with Vesper logo

## 3. iOS physics for swipeable areas
- Meditate category tabs and any horizontal scroll areas
- Add rubber-band / momentum scrolling feel (iOS-style)

## 4. Settings page updates
- "Our Approach" should show the README content
- "Open Source" should link to correct repo URL (jmdlab/vesper)
- Fix any stale URLs

## 5. Prayer pause fix
- prayer-hail-mary: 30s speech inflated to 817s
- prayer-our-father: first pause too long
- Need TTS re-gen with shorter pauses for prayer category
