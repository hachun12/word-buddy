/* =========================================================
   speech.js — 發音模組
   使用瀏覽器內建 Web Speech API (SpeechSynthesis)，
   免費、免金鑰、免後端。挑選英語 (en-US/en-GB) 的語音。
   ========================================================= */

const Speech = (() => {
  let voices = [];
  let enVoice = null;
  const supported = 'speechSynthesis' in window;

  function pickVoice() {
    voices = window.speechSynthesis.getVoices();
    // 優先挑選較自然的英語語音
    const prefer = [
      'Google US English', 'Microsoft Zira', 'Microsoft Aria',
      'Samantha', 'Karen', 'Daniel',
    ];
    enVoice =
      voices.find(v => prefer.includes(v.name)) ||
      voices.find(v => /^en[-_]US/i.test(v.lang)) ||
      voices.find(v => /^en/i.test(v.lang)) ||
      null;
  }

  if (supported) {
    pickVoice();
    // 語音清單常為非同步載入
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  /**
   * 唸出一段英文文字
   * @param {string} text
   * @param {object} opts { rate, pitch, onend }
   */
  function speak(text, opts = {}) {
    if (!supported) {
      console.warn('此瀏覽器不支援語音合成');
      if (opts.onend) opts.onend();
      return;
    }
    window.speechSynthesis.cancel(); // 停掉前一句，避免疊字
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    if (enVoice) u.voice = enVoice;
    u.rate = opts.rate != null ? opts.rate : 0.85; // 稍慢，適合孩童
    u.pitch = opts.pitch != null ? opts.pitch : 1.05;
    u.volume = 1;
    if (opts.onend) u.onend = opts.onend;
    window.speechSynthesis.speak(u);
  }

  return { speak, isSupported: () => supported };
})();
