import { Component, ElementRef, Renderer2, ViewChildren, QueryList, ViewChild } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';

interface AudioFile {
  wavesurfer: WaveSurfer;
  isPlaying: boolean;
}

@Component({
  selector: 'app-multi-upload',
  templateUrl: './multi-upload.component.html',
  styleUrls: ['./multi-upload.component.scss']
})
export class MultiUploadComponent {
  @ViewChild('waveformContainer', { static: true }) waveformContainer!: ElementRef;

  audioFiles: AudioFile[] = [];

  constructor(private renderer: Renderer2) {}

  onFilesSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      Array.from(files).forEach((file, index) => {
        // Create a container div for the waveform and the button
        const containerDiv = this.renderer.createElement('div');
        this.renderer.addClass(containerDiv, 'audio-item');

        // Create a new waveform div dynamically
        const waveformDiv = this.renderer.createElement('div');
        this.renderer.setAttribute(waveformDiv, 'id', `waveform-${index}`);

        // Create a play/pause button
        const button = this.renderer.createElement('button');
        const buttonText = this.renderer.createText('Play');
        this.renderer.appendChild(button, buttonText);

        // Append the waveform div and button to the container
        this.renderer.appendChild(containerDiv, waveformDiv);
        this.renderer.appendChild(containerDiv, button);

        // Append the container to the waveformContainer
        this.renderer.appendChild(this.waveformContainer.nativeElement, containerDiv);

        // Initialize WaveSurfer with the new div container
        const wavesurfer = WaveSurfer.create({
          container: waveformDiv,
          waveColor: 'violet',
          progressColor: 'purple'
        });

        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
          wavesurfer.loadBlob(blob);
        };
        reader.readAsArrayBuffer(file);

        // Store the WaveSurfer instance and isPlaying state
        this.audioFiles.push({ wavesurfer, isPlaying: false });

        // Add click event listener to the button
        this.renderer.listen(button, 'click', () => this.togglePlayPause(index, button));
      });
    }
  }

  togglePlayPause(index: number, button: HTMLElement): void {
    const audioFile = this.audioFiles[index];
    if (audioFile.isPlaying) {
      audioFile.wavesurfer.pause();
      button.textContent = 'Play';
    } else {
      audioFile.wavesurfer.play();
      button.textContent = 'Pause';
    }
    audioFile.isPlaying = !audioFile.isPlaying;
  }
}
