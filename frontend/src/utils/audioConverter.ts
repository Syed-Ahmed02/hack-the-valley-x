/**
 * Converts audio blob to WAV format that Azure Speech SDK can process
 * Azure expects: PCM 16-bit, 16kHz, mono
 */
export async function convertToWav(audioBlob: Blob): Promise<ArrayBuffer> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 16000
  });

  try {
    // Read the blob as array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get the PCM data (mono channel)
    const channelData = audioBuffer.getChannelData(0);
    
    // Convert float32 to int16
    const pcmData = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Create WAV file
    const wavBuffer = createWavFile(pcmData, 16000);
    
    await audioContext.close();
    
    return wavBuffer;
  } catch (error) {
    await audioContext.close();
    throw error;
  }
}

/**
 * Creates a WAV file from PCM data
 */
function createWavFile(pcmData: Int16Array, sampleRate: number): ArrayBuffer {
  const dataLength = pcmData.length * 2; // 2 bytes per sample
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  // WAV file header
  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM = 16
  view.setUint16(20, 1, true); // Audio format = 1 (PCM)
  view.setUint16(22, 1, true); // Number of channels = 1 (mono)
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM data
  const offset = 44;
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(offset + i * 2, pcmData[i], true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
