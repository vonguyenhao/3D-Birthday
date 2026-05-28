import { useRef, useState } from 'react';
import { Music2, Pause, VolumeX } from 'lucide-react';

const configuredMusicUrl = import.meta.env.VITE_BACKGROUND_MUSIC_URL?.trim();
const musicSource = configuredMusicUrl || '/audio/background-music.mp3';

function MusicControl() {
  const audioRef = useRef(null);
  const [musicState, setMusicState] = useState('idle');

  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio || musicState === 'unavailable') {
      return;
    }

    if (!audio.paused) {
      audio.pause();
      setMusicState('idle');
      return;
    }

    try {
      await audio.play();
      setMusicState('playing');
    } catch {
      setMusicState('unavailable');
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={musicSource}
        loop
        preload="none"
        onError={() => setMusicState('unavailable')}
      />
      <button
        className="glass-button"
        type="button"
        onClick={toggleMusic}
        disabled={musicState === 'unavailable'}
        aria-label={
          musicState === 'playing'
            ? 'Pause background music'
            : musicState === 'unavailable'
              ? 'Background music unavailable'
              : 'Play background music'
        }
      >
        {musicState === 'playing' ? <Pause size={18} aria-hidden="true" /> : null}
        {musicState === 'idle' ? <Music2 size={18} aria-hidden="true" /> : null}
        {musicState === 'unavailable' ? <VolumeX size={18} aria-hidden="true" /> : null}
        <span>{musicState === 'playing' ? 'Pause music' : musicState === 'unavailable' ? 'No music file' : 'Play music'}</span>
      </button>
    </>
  );
}

export default MusicControl;
