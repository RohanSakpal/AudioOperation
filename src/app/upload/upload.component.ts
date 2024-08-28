import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @ViewChild('waveformContainer', { static: true }) waveformContainer!: ElementRef;

  wavesurfer!: WaveSurfer;

  constructor(private renderer: Renderer2) {}

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Create a new waveform div dynamically
      const waveformDiv = this.renderer.createElement('div');
      this.renderer.setAttribute(waveformDiv, 'id', 'waveform');
      this.renderer.appendChild(this.waveformContainer.nativeElement, waveformDiv);

      // Initialize WaveSurfer with the new div container
      this.wavesurfer = WaveSurfer.create({
        container: waveformDiv,
        waveColor: 'violet',
        progressColor: 'purple'
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

  playAudio(): void {
    if (this.wavesurfer) {
      this.wavesurfer.play();
    }
  }
}
