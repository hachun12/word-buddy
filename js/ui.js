/* =========================================================
   ui.js — 共用 UI 工具
     - 把例句渲染成「可點擊查詢」的文字
     - 單字彈出小視窗 (發音 + 中文)
     - 答對彩帶特效
   ========================================================= */

const UI = (() => {

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  // 去掉單字前後的標點，保留字母、數字、撇號、連字號
  function cleanWord(w) {
    return w.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, '');
  }

  // 嘗試把一個 (可能含複數) 詞對到單字資料
  function matchWord(phrase) {
    const p = phrase.toLowerCase();
    if (WORD_LOOKUP[p]) return WORD_LOOKUP[p];
    if (p.endsWith('es') && WORD_LOOKUP[p.slice(0, -2)]) return WORD_LOOKUP[p.slice(0, -2)];
    if (p.endsWith('s') && WORD_LOOKUP[p.slice(0, -1)]) return WORD_LOOKUP[p.slice(0, -1)];
    return null;
  }

  /* 把例句轉成 HTML，句中屬於 300 單字的詞會變成可點擊 span。
     支援多字片語 (hot dog / ice cream / in front of ...)。 */
  function renderSentence(sentence) {
    const tokens = sentence.split(/\s+/);
    let html = '';
    let i = 0;
    while (i < tokens.length) {
      let hit = null;
      for (let len = 3; len >= 1; len--) {           // 先試最長片語
        if (i + len <= tokens.length) {
          const phrase = tokens.slice(i, i + len).map(cleanWord).join(' ');
          const w = matchWord(phrase);
          if (w) { hit = { len, word: w }; break; }
        }
      }
      if (hit) {
        const display = tokens.slice(i, i + hit.len).join(' ');
        html += `<span class="clickable-word" data-en="${escapeHtml(hit.word.en)}">${escapeHtml(display)}</span> `;
        i += hit.len;
      } else {
        html += escapeHtml(tokens[i]) + ' ';
        i++;
      }
    }
    return html.trim();
  }

  // 數字類的 emoji 其實是數字字串，需要特別放大顯示
  function isNumberGlyph(word) { return word.cat === 'numbers'; }

  /* ---------- 單字彈出視窗 ---------- */
  const popup = () => document.getElementById('wordPopup');

  function showWordPopup(word) {
    Speech.speak(word.en);
    const numClass = isNumberGlyph(word) ? 'is-number' : '';
    const el = popup();
    el.innerHTML = `
      <div class="popup-card">
        <div class="p-emoji ${numClass}">${word.emoji}</div>
        <div class="p-en">${escapeHtml(word.en)}</div>
        <div class="p-zh">${escapeHtml(word.zh)}</div>
        <div class="p-actions">
          <button class="round-btn speak-btn" id="popupSpeak" aria-label="再唸一次">🔊</button>
          <button class="primary-btn" id="popupClose">好</button>
        </div>
      </div>`;
    el.classList.remove('hidden');
    el.querySelector('#popupSpeak').onclick = (e) => { e.stopPropagation(); Speech.speak(word.en); };
    el.querySelector('#popupClose').onclick = closePopup;
    el.onclick = (e) => { if (e.target === el) closePopup(); };
  }

  function closePopup() { popup().classList.add('hidden'); popup().innerHTML = ''; }

  /* ---------- 答對彩帶 ---------- */
  function celebrate(emoji = '🎉') {
    const c = document.createElement('div');
    c.className = 'confetti-burst';
    c.textContent = emoji;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1000);
  }

  // 全域委派：點擊例句中的單字
  document.addEventListener('click', (e) => {
    const span = e.target.closest('.clickable-word');
    if (span) {
      const w = WORD_LOOKUP[span.dataset.en.toLowerCase()];
      if (w) showWordPopup(w);
    }
  });

  return { renderSentence, showWordPopup, closePopup, celebrate, escapeHtml, isNumberGlyph };
})();
