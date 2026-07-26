const COURSE_META = {
  "03min": {
    time: "3分",
    title: "今すぐほどく",
    defaultAfterMinutes: 5,
    randomMessages: 1,
  },
  "07min": {
    time: "7分",
    title: "一日の緊張をほどく",
    defaultAfterMinutes: 10,
    randomMessages: 2,
  },
  "12min": {
    time: "12分",
    title: "深くほどく",
    defaultAfterMinutes: 15,
    randomMessages: 3,
  },
};

const BGM_TRACKS = {
  "quiet-rain": "./audio/bgm/eryliaa-gentle-rain-for-relaxation-and-sleep-337279.mp3",
  "midnight-ambient": "./audio/bgm/gigidelaromusic-peaceful-light-ray-short-450966.mp3",
};

const screens = [...document.querySelectorAll(".screen")];
const settingsModal = document.getElementById("settingsModal");
const guideAudio = document.getElementById("guideAudio");
const bgmAudio = document.getElementById("bgmAudio");

const state = {
  selectedCourse: localStorage.getItem("hodoku.course") || "07min",
  queue: [],
  currentIndex: 0,
  running: false,
  paused: false,
  waitingTimer: null,
  waitingRemainingMs: 0,
  waitingStartedAt: 0,
  wakeLock: null,
  startedAt: null,
  elapsedTimer: null,
  afterBgmTimer: null,
  previewing: false,
};

function showScreen(id) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
  window.scrollTo(0, 0);
}

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateElapsed() {
  const output = document.getElementById("sessionElapsed");
  if (!state.startedAt) {
    output.textContent = "00:00";
    return;
  }
  output.textContent = formatElapsed(Date.now() - state.startedAt);
}

function saveSettings() {
  const selectedBgm = document.getElementById("bgmSelect").value;
  localStorage.setItem("hodoku.course", state.selectedCourse);
  localStorage.setItem("hodoku.bgm", selectedBgm);
  localStorage.setItem("hodoku.guideVolume", document.getElementById("guideVolume").value);
  localStorage.setItem("hodoku.bgmVolume", document.getElementById("bgmVolume").value);
  localStorage.setItem("hodoku.afterBgmMinutes", document.getElementById("afterBgmMinutes").value);
  localStorage.setItem("hodoku.wakeLockEnabled", String(document.getElementById("wakeLockEnabled").checked));
  localStorage.setItem("hodoku.darkSessionEnabled", String(document.getElementById("darkSessionEnabled").checked));
}

function restoreSettings() {
  const guideVolume = localStorage.getItem("hodoku.guideVolume") || "80";
  const bgmVolume = localStorage.getItem("hodoku.bgmVolume") || "25";
  const selectedBgm = localStorage.getItem("hodoku.bgm") || "quiet-rain";
  const wakeLockEnabled = localStorage.getItem("hodoku.wakeLockEnabled") !== "false";
  const darkSessionEnabled = localStorage.getItem("hodoku.darkSessionEnabled") !== "false";

  document.getElementById("guideVolume").value = guideVolume;
  document.getElementById("guideVolumeValue").textContent = `${guideVolume}%`;
  document.getElementById("bgmVolume").value = bgmVolume;
  document.getElementById("bgmVolumeValue").textContent = `${bgmVolume}%`;
  document.getElementById("wakeLockEnabled").checked = wakeLockEnabled;
  document.getElementById("darkSessionEnabled").checked = darkSessionEnabled;

  document.getElementById("bgmSelect").value = selectedBgm;

  selectCourse(state.selectedCourse, false);
}

function selectCourse(course, save = true) {
  state.selectedCourse = course;
  
const GUIDANCE_MODE_KEY = "hodoku.guidanceMode";

function getAutomaticGuidanceMode(date = new Date()) {
  const hour = date.getHours();
  return hour >= 7 && hour < 20 ? "day" : "night";
}

function getGuidancePreference() {
  const saved = localStorage.getItem(GUIDANCE_MODE_KEY);
  return ["auto", "day", "night"].includes(saved) ? saved : "auto";
}

function getResolvedGuidanceMode() {
  const preference = getGuidancePreference();
  return preference === "auto" ? getAutomaticGuidanceMode() : preference;
}

function refreshGuidanceModeUi() {
  const resolved = getResolvedGuidanceMode();
  const label = document.getElementById("guidanceModeLabel");
  if (label) label.textContent = resolved === "day" ? "昼用" : "夜用";

  const preference = getGuidancePreference();
  document.querySelectorAll("[data-guidance-mode]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.guidanceMode === preference);
  });
}

function openGuidanceModeSheet() {
  refreshGuidanceModeUi();
  const sheet = document.getElementById("guidanceModeSheet");
  if (sheet) sheet.hidden = false;
}

function closeGuidanceModeSheet() {
  const sheet = document.getElementById("guidanceModeSheet");
  if (sheet) sheet.hidden = true;
}

function initGuidanceModeControls() {
  const guidanceModeButton = document.getElementById("guidanceModeButton");
  const closeGuidanceModeButton = document.getElementById("closeGuidanceModeSheet");
  const guidanceModeSheet = document.getElementById("guidanceModeSheet");

  guidanceModeButton?.addEventListener("click", openGuidanceModeSheet);
  closeGuidanceModeButton?.addEventListener("click", closeGuidanceModeSheet);

  guidanceModeSheet?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeGuidanceModeSheet();
  });

  document.querySelectorAll("[data-guidance-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem(GUIDANCE_MODE_KEY, button.dataset.guidanceMode);
      refreshGuidanceModeUi();
      closeGuidanceModeSheet();
    });
  });
}


document.querySelectorAll(".course-card").forEach((card) => {
    const selected = card.dataset.course === course;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-checked", String(selected));
  });

  const meta = COURSE_META[course];
  document.getElementById("selectedCourseTime").textContent = meta.time;
  document.getElementById("selectedCourseTitle").textContent = meta.title;

  const savedAfter = localStorage.getItem(`hodoku.afterBgmMinutes.${course}`);
  document.getElementById("afterBgmMinutes").value =
    savedAfter || String(meta.defaultAfterMinutes);

  if (save) {
    localStorage.setItem("hodoku.course", course);
  }
}

async function requestWakeLock() {
  if (!document.getElementById("wakeLockEnabled").checked) return;
  if (!("wakeLock" in navigator)) return;

  try {
    state.wakeLock = await navigator.wakeLock.request("screen");
  } catch (error) {
    console.warn("Wake Lockを取得できませんでした。", error);
  }
}

async function releaseWakeLock() {
  if (!state.wakeLock) return;
  try {
    await state.wakeLock.release();
  } catch (error) {
    console.warn("Wake Lockの解除に失敗しました。", error);
  } finally {
    state.wakeLock = null;
  }
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error(`${path} の読み込みに失敗しました。`);
  return response.json();
}

function pickRandom(items, count) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

async function buildQueue(course) {
  const mode = getResolvedGuidanceMode();

  const coursePath = mode === "day"
    ? `./audio/guidance/manifests/day-${course}.json`
    : `./audio/guidance/manifests/${course}.json`;

  const messagesPath = mode === "day"
    ? "./audio/guidance/manifests/day-messages.json"
    : "./audio/guidance/manifests/messages.json";

  const [courseManifest, messagesManifest] = await Promise.all([
    fetchJson(coursePath),
    fetchJson(messagesPath),
  ]);

  const baseItems = courseManifest.items.map((item) => ({
    ...item,
    file: mode === "day"
      ? `./audio/guidance/day/${course}/${item.file.split("/").pop()}`
      : `./audio/guidance/${course}/${item.file.split("/").pop()}`,
  }));

  const messageCount = COURSE_META[course].randomMessages;
  const messageSource = mode === "day"
    ? (messagesManifest.groups?.[course] || messagesManifest[course] || [])
    : (messagesManifest[course] || messagesManifest.groups?.[course] || []);

  const selectedMessages = pickRandom(messageSource, messageCount).map((item) => ({
    ...item,
    file: mode === "day"
      ? `./audio/guidance/day/messages/${item.file.split("/").pop()}`
      : `./audio/guidance/messages/${item.file.split("/").pop()}`,
  }));

  const insertAt = Math.max(0, baseItems.length - 2);
  return [
    ...baseItems.slice(0, insertAt),
    ...selectedMessages,
    ...baseItems.slice(insertAt),
  ];
}

function setGuideVolume() {
  guideAudio.volume = Number(document.getElementById("guideVolume").value) / 100;
}

function setBgmVolume() {
  bgmAudio.volume = Number(document.getElementById("bgmVolume").value) / 100;
}

async function startBgm() {
  const selected = document.getElementById("bgmSelect").value;
  if (selected === "none") {
    bgmAudio.pause();
    bgmAudio.removeAttribute("src");
    return;
  }

  bgmAudio.src = BGM_TRACKS[selected];
  bgmAudio.loop = true;
  setBgmVolume();
  await bgmAudio.play();
}

function stopBgm() {
  bgmAudio.pause();
  bgmAudio.currentTime = 0;
}

function clearWaitingTimer() {
  if (state.waitingTimer) {
    clearTimeout(state.waitingTimer);
    state.waitingTimer = null;
  }
}

function clearAfterBgmTimer() {
  if (state.afterBgmTimer) {
    clearTimeout(state.afterBgmTimer);
    state.afterBgmTimer = null;
  }
}

async function playCurrentItem() {
  if (!state.running || state.paused) return;

  if (state.currentIndex >= state.queue.length) {
    await beginAfterBgm();
    return;
  }

  const item = state.queue[state.currentIndex];
  document.getElementById("sessionText").textContent = item.text;
  document.getElementById("sessionPhase").textContent = "ガイダンス中";

  guideAudio.src = item.file;
  setGuideVolume();

  try {
    await guideAudio.play();
  } catch (error) {
    console.error(error);
    await stopSession(true);
    alert("音声を再生できませんでした。ファイル配置を確認してください。");
  }
}

function startWait(ms) {
  state.waitingRemainingMs = ms;
  state.waitingStartedAt = Date.now();
  state.waitingTimer = window.setTimeout(() => {
    state.waitingTimer = null;
    state.waitingRemainingMs = 0;
    state.currentIndex += 1;
    playCurrentItem();
  }, ms);
}

guideAudio.addEventListener("ended", () => {
  if (!state.running || state.paused) return;
  const item = state.queue[state.currentIndex];
  startWait(Number(item?.wait_ms || 0));
});

async function beginAfterBgm() {
  document.getElementById("sessionPhase").textContent = "BGMのみ";
  document.getElementById("sessionText").textContent = "そのまま、ゆっくり休んでください。";

  const minutes = Number(document.getElementById("afterBgmMinutes").value);
  if (minutes <= 0 || bgmAudio.paused) {
    await finishSession();
    return;
  }

  clearAfterBgmTimer();
  state.afterBgmTimer = window.setTimeout(
    finishSession,
    minutes * 60 * 1000,
  );
}

async function finishSession() {
  clearWaitingTimer();
  clearAfterBgmTimer();
  guideAudio.pause();
  stopBgm();
  state.running = false;
  state.paused = false;
  clearInterval(state.elapsedTimer);
  state.elapsedTimer = null;
  await releaseWakeLock();
  document.body.classList.remove("session-dimmed");
  showScreen("completionScreen");
}

async function stopSession(showCompletion = false) {
  clearWaitingTimer();
  clearAfterBgmTimer();
  guideAudio.pause();
  stopBgm();
  state.running = false;
  state.paused = false;
  clearInterval(state.elapsedTimer);
  state.elapsedTimer = null;
  await releaseWakeLock();
  document.body.classList.remove("session-dimmed");
  showScreen(showCompletion ? "completionScreen" : "homeScreen");
}

async function startSession() {
  saveSettings();
  localStorage.setItem(
    `hodoku.afterBgmMinutes.${state.selectedCourse}`,
    document.getElementById("afterBgmMinutes").value,
  );

  try {
    state.queue = await buildQueue(state.selectedCourse);
  } catch (error) {
    console.error(error);
    alert("ガイダンスのJSONを読み込めませんでした。配置を確認してください。");
    return;
  }

  state.currentIndex = 0;
  state.running = true;
  state.paused = false;
  state.startedAt = Date.now();
  updateElapsed();
  state.elapsedTimer = window.setInterval(updateElapsed, 1000);

  showScreen("sessionScreen");
  document.body.classList.toggle(
    "session-dimmed",
    document.getElementById("darkSessionEnabled").checked,
  );

  try {
    await requestWakeLock();
    await startBgm();
    await playCurrentItem();
  } catch (error) {
    console.error(error);
    await stopSession(false);
    alert("再生を開始できませんでした。音声ファイルを確認してください。");
  }
}

async function pauseOrResume() {
  const button = document.getElementById("pauseButton");

  if (!state.paused) {
    state.paused = true;
    guideAudio.pause();
    bgmAudio.pause();

    if (state.waitingTimer) {
      const elapsed = Date.now() - state.waitingStartedAt;
      state.waitingRemainingMs = Math.max(0, state.waitingRemainingMs - elapsed);
      clearWaitingTimer();
    }

    button.textContent = "再開";
    document.getElementById("sessionPhase").textContent = "一時停止中";
    return;
  }

  state.paused = false;
  button.textContent = "一時停止";
  document.getElementById("sessionPhase").textContent = "ガイダンス中";

  if (bgmAudio.src) {
    await bgmAudio.play();
  }

  if (state.waitingRemainingMs > 0) {
    startWait(state.waitingRemainingMs);
  } else if (guideAudio.src && guideAudio.currentTime > 0 && !guideAudio.ended) {
    await guideAudio.play();
  } else {
    await playCurrentItem();
  }
}

async function toggleBgmPreview() {
  const button = document.getElementById("previewBgmButton");

  if (state.previewing) {
    stopBgm();
    state.previewing = false;
    button.textContent = "BGMを試聴";
    return;
  }

  try {
    await startBgm();
    state.previewing = true;
    button.textContent = "試聴を停止";

    window.setTimeout(() => {
      if (!state.previewing) return;
      stopBgm();
      state.previewing = false;
      button.textContent = "BGMを試聴";
    }, 10000);
  } catch (error) {
    console.error(error);
    const selected = document.getElementById("bgmSelect").value;
    const path = BGM_TRACKS[selected] || "BGMなし";
    alert(`BGMを再生できませんでした。\n参照先: ${path}`);
  }
}

document.querySelectorAll(".course-card").forEach((card) => {
  card.addEventListener("click", () => selectCourse(card.dataset.course));
});

document.getElementById("goToPreparationButton").addEventListener("click", () => {
  selectCourse(state.selectedCourse, false);
  refreshGuidanceModeUi();
  showScreen("preparationScreen");
});

document.getElementById("backToHomeButton").addEventListener("click", () => {
  if (state.previewing) toggleBgmPreview();
  showScreen("homeScreen");
});

function openSettingsModal() {
  settingsModal.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("closeSettingsButton").focus();
}

function closeSettingsModal() {
  saveSettings();
  settingsModal.hidden = true;
  document.body.classList.remove("modal-open");
  document.getElementById("openSettingsButton").focus();
}

document.getElementById("openSettingsButton").addEventListener("click", openSettingsModal);
document.getElementById("closeSettingsButton").addEventListener("click", closeSettingsModal);
settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) closeSettingsModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !settingsModal.hidden) closeSettingsModal();
});

document.getElementById("startSessionButton").addEventListener("click", startSession);
document.getElementById("previewBgmButton").addEventListener("click", toggleBgmPreview);
document.getElementById("pauseButton").addEventListener("click", pauseOrResume);
document.getElementById("stopButton").addEventListener("click", () => stopSession(false));
document.getElementById("returnHomeButton").addEventListener("click", () => showScreen("homeScreen"));

document.getElementById("guideVolume").addEventListener("input", (event) => {
  document.getElementById("guideVolumeValue").textContent = `${event.target.value}%`;
  setGuideVolume();
  saveSettings();
});

document.getElementById("bgmVolume").addEventListener("input", (event) => {
  document.getElementById("bgmVolumeValue").textContent = `${event.target.value}%`;
  setBgmVolume();
  saveSettings();
});

document.getElementById("bgmSelect").addEventListener("change", () => {
  if (state.previewing) {
    stopBgm();
    state.previewing = false;
    document.getElementById("previewBgmButton").textContent = "BGMを試聴";
  }
  saveSettings();
});

function normalizeAfterBgmMinutes(value) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return 0;
  return Math.min(120, Math.max(0, number));
}

function updateAfterBgmMinutes(delta) {
  const input = document.getElementById("afterBgmMinutes");
  input.value = String(normalizeAfterBgmMinutes(input.value) + delta);
  input.value = String(normalizeAfterBgmMinutes(input.value));
  saveSettings();
}

document.getElementById("afterBgmMinus").addEventListener("click", () => updateAfterBgmMinutes(-1));
document.getElementById("afterBgmPlus").addEventListener("click", () => updateAfterBgmMinutes(1));
document.getElementById("afterBgmMinutes").addEventListener("input", (event) => {
  if (event.target.value !== "") saveSettings();
});
document.getElementById("afterBgmMinutes").addEventListener("blur", (event) => {
  event.target.value = String(normalizeAfterBgmMinutes(event.target.value));
  saveSettings();
});
document.getElementById("wakeLockEnabled").addEventListener("change", saveSettings);
document.getElementById("darkSessionEnabled").addEventListener("change", saveSettings);

document.addEventListener("visibilitychange", async () => {
  if (
    document.visibilityState === "visible" &&
    state.running &&
    !state.wakeLock
  ) {
    await requestWakeLock();
  }
});

window.addEventListener("beforeunload", () => {
  releaseWakeLock();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("Service Worker登録に失敗しました。", error);
    });
  });
}

restoreSettings();
initGuidanceModeControls();
refreshGuidanceModeUi();
showScreen("homeScreen");


/* v10: subtle Canvas starfield for home/preparation */
(() => {
  const configs = {
    homeScreen: {
      count: 70, minR: 0.42, maxR: 1.05,
      minAlpha: 0.12, maxAlpha: 0.46
    },
    preparationScreen: {
      count: 70, minR: 0.42, maxR: 1.05,
      minAlpha: 0.12, maxAlpha: 0.46
    }
  };

  const states = new Map();
  let rafId = null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function makeStars(width, height, config) {
    return Array.from({ length: config.count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: config.minR + Math.random() * (config.maxR - config.minR),
      base: config.minAlpha + Math.random() * (config.maxAlpha - config.minAlpha),
      amp: 0.035 + Math.random() * 0.09,
      speed: 0.00028 + Math.random() * 0.00055,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function resizeState(state) {
    const rect = state.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.max(1, rect.width);
    const cssH = Math.max(1, rect.height);
    const pxW = Math.round(cssW * dpr);
    const pxH = Math.round(cssH * dpr);

    if (state.canvas.width !== pxW || state.canvas.height !== pxH) {
      state.canvas.width = pxW;
      state.canvas.height = pxH;
      state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.stars = makeStars(cssW, cssH, state.config);
    }
  }

  function screenIsVisible(screen) {
    return screen.classList.contains("active") &&
      getComputedStyle(screen).display !== "none";
  }

  function paint(time = 0) {
    let hasVisibleStarScreen = false;

    for (const [screenId, state] of states) {
      const screen = document.getElementById(screenId);
      if (!screen || !screenIsVisible(screen)) continue;

      hasVisibleStarScreen = true;
      resizeState(state);

      const rect = state.canvas.getBoundingClientRect();
      state.ctx.clearRect(0, 0, rect.width, rect.height);

      for (const star of state.stars) {
        const alpha = reduceMotion.matches
          ? star.base
          : Math.max(0.03, Math.min(0.58,
              star.base + Math.sin(time * star.speed + star.phase) * star.amp));

        state.ctx.beginPath();
        state.ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        state.ctx.fillStyle = `rgba(236,242,255,${alpha})`;
        state.ctx.fill();
      }
    }

    if (hasVisibleStarScreen && !reduceMotion.matches && document.visibilityState === "visible") {
      rafId = requestAnimationFrame(paint);
    } else {
      rafId = null;
    }
  }

  function restart() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(paint);
  }

  function init() {
    for (const [screenId, config] of Object.entries(configs)) {
      const screen = document.getElementById(screenId);
      const canvas = screen?.querySelector(".star-canvas");
      if (!canvas) continue;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) continue;

      const state = { canvas, ctx, config, stars: [] };
      states.set(screenId, state);
      resizeState(state);
    }

    paint(0);

    const observer = new MutationObserver(() => restart());
    document.querySelectorAll(".screen").forEach(screen => {
      observer.observe(screen, { attributes: true, attributeFilter: ["class", "style", "hidden"] });
    });

    window.addEventListener("resize", () => {
      states.forEach(resizeState);
      restart();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else {
        restart();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
