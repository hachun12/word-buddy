/* =========================================================
   progress.js — 學習進度與星星獎勵
   全部存在瀏覽器 localStorage，免帳號、免登入。
     learned : 已學過的單字 id (看過單字卡即算)
     stars   : 遊戲答對累積的星星數
   ========================================================= */

const Progress = (() => {
  const KEY = 'wordbuddy_progress_v1';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* localStorage 可能被停用 */ }
    return { learned: {}, stars: 0 };
  }

  let state = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* 忽略無法儲存的情況 */ }
  }

  function markLearned(id) {
    if (!state.learned[id]) {
      state.learned[id] = true;
      save();
    }
  }

  function isLearned(id) {
    return !!state.learned[id];
  }

  function learnedCount() {
    return Object.keys(state.learned).length;
  }

  // 某分類已學數量
  function learnedInCategory(catId) {
    return wordsByCategory(catId).filter(w => state.learned[w.id]).length;
  }

  function addStars(n) {
    state.stars += n;
    save();
    return state.stars;
  }

  function getStars() {
    return state.stars;
  }

  function reset() {
    state = { learned: {}, stars: 0 };
    save();
  }

  return {
    markLearned, isLearned, learnedCount, learnedInCategory,
    addStars, getStars, reset,
  };
})();
