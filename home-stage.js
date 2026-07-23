(function (window, document) {
  "use strict";

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
    typeof window.activateModalDialog !== "function"
  ) {
    return;
  }

  let activeMission = 0;
  let activeDataPage = 0;
  let wipeRun = 0;

  function renderMission(index) {
    const mission = MISSIONS[index];
    if (!mission) {
      return;
    }

    activeMission = index;
    missionKicker.textContent = `MISSION ${mission.number} / ${mission.label}`;
    missionTitle.textContent = mission.title;
    missionDescription.textContent = mission.description;
    missionEnter.setAttribute("href", mission.href);

    missionControls.forEach((control, controlIndex) => {
      const isActive = controlIndex === activeMission;
      control.classList.toggle("is-active", isActive);
      control.setAttribute("aria-selected", String(isActive));
      control.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    missionPreviews.forEach((preview, previewIndex) => {
      const isActive = previewIndex === activeMission;
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

  function renderDataPage(index) {
    activeDataPage = Math.max(0, Math.min(dataPages.length - 1, index));
    dataPages.forEach((page, pageIndex) => {
      const isActive = pageIndex === activeDataPage;
      page.hidden = !isActive;
      page.setAttribute("aria-hidden", String(!isActive));
    });
    dataPrevious.disabled = activeDataPage === 0;
    dataNext.disabled = activeDataPage === dataPages.length - 1;
    dataStatus.textContent = `${String(activeDataPage + 1).padStart(2, "0")} / ${String(dataPages.length).padStart(2, "0")}`;
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

  function runWipe(label, action) {
    wipeRun += 1;
    const currentRun = wipeRun;
    stageWipeLabel.textContent = label;

    if (prefersReducedMotion.matches) {
      action();
      return;
    }

    stageWipe.classList.remove("is-running");
    void stageWipe.offsetWidth;
    stageWipe.classList.add("is-running");

    window.setTimeout(() => {
      if (currentRun === wipeRun) {
        action();
      }
    }, 285);
    window.setTimeout(() => {
      if (currentRun === wipeRun) {
        stageWipe.classList.remove("is-running");
      }
    }, 570);
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
    control.addEventListener("click", () => renderMission(index));
    control.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + MISSIONS.length) % MISSIONS.length;
      renderMission(nextIndex);
      missionControls[nextIndex].focus();
    });
  });

  missionEnter.addEventListener("click", (event) => {
    event.preventDefault();
    const href = MISSIONS[activeMission].href;
    runWipe("ENTER MISSION", () => window.location.assign(href));
  });

  panelControls.forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      const panelName = control.dataset.homePanelOpen;
      if (panelName === body.dataset.homePanel) {
        return;
      }
      runWipe(panelName === "data" ? "RESULT BOARD" : "MISSION SELECT", () => showPanel(panelName));
    });
  });

  resumeControl.addEventListener("click", (event) => {
    event.preventDefault();
    openResume();
  });

  brandControl?.addEventListener("click", (event) => {
    event.preventDefault();
    if (body.dataset.homePanel !== "missions") {
      runWipe("MISSION SELECT", () => showPanel("missions"));
    }
  });

  dataPrevious.addEventListener("click", () => renderDataPage(activeDataPage - 1));
  dataNext.addEventListener("click", () => renderDataPage(activeDataPage + 1));

  renderMission(0);
  renderDataPage(0);
  stage.hidden = false;
  stage.removeAttribute("aria-hidden");
  showPanel(window.location.hash === "#data" ? "data" : "missions");
  body.classList.add("stage-ready");
})(window, document);
