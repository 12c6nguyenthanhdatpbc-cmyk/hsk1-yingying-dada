export interface AudioPlaybackResult {
  source: 'audio_file' | 'browser_tts' | 'unavailable';
  message?: string;
}

let activeAudio: HTMLAudioElement | null = null;

export function stopAllAudio(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function playChineseAudio(
  text: string,
  audioFile?: string,
  rate = 0.95
): Promise<AudioPlaybackResult> {
  stopAllAudio();

  if (audioFile) {
    try {
      const audio = new Audio(audioFile);
      audio.playbackRate = rate;
      activeAudio = audio;
      await audio.play();
      return { source: 'audio_file' };
    } catch {
      // Fallback sang SpeechSynthesis nếu tệp âm thanh chưa được tải lên
    }
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return new Promise((resolve) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = rate;
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find((v) => v.lang.toLowerCase().startsWith('zh'));
      if (zhVoice) utter.voice = zhVoice;
      utter.onend = () => resolve({ source: 'browser_tts', message: 'Phát bằng giọng đọc trình duyệt (dự phòng).' });
      utter.onerror = () => resolve({ source: 'unavailable', message: 'Trình duyệt không hỗ trợ phát âm tiếng Trung.' });
      window.speechSynthesis.speak(utter);
    });
  }

  return { source: 'unavailable', message: 'Không tìm thấy tệp âm thanh hoặc trình đọc giọng nói.' };
}
