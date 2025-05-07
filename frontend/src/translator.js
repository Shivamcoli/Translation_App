import { useState } from 'react';
import axios from 'axios';
import './translator.css';
import { languages } from './languages';

function Translator() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es'); // Use language code
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState(null); // Error state
  const [sourceLanguage, setSourceLanguage] = useState(''); // Source language for speech input

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      alert("Please enter some text to translate.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/translate', {
        text: inputText,
        target_language: targetLanguage.toLowerCase(),
      });
      
      setTranslatedText(response.data.translated_text);
      speakText(response.data.translated_text);  // Speak the translated text after translation
    } catch (error) {
      console.error('Error translating:', error);
      setError('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported by this browser.");
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = sourceLanguage || "en-US"; // Use source language for speech input
    recognition.interimResults = true; // Allow intermediate results for real-time feedback
    recognition.maxAlternatives = 1;
  
    recognition.start();
  
    recognition.onresult = function (event) {
      const speechToText = event.results[0][0].transcript;
      setInputText(speechToText); // Update the input text with speech result
    };
  
    recognition.onerror = function (event) {
      console.error("Speech recognition error: ", event.error);
    };
  
    recognition.onend = function () {
      console.log("Speech recognition service disconnected");
    };
  }

  const speakText = (text) => {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="translator-container">
      <h1 className="translator-title">Multilingual Translator</h1>

      {/* Textarea for user input */}
      <textarea
        className="input-text"
        rows="5"
        placeholder="Enter text to translate..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      {/* Row for Speak button and Language selection */}
      <div className="language-row">
        {/* Button to start speech-to-text */}
        <button
          className="voice-input-button"
          onClick={startSpeechRecognition}
          disabled={loading}  // Disable button while loading
        >
          🎤 Speak
        </button>

        {/* Select for source language */}
        <select
          className="language-select"
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
        >
          <option value="">Select Language</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Row for Translate button and target language selection */}
      <div className="action-row">
        {/* Translate Button */}
        <button
          className="translate-button"
          onClick={handleTranslate}
          disabled={loading}
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>

        {/* Select for target language */}
        <select
          className="target-language-select"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          <option value="">Select Language</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Translated text output */}
      {translatedText && (
        <div className="translated-text-container">
          <strong>Translated Text:</strong>
          <p className="translated-text">{translatedText}</p>
        </div>
      )}
    </div>
  );
}

export default Translator;
