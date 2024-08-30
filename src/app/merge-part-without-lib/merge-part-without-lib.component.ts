import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import Hover from 'wavesurfer.js/dist/plugins/hover';

@Component({
  selector: 'app-merge-part-without-lib',
  templateUrl: './merge-part-without-lib.component.html',
  styleUrls: ['./merge-part-without-lib.component.scss']
})
export class MergePartWithoutLibComponent {
  @ViewChild('waveformContainer', { static: true }) waveformContainer!: ElementRef;

  wavesurfer!: WaveSurfer;
  currentTime: number = 0;
  totalTime: number = 0;

  private audioContext!: AudioContext;
  private file: File | null = null;
  private segments:any[] = [];

  isPlay: boolean = false;

  regions = RegionsPlugin.create();
  regionArr: any[] = [];
  activeRegion: any = null;
  loop: boolean = false;

  hoverPlugin = Hover.create({
    lineColor: '#ff0000',
    lineWidth: 2,
    labelBackground: '#555',
    labelColor: '#fff',
    labelSize: '11px',
  });


  constructor(private renderer: Renderer2) {
    this.audioContext = new AudioContext();
   }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (this.wavesurfer) {
        this.wavesurfer.destroy();
        this.regionArr = [];
        this.waveformContainer.nativeElement.innerHTML = '';
      }
      this.file = file;
      // Create a new waveform div dynamically
      const waveformDiv = this.renderer.createElement('div');
      this.renderer.setAttribute(waveformDiv, 'id', 'waveform');
      this.renderer.appendChild(this.waveformContainer.nativeElement, waveformDiv);

      // Initialize WaveSurfer with the new div container
      this.wavesurfer = WaveSurfer.create({
        container: waveformDiv,
        waveColor: 'violet',
        progressColor: 'purple',
        plugins: [this.regions, this.hoverPlugin]
      });

      this.wavesurfer.on('decode', () => {
        this.totalTime = parseFloat(this.wavesurfer.getDuration().toFixed(1));
        this.regions.enableDragSelection({
          //color: 'rgba(255, 0, 0, 0.1)',
          color: this.randomColor(),
        });

        this.regions.on('region-in', (region) => {
          this.activeRegion = region
        });

        this.regions.on('region-created', (region) => {
          this.regionArr = this.regions.getRegions();
        });

        this.regions.on('region-out', (region) => {
          if (this.activeRegion === region) {
            if (this.loop) {
              region.play();
            } else {
              this.activeRegion = null;
            }
          }
        });

        this.regions.on('region-clicked', (region, e) => {
          e.stopPropagation() // prevent triggering a click on the waveform
          this.activeRegion = region;
          region.play();
        })

        this.wavesurfer.on('timeupdate', (currentTime) => {
          this.currentTime = parseFloat(currentTime.toFixed(1));
        })
      });

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
        this.wavesurfer.loadBlob(blob);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  randomColor(): string {
    return `rgba(${this.random(0, 255)}, ${this.random(0, 255)}, ${this.random(0, 255)}, 0.5)`;
  }

  playAudio(): void {
    if (this.wavesurfer) {
      if (!this.isPlay) {
        this.wavesurfer.play();
        this.isPlay = !this.isPlay;
      } else {
        this.wavesurfer.pause();
        this.isPlay = !this.isPlay;
      }
    }
  }

  mergeAudioPart() {
    for(let i=0;i<this.regionArr.length;i++) {
      const param = {
        start: this.regionArr[i].start,
        end: this.regionArr[i].end
      }
      this.segments.push(param);
      this.mergeSegments();
    }
  }

  async mergeSegments(): Promise<void> {
    if (this.file) {
      try {
        if (!this.audioContext) {
          this.audioContext = new AudioContext();
        }
        const audioBuffer = await this.decodeAudioFile(this.file);
        const mergedBuffer = await this.extractAndMergeSegments(audioBuffer, this.segments);
        this.exportAsAudio(mergedBuffer);
      } catch (error) {
        console.error('Error merging audio segments:', error);
      }
    }
  }

  private decodeAudioFile(file: File): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = () => {
        // Ensure the audioContext is defined and active
        if (!this.audioContext) {
          this.audioContext = new AudioContext();
        }

        this.audioContext.decodeAudioData(reader.result as ArrayBuffer)
          .then(resolve)
          .catch(reject);
      };

      reader.onerror = (error) => reject(error);
    });
  }

  private async extractAndMergeSegments(audioBuffer: AudioBuffer, segments: { start: number, end: number }[]): Promise<AudioBuffer> {
    const totalLength = segments.reduce((sum, segment) => {
      const startSample = Math.floor(segment.start * audioBuffer.sampleRate);
      const endSample = Math.floor(segment.end * audioBuffer.sampleRate);
      return sum + (endSample - startSample);
    }, 0);

    const mergedBuffer = this.audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      totalLength,
      audioBuffer.sampleRate
    );

    let offset = 0;
    segments.forEach(segment => {
      const startSample = Math.floor(segment.start * audioBuffer.sampleRate);
      const endSample = Math.floor(segment.end * audioBuffer.sampleRate);
      const segmentLength = endSample - startSample;

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel).subarray(startSample, endSample);
        mergedBuffer.getChannelData(channel).set(channelData, offset);
      }
      offset += segmentLength;
    });

    return mergedBuffer;
  }
  private exportAsAudio(mergedBuffer: AudioBuffer): void {
    const offlineContext = new OfflineAudioContext(
      mergedBuffer.numberOfChannels,
      mergedBuffer.length,
      mergedBuffer.sampleRate
    );

    const bufferSource = offlineContext.createBufferSource();
    bufferSource.buffer = mergedBuffer;
    bufferSource.connect(offlineContext.destination);
    bufferSource.start();

    offlineContext.startRendering().then(renderedBuffer => {
      const wavBlob = this.bufferToWave(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);

      const audioElement = document.createElement('audio');
      audioElement.controls = true;
      audioElement.src = url;

      const container = document.getElementById('audioContainer');
      if (container) {
        container.innerHTML = '';
        container.appendChild(audioElement);
      }
    });
  }

  private bufferToWave(audioBuffer: AudioBuffer): Blob {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    this.writeString(view, pos, 'RIFF'); pos += 4;
    view.setUint32(pos, length - 8, true); pos += 4;
    this.writeString(view, pos, 'WAVE'); pos += 4;
    this.writeString(view, pos, 'fmt '); pos += 4;
    view.setUint32(pos, 16, true); pos += 4;
    view.setUint16(pos, 1, true); pos += 2;
    view.setUint16(pos, numberOfChannels, true); pos += 2;
    view.setUint32(pos, audioBuffer.sampleRate, true); pos += 4;
    view.setUint32(pos, audioBuffer.sampleRate * 4, true); pos += 4;
    view.setUint16(pos, numberOfChannels * 2, true); pos += 2;
    view.setUint16(pos, 16, true); pos += 2;
    this.writeString(view, pos, 'data'); pos += 4;
    view.setUint32(pos, length - pos - 4, true); pos += 4;

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numberOfChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset]));
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

}
