/* =========================================================
   mode-listen.js — 聽音選圖遊戲
   播放單字發音，小朋友從 4 個 (emoji+英文) 選項中選出正確的。
   ========================================================= */

const ListenGame = (() => {
  const QN = 10;                 // 一輪題數
  let cat = null, questions = [], qi = 0, score = 0;

  function pickDistractors(correct, pool, n) {
    let others = shuffle(pool.filter(w => w.id !== correct.id));
    if (others.length < n) {     // 池子太小則從全部單字補
      others = others.concat(shuffle(WORDS.filter(
        w => w.id !== correct.id && !pool.some(p => p.id === w.id))));
    }
    return others.slice(0, n);
  }

  function start(catId) {
    cat = getCategory(catId);
    const pool = wordsByCategory(catId);
    const n = Math.min(QN, pool.length);
    questions = shuffle(pool).slice(0, n).map(correct => ({
      correct,
      options: shuffle([correct, ...pickDistractors(correct, pool, 3)]),
    }));
    qi = 0; score = 0;
    renderQuestion();
  }

  function renderQuestion() {
    if (qi >= questions.length) return renderResult();
    const q = questions[qi];
    const pct = Math.round((qi / questions.length) * 100);

    const optHtml = q.options.map(w => {
      const numClass = UI.isNumberGlyph(w) ? 'is-number' : '';
      return `<button class="option-btn" data-id="${w.id}">
                <span class="opt-emoji ${numClass}">${w.emoji}</span>
                <span>${UI.escapeHtml(w.en)}</span>
              </button>`;
    }).join('');

    const html = `
      <button class="ghost-btn primary-btn" id="quit">‹ 返回</button>
      <div class="game-head">
        <div class="view-title" style="margin:0">🎧 聽音選圖</div>
        <div class="game-score">⭐ ${score}</div>
      </div>
      <div class="game-progressbar"><i style="width:${pct}%"></i></div>
      <div class="view-sub">第 ${qi + 1} / ${questions.length} 題　聽聽看是哪一個？</div>

      <div class="game-prompt">
        <button class="big-speak" id="playBtn"><span class="big">🔊</span> 播放</button>
      </div>
      <div class="options-grid">${optHtml}</div>
      <div class="feedback" id="feedback"></div>`;

    const root = App.mount(html);
    root.querySelector('#quit').onclick = () => App.openCategory(cat.id);

    const play = () => Speech.speak(q.correct.en);
    root.querySelector('#playBtn').onclick = play;
    play(); // 進題自動播放

    root.querySelectorAll('.option-btn').forEach(btn => {
      btn.onclick = () => answer(btn, q, root);
    });
  }

  function answer(btn, q, root) {
    const chosenId = Number(btn.dataset.id);
    const buttons = root.querySelectorAll('.option-btn');
    buttons.forEach(b => b.classList.add('disabled'));
    const fb = root.querySelector('#feedback');

    if (chosenId === q.correct.id) {
      btn.classList.add('correct');
      score++;
      Progress.addStars(1);
      Progress.markLearned(q.correct.id);
      App.refreshStars();
      UI.celebrate('🎉');
      fb.textContent = '答對了！ ⭐';
      fb.className = 'feedback ok';
    } else {
      btn.classList.add('wrong');
      buttons.forEach(b => { if (Number(b.dataset.id) === q.correct.id) b.classList.add('correct'); });
      fb.textContent = `這是 ${q.correct.en} ${q.correct.zh}`;
      fb.className = 'feedback no';
      Speech.speak(q.correct.en);
    }
    setTimeout(() => { qi++; renderQuestion(); }, 1400);
  }

  function renderResult() {
    App.renderGameResult({
      title: '聽力挑戰完成！',
      score, total: questions.length,
      onReplay: () => start(cat.id),
      backCat: cat.id,
    });
  }

  return { start };
})();
