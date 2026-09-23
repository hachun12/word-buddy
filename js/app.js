/* =========================================================
   app.js — 主控 / 路由 / 首頁
   ========================================================= */

const App = (() => {
  const appEl = () => document.getElementById('app');

  // 把 HTML 放進主容器，捲回頂端，回傳容器方便後續 wiring
  function mount(html) {
    const el = appEl();
    el.innerHTML = html;
    window.scrollTo(0, 0);
    UI.closePopup();
    return el;
  }

  function refreshStars() {
    document.getElementById('starNum').textContent = Progress.getStars();
  }

  /* ---------- 首頁 ---------- */
  function goHome() {
    const total = WORDS.length;
    const learned = Progress.learnedCount();
    const pct = Math.round((learned / total) * 100);

    const cards = CATEGORIES.map(c => {
      const all = wordsByCategory(c.id).length;
      const done = Progress.learnedInCategory(c.id);
      const p = all ? Math.round((done / all) * 100) : 0;
      return `
        <button class="cat-card" data-cat="${c.id}" style="--cat-color:${c.color}">
          <div class="cat-emoji">${c.emoji}</div>
          <div class="cat-name">${c.name}</div>
          <div class="cat-zh">${c.zh}</div>
          <div class="cat-prog"><i style="width:${p}%"></i></div>
          <div class="cat-count">${done} / ${all}</div>
        </button>`;
    }).join('');

    const html = `
      <div class="hero">
        <h1>👋 嗨！一起學單字吧</h1>
        <p>國小必學 300 單字 · 看圖 · 發音 · 例句 · 玩遊戲</p>
        <div class="hero-stats">
          <div class="stat-pill">已學會單字 <b>${learned} / ${total}</b></div>
          <div class="stat-pill">收集星星 <b>⭐ ${Progress.getStars()}</b></div>
          <div class="stat-pill">完成度 <b>${pct}%</b></div>
        </div>
      </div>

      <div class="section-label">🎮 混合大挑戰</div>
      <div class="challenge-row">
        <button class="challenge-btn challenge-listen" id="mixListen">
          <span class="big">🎧</span> 聽音選圖
        </button>
        <button class="challenge-btn challenge-quiz" id="mixQuiz">
          <span class="big">🔤</span> 看圖選字
        </button>
      </div>

      <div class="section-label">📚 選一個主題開始</div>
      <div class="cat-grid">${cards}</div>

      <div style="text-align:center;margin-top:26px">
        <button class="ghost-btn primary-btn" id="resetBtn">🔄 重設進度</button>
      </div>`;

    const root = mount(html);
    root.querySelectorAll('.cat-card').forEach(btn => {
      btn.onclick = () => openCategory(btn.dataset.cat);
    });
    // 混合挑戰：使用全部單字當作題庫
    root.querySelector('#mixListen').onclick = () => ListenGame.start(ALL_CAT);
    root.querySelector('#mixQuiz').onclick = () => QuizGame.start(ALL_CAT);
    root.querySelector('#resetBtn').onclick = () => {
      if (confirm('確定要清除所有學習進度和星星嗎？')) {
        Progress.reset();
        refreshStars();
        goHome();
      }
    };
  }

  /* ---------- 分類選單 (三種活動) ---------- */
  function openCategory(catId) {
    if (catId === ALL_CAT) return goHome();
    const c = CATEGORIES.find(x => x.id === catId);
    const all = wordsByCategory(catId).length;
    const done = Progress.learnedInCategory(catId);

    const html = `
      <button class="ghost-btn primary-btn" id="home2">‹ 回首頁</button>
      <div class="view-title" style="color:${c.color}">${c.emoji} ${c.name}</div>
      <p class="view-sub">${c.zh} · 共 ${all} 個單字 · 已學 ${done} 個</p>

      <div class="activity-list" style="--cat-color:${c.color}">
        <button class="activity-btn" id="actFlash">
          <span class="a-emoji">📇</span>
          <span><span class="a-title">單字卡</span><br><span class="a-sub">看圖、發音、例句，翻卡學習</span></span>
        </button>
        <button class="activity-btn" id="actListen">
          <span class="a-emoji">🎧</span>
          <span><span class="a-title">聽音選圖</span><br><span class="a-sub">聽發音，選出正確的圖</span></span>
        </button>
        <button class="activity-btn" id="actQuiz">
          <span class="a-emoji">🔤</span>
          <span><span class="a-title">看圖選字</span><br><span class="a-sub">看圖片，選出正確的英文</span></span>
        </button>
      </div>`;

    const root = mount(html);
    root.querySelector('#home2').onclick = goHome;
    root.querySelector('#actFlash').onclick = () => Flashcards.start(catId);
    root.querySelector('#actListen').onclick = () => ListenGame.start(catId);
    root.querySelector('#actQuiz').onclick = () => QuizGame.start(catId);
  }

  /* ---------- 遊戲結算 ---------- */
  function renderGameResult({ title, score, total, onReplay, backCat }) {
    const perfect = score === total;
    const emoji = perfect ? '🏆' : score >= total * 0.6 ? '🎉' : '💪';
    const msg = perfect ? '全部答對，太棒了！' : score >= total * 0.6 ? '做得很好！' : '再接再厲！';

    const html = `
      <div class="result-card">
        <div class="big-emoji">${emoji}</div>
        <h2>${title}</h2>
        <div class="result-stars">⭐ ${score} / ${total}</div>
        <p class="view-sub" style="margin:6px 0 0">${msg}</p>
        <div style="margin-top:18px">
          <button class="primary-btn" id="replay">🔁 再玩一次</button>
          <button class="ghost-btn primary-btn" id="toCat">選單</button>
          <button class="ghost-btn primary-btn" id="toHome">🏠 首頁</button>
        </div>
      </div>`;

    const root = mount(html);
    if (perfect) UI.celebrate('🏆');
    root.querySelector('#replay').onclick = onReplay;
    root.querySelector('#toCat').onclick = () => openCategory(backCat);
    root.querySelector('#toHome').onclick = goHome;
  }

  // ALL_CAT 於 data.js 定義 (混合挑戰 = 全部單字)

  function init() {
    refreshStars();
    goHome();
    document.getElementById('homeBtn').onclick = goHome;
  }

  return { mount, refreshStars, goHome, openCategory, renderGameResult, ALL_CAT, init };
})();

window.addEventListener('DOMContentLoaded', App.init);
