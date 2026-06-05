const APP_CONFIG = {
  title: "Maypure+ 신입교육 시험",
  durationMinutes: 120,
  passScore: 80,
  adminPin: "0000", // 운영 전 반드시 변경하세요.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwtIL7-bIPV_UjFaG9QOpHX8afBlfZaT41HpdB5IM-voBFuN9GssOYeq-wbLqUWKg/exec", // Apps Script 웹앱 URL
  backendToken: "CHANGE_ME", // Apps Script의 SHARED_TOKEN과 동일하게 설정하세요.
  autoEmailOnSubmit: true,
  studentEmailIncludesCorrectAnswer: false,
  storageKey: "maypure_exam_records_v2"
};

const QUESTIONS = Array.isArray(window.MAYPURE_QUESTIONS) ? window.MAYPURE_QUESTIONS : [];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const state = {
  candidate: null,
  currentIndex: 0,
  answers: {},
  startedAt: null,
  remainingSec: APP_CONFIG.durationMinutes * 60,
  timerId: null,
  lastRecord: null,
  records: [],
  sendSelection: new Set(),
  activeTab: "records"
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  state.records = loadLocalRecords();
  hydrateStaticLabels();
  bindEvents();
  renderAdminFilters();
}

function hydrateStaticLabels() {
  document.querySelectorAll("[data-question-count]").forEach((node) => node.textContent = QUESTIONS.length.toLocaleString("ko-KR"));
  document.querySelectorAll("[data-duration-label]").forEach((node) => node.textContent = APP_CONFIG.durationMinutes);
  $("#timerText").textContent = formatTime(APP_CONFIG.durationMinutes * 60);
}

function bindEvents() {
  $("#candidateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    startExam();
  });
  $("#prevQuestionButton").addEventListener("click", () => moveQuestion(-1));
  $("#nextQuestionButton").addEventListener("click", () => moveQuestion(1));
  $("#submitExamButton").addEventListener("click", () => submitExam(false));
  $("#restartButton").addEventListener("click", resetToLanding);
  $("#downloadResultButton").addEventListener("click", downloadLastResult);

  $("#adminOpenButton").addEventListener("click", openAdminDialog);
  $("#adminCancelButton").addEventListener("click", () => $("#adminDialog").close());
  $("#adminPinForm").addEventListener("submit", handleAdminPinSubmit);
  $("#adminLogoutButton").addEventListener("click", () => showView("landingView"));
  $("#loadBackendButton").addEventListener("click", loadBackendRecords);

  $$(".tab").forEach((button) => button.addEventListener("click", () => switchAdminTab(button.dataset.tab)));
  $("#selectAllSendButton").addEventListener("click", selectAllSendRecords);
  $("#clearSendButton").addEventListener("click", clearSendRecords);
  $("#sendSelectedButton").addEventListener("click", sendSelectedRecords);
  $("#filterChapter").addEventListener("change", renderAnswerKey);
  $("#filterType").addEventListener("change", renderAnswerKey);
  $("#filterDifficulty").addEventListener("change", renderAnswerKey);
}

function startExam() {
  if (!QUESTIONS.length) {
    alert("questions.js에 문항 데이터를 먼저 입력하세요.");
    return;
  }

  const name = $("#candidateName").value.trim();
  const hireDate = $("#candidateHireDate").value;
  const email = $("#candidateEmail").value.trim();
  if (!name || !hireDate || !email) return;

  state.candidate = { name, hireDate, email };
  state.currentIndex = 0;
  state.answers = {};
  state.startedAt = new Date();
  state.remainingSec = APP_CONFIG.durationMinutes * 60;
  clearInterval(state.timerId);
  state.timerId = setInterval(tickTimer, 1000);

  showView("examView");
  renderQuestionNav();
  renderQuestion();
  updateProgress();
}

function tickTimer() {
  state.remainingSec -= 1;
  $("#timerText").textContent = formatTime(state.remainingSec);
  if (state.remainingSec <= 300) $("#timerText").style.color = "var(--danger)";
  if (state.remainingSec <= 0) {
    clearInterval(state.timerId);
    submitExam(true);
  }
}

function renderQuestionNav() {
  const nav = $("#questionNav");
  nav.innerHTML = QUESTIONS.map((_, index) => `
    <button class="nav-dot" type="button" data-index="${index}" aria-label="${index + 1}번 문항">${index + 1}</button>
  `).join("");
  nav.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentIndex = Number(button.dataset.index);
      renderQuestion();
    });
  });
}

function renderQuestion() {
  const question = QUESTIONS[state.currentIndex];
  if (!question) return;

  $("#questionNumber").textContent = `${state.currentIndex + 1}번`;
  $("#questionChapter").textContent = question.chapter || "공통";
  $("#questionDifficulty").textContent = question.difficulty || "-";
  $("#questionText").textContent = question.question;

  const answer = state.answers[question.id];
  const area = $("#choiceArea");
  if (question.type === "multiple") {
    area.innerHTML = (question.choices || []).map((choice, index) => {
      const number = index + 1;
      const checked = Number(answer) === number ? "checked" : "";
      return `
        <label class="choice-label">
          <input type="radio" name="answer-${escapeAttribute(question.id)}" value="${number}" ${checked} />
          <span class="choice-number">${number}</span>
          <span>${escapeHTML(choice)}</span>
        </label>
      `;
    }).join("");
    area.querySelectorAll("input[type='radio']").forEach((input) => {
      input.addEventListener("change", () => setAnswer(question.id, Number(input.value)));
    });
  } else if (question.type === "short") {
    area.innerHTML = `
      <label>
        <span>답안 입력</span>
        <input class="short-answer" id="shortAnswerInput" type="text" value="${escapeAttribute(answer || "")}" placeholder="단답을 입력하세요" />
      </label>
    `;
    $("#shortAnswerInput").addEventListener("input", (event) => setAnswer(question.id, event.target.value));
  } else {
    area.innerHTML = `
      <label>
        <span>서술형 답안</span>
        <textarea class="essay-answer" id="essayAnswerInput" placeholder="답안을 입력하세요">${escapeHTML(answer || "")}</textarea>
      </label>
      <p class="panel-note">서술형은 관리자 검토 대상으로 표시됩니다.</p>
    `;
    $("#essayAnswerInput").addEventListener("input", (event) => setAnswer(question.id, event.target.value));
  }

  $("#prevQuestionButton").disabled = state.currentIndex === 0;
  $("#nextQuestionButton").disabled = state.currentIndex === QUESTIONS.length - 1;
  updateProgress();
}

function setAnswer(questionId, value) {
  state.answers[questionId] = value;
  updateProgress();
}

function moveQuestion(delta) {
  const nextIndex = state.currentIndex + delta;
  if (nextIndex < 0 || nextIndex >= QUESTIONS.length) return;
  state.currentIndex = nextIndex;
  renderQuestion();
}

function updateProgress() {
  const answered = QUESTIONS.filter((q) => hasAnswer(state.answers[q.id])).length;
  const percent = QUESTIONS.length ? Math.round((answered / QUESTIONS.length) * 100) : 0;
  $("#progressText").textContent = `${answered} / ${QUESTIONS.length}`;
  $("#progressBar").style.width = `${percent}%`;
  $$(".nav-dot").forEach((button, index) => {
    const q = QUESTIONS[index];
    button.classList.toggle("is-current", index === state.currentIndex);
    button.classList.toggle("is-answered", hasAnswer(state.answers[q.id]));
  });
}

function submitExam(isTimeOver) {
  const unanswered = QUESTIONS.filter((q) => !hasAnswer(state.answers[q.id])).length;
  if (!isTimeOver && unanswered > 0) {
    const proceed = confirm(`미응답 문항이 ${unanswered}개 있습니다. 제출하시겠습니까?`);
    if (!proceed) return;
  }

  clearInterval(state.timerId);
  const record = buildRecord(isTimeOver);
  state.lastRecord = record;
  state.records = [record, ...state.records.filter((item) => item.submissionId !== record.submissionId)];
  saveLocalRecords(state.records);
  renderResult(record);
  showView("resultView");

  if (APP_CONFIG.autoEmailOnSubmit) {
    requestEmailSend(record, "submit");
  } else {
    $("#emailStatusText").textContent = "자동 메일 발송이 꺼져 있습니다. 관리자 화면에서 발송할 수 있습니다.";
  }
}

function buildRecord(isTimeOver) {
  const submittedAt = new Date();
  const durationSec = Math.max(0, Math.round((submittedAt - state.startedAt) / 1000));
  const details = QUESTIONS.map((question, index) => buildDetail(question, index));
  const correct = details.filter((item) => item.status === "correct").length;
  const incorrect = details.filter((item) => item.status === "incorrect").length;
  const review = details.filter((item) => item.status === "review").length;
  const gradableTotal = details.filter((item) => item.status !== "review").length;
  const score = gradableTotal ? Math.round((correct / gradableTotal) * 100) : 0;

  return {
    submissionId: createId(),
    title: APP_CONFIG.title,
    candidate: { ...state.candidate },
    startedAt: state.startedAt.toISOString(),
    submittedAt: submittedAt.toISOString(),
    isTimeOver,
    durationSec,
    score,
    passScore: APP_CONFIG.passScore,
    correct,
    incorrect,
    review,
    total: QUESTIONS.length,
    gradableTotal,
    mailStatus: "대기",
    details
  };
}

function buildDetail(question, index) {
  const raw = state.answers[question.id];
  if (question.type === "multiple") {
    const selectedNumber = hasAnswer(raw) ? Number(raw) : null;
    const correctNumber = Number(question.answer);
    const isCorrect = selectedNumber === correctNumber;
    return {
      questionId: question.id,
      number: index + 1,
      chapter: question.chapter || "공통",
      difficulty: question.difficulty || "-",
      type: question.type,
      selectedNumber,
      selectedText: selectedNumber ? `${selectedNumber}번` : "미응답",
      correctNumber,
      status: isCorrect ? "correct" : "incorrect"
    };
  }

  if (question.type === "short") {
    const selectedText = typeof raw === "string" ? raw.trim() : "";
    const correctAnswers = Array.isArray(question.answer) ? question.answer : [question.answer];
    const isCorrect = selectedText !== "" && correctAnswers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(selectedText));
    return {
      questionId: question.id,
      number: index + 1,
      chapter: question.chapter || "공통",
      difficulty: question.difficulty || "-",
      type: question.type,
      selectedNumber: null,
      selectedText: selectedText || "미응답",
      correctText: correctAnswers.filter(Boolean).join(" / "),
      status: isCorrect ? "correct" : "incorrect"
    };
  }

  return {
    questionId: question.id,
    number: index + 1,
    chapter: question.chapter || "공통",
    difficulty: question.difficulty || "-",
    type: question.type,
    selectedNumber: null,
    selectedText: typeof raw === "string" && raw.trim() ? raw.trim() : "미응답",
    status: "review"
  };
}

function renderResult(record) {
  $("#scoreText").textContent = `${record.score}점`;
  $("#correctText").textContent = record.correct;
  $("#incorrectText").textContent = record.incorrect;
  $("#reviewText").textContent = record.review;
  $("#emailStatusText").textContent = APP_CONFIG.appsScriptUrl ? "결과 메일 발송을 요청했습니다." : "Apps Script URL이 비어 있어 메일은 발송되지 않았습니다.";
  $("#resultTableBody").innerHTML = record.details.map((item) => `
    <tr>
      <td>${item.number}번</td>
      <td>${escapeHTML(formatSelectedAnswer(item))}</td>
      <td>${statusBadge(item.status)}</td>
    </tr>
  `).join("");
}

function requestEmailSend(record, action = "submit") {
  if (!APP_CONFIG.appsScriptUrl) {
    markRecordMailStatus(record.submissionId, "URL 미설정");
    return;
  }

  const payload = {
    action,
    token: APP_CONFIG.backendToken,
    includeCorrectAnswerInStudentEmail: APP_CONFIG.studentEmailIncludesCorrectAnswer,
    submission: record
  };

  try {
    fetch(APP_CONFIG.appsScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    markRecordMailStatus(record.submissionId, "요청 완료");
    if (state.lastRecord?.submissionId === record.submissionId) {
      $("#emailStatusText").textContent = "결과 메일 발송 요청이 완료되었습니다.";
    }
  } catch (error) {
    markRecordMailStatus(record.submissionId, "요청 실패");
    if (state.lastRecord?.submissionId === record.submissionId) {
      $("#emailStatusText").textContent = "메일 발송 요청 중 오류가 발생했습니다. 관리자에게 문의하세요.";
    }
  }
}

function markRecordMailStatus(submissionId, mailStatus) {
  state.records = state.records.map((record) => record.submissionId === submissionId ? { ...record, mailStatus } : record);
  if (state.lastRecord?.submissionId === submissionId) state.lastRecord.mailStatus = mailStatus;
  saveLocalRecords(state.records);
}

function resetToLanding() {
  clearInterval(state.timerId);
  $("#timerText").style.color = "";
  $("#candidateForm").reset();
  showView("landingView");
}

function showView(viewId) {
  $$(".view").forEach((view) => view.classList.remove("is-active"));
  $(`#${viewId}`).classList.add("is-active");
  if (viewId === "adminView") renderAdmin();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openAdminDialog() {
  $("#adminPinInput").value = "";
  $("#adminPinError").hidden = true;
  $("#adminDialog").showModal();
  setTimeout(() => $("#adminPinInput").focus(), 50);
}

function handleAdminPinSubmit(event) {
  event.preventDefault();
  if ($("#adminPinInput").value === APP_CONFIG.adminPin) {
    $("#adminDialog").close();
    showView("adminView");
  } else {
    $("#adminPinError").hidden = false;
  }
}

function renderAdmin() {
  renderMetrics();
  renderAdminRecords();
  renderCohorts();
  renderWrongRanking();
  renderDistribution();
  renderSendPanel();
  renderAnswerKey();
}

function renderMetrics() {
  const total = state.records.length;
  const average = total ? Math.round(state.records.reduce((sum, r) => sum + Number(r.score || 0), 0) / total) : 0;
  const max = total ? Math.max(...state.records.map((r) => Number(r.score || 0))) : 0;
  const mail = state.records.filter((r) => ["요청 완료", "발송 완료"].includes(r.mailStatus)).length;
  $("#metricTotal").textContent = total;
  $("#metricAverage").textContent = `${average}점`;
  $("#metricMax").textContent = `${max}점`;
  $("#metricMail").textContent = mail;
}

function renderAdminRecords() {
  const body = $("#adminRecordsBody");
  if (!state.records.length) {
    body.innerHTML = emptyRow(7, "아직 저장된 응시 기록이 없습니다.");
    return;
  }
  body.innerHTML = state.records.map((record) => `
    <tr>
      <td>${escapeHTML(record.candidate?.name || "-")}</td>
      <td>${escapeHTML(record.candidate?.hireDate || "-")}</td>
      <td>${escapeHTML(record.candidate?.email || "-")}</td>
      <td><strong>${record.score}점</strong></td>
      <td>${formatDateTime(record.submittedAt)}</td>
      <td>${escapeHTML(record.mailStatus || "-")}</td>
      <td><button class="icon-button" type="button" data-delete-id="${record.submissionId}">×</button></td>
    </tr>
  `).join("");
  body.querySelectorAll("[data-delete-id]").forEach((button) => {
    button.addEventListener("click", () => deleteRecord(button.dataset.deleteId));
  });
}

function deleteRecord(submissionId) {
  if (!confirm("이 브라우저의 응시 기록을 삭제할까요?")) return;
  state.records = state.records.filter((record) => record.submissionId !== submissionId);
  state.sendSelection.delete(submissionId);
  saveLocalRecords(state.records);
  renderAdmin();
}

function renderCohorts() {
  const groups = new Map();
  state.records.forEach((record) => {
    const key = (record.candidate?.hireDate || "미입력").slice(0, 7) || "미입력";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  });
  const rows = Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a)).map(([key, records]) => {
    const average = Math.round(records.reduce((sum, r) => sum + Number(r.score || 0), 0) / records.length);
    const max = Math.max(...records.map((r) => Number(r.score || 0)));
    return `<tr><td>${escapeHTML(key)}</td><td>${records.length}</td><td>${average}점</td><td>${max}점</td></tr>`;
  });
  $("#cohortBody").innerHTML = rows.length ? rows.join("") : emptyRow(4, "기수별 집계 데이터가 없습니다.");
}

function renderWrongRanking() {
  const totalRecords = state.records.length;
  const stats = new Map();
  state.records.forEach((record) => {
    (record.details || []).forEach((detail) => {
      if (detail.status !== "incorrect") return;
      const key = detail.number;
      const item = stats.get(key) || { number: detail.number, chapter: detail.chapter, count: 0 };
      item.count += 1;
      stats.set(key, item);
    });
  });
  const rows = Array.from(stats.values())
    .sort((a, b) => b.count - a.count || a.number - b.number)
    .slice(0, 15)
    .map((item, index) => {
      const rate = totalRecords ? Math.round((item.count / totalRecords) * 100) : 0;
      return `<tr><td>${index + 1}</td><td>${item.number}번</td><td>${escapeHTML(item.chapter || "-")}</td><td>${item.count}</td><td>${rate}%</td></tr>`;
    });
  $("#wrongBody").innerHTML = rows.length ? rows.join("") : emptyRow(5, "오답 집계 데이터가 없습니다.");
}

function renderDistribution() {
  const bins = [
    { label: "0-59", min: 0, max: 59 },
    { label: "60-69", min: 60, max: 69 },
    { label: "70-79", min: 70, max: 79 },
    { label: "80-89", min: 80, max: 89 },
    { label: "90-100", min: 90, max: 100 }
  ];
  const maxCount = Math.max(1, ...bins.map((bin) => countInRange(bin.min, bin.max)));
  $("#distributionChart").innerHTML = bins.map((bin) => {
    const count = countInRange(bin.min, bin.max);
    const width = Math.round((count / maxCount) * 100);
    return `
      <div class="bar-row">
        <strong>${bin.label}</strong>
        <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
        <span>${count}명</span>
      </div>
    `;
  }).join("");
}

function countInRange(min, max) {
  return state.records.filter((record) => Number(record.score || 0) >= min && Number(record.score || 0) <= max).length;
}

function renderSendPanel() {
  const body = $("#sendBody");
  if (!state.records.length) {
    body.innerHTML = emptyRow(5, "발송할 응시 기록이 없습니다.");
    return;
  }
  body.innerHTML = state.records.map((record) => `
    <tr>
      <td><input type="checkbox" data-send-id="${record.submissionId}" ${state.sendSelection.has(record.submissionId) ? "checked" : ""} /></td>
      <td>${escapeHTML(record.candidate?.name || "-")}</td>
      <td>${escapeHTML(record.candidate?.email || "-")}</td>
      <td>${record.score}점</td>
      <td>${formatDateTime(record.submittedAt)}</td>
    </tr>
  `).join("");
  body.querySelectorAll("[data-send-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.sendSelection.add(checkbox.dataset.sendId);
      else state.sendSelection.delete(checkbox.dataset.sendId);
    });
  });
}

function selectAllSendRecords() {
  state.records.forEach((record) => state.sendSelection.add(record.submissionId));
  renderSendPanel();
}

function clearSendRecords() {
  state.sendSelection.clear();
  renderSendPanel();
}

function sendSelectedRecords() {
  const selected = state.records.filter((record) => state.sendSelection.has(record.submissionId));
  if (!selected.length) {
    alert("발송할 기록을 선택하세요.");
    return;
  }
  if (!APP_CONFIG.appsScriptUrl) {
    alert("app.js의 appsScriptUrl을 먼저 설정하세요.");
    return;
  }
  selected.forEach((record) => requestEmailSend(record, "sendResult"));
  alert(`${selected.length}건의 결과 메일 발송을 요청했습니다.`);
  renderAdmin();
}

function renderAdminFilters() {
  const chapters = unique(QUESTIONS.map((q) => q.chapter).filter(Boolean));
  const difficulties = unique(QUESTIONS.map((q) => q.difficulty).filter(Boolean));
  $("#filterChapter").insertAdjacentHTML("beforeend", chapters.map((item) => `<option value="${escapeAttribute(item)}">${escapeHTML(item)}</option>`).join(""));
  $("#filterDifficulty").insertAdjacentHTML("beforeend", difficulties.map((item) => `<option value="${escapeAttribute(item)}">${escapeHTML(item)}</option>`).join(""));
}

function renderAnswerKey() {
  const chapter = $("#filterChapter").value;
  const type = $("#filterType").value;
  const difficulty = $("#filterDifficulty").value;
  const rows = QUESTIONS
    .map((q, index) => ({ ...q, number: index + 1 }))
    .filter((q) => !chapter || q.chapter === chapter)
    .filter((q) => !type || q.type === type)
    .filter((q) => !difficulty || q.difficulty === difficulty)
    .map((q) => `<tr><td>${q.number}번</td><td>${escapeHTML(q.chapter || "-")}</td><td>${formatType(q.type)}</td><td>${escapeHTML(q.difficulty || "-")}</td><td>${escapeHTML(formatCorrectAnswer(q))}</td></tr>`);
  $("#answerKeyBody").innerHTML = rows.length ? rows.join("") : emptyRow(5, "조건에 맞는 문항이 없습니다.");
}

function switchAdminTab(tab) {
  state.activeTab = tab;
  $$(".tab").forEach((button) => button.classList.toggle("is-active", button.dataset.tab === tab));
  $$(".tab-panel").forEach((panel) => panel.classList.remove("is-active"));
  $(`#${tab}Panel`).classList.add("is-active");
}

function loadBackendRecords() {
  if (!APP_CONFIG.appsScriptUrl) {
    alert("app.js의 appsScriptUrl을 먼저 설정하세요.");
    return;
  }
  const callbackName = `maypureBackendCallback_${Date.now()}`;
  window[callbackName] = (response) => {
    try {
      if (!response || response.ok === false) throw new Error(response?.error || "기록을 불러올 수 없습니다.");
      const backendRecords = Array.isArray(response.records) ? response.records : [];
      const merged = [...backendRecords, ...state.records];
      const uniqueById = new Map();
      merged.forEach((record) => uniqueById.set(record.submissionId, record));
      state.records = Array.from(uniqueById.values()).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      saveLocalRecords(state.records);
      renderAdmin();
      alert(`구글 시트 기록 ${backendRecords.length}건을 불러왔습니다.`);
    } catch (error) {
      alert(error.message);
    } finally {
      delete window[callbackName];
      script.remove();
    }
  };

  const url = new URL(APP_CONFIG.appsScriptUrl);
  url.searchParams.set("action", "list");
  url.searchParams.set("token", APP_CONFIG.backendToken);
  url.searchParams.set("callback", callbackName);

  const script = document.createElement("script");
  script.src = url.toString();
  script.onerror = () => {
    delete window[callbackName];
    script.remove();
    alert("구글 시트 기록 불러오기에 실패했습니다.");
  };
  document.body.appendChild(script);
}

function downloadLastResult() {
  if (!state.lastRecord) return;
  const blob = new Blob([JSON.stringify(state.lastRecord, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `maypure-result-${state.lastRecord.candidate.name}-${state.lastRecord.submissionId}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function loadLocalRecords() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRecords(records) {
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(records));
}

function emptyRow(colspan, message) {
  return `<tr><td colspan="${colspan}" class="empty-state">${escapeHTML(message)}</td></tr>`;
}

function hasAnswer(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function normalizeAnswer(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function formatTime(totalSec) {
  const sec = Math.max(0, totalSec);
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatSelectedAnswer(detail) {
  if (detail.type === "multiple") return detail.selectedNumber ? `${detail.selectedNumber}번` : "미응답";
  return detail.selectedText || "미응답";
}

function formatCorrectAnswer(question) {
  if (question.type === "multiple") return `${question.answer}번`;
  if (Array.isArray(question.answer)) return question.answer.join(" / ");
  return question.answer || "관리자 검토";
}

function formatType(type) {
  return { multiple: "객관식", short: "단답", essay: "서술" }[type] || type;
}

function statusBadge(status) {
  const label = { correct: "정답", incorrect: "오답", review: "검토 필요" }[status] || "-";
  const className = { correct: "correct", incorrect: "incorrect", review: "review" }[status] || "";
  return `<span class="status ${className}">${label}</span>`;
}

function createId() {
  return `mp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function unique(values) {
  return Array.from(new Set(values));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function escapeAttribute(value) {
  return escapeHTML(value).replace(/`/g, "&#96;");
}
