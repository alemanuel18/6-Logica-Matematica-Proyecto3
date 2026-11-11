import { getVoiceConfig, requestSpeech } from '../../../repositories/httpClient.js';
import { useEffect, useRef, useState } from 'react';
import { explanationToSpeech, formulaToSpeech } from '../services/speechText.js';

const INTRO_TEXT =
  'Soy tu guía de lógica matemática. Puedes escuchar una introducción o pedirme que lea la explicación de tu resultado.';

function explanationText(result, formula, environment) {
  const outcome = result.truth ? 'verdadera' : 'falsa';
  const assignments = result.freeVariables
    .map((name) => `${name} es igual a ${environment[name]}`)
    .join(' y ');
  const context = assignments ? ` Con el entorno, ${assignments}.` : '';
  return `La fórmula ${formulaToSpeech(formula)} es ${outcome}.${context} ${explanationToSpeech(result.explanation.reason)}`;
}

export function VoiceGuide({ result, formula, environment }) {
  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  const [cloudAvailable, setCloudAvailable] = useState(false);
  const [configuring, setConfiguring] = useState(true);
  const [provider, setProvider] = useState('device');
  const [error, setError] = useState('');
  const playback = useRef({ controller: null, audio: null, url: null });

  const releasePlayback = () => {
    const current = playback.current;
    current.controller?.abort();
    if (current.audio) {
      current.audio.onended = null;
      current.audio.onerror = null;
      current.audio.pause();
      current.audio.removeAttribute('src');
    }
    if (current.url) URL.revokeObjectURL(current.url);
    playback.current = { controller: null, audio: null, url: null };
  };

  useEffect(() => {
    const controller = new AbortController();
    getVoiceConfig(controller.signal)
      .then(({ available }) => {
        if (controller.signal.aborted) return;
        setCloudAvailable(available);
        setProvider(available ? 'elevenlabs' : 'device');
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setConfiguring(false);
      });
    return () => {
      controller.abort();
      releasePlayback();
    };
  }, []);

  useEffect(() => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const available = synth
        .getVoices()
        .filter((voice) => voice.lang.toLowerCase().startsWith('es'));
      setVoices(available);
      setSupported(true);
      setVoiceURI((current) => current || available[0]?.voiceURI || '');
    };
    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);
    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
      synth.cancel();
    };
  }, []);

  const speak = async (text) => {
    setError('');
    if (provider === 'elevenlabs') {
      releasePlayback();
      window.speechSynthesis?.cancel();
      const controller = new AbortController();
      playback.current.controller = controller;
      setSpeaking(true);
      try {
        const blob = await requestSpeech(text, controller.signal);
        if (controller.signal.aborted) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        playback.current = { controller, audio, url };
        audio.onended = () => {
          releasePlayback();
          setSpeaking(false);
        };
        audio.onerror = () => {
          releasePlayback();
          setSpeaking(false);
          setError('No se pudo reproducir el audio.');
        };
        await audio.play();
      } catch (failure) {
        if (controller.signal.aborted) return;
        releasePlayback();
        setSpeaking(false);
        setError(failure.message || 'No se pudo reproducir la voz.');
      }
      return;
    }
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'es';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.voice = voices.find((voice) => voice.voiceURI === voiceURI) ?? null;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
  };

  const stop = () => {
    releasePlayback();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <section className="voice-guide" aria-label="Guía de voz">
      <div className="voice-guide-copy">
        <span className="eyebrow">GUÍA DE VOZ</span>
        <p>
          Escucha una introducción o la explicación del resultado con una voz disponible en tu
          dispositivo o con la voz configurada en ElevenLabs.
        </p>
      </div>
      <div className="voice-guide-controls">
        <label className="voice-select-label">
          Servicio de voz
          <select
            value={provider}
            disabled={configuring}
            onChange={(event) => {
              stop();
              setError('');
              setProvider(event.target.value);
            }}
          >
            <option value="device">Voces del dispositivo</option>
            <option value="elevenlabs" disabled={!cloudAvailable}>
              ElevenLabs · voz personalizada / clonada
            </option>
          </select>
        </label>
        {provider === 'device' && (
          <label className="voice-select-label">
            Voz
            <select
              aria-label="Voz del guía"
              value={voiceURI}
              onChange={(event) => setVoiceURI(event.target.value)}
              disabled={provider !== 'device' || !supported || voices.length === 0}
            >
              {voices.length === 0 ? (
                <option value="">Voz predeterminada del dispositivo</option>
              ) : (
                voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} · {voice.lang}
                  </option>
                ))
              )}
            </select>
          </label>
        )}
        <div className="voice-guide-buttons">
          <button
            className="secondary compact"
            type="button"
            onClick={() => speak(INTRO_TEXT)}
            disabled={
              configuring || (provider === 'device' ? !supported : !cloudAvailable) || speaking
            }
          >
            Escuchar introducción
          </button>
          {result && (
            <button
              className="secondary compact"
              type="button"
              onClick={() => speak(explanationText(result, formula, environment))}
              disabled={
                configuring || (provider === 'device' ? !supported : !cloudAvailable) || speaking
              }
            >
              Escuchar explicación
            </button>
          )}
          <button className="voice-stop compact" type="button" onClick={stop} disabled={!speaking}>
            Detener voz
          </button>
        </div>
      </div>
      {configuring && (
        <p className="syntax-note" role="status">
          Preparando la guía de voz…
        </p>
      )}
      {!configuring && provider === 'elevenlabs' && (
        <p className="syntax-note" role="status">
          Se usará la voz personalizada configurada en ElevenLabs.
        </p>
      )}
      {error && (
        <p className="syntax-note" role="alert">
          {error}
        </p>
      )}
      {!supported && provider === 'device' && (
        <p className="syntax-note" role="status">
          La síntesis de voz no está disponible en este navegador.
        </p>
      )}
      {provider === 'device' && supported && voices.length === 0 && (
        <p className="syntax-note" role="status">
          Se usará la voz predeterminada del dispositivo. Puedes instalar o activar voces desde la
          configuración del sistema.
        </p>
      )}
    </section>
  );
}
