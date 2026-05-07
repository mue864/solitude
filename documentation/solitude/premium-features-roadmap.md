# Solitude — Premium Features Roadmap

## Currently Locked (Placeholder Only)

- Custom color themes
- Scheduled notifications (custom times/days)

---

## Priority Build Order

### 1. Cloud Sync

- Currently all data lives in AsyncStorage only
- Losing a phone = losing everything — kills retention
- Multi-device support is a strong lock-in feature
- Stack: Expo + backend (MongoDB/Supabase) with user accounts

### 2. Advanced Insights

- Analytics screen is partially built already
- Weekly/monthly heatmaps
- Productivity score
- Best focus hours chart
- People pay to see data about themselves

### 3. Custom Flows

- Currently 3 hardcoded presets (Classic Focus, Solo Study, Creative Rhythm)
- Let users build their own session sequences
- Low effort, high perceived value

### 4. Focus Sounds / Ambient Audio

- Brown noise, rain, cafe, lo-fi
- Medium effort, very sticky (see: Endel, Brain.fm)
- assets/sounds/ folder already exists in the project

### 5. Real AI Features (Strongest Differentiator)

- **Smart session planning**: paste task list → AI suggests session type and order based on deadlines/energy
- **Reflection analysis**: after journaling, AI gives weekly pattern summary (e.g. "you underestimate deep work on Mondays")
- **Flow builder**: describe your goal → AI generates a custom flow sequence
- Highest effort, easiest to charge a premium tier for

### 6. Widgets

- Android: Kotlin/XML AppWidgetProvider + SharedPreferences
- iOS: SwiftUI WidgetKit + AppGroup
- Requires full bare workflow (expo prebuild)
- Major selling point once built

### 7. Data Export

- CSV / PDF export of session history and task completion
- Students and professionals need this for time tracking logs

### 8. Recurring Tasks

- Daily/weekly task templates that auto-populate
- Strong habit-building feature

---

## Free vs. Pro Split (Suggested)

| Feature                              | Free | Pro |
| ------------------------------------ | ---- | --- |
| Pomodoro timer + session types       | ✅   | ✅  |
| Flows (preset only)                  | ✅   | ✅  |
| Custom flows                         | ❌   | ✅  |
| Basic insights (weekly)              | ✅   | ✅  |
| Advanced insights (heatmaps, scores) | ❌   | ✅  |
| Journal                              | ✅   | ✅  |
| AI reflection analysis               | ❌   | ✅  |
| AI session planning                  | ❌   | ✅  |
| Themes (default only)                | ✅   | ✅  |
| Custom color themes                  | ❌   | ✅  |
| Focus sounds                         | ❌   | ✅  |
| Scheduled notifications              | ❌   | ✅  |
| Cloud sync                           | ❌   | ✅  |
| Data export                          | ❌   | ✅  |
| Widgets                              | ❌   | ✅  |
| Recurring tasks                      | ❌   | ✅  |
