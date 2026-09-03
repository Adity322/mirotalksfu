'use strict';
class VolumeProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.silenceThreshold = 0.01;
        this.lastVolume = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || input.length === 0) {
            if (this.lastVolume > 0) {
                this.lastVolume = 0;
                this.port.postMessage({ type: 'volumeIndicator', volume: 0 });
            }
            return true;
        }

        const inputData = input[0];
        if (!inputData || inputData.length === 0) {
            if (this.lastVolume > 0) {
                this.lastVolume = 0;
                this.port.postMessage({ type: 'volumeIndicator', volume: 0 });
            }
            return true;
        }

        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
        }

        const rms = Math.sqrt(sum / inputData.length);
        const volume = Math.max(0, Math.min(1, rms * 10));

        if (volume > this.silenceThreshold || this.lastVolume > 0) {
            this.lastVolume = volume > this.silenceThreshold ? volume : 0;
            this.port.postMessage({
                type: 'volumeIndicator',
                volume: this.lastVolume,
            });
        }

        return true;
    }
}

registerProcessor('volume-processor', VolumeProcessor);
