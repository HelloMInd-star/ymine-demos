/* ═══════════════════════════════════════════════════════════
   Y.MINE Radio · 深夜电台悬浮唱片组件
   - 自动注入 DOM，各页零侵入
   - 默认静音，点击播放/暂停，低音量循环
   - 音频: Y.MINE 原创 AI 音乐 · Sweater Weather (ISFJ 主题曲)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // 单例：已注入则跳过
  if (document.querySelector('.ym-radio')) return;

  // 路径自适应：从自身 script src 推导站点根路径（绝对可靠）
  const scriptUrl = (document.currentScript && document.currentScript.src) || '';
  const base = scriptUrl.includes('shared/radio.js')
    ? scriptUrl.substring(0, scriptUrl.indexOf('shared/radio.js'))
    : './';
  const AUDIO_URL = base + 'assets/radio/sweater-weather.mp3';
  const PLAYLIST_URL = 'https://163cn.tv/bcXc6I9W';

  // 注入 DOM
  const wrap = document.createElement('div');
  wrap.className = 'ym-radio';
  wrap.innerHTML =
    '<button class="ym-radio-disc" aria-label="Y.MINE Radio 播放/暂停">' +
      '<span class="ym-radio-dot"></span>' +
    '</button>' +
    '<div class="ym-radio-label">' +
      'Y.MINE 原创 · Sweater Weather · ' +
      '<a href="' + PLAYLIST_URL + '" target="_blank" rel="noopener" title="网易云歌单《first cup》">歌单 ↗</a>' +
    '</div>';
  document.body.appendChild(wrap);

  // 音频实例
  const audio = new Audio(AUDIO_URL);
  audio.loop = true;
  audio.volume = 0.35;
  audio.preload = 'none';

  const disc = wrap.querySelector('.ym-radio-disc');
  let playing = false;

  function setState(on) {
    playing = on;
    wrap.classList.toggle('playing', on);
  }

  disc.addEventListener('click', function () {
    if (playing) {
      audio.pause();
      setState(false);
    } else {
      audio.play().then(function () {
        setState(true);
      }).catch(function () {
        // 浏览器策略或加载失败时静默降级
        setState(false);
      });
    }
  });

  // 音频结束/出错时复位状态
  audio.addEventListener('ended', function () { setState(false); });
  audio.addEventListener('error', function () { setState(false); });

  // 页面隐藏时暂停（节能 & 礼貌），回来自动恢复
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && playing) {
      audio.pause();
    } else if (!document.hidden && playing) {
      audio.play().catch(function () {});
    }
  });
})();
