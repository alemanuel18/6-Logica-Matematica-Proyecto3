import { useEffect, useState } from 'react';
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

  const speak = (text) => {
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
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <section className="voice-guide" aria-label="Guía de voz">
      <div className="voice-guide-copy">
        <span className="eyebrow">GUÍA DE VOZ</span>
        <p>
          Escucha una introducción o la explicación del resultado con una voz disponible en tu
          dispositivo.
        </p>
      </div>
      <div className="voice-guide-controls">
        <label className="voice-select-label">
          Voz
          <select
            aria-label="Voz del guía"
            value={voiceURI}
            onChange={(event) => setVoiceURI(event.target.value)}
            disabled={!supported || voices.length === 0}
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
        <div className="voice-guide-buttons">
          <button
            className="secondary compact"
            type="button"
            onClick={() => speak(INTRO_TEXT)}
            disabled={!supported || speaking}
          >
            Escuchar introducción
          </button>
          {result && (
            <button
              className="secondary compact"
              type="button"
              onClick={() => speak(explanationText(result, formula, environment))}
              disabled={!supported || speaking}
            >
              Escuchar explicación
            </button>
          )}
          <button className="voice-stop compact" type="button" onClick={stop} disabled={!speaking}>
            Detener voz
          </button>
        </div>
      </div>
      {!supported && (
        <p className="syntax-note" role="status">
          La síntesis de voz no está disponible en este navegador.
        </p>
      )}
      {supported && voices.length === 0 && (
        <p className="syntax-note" role="status">
          Se usará la voz predeterminada del dispositivo. Puedes instalar o activar voces desde la
          configuración del sistema.
        </p>
      )}
    </section>
  );
}
