/**
 * Playful looping background music — Web Audio synthesis (no MP3 assets).
 * Light pentatonic melody + soft bass; quiet mix so SFX stay clear.
 * Respects `isMuted()` from sounds.js.
 */

import { getSharedAudioContext, isMuted } from './sounds'

const BPM = 108
const SECONDS_PER_BEAT = 60 / BPM
const LOOP_BARS = 2
const LOOP_SEC = 4 * LOOP_BARS * SECONDS_PER_BEAT

const MELODY = [
  { b: 0, n: 'C5' },
  { b: 0.5, n: 'E5' },
  { b: 1, n: 'G5' },
  { b: 1.5, n: 'E5' },
  { b: 2, n: 'A5' },
  { b: 2.5, n: 'G5' },
  { b: 3, n: 'E5' },
  { b: 3.5, n: 'C5' },
  { b: 4, n: 'D5' },
  { b: 4.5, n: 'E5' },
  { b: 5, n: 'G5' },
  { b: 5.5, n: 'C6' },
  { b: 6, n: 'G5' },
  { b: 6.5, n: 'E5' },
  { b: 7, n: 'D5' },
  { b: 7.5, n: 'C5' },
]

const BASS = [
  { b: 0, n: 'C3' },
  { b: 2, n: 'G2' },
  { b: 4, n: 'A2' },
  { b: 6, n: 'F2' },
]

function isLessonLikePath() {
  try {
    const p = window.location.pathname
    return p === '/lesson' || p === '/result'
  } catch {
    return false
  }
}

const NOTE_HZ = {
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  C3: 130.81,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
  C6: 1046.5,
}

let masterGain = null
let running = false
let timeoutId = null

function ensureMasterGain() {
  if (masterGain) return masterGain
  try {
    const c = getSharedAudioContext()
    masterGain = c.createGain()
    masterGain.gain.value = 0
    masterGain.connect(c.destination)
    return masterGain
  } catch {
    return null
  }
}

function setMasterVolume(playing) {
  const g = ensureMasterGain()
  if (!g) return
  const c = getSharedAudioContext()
  const now = c.currentTime
  const target = playing && !isMuted() ? 0.08 : 0
  g.gain.cancelScheduledValues(now)
  g.gain.setValueAtTime(g.gain.value, now)
  g.gain.linearRampToValueAtTime(target, now + 0.2)
}

function playTone(startTime, freq, duration, volume, type = 'triangle') {
  const g = ensureMasterGain()
  if (!g) return
  const c = getSharedAudioContext()

  const osc = c.createOscillator()
  const gn = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  gn.gain.setValueAtTime(0.0001, startTime)
  gn.gain.exponentialRampToValueAtTime(volume, startTime + 0.02)
  gn.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.connect(gn)
  gn.connect(g)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
}

function scheduleLoopAt(t0) {
  if (!masterGain || isMuted()) return

  for (const { b, n } of MELODY) {
    const hz = NOTE_HZ[n]
    if (!hz) continue
    const start = t0 + b * SECONDS_PER_BEAT
    playTone(start, hz, SECONDS_PER_BEAT * 0.42, 0.1, 'triangle')
  }

  for (const { b, n } of BASS) {
    const hz = NOTE_HZ[n]
    if (!hz) continue
    const start = t0 + b * SECONDS_PER_BEAT
    playTone(start, hz, SECONDS_PER_BEAT * 0.52, 0.055, 'sine')
  }

  /** Sparse high sparkles — light “shimmer” without cluttering the mix */
  for (let i = 0; i < 4; i++) {
    const start = t0 + (1 + i * 2) * SECONDS_PER_BEAT
    playTone(start, 1568 + i * 12, 0.05, 0.018, 'sine')
  }
}

function loopTick() {
  if (!running) return

  if (isMuted()) {
    setMasterVolume(false)
    timeoutId = window.setTimeout(loopTick, 320)
    return
  }

  const c = getSharedAudioContext()
  const t0 = c.currentTime + 0.06
  setMasterVolume(true)
  scheduleLoopAt(t0)

  timeoutId = window.setTimeout(loopTick, LOOP_SEC * 1000)
}

export function startBackgroundMusic() {
  if (running) return
  ensureMasterGain()
  if (!masterGain) return
  running = true
  loopTick()
}

export function stopBackgroundMusic() {
  running = false
  if (timeoutId != null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  setMasterVolume(false)
}

export function syncBackgroundMusicWithMute() {
  if (!running) return
  setMasterVolume(!isMuted())
}

export function registerBackgroundMusicAutostart() {
  const start = () => {
    try {
      const c = getSharedAudioContext()
      if (c.state === 'suspended') c.resume()
    } catch {
      /* ignore */
    }
    if (!isMuted() && !isLessonLikePath()) startBackgroundMusic()
    window.removeEventListener('pointerdown', start)
    window.removeEventListener('keydown', start)
  }
  window.addEventListener('pointerdown', start, { passive: true })
  window.addEventListener('keydown', start)
  return () => {
    window.removeEventListener('pointerdown', start)
    window.removeEventListener('keydown', start)
  }
}

export function ensureBackgroundMusicStarted() {
  if (running) {
    syncBackgroundMusicWithMute()
    return
  }
  if (isMuted() || isLessonLikePath()) return
  try {
    const c = getSharedAudioContext()
    if (c.state === 'running') startBackgroundMusic()
  } catch {
    /* ignore */
  }
}
