import { Component } from '@angular/core';

@Component({
  selector: 'app-merge-multiple-file',
  templateUrl: './merge-multiple-file.component.html',
  styleUrls: ['./merge-multiple-file.component.scss']
})
export class MergeMultipleFileComponent {
  audioFiles: File[] = []; // Store selected audio files

onFilesSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
        this.audioFiles = Array.from(files);
    }
}

// Method to merge the audio files
async mergeAudioFiles(): Promise<void> {
    try {
        const audioContext = new AudioContext();
        const buffers = await Promise.all(
            this.audioFiles.map(file => this.decodeAudioFile(file, audioContext))
        );

        // Calculate the total length of the merged audio
        const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
        
        // Create an empty buffer with the total length
        const mergedBuffer = audioContext.createBuffer(
            buffers[0].numberOfChannels,
            totalLength,
            audioContext.sampleRate
        );

        // Copy the data from each buffer into the merged buffer
        let offset = 0;
        buffers.forEach(buffer => {
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                mergedBuffer.getChannelData(channel).set(buffer.getChannelData(channel), offset);
            }
            offset += buffer.length;
        });

        // Convert the merged buffer to a Blob and download it
        this.exportAsAudio(mergedBuffer, audioContext);
    } catch (error) {
        console.error('Error merging audio files:', error);
    }
}

// Decode each audio file
decodeAudioFile(file: File, audioContext: AudioContext): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = () => {
            audioContext.decodeAudioData(reader.result as ArrayBuffer, resolve, reject);
        };

        reader.onerror = (error) => reject(error);
    });
}   

// Export the merged audio buffer as a downloadable file
exportAsAudio(mergedBuffer: AudioBuffer, audioContext: AudioContext): void {
    // Create an offline audio context to render the merged buffer
    const offlineContext = new OfflineAudioContext(
        mergedBuffer.numberOfChannels,
        mergedBuffer.length,
        mergedBuffer.sampleRate
    );

    // Create a buffer source node for playback
    const bufferSource = offlineContext.createBufferSource();
    bufferSource.buffer = mergedBuffer;
    bufferSource.connect(offlineContext.destination);
    bufferSource.start();

    // Render the merged audio buffer to a WAV file
    offlineContext.startRendering().then(renderedBuffer => {
        const wavBlob = this.bufferToWave(renderedBuffer);
        const url = URL.createObjectURL(wavBlob);

        // Create a download link and click it

        // const a = document.createElement('a');
        // a.style.display = 'none';
        // a.href = url;
        // a.download = 'merged-audio.wav';
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);

        //audio Format
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = url;

        // Optionally, append the audio element to a specific container in your HTML
        const container = document.getElementById('audioContainer'); // Make sure this element exists in your HTML
        if (container) {
            container.innerHTML = ''; // Clear any previous audio elements
            container.appendChild(audioElement);
        }
    });
}

// Convert the audio buffer to a WAV Blob
bufferToWave(audioBuffer: AudioBuffer): Blob {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    writeString(view, pos, 'RIFF'); pos += 4;
    view.setUint32(pos, length - 8, true); pos += 4;
    writeString(view, pos, 'WAVE'); pos += 4;
    writeString(view, pos, 'fmt '); pos += 4;
    view.setUint32(pos, 16, true); pos += 4;
    view.setUint16(pos, 1, true); pos += 2;
    view.setUint16(pos, numberOfChannels, true); pos += 2;
    view.setUint32(pos, audioBuffer.sampleRate, true); pos += 4;
    view.setUint32(pos, audioBuffer.sampleRate * 4, true); pos += 4;
    view.setUint16(pos, numberOfChannels * 2, true); pos += 2;
    view.setUint16(pos, 16, true); pos += 2;
    writeString(view, pos, 'data'); pos += 4;
    view.setUint32(pos, length - pos - 4, true); pos += 4;

    // Interleave audio channels
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < length) {
        for (let i = 0; i < numberOfChannels; i++) {
            const sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            pos += 2;
        }
        offset++;
    }

    //return new Blob([buffer], { type: 'audio/wav' });
    return new Blob([buffer], { type: 'audio/mp3' });

    function writeString(view: DataView, offset: number, string: string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

}
