(function (window, document) {
  "use strict";

  const DEFAULT_STATE = Object.freeze({
    panel: "missions",
    mission: 1,
    dataPage: 1,
  });

  function normalizeState(state) {
    const mission = Number(state?.mission);
    const dataPage = Number(state?.dataPage);

    return {
      panel: state?.panel === "data" ? "data" : "missions",
      mission: Number.isInteger(mission) && mission >= 1 && mission <= 4 ? mission : 1,
      dataPage: dataPage === 2 ? 2 : 1,
    };
  }

  function parseHash(hash) {
    const value = String(hash || "");
    const missionMatch = value.match(/^#contents-m([2-4])$/);

    if (value === "#contents") {
      return { ...DEFAULT_STATE };
    }

    if (missionMatch) {
      return {
        panel: "missions",
        mission: Number(missionMatch[1]),
        dataPage: 1,
      };
    }

    if (value === "#data" || value === "#data-p2") {
      return {
        panel: "data",
        mission: 1,
        dataPage: value === "#data-p2" ? 2 : 1,
      };
    }

    return { ...DEFAULT_STATE };
  }

  function formatHash(state) {
    const normalized = normalizeState(state);

    if (normalized.panel === "data") {
      return normalized.dataPage === 2 ? "#data-p2" : "#data";
    }

    return normalized.mission === 1
      ? "#contents"
      : `#contents-m${normalized.mission}`;
  }

  function reduce(state, action) {
    const current = normalizeState(state);

    switch (action?.type) {
      case "selectMission":
        return normalizeState({
          ...current,
          panel: "missions",
          mission: action.mission,
        });
      case "selectPanel":
        return normalizeState({
          ...current,
          panel: action.panel,
        });
      case "selectDataPage":
        return normalizeState({
          ...current,
          panel: "data",
          dataPage: action.dataPage,
        });
      case "restore":
        return normalizeState(action.state);
      default:
        return current;
    }
  }

  function statesEqual(left, right) {
    const normalizedLeft = normalizeState(left);
    const normalizedRight = normalizeState(right);

    return normalizedLeft.panel === normalizedRight.panel
      && normalizedLeft.mission === normalizedRight.mission
      && normalizedLeft.dataPage === normalizedRight.dataPage;
  }

  window.HomeStageState = Object.freeze({
    DEFAULT_STATE,
    normalizeState,
    parseHash,
    formatHash,
    reduce,
    statesEqual,
  });

  if (!document?.body || typeof document.querySelector !== "function") {
    return;
  }

  const MISSIONS = [
    {
      number: "01",
      label: "WEBSITE",
      title: "官网视觉设计",
      description: "游戏官网与 AI 官网视觉交互设计",
      href: "website-design.html",
    },
    {
      number: "02",
      label: "UA",
      title: "买量图片设计",
      description: "横版、竖版与九图买量素材",
      href: "ua-creatives.html",
    },
    {
      number: "03",
      label: "COMMUNITY",
      title: "运营图片设计",
      description: "小恐龙派对、不休的乌拉拉与狸狸汤泉",
      href: "community-creatives.html",
    },
    {
      number: "04",
      label: "VIDEO",
      title: "AI 视频设计",
      description: "运营社群视频与买量视频混剪",
      href: "video-design.html",
    },
  ];

  const body = document.body;
  const stage = document.querySelector("[data-home-stage]");
  const legacyHome = document.querySelector("#home");
  const legacyContents = document.querySelector("#contents");
  const dataPanel = document.querySelector('[data-stage-panel="data"]');
  const missionControls = Array.from(document.querySelectorAll("[data-mission-select]"));
  const missionPreviews = Array.from(document.querySelectorAll("[data-mission-preview]"));
  const missionKicker = document.querySelector("[data-mission-kicker]");
  const missionTitle = document.querySelector("[data-mission-title]");
  const missionDescription = document.querySelector("[data-mission-description]");
  const missionEnter = document.querySelector("[data-mission-enter]");
  const panelControls = Array.from(document.querySelectorAll("[data-home-panel-open]"));
  const resumeControl = document.querySelector("[data-home-resume]");
  const resumeOverlay = document.querySelector(".resume-overlay");
  const resumeModal = resumeOverlay?.querySelector(".resume-modal");
  const dataPages = Array.from(document.querySelectorAll("[data-data-page]"));
  const dataPrevious = document.querySelector("[data-data-prev]");
  const dataNext = document.querySelector("[data-data-next]");
  const dataStatus = document.querySelector("[data-data-status]");
  const stageWipe = document.querySelector(".stage-wipe");
  const stageWipeLabel = stageWipe?.querySelector("span");
  const brandControl = document.querySelector(".brand-pill");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const requiredNodes = [
    body,
    stage,
    legacyHome,
    legacyContents,
    dataPanel,
    missionKicker,
    missionTitle,
    missionDescription,
    missionEnter,
    resumeControl,
    resumeOverlay,
    resumeModal,
    dataPrevious,
    dataNext,
    dataStatus,
    stageWipe,
    stageWipeLabel,
  ];

  if (
    requiredNodes.some((node) => !node) ||
    missionControls.length !== MISSIONS.length ||
    missionPreviews.length !== MISSIONS.length ||
    panelControls.length !== 2 ||
    dataPages.length !== 2 ||
    typeof window.lockPreviewScroll !== "function" ||
    typeof window.activateModalDialog !== "function" ||
    typeof window.history?.pushState !== "function" ||
    typeof window.history?.replaceState !== "function"
  ) {
    return;
  }

  let desiredState = parseHash(window.location.hash);
  let renderedPanel = desiredState.panel;
  let pendingPanel = null;
  let wipeRun = 0;
  let wipeMidpointTimer = null;
  let wipeEndTimer = null;

  function renderMission(missionNumber) {
    const missionIndex = missionNumber - 1;
    const mission = MISSIONS[missionIndex];
    if (!mission) {
      return;
    }

    missionKicker.textContent = `MISSION ${mission.number} / ${mission.label}`;
    missionTitle.textContent = mission.title;
    missionDescription.textContent = mission.description;
    missionEnter.setAttribute("href", mission.href);

    missionControls.forEach((control, controlIndex) => {
      const isActive = controlIndex === missionIndex;
      control.classList.toggle("is-active", isActive);
      control.setAttribute("aria-selected", String(isActive));
      control.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    missionPreviews.forEach((preview, previewIndex) => {
      const isActive = previewIndex === missionIndex;
      preview.classList.toggle("is-active", isActive);
      preview.hidden = !isActive;
      if (isActive) {
        preview.removeAttribute("inert");
        preview.removeAttribute("aria-hidden");
      } else {
        preview.setAttribute("inert", "");
        preview.setAttribute("aria-hidden", "true");
      }
    });
  }

  function renderDataPage(pageNumber) {
    const pageIndex = pageNumber - 1;
    dataPages.forEach((page, currentPageIndex) => {
      const isActive = currentPageIndex === pageIndex;
      page.hidden = !isActive;
      page.setAttribute("aria-hidden", String(!isActive));
    });
    dataPrevious.disabled = pageNumber === 1;
    dataNext.disabled = pageNumber === dataPages.length;
    dataStatus.textContent = `${String(pageNumber).padStart(2, "0")} / ${String(dataPages.length).padStart(2, "0")}`;
  }

  function updatePanelNavigation(panelName) {
    panelControls.forEach((control) => {
      const isActive = control.dataset.homePanelOpen === panelName;
      control.classList.toggle("active", isActive);
      if (isActive) {
        control.setAttribute("aria-current", "page");
      } else {
        control.removeAttribute("aria-current");
      }
    });
    resumeControl.classList.remove("active");
    resumeControl.removeAttribute("aria-current");
  }

  function showPanel(panelName) {
    const showData = panelName === "data";
    stage.hidden = showData;
    stage.setAttribute("aria-hidden", String(showData));
    dataPanel.hidden = !showData;
    dataPanel.setAttribute("aria-hidden", String(!showData));
    body.dataset.homePanel = showData ? "data" : "missions";
    updatePanelNavigation(body.dataset.homePanel);
  }

  function renderState(state) {
    const normalized = normalizeState(state);
    renderMission(normalized.mission);
    renderDataPage(normalized.dataPage);
    showPanel(normalized.panel);
    renderedPanel = normalized.panel;
  }

  function writeHistory(state, mode) {
    const hash = formatHash(state);
    if (window.location.hash === hash) {
      return;
    }

    if (mode === "push") {
      window.history.pushState({ homeStage: true }, "", hash);
    } else {
      window.history.replaceState({ homeStage: true }, "", hash);
    }
  }

  function cancelWipe() {
    wipeRun += 1;
    if (wipeMidpointTimer !== null) {
      window.clearTimeout(wipeMidpointTimer);
      wipeMidpointTimer = null;
    }
    if (wipeEndTimer !== null) {
      window.clearTimeout(wipeEndTimer);
      wipeEndTimer = null;
    }
    stageWipe.classList.remove("is-running");
  }

  function runWipe(label, action) {
    cancelWipe();
    const currentRun = wipeRun;
    stageWipeLabel.textContent = label;

    if (prefersReducedMotion.matches) {
      action();
      return;
    }

    void stageWipe.offsetWidth;
    stageWipe.classList.add("is-running");

    wipeMidpointTimer = window.setTimeout(() => {
      wipeMidpointTimer = null;
      if (currentRun === wipeRun) {
        action();
      }
    }, 285);
    wipeEndTimer = window.setTimeout(() => {
      wipeEndTimer = null;
      if (currentRun === wipeRun) {
        stageWipe.classList.remove("is-running");
      }
    }, 570);
  }

  function renderDesiredState(animatePanel) {
    if (!animatePanel || desiredState.panel === renderedPanel) {
      cancelWipe();
      pendingPanel = null;
      renderState(desiredState);
      return;
    }

    pendingPanel = desiredState.panel;
    runWipe(
      desiredState.panel === "data" ? "RESULT BOARD" : "MISSION SELECT",
      () => {
        if (pendingPanel !== desiredState.panel) {
          return;
        }
        renderState(desiredState);
        pendingPanel = null;
      },
    );
  }

  function commitAction(action, options = {}) {
    const nextState = reduce(desiredState, action);
    if (statesEqual(nextState, desiredState)) {
      return false;
    }

    desiredState = nextState;
    writeHistory(desiredState, "push");
    renderDesiredState(options.animatePanel === true);
    return true;
  }

  function restoreFromLocation() {
    const restoredState = parseHash(window.location.hash);
    cancelWipe();
    pendingPanel = null;
    desiredState = reduce(desiredState, {
      type: "restore",
      state: restoredState,
    });
    renderState(desiredState);
    writeHistory(desiredState, "replace");
  }

  function openResume() {
    const wasOpen = resumeOverlay.classList.contains("is-open");
    resumeOverlay.classList.add("is-open");
    resumeOverlay.setAttribute("aria-hidden", "false");
    resumeOverlay.removeAttribute("inert");
    if (!wasOpen) {
      window.lockPreviewScroll();
      window.activateModalDialog(resumeOverlay, resumeControl);
    }
    resumeModal.scrollTop = 0;
  }

  missionControls.forEach((control, index) => {
    control.addEventListener("click", () => {
      commitAction({
        type: "selectMission",
        mission: index + 1,
      });
    });
    control.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextMission = ((desiredState.mission - 1 + direction + MISSIONS.length) % MISSIONS.length) + 1;
      commitAction({
        type: "selectMission",
        mission: nextMission,
      });
      missionControls[nextMission - 1].focus();
    });
  });

  missionEnter.addEventListener("click", (event) => {
    event.preventDefault();
    const href = MISSIONS[desiredState.mission - 1].href;
    pendingPanel = null;
    runWipe("ENTER MISSION", () => window.location.assign(href));
  });

  panelControls.forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      commitAction(
        {
          type: "selectPanel",
          panel: control.dataset.homePanelOpen,
        },
        { animatePanel: true },
      );
    });
  });

  resumeControl.addEventListener("click", (event) => {
    event.preventDefault();
    openResume();
  });

  brandControl?.addEventListener("click", (event) => {
    event.preventDefault();
    commitAction(
      {
        type: "selectPanel",
        panel: "missions",
      },
      { animatePanel: true },
    );
  });

  dataPrevious.addEventListener("click", () => {
    commitAction({
      type: "selectDataPage",
      dataPage: desiredState.dataPage - 1,
    });
  });
  dataNext.addEventListener("click", () => {
    commitAction({
      type: "selectDataPage",
      dataPage: desiredState.dataPage + 1,
    });
  });

  renderState(desiredState);
  writeHistory(desiredState, "replace");
  window.addEventListener("popstate", restoreFromLocation);
  window.addEventListener("hashchange", restoreFromLocation);
  body.classList.add("stage-ready");
})(window, document);
