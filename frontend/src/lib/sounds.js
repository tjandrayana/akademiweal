/**
 * Lightweight Web Audio API sound effects — no external files required.
 * AudioContext is created lazily on first use to comply with browser autoplay policy.
 */

let _ctx = null

const MUTE_KEY = 'akademiweal_sounds_muted'

/** Returns true if the user has muted sounds. */
export function isMuted() {
  try { return localStorage.getItem(MUTE_KEY) === '1' } catch { return false }
}

/** Toggles mute state. Returns the new muted value. */
export function toggleMute() {
  try {
    const next = !isMuted()
    localStorage.setItem(MUTE_KEY, next ? '1' : '0')
    return next
  } catch { return false }
}

function ctx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Resume if suspended (common after page load before user gesture)
  if (_ctx.state === 'suspended') {
    _ctx.resume()
  }
  return _ctx
}

function tone(freq, startTime, duration, volume = 0.28, type = 'sine') {
  try {
    if (isMuted()) return
    const c = ctx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)
    gain.gain.setValueAtTime(volume, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
    osc.start(startTime)
    osc.stop(startTime + duration)
  } catch {
    /* ignore — audio blocked or unsupported */
  }
}

/** Ascending chime — played when user answers correctly */
export function playCorrect() {
  try {
    const c = ctx()
    const t = c.currentTime
    tone(523.25, t,        0.12) // C5
    tone(659.25, t + 0.09, 0.12) // E5
    tone(783.99, t + 0.18, 0.22) // G5
  } catch {}
}

/** Short descending tone — played when user answers wrong */
export function playWrong() {
  try {
    const c = ctx()
    const t = c.currentTime
    tone(311.13, t,        0.12, 0.22, 'sawtooth') // Eb4
    tone(261.63, t + 0.10, 0.22, 0.18, 'sawtooth') // C4
  } catch {}
}

/** Fanfare — played on lesson / level complete */
export function playComplete() {
  try {
    const c = ctx()
    const t = c.currentTime
    tone(523.25, t,        0.1)  // C5
    tone(659.25, t + 0.08, 0.1)  // E5
    tone(783.99, t + 0.16, 0.1)  // G5
    tone(1046.5,  t + 0.24, 0.25) // C6
  } catch {}
}

/** Soft click — played when tapping a chip */
export function playTap() {
  try {
    const c = ctx()
    const t = c.currentTime
    tone(1200, t, 0.04, 0.12, 'sine')
  } catch {}
}

/** Gentle ping — selecting an option (goal, time, word-bank chip) */
export function playSelect() {
  try {
    const c = ctx()
    const t = c.currentTime
    tone(880, t, 0.08, 0.13, 'sine')
  } catch {}
}

/** Very brief click — bottom nav / tab switch */
export function playNavigate() {
  try {
    const c = ctx()
    const t = c.currentTime
    tone(700, t, 0.055, 0.09, 'sine')
  } catch {}
}

/** Two-note rise — onboarding step advance / intro continue */
export function playStepNext() {
  try {
    const c = ctx()
    const t = c.currentTime
    tone(440, t,        0.09, 0.17, 'sine') // A4
    tone(554, t + 0.07, 0.14, 0.17, 'sine') // C#5
  } catch {}
}

/** Energetic two-note launch — Mulai / start lesson */
export function playLevelStart() {
  try {
    const c = ctx()
    const t = c.currentTime
    tone(659.25, t,        0.08, 0.22, 'sine') // E5
    tone(880,    t + 0.06, 0.14, 0.22, 'sine') // A5
  } catch {}
}

/** Full five-note fanfare — perfect result, onboarding complete */
export function playCelebration() {
  try {
    const c = ctx()
    const t = c.currentTime
    tone(523.25, t,        0.08, 0.28) // C5
    tone(659.25, t + 0.07, 0.08, 0.28) // E5
    tone(783.99, t + 0.14, 0.08, 0.28) // G5
    tone(1046.5,  t + 0.21, 0.10, 0.30) // C6
    tone(1318.5,  t + 0.31, 0.22, 0.26) // E6
  } catch {}
}

/** Dull thud — locked content denied */
export function playLocked() {
  try {
    const c = ctx()
    const t = c.currentTime
    tone(130.81, t,        0.10, 0.20, 'sawtooth') // C3
    tone(110,    t + 0.08, 0.18, 0.15, 'sawtooth') // A2
  } catch {}
}
