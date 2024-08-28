import { Component } from '@angular/core';
import WaveSurfer from 'wavesurfer.js'

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent {
  private wavesurfer!: WaveSurfer;
  slider = document.querySelector('input[type="range"]');
  zoomValue:number = 100;
  speedValue:number = 2;
  preserveValue:boolean = true;

  ngAfterViewInit() {
    this.wavesurfer = WaveSurfer.create({
      container: document.body,
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
    })

    /** When audio starts loading */
    this.wavesurfer.on('load', (url) => {
      console.log('Load', url)
    });

    /** During audio loading */
    this.wavesurfer.on('loading', (percent) => {
      console.log('Loading', percent + '%')
    });

    /** When the audio has been decoded */
    this.wavesurfer.on('decode', (duration) => {
      console.log('Decode', duration + 's')
    });

    /** When the audio is both decoded and can play */
    this.wavesurfer.on('ready', (duration) => {
      console.log('Ready', duration + 's')
    });

    /** When all audio channel chunks of the waveform have drawn */
    this.wavesurfer.on('redrawcomplete', () => {
      console.log('Redraw complete')
    });

    /** When the audio starts playing */
    this.wavesurfer.on('play', () => {
      console.log('Play')
    });

    this.wavesurfer.on('pause', () => {
      console.log('Pause');
    });

    /** When the audio finishes playing */
    this.wavesurfer.on('finish', () => {
      console.log('Finish');
    });

    /** On audio position change, fires continuously during playback */
    this.wavesurfer.on('timeupdate', (currentTime) => {
      //console.log('Time', currentTime + 's')
    })

    /** When the user seeks to a new position */
    this.wavesurfer.on('seeking', (currentTime) => {
      console.log('Seeking', currentTime + 's')
    })

    /** When the user interacts with the waveform (i.g. clicks or drags on it) */
    this.wavesurfer.on('interaction', (newTime) => {
      console.log('Interaction', newTime + 's')
    })

    /** When the user clicks on the waveform */
    this.wavesurfer.on('click', (relativeX) => {
      console.log('Click', relativeX)
    })

    /** When the user drags the cursor */
    this.wavesurfer.on('drag', (relativeX) => {
      console.log('Drag', relativeX)
    });

    /** When the waveform is scrolled (panned) */
    this.wavesurfer.on('scroll', (visibleStartTime, visibleEndTime) => {
      console.log('Scroll', visibleStartTime + 's', visibleEndTime + 's')
    });
    
    /** When the zoom level changes */
    this.wavesurfer.on('zoom', (minPxPerSec) => {
      console.log('Zoom', minPxPerSec + 'px/s')
    });

    /** Just before the waveform is destroyed so you can clean up your events */
    this.wavesurfer.on('destroy', () => {
      console.log('Destroy')
    });

    this.wavesurfer.load('../../assets/sample.mp3');
  }

  playPause() {
    this.wavesurfer.playPause()
  }

  onZoomChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const zmVal = Number(inputElement.value);
    this.wavesurfer.zoom(zmVal);
  }

  onPreservChange(): void {
    this.wavesurfer.setPlaybackRate(this.wavesurfer.getPlaybackRate(), this.preserveValue)
  }

  onSpeedChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const speedVal = Number(inputElement.value);
    this.wavesurfer.setPlaybackRate(speedVal,  this.preserveValue)
  }

  forward() {
    this.wavesurfer.skip(5);
  }

  backward() {
    this.wavesurfer.skip(-5);
  }
}
