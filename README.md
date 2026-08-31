# Breath App

An interactive React application that guides users through timed breathing sessions with synchronized animation, phase instructions, ambient sounds, and visual backgrounds.

**Live demo:** [breath-app-phi.vercel.app](https://breath-app-phi.vercel.app)

The interface is currently available in Russian.

## How It Works

1. Select the state you want to support.
2. Choose a session duration.
3. Start the session.
4. Follow the animated breathing guide and phase countdown.
5. Continue the session or return to the home screen when it finishes.

## Breathing Modes

| State      | Pattern |
| ---------- | ------- |
| Clarity    | 4–6     |
| Calm       | 4–4–6   |
| Focus      | 4–2–4   |
| Stability  | 4–4–4–4 |
| Relaxation | 4–7–8   |
| Energy     | 2–1–2   |

The `4–4–4–4` stability mode includes pauses after both inhalation and exhalation and uses a box-style breathing path.

## Session Durations

Users can choose:

* 1 minute
* 2 minutes
* 3 minutes
* 5 minutes

## Key Features

* Six configurable breathing patterns
* Animated breathing wave and guide ball
* Current-phase label and phase countdown
* Full-session countdown timer
* Breathing-cycle counter
* Smooth session completion and fade-out
* Continue or return-home actions
* Responsive interface for desktop and mobile
* Optional ambient sounds
* Optional visual backgrounds

## Ambient Experience

### Sounds

* Ocean
* Rain
* Forest

Audio elements are preloaded and reused. Sound transitions use gradual fade-in and fade-out instead of abrupt playback changes.

### Backgrounds

* Ocean
* Forest
* Mountains

The breathing interface uses a translucent glass-style card to remain readable over background images.

## Animation Architecture

The breathing engine uses a single `requestAnimationFrame` loop.

The following elements are derived from the same elapsed-time value:

* Wave movement
* Guide-ball position
* Current breathing phase
* Phase countdown
* Session timer
* Cycle counter
* Final fade-out

Using one time source prevents the timer and visual animation from drifting out of sync.

Frequently changing visual values are written through DOM references instead of causing a React render on every animation frame.

## Tech Stack

* React 19
* JavaScript
* Vite
* SVG
* Web Audio through `HTMLAudioElement`
* `requestAnimationFrame`
* CSS and responsive layouts
* ESLint

## Project Structure

```text
src/
├── components/
│   ├── HomeScreen.jsx
│   ├── BreathingScreen.jsx
│   ├── BreathingWave.jsx
│   └── BreathingBall.jsx
├── hooks/
│   └── useAmbientSound.js
├── utils/
│   └── getBreathingPattern.js
├── App.jsx
├── index.css
└── main.jsx
```

## Getting Started

### Requirements

* Node.js 20 or newer
* npm

### Installation

```bash
git clone https://github.com/TatsianaU/breath-app.git
cd breath-app
npm install
```

### Development

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

### Production build

```bash
npm run build
```

### Preview the build

```bash
npm run preview
```

### Lint the project

```bash
npm run lint
```

## Current Status

The application is deployed and available as a working frontend project.

Possible future improvements include accessibility refinements, user-defined breathing patterns, session history, multilingual interface support, and automated tests.
