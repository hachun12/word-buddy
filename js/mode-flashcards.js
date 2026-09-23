/* =========================================================
   mode-flashcards.js — 單字卡模式
   翻卡：正面 emoji + 英文 (可發音)；背面 中文 + 可點擊例句。
   ========================================================= */

const Flashcards = (() => {
  let words = [];
  let idx = 0;
  let flipped = false;
  let cat = null;

  function start(catId) {
    cat = CATEGORIES.find(c => c.id === catId);
    words = wordsByCategory(catId);
    idx = 0;
    flipped = false;
    render();
  }

  function render() {
    const w = words[idx];
    Progress.markLearned(w.id);        // 看過即算學過
    const numClass = UI.isNumberGlyph(w) ? 'is-number' : '';

    const html = `
      <button class="ghost-btn primary-btn" id="backToCat">‹ 返回</button>
      <div class="view-title" style="color:${cat.color}">${cat.emoji} ${cat.name} <span style="color:var(--muted);font-size:1rem">${cat.zh}</span></div>
      <div class="flash-wrap" style="--cat-color:${cat.color}">
        <div class="flash-progress">${idx + 1} / ${words.length}</div>

        <div class="flashcard ${flipped ? 'flipped' : ''}" id="card">
          <div class="flashcard-inner">
            <div class="flash-face flash-front">
              <div class="fc-emoji ${numClass}">${w.emoji}</div>
              <div class="fc-en">${UI.escapeHtml(w.en)}</div>
              <div class="fc-hint">👆 點卡片看中文</div>
            </div>
            <div class="flash-face flash-back">
              <div class="fc-emoji-sm ${numClass}">${w.emoji}</div>
              <div class="fc-en2">${UI.escapeHtml(w.en)}</div>
              <div class="fc-zh">${UI.escapeHtml(w.zh)}</div>
              <div class="sentence-label">📖 例句 (點單字可查詢)</div>
              <div class="fc-sentence">${UI.renderSentence(w.sentence)}</div>
              <button class="sentence-speak" id="sentenceSpeak">🔊 朗讀例句</button>
            </div>
          </div>
        </div>

        <div class="flash-controls">
          <button class="round-btn" id="prevBtn" ${idx === 0 ? 'disabled' : ''} aria-label="上一個">◀</button>
          <button class="round-btn speak-btn" id="speakBtn" aria-label="發音">🔊</button>
          <button class="round-btn" id="nextBtn" ${idx === words.length - 1 ? 'disabled' : ''} aria-label="下一個">▶</button>
        </div>
      </div>`;

    const root = App.mount(html);

    root.querySelector('#backToCat').onclick = () => App.openCategory(cat.id);

    const card = root.querySelector('#card');
    // 點卡片翻面，但點到例句單字或朗讀鈕時不要翻
    card.onclick = (e) => {
      if (e.target.closest('.clickable-word') || e.target.closest('#sentenceSpeak')) return;
      flipped = !flipped;
      card.classList.toggle('flipped', flipped);
    };

    // 朗讀整句例句
    const sentenceSpeak = root.querySelector('#sentenceSpeak');
    sentenceSpeak.onclick = (e) => {
      e.stopPropagation();
      sentenceSpeak.classList.add('speaking');
      Speech.speak(w.sentence, { rate: 0.8, onend: () => sentenceSpeak.classList.remove('speaking') });
    };

    const speakBtn = root.querySelector('#speakBtn');
    speakBtn.onclick = (e) => {
      e.stopPropagation();
      speakBtn.classList.add('speaking');
      Speech.speak(w.en, { onend: () => speakBtn.classList.remove('speaking') });
    };

    root.querySelector('#prevBtn').onclick = () => { if (idx > 0) { idx--; flipped = false; render(); } };
    root.querySelector('#nextBtn').onclick = () => { if (idx < words.length - 1) { idx++; flipped = false; render(); } };

    // 進卡自動發音一次
    Speech.speak(w.en);
  }

  return { start };
})();
