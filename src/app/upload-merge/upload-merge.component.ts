import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import Hover from 'wavesurfer.js/dist/plugins/hover';

@Component({
  selector: 'app-upload-merge',
  templateUrl: './upload-merge.component.html',
  styleUrls: ['./upload-merge.component.scss']
})
export class UploadMergeComponent {
  @ViewChild('waveformContainer', { static: true }) waveformContainer!: ElementRef;

  wavesurfer!: WaveSurfer;
  currentTime: number = 0;
  totalTime: number = 0;

  audioBuffer: AudioBuffer | null = null;
  arrBuffer: ArrayBuffer | null = null;
  audioFile!: File;

  isPlay:boolean = false;

  regions = RegionsPlugin.create();
  regionArr:any[] = [];
  activeRegion:any = null;
  loop:boolean = false;

  hoverPlugin = Hover.create({
    lineColor: '#ff0000',
    lineWidth: 2,
    labelBackground: '#555',
    labelColor: '#fff',
    labelSize: '11px',
  });


  constructor(private renderer: Renderer2) {}

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (this.wavesurfer) {
        this.wavesurfer.destroy();
        this.regionArr = [];
        this.waveformContainer.nativeElement.innerHTML = '';
    }
      this.audioFile =file;
      // Create a new waveform div dynamically
      const waveformDiv = this.renderer.createElement('div');
      this.renderer.setAttribute(waveformDiv, 'id', 'waveform');
      this.renderer.appendChild(this.waveformContainer.nativeElement, waveformDiv);

      // Initialize WaveSurfer with the new div container
      this.wavesurfer = WaveSurfer.create({
        container: waveformDiv,
        waveColor: 'violet',
        progressColor: 'purple',
        plugins: [this.regions,this.hoverPlugin]
      });

      this.wavesurfer.on('decode', () => {
        this.totalTime = this.wavesurfer.getDuration();
        this.regions.enableDragSelection({
          //color: 'rgba(255, 0, 0, 0.1)',
          color : this.randomColor(),
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
          this.currentTime = currentTime;
        })
      });

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
        this.wavesurfer.loadBlob(blob);
      };
      reader.readAsArrayBuffer(file);
      this.readAndDecodeAudio();
    }
  }

  random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
  
  randomColor(): string {
    return `rgba(${this.random(0, 255)}, ${this.random(0, 255)}, ${this.random(0, 255)}, 0.5)`;
  }

  async readAndDecodeAudio() {
    try {
      this.arrBuffer = await this.readAudio(this.audioFile);
      this.audioBuffer = await new AudioContext().decodeAudioData(this.arrBuffer!);
    } catch (error) {
      window.alert('Error occurred while decoding audio.');
    }
  }

  readAudio(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };

      reader.onerror = (error) => {
        console.error('Error reading audio file', error);
        reject(error);
      };

      reader.onabort = (abort) => {
        console.warn('File reading aborted', abort);
        reject(abort);
      };
    });
  }

  playAudio(): void {
    if (this.wavesurfer) {
      if(!this.isPlay) {
        this.wavesurfer.play();
        this.isPlay = !this.isPlay;
      } else {
        this.wavesurfer.pause();
        this.isPlay = !this.isPlay;
      }
    }
  }

  mergeAudioPart() {
    if(this.regionArr.length > 0) {
      this.mergeAudio(this.regionArr);
    }
  }

  async mergeAudio(audioList: any[]): Promise<void> {
    const trackDetails: any[] = [];
    let channelLength = 0;

    audioList.forEach(region => {
      const regionDuration = region.end - region.start;
      console.log(this.audioBuffer)
      console.log(this.audioBuffer?.length)
      const startPoint = Math.floor((region.start * this.audioBuffer!.length) / this.wavesurfer.getDuration());
      const endPoint = Math.ceil((region.end * this.audioBuffer!.length) / this.wavesurfer.getDuration());
      const audioLength = endPoint - startPoint;
      channelLength += audioLength;

      trackDetails.push({ regionDuration, startPoint, endPoint, audioLength });
    });

    const mergedAudio = new AudioContext().createBuffer(
      this.audioBuffer!.numberOfChannels,
      channelLength,
      this.audioBuffer!.sampleRate
    );

    const channelData = Array.from({ length: this.audioBuffer!.numberOfChannels }, () =>
      new Float32Array(channelLength)
    );

    trackDetails.forEach((detail, index) => {
      for (let i = 0; i < this.audioBuffer!.numberOfChannels; i++) {
        channelData[i].set(this.audioBuffer!.getChannelData(i).slice(
          detail.startPoint, detail.endPoint), index === 0 ? 0 : trackDetails[index - 1].audioLength);
      }
    });

    for (let i = 0; i < this.audioBuffer!.numberOfChannels; i++) {
      mergedAudio.copyToChannel(channelData[i], i);
    }

    const audioData = {
      channels: Array.from({ length: mergedAudio.numberOfChannels }, (_, index) => mergedAudio.getChannelData(index)),
      sampleRate: mergedAudio.sampleRate,
      length: mergedAudio.length,
    };

    await this.encodeAudioBufferLame(audioData);
  }

  encodeAudioBufferLame(audioData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../app.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (event) => {
        if (event.data) {
          const blob = new Blob(event.data.res, { type: 'audio/mp3' });
          const processedAudio = new Audio();
          processedAudio.src = URL.createObjectURL(blob);
          document.getElementById('merged-track')!.setAttribute('src', processedAudio.src);
          resolve();
        } else {
          reject('Error during encoding');
        }
      };

      worker.postMessage({ audioData });
    });
  }
}
