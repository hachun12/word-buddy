/* =========================================================
   mode-quiz.js — 看圖選字遊戲
   顯示 emoji 圖示，小朋友從 4 個英文選項中選出正確單字。
   ========================================================= */

const QuizGame = (() => {
  const QN = 10;
  let cat = null, questions = [], qi = 0, score = 0;

  function pickDistractors(correct, pool, n) {
    let others = shuffle(pool.filter(w => w.id !== correct.id));
    if (others.length < n) {
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
    const numClass = UI.isNumberGlyph(q.correct) ? 'is-number' : '';

    const optHtml = q.options.map(w =>
      `<button class="option-btn" data-id="${w.id}">${UI.escapeHtml(w.en)}</button>`
    ).join('');

    const html = `
      <button class="ghost-btn primary-btn" id="quit">‹ 返回</button>
      <div class="game-head">
        <div class="view-title" style="margin:0">🔤 看圖選字</div>
        <div class="game-score">⭐ ${score}</div>
      </div>
      <div class="game-progressbar"><i style="width:${pct}%"></i></div>
      <div class="view-sub">第 ${qi + 1} / ${questions.length} 題　這是哪一個單字？</div>

      <div class="game-prompt">
        <div class="prompt-emoji ${numClass}">${q.correct.emoji}</div>
        <div class="fc-zh" style="color:var(--brand-dark);font-weight:700">${UI.escapeHtml(q.correct.zh)}</div>
      </div>
      <div class="options-grid">${optHtml}</div>
      <div class="feedback" id="feedback"></div>`;

    const root = App.mount(html);
    root.querySelector('#quit').onclick = () => App.openCategory(cat.id);

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
      UI.celebrate('🌟');
      fb.textContent = '答對了！ ⭐';
      fb.className = 'feedback ok';
      Speech.speak(q.correct.en);
    } else {
      btn.classList.add('wrong');
      buttons.forEach(b => { if (Number(b.dataset.id) === q.correct.id) b.classList.add('correct'); });
      fb.textContent = `正確答案是 ${q.correct.en}`;
      fb.className = 'feedback no';
      Speech.speak(q.correct.en);
    }
    setTimeout(() => { qi++; renderQuestion(); }, 1400);
  }

  function renderResult() {
    App.renderGameResult({
      title: '拼字挑戰完成！',
      score, total: questions.length,
      onReplay: () => start(cat.id),
      backCat: cat.id,
    });
  }

  return { start };
})();
