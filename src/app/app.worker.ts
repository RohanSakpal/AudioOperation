/// <reference lib="webworker" />

importScripts('../assets/lame.min.js'); // Update the path if necessary

declare var lamejs: any; // Declare the lamejs global variable

let mp3Encoder = lamejs.Mp3Encoder;

const buffer: Int8Array[] = [];
const sampleBlockSize = 1152;

addEventListener('message', async ({ data }: MessageEvent) => {
  try {
    const res = await encode(data.audioData);
    finish();
    postMessage({ res });
  } catch (err) {
  }
});

function finish() {
  appendToBuffer(mp3Encoder.flush());
}

function encode(audioData: { channels: Float32Array[]; sampleRate: number }): Promise<Int8Array[]> {
  if (audioData?.channels?.length === 1) {
    mp3Encoder = new lamejs.Mp3Encoder(1, audioData.sampleRate, 128);
    return new Promise((resolve, reject) => {
      const arrayBuffer = audioData.channels[0];
      const data = new Float32Array(arrayBuffer);
      const samples = new Int16Array(arrayBuffer.length);
      floatTo16BitPCM(data, samples);

      let remaining = samples.length;
      for (let i = 0; remaining >= 0; i += sampleBlockSize) {
        const mono = samples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3Encoder.encodeBuffer(mono);
        appendToBuffer(mp3buf);
        remaining -= sampleBlockSize;
      }
      resolve(buffer);
    });
  } else if (audioData?.channels?.length === 2) {
    mp3Encoder = new lamejs.Mp3Encoder(2, audioData.sampleRate, 128);
    return new Promise((resolve, reject) => {
      const right = new Int16Array(audioData.channels[0].length);
      floatTo16BitPCM(audioData.channels[0], right);

      const left = new Int16Array(audioData.channels[1].length);
      floatTo16BitPCM(audioData.channels[1], left);

      for (let i = 0; i < audioData.channels[0].length; i += sampleBlockSize) {
        const leftChunk = left.subarray(i, i + sampleBlockSize);
        const rightChunk = right.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
        if (mp3buf.length > 0) {
          buffer.push(mp3buf);
        }
      }
      resolve(buffer);
    });
  } else {
    // Handle unexpected audio data format
    return Promise.reject(new Error('Unsupported number of channels'));
  }
}

function appendToBuffer(mp3Buf: Uint8Array) {
  buffer.push(new Int8Array(mp3Buf));
}

function floatTo16BitPCM(input: Float32Array, output: Int16Array) {
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
  }
}
