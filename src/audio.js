export function createAudio() {
  /** @type {AudioContext|null} */
  let ctx = null;
  let master = null;
  let dangerGain = null;
  let noiseNode = null;
  let heartbeatOsc = null;
  let heartbeatLFO = null;
  let heartbeatGain = null;
  let isRunning = false;

  function ensure() {
    if (ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();

    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);

    dangerGain = ctx.createGain();
    dangerGain.gain.value = 0.0;
    dangerGain.connect(master);

    // Pink-ish noise (buffer) -> lowpass
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = white * 0.12;
    }
    noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 420;
    noiseFilter.Q.value = 0.2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.20;

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);

    // Heartbeat: sine + LFO amplitude -> danger bus
    heartbeatOsc = ctx.createOscillator();
    heartbeatOsc.type = "sine";
    heartbeatOsc.frequency.value = 75;

    heartbeatGain = ctx.createGain();
    heartbeatGain.gain.value = 0.0;

    heartbeatLFO = ctx.createOscillator();
    heartbeatLFO.type = "square";
    heartbeatLFO.frequency.value = 1.4;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.35;

    heartbeatLFO.connect(lfoGain);
    lfoGain.connect(heartbeatGain.gain);

    heartbeatOsc.connect(heartbeatGain);
    heartbeatGain.connect(dangerGain);
  }

  async function start() {
    ensure();
    if (!ctx || isRunning) return;
    if (ctx.state === "suspended") await ctx.resume();
    noiseNode.start();
    heartbeatOsc.start();
    heartbeatLFO.start();
    isRunning = true;
  }

  function stop() {
    if (!ctx) return;
    // We keep context for next run; just mute.
    master.gain.value = 0.0;
  }

  function setMasterVolume(v) {
    if (!ctx) return;
    master.gain.value = v;
  }

  function setDangerLevel(t) {
    if (!ctx) return;
    const x = Math.max(0, Math.min(1, t));
    dangerGain.gain.setTargetAtTime(x * 0.65, ctx.currentTime, 0.05);
    heartbeatGain.gain.setTargetAtTime(x * 0.22, ctx.currentTime, 0.05);
    master.gain.setTargetAtTime(0.55 + x * 0.10, ctx.currentTime, 0.08);
  }

  return { start, stop, setDangerLevel, setMasterVolume };
}

