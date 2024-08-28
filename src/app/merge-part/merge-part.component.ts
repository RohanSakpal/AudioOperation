import { Component } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline';
import Hover from 'wavesurfer.js/dist/plugins/hover';

@Component({
  selector: 'app-merge-part',
  templateUrl: './merge-part.component.html',
  styleUrls: ['./merge-part.component.scss']
})
export class MergePartComponent {
  wavesurfer!: WaveSurfer;
  regions = RegionsPlugin.create();
  activeRegion:any = null;
  loop:boolean = false;
  regionArr:any[] = [];
  audioBuffer: AudioBuffer | null = null;
  arrBuffer: ArrayBuffer | null = null;
  audioFile!: File;
  isPlay:boolean = false;
  bottomTimeline = TimelinePlugin.create({
    height: 10,
    timeInterval: 0.1,
    primaryLabelInterval: 5,
    style: {
      fontSize: '10px',
      color: '#6A3274',
    },
  });

  hoverPlugin = Hover.create({
    lineColor: '#ff0000',
    lineWidth: 2,
    labelBackground: '#555',
    labelColor: '#fff',
    labelSize: '11px',
  });

  ngAfterViewInit() {
    this.wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
      url: '../../assets/Stree_2.mp3',
      plugins: [this.regions,this.bottomTimeline,this.hoverPlugin],
    });

    this.wavesurfer.on('decode', () => {
      // this.regions.addRegion({
      //   start: 0,
      //   end: 30,
      //   //content: 'Resize me',
      //   color: this.randomColor(),
      //   drag: false,
      //   resize: true,
      // });

      // this.regions.addRegion({
      //   start: 50,
      //   end: 100,
      //   //content: 'Cramped region',
      //   color: this.randomColor(),
      //   minLength: 1,
      //   maxLength: 10,
      // });

      // this.regions.addRegion({
      //   start: 150,
      //   end: 200,
      //   content: 'Drag me',
      //   color: this.randomColor(),
      //   resize: false,
      // });

      this.regions.enableDragSelection({
        color: 'rgba(255, 0, 0, 0.1)',
      });

      this.regions.on('region-updated', (region) => {
        console.log('Updated region', region)
      });

      this.regions.on('region-in', (region) => {
        console.log('region-in', region)
        this.activeRegion = region
      });

      this.regions.on('region-created', (region) => {
        this.regionArr = this.regions.getRegions();
      });

      this.regions.on('region-out', (region) => {
        console.log('region-out', region)
        if (this.activeRegion === region) {
          if (this.loop) {
            region.play()
          } else {
            this.activeRegion = null
          }
        }
      });

      this.regions.on('region-clicked', (region, e) => {
        e.stopPropagation() // prevent triggering a click on the waveform
        this.activeRegion = region
        region.play()
        console.log(this.regions)
        //region.setOptions({ color: 'hsla(2, 100%, 39%, 1)' })
      })
    });

    this.wavesurfer.on('interaction', () => {
      this.activeRegion = null
    });

    this.wavesurfer.on('drag', (relativeX) => {
      console.log('Drag', relativeX)
    });
  }

  random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
  
  randomColor(): string {
    return `rgba(${this.random(0, 255)}, ${this.random(0, 255)}, ${this.random(0, 255)}, 0.5)`;
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

  onFileSelected(event: Event): void {
    debugger
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.audioFile = file;

      // Call the method to read and decode audio
      this.readAndDecodeAudio();
    }
  }

  async readAndDecodeAudio() {
    debugger
    try {
      this.arrBuffer = await this.readAudio(this.audioFile);
      this.audioBuffer = await new AudioContext().decodeAudioData(this.arrBuffer!);
      console.log('Decoded audio buffer:', this.audioBuffer);
    } catch (error) {
      window.alert('Error occurred while decoding audio.');
    }
  }

  readAudio(file: File): Promise<ArrayBuffer> {
    debugger
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

  mergeAudioPart() {
    debugger
    if(this.regionArr.length > 0) {
      this.mergeAudio(this.regionArr);
    }
  }

  async mergeAudio(audioList: any[]): Promise<void> {
    debugger
    const trackDetails: any[] = [];
    let channelLength = 0;

    audioList.forEach(region => {
      debugger
      const regionDuration = region.end - region.start;
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
    debugger
    return new Promise((resolve, reject) => {
      // const worker = new Worker(new URL('../../assets/workes/audio-merge.worker.ts', import.meta.url), { type: 'module' });
      const worker = new Worker(new URL('../app.worker.ts', import.meta.url), { type: 'module' });
      console.log(worker);
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

  // encodeAudioBufferLame(audioData: { channels: Float32Array[], sampleRate: number, length: number }): Promise<Uint8Array> {
  //   debugger
  //   console.log(audioData)
  //   return new Promise((resolve, reject) => {
  //     const workerBlob = new Blob([`
  //       self.onmessage = function(event) {
  //         importScripts('https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.0/lame.min.js');
          
  //         const { audioData } = event.data;
  //         if (!audioData || !audioData.channels || audioData.channels.length === 0) {
  //           self.postMessage(new Uint8Array([]));
  //           return;
  //         }
  
  //         try {
  //           const mp3Encoder = new lamejs.Mp3Encoder(audioData.channels.length, audioData.sampleRate, 128);
  //           const buffer = [];
  
  //           audioData.channels.forEach((channel, index) => {
  //             if (!channel || channel.length === 0) {
  //               console.error('Empty channel data:', index);
  //               return;
  //             }
  
  //             const samples = new Int16Array(channel.length);
  //             for (let i = 0; i < channel.length; i++) {
  //               samples[i] = Math.max(-1, Math.min(1, channel[i])) * 0x7FFF;
  //             }
  
  //             const mp3buf = mp3Encoder.encodeBuffer(samples);
  //             if (mp3buf.length > 0) {
  //               buffer.push(mp3buf);
  //             }
  //           });
  
  //           // Flush the encoder and push the final buffer
  //           const finalBuffer = mp3Encoder.flush();
  //           if (finalBuffer.length > 0) {
  //             buffer.push(finalBuffer);
  //           }
  
  //           self.postMessage(new Uint8Array(buffer.flat()));
  //         } catch (e) {
  //           console.error('Error encoding audio:', e);
  //           self.postMessage(new Uint8Array([]));
  //         }
  //       };
  //     `], { type: 'application/javascript' });
  
  //     const worker = new Worker(URL.createObjectURL(workerBlob));
  //     worker.onmessage = (event) => resolve(event.data);
  //     worker.onerror = (error) => reject(error);
  //     worker.postMessage({ audioData });
  //   });
  // }
  
  
  
  
}
