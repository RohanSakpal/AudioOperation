import { Component } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline';
import Hover from 'wavesurfer.js/dist/plugins/hover';

@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.scss']
})
export class RegionComponent {
  wavesurfer!: WaveSurfer;
  regions = RegionsPlugin.create();
  activeRegion:any = null;
  loop:boolean = false;
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
      url: '../../assets/sample.mp3',
      plugins: [this.regions,this.bottomTimeline,this.hoverPlugin],
    });

    this.wavesurfer.on('decode', () => {
      this.regions.addRegion({
        start: 0,
        end: 30,
        //content: 'Resize me',
        color: this.randomColor(),
        drag: false,
        resize: true,
      });

      this.regions.addRegion({
        start: 50,
        end: 100,
        //content: 'Cramped region',
        color: this.randomColor(),
        minLength: 1,
        maxLength: 10,
      });

      this.regions.addRegion({
        start: 150,
        end: 200,
        content: 'Drag me',
        color: this.randomColor(),
        resize: false,
      });

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
      this.wavesurfer.play();
    }
  }
}
