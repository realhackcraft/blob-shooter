class AudioInstance {
  buffer: AudioBuffer;
  volume: number;
  loop: boolean;
  source: AudioBufferSourceNode | null;

  constructor(buffer: AudioBuffer, volume: number, loop: boolean) {
    this.buffer = buffer;
    this.volume = volume;
    this.loop = loop;
    this.source = null;
  }
}

class AudioManager {
  sounds: { [key: string]: AudioInstance };
  audioContext: AudioContext;

  constructor() {
    this.audioContext = new window.AudioContext();
    this.sounds = {};
  }

  // Load an audio file and store it by name
  async load(
    name: string,
    url: string | URL | Request,
    volume = 1,
    loop = false,
  ) {
    try {
      const response = await fetch(url);
      const data = await response.arrayBuffer();
      const buffer = await this.audioContext.decodeAudioData(data);
      this.sounds[name] = new AudioInstance(buffer, volume, loop);
    } catch (err) {
      return console.error(`Error loading sound: ${url}`, err);
    }
  }

  // Play a sound by its name
  play(name: string) {
    const sound = this.sounds[name];
    if (sound && sound.buffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = sound.buffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = sound.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.loop = sound.loop;
      source.start(0);

      // Store the source node so we can stop it later
      sound.source = source;
    } else {
      console.warn(`Sound '${name}' not found or not loaded.`);
    }
  }

  // Stop a single sound by its name
  stop(name: string) {
    const sound = this.sounds[name];
    if (sound && sound.source) {
      sound.source.stop(); // Stop the currently playing sound
      sound.source = null; // Reset the source so it can be played again
    } else {
      console.warn(`Sound '${name}' is not currently playing.`);
    }
  }

  // Stop all sounds
  stopAll() {
    Object.keys(this.sounds).forEach((name) => this.stop(name));
  }

  // Set volume for a specific sound
  setVolume(name: string, volume: number) {
    if (this.sounds[name]) {
      this.sounds[name].volume = volume;
    }
  }

  // Toggle loop for a specific sound
  setLoop(name: string, loop: boolean) {
    if (this.sounds[name]) {
      this.sounds[name].loop = loop;
    }
  }
}

let instance = new AudioManager();

// Load sounds
instance.load("background", "./assets/aud/MarchOfTheBlob.wav", 0.4, true);
instance.load("shoot", "./assets/aud/laserShoot.wav", 0.1);
instance.load("damageEnemy", "./assets/aud/hitHurt.wav", 0.1);
instance.load("killEnemy", "./assets/aud/explosion.wav", 0.1);
instance.load("powerUp", "./assets/aud/powerUp.wav", 0.1);
instance.load("death", "./assets/aud/death.wav", 0.1);
instance.load("click", "./assets/aud/click.wav", 0.1);

export default instance;
