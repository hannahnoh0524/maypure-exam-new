<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Maypure+ 신입교육 시험</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand-wrap">
        <div class="brand-mark">M+</div>
        <div>
          <p class="eyebrow">Maypure+</p>
          <h1>신입교육 시험</h1>
        </div>
      </div>
      <button class="ghost-button" id="adminOpenButton" type="button">관리자</button>
    </header>

    <main>
      <section id="landingView" class="view is-active">
        <div class="hero-card">
          <div class="hero-copy">
            <span class="pill">전범위 평가 · <span data-question-count>0</span>문항 · <span data-duration-label>120</span>분</span>
            <h2>시험 정보를 입력하고 시작하세요.</h2>
            <p>제출 후 결과 메일에는 점수 요약과 문항별 선택 번호, 정답/오답 여부가 함께 발송됩니다.</p>
          </div>

          <form id="candidateForm" class="candidate-form">
            <label>
              <span>이름</span>
              <input id="candidateName" name="name" type="text" autocomplete="name" placeholder="예: 홍길동" required />
            </label>
            <label>
              <span>입사일</span>
              <input id="candidateHireDate" name="hireDate" type="date" required />
            </label>
            <label>
              <span>이메일</span>
              <input id="candidateEmail" name="email" type="email" autocomplete="email" placeholder="결과 수신용 이메일" required />
            </label>
            <button class="primary-button" type="submit">시험 시작</button>
            <p class="form-note">결과 이메일 발송은 Google Apps Script 설정 완료 후 작동합니다.</p>
          </form>
        </div>
      </section>

      <section id="examView" class="view">
        <div class="exam-layout">
          <aside class="exam-sidebar">
            <div class="timer-card">
              <span>남은 시간</span>
              <strong id="timerText">120:00</strong>
            </div>
            <div class="progress-card">
              <div class="progress-head">
                <span>진행률</span>
                <strong id="progressText">0 / 0</strong>
              </div>
              <div class="progress-track"><div id="progressBar" class="progress-bar"></div></div>
            </div>
            <div id="questionNav" class="question-nav" aria-label="문항 이동"></div>
          </aside>

          <section class="question-card">
            <div class="question-meta">
              <span id="questionNumber">1번</span>
              <span id="questionChapter">-</span>
              <span id="questionDifficulty">-</span>
            </div>
            <h2 id="questionText"></h2>
            <div id="choiceArea" class="choice-area"></div>
            <div class="question-actions">
              <button class="secondary-button" id="prevQuestionButton" type="button">이전</button>
              <button class="secondary-button" id="nextQuestionButton" type="button">다음</button>
              <button class="danger-button" id="submitExamButton" type="button">제출하기</button>
            </div>
          </section>
        </div>
      </section>

      <section id="resultView" class="view">
        <div class="result-card">
          <div class="result-header">
            <span class="pill">제출 완료</span>
            <h2>시험 결과</h2>
            <p id="emailStatusText">결과 메일 발송 상태를 확인 중입니다.</p>
          </div>
          <div class="score-grid">
            <div><span>점수</span><strong id="scoreText">0점</strong></div>
            <div><span>정답</span><strong id="correctText">0</strong></div>
            <div><span>오답</span><strong id="incorrectText">0</strong></div>
            <div><span>검토</span><strong id="reviewText">0</strong></div>
          </div>
          <div class="table-headline">
            <h3>문항별 결과</h3>
            <p>학생용 이메일과 동일하게 선택 번호와 정답/오답 여부만 표시합니다.</p>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>문항</th>
                  <th>내 선택</th>
                  <th>결과</th>
                </tr>
              </thead>
              <tbody id="resultTableBody"></tbody>
            </table>
          </div>
          <div class="result-actions">
            <button class="secondary-button" id="downloadResultButton" type="button">결과 JSON 다운로드</button>
            <button class="primary-button" id="restartButton" type="button">처음으로</button>
          </div>
        </div>
      </section>

      <section id="adminView" class="view">
        <div class="admin-header">
          <div>
            <span class="pill">관리자 대시보드</span>
            <h2>응시 기록 관리</h2>
            <p>브라우저 저장 기록과 Apps Script/Google Sheets 기록을 확인할 수 있습니다.</p>
          </div>
          <div class="admin-actions">
            <button class="secondary-button" id="loadBackendButton" type="button">구글 시트 기록 불러오기</button>
            <button class="ghost-button" id="adminLogoutButton" type="button">나가기</button>
          </div>
        </div>

        <div class="admin-metrics">
          <div><span>응시자</span><strong id="metricTotal">0</strong></div>
          <div><span>평균 점수</span><strong id="metricAverage">0점</strong></div>
          <div><span>최고 점수</span><strong id="metricMax">0점</strong></div>
          <div><span>메일 발송</span><strong id="metricMail">0</strong></div>
        </div>

        <div class="tabs" role="tablist">
          <button class="tab is-active" data-tab="records" type="button">현황</button>
          <button class="tab" data-tab="cohort" type="button">기수별</button>
          <button class="tab" data-tab="wrong" type="button">오답순위</button>
          <button class="tab" data-tab="distribution" type="button">분포</button>
          <button class="tab" data-tab="send" type="button">발송</button>
          <button class="tab" data-tab="answers" type="button">답지</button>
        </div>

        <div class="tab-panel is-active" id="recordsPanel">
          <div class="table-wrap">
            <table>
              <thead><tr><th>이름</th><th>입사일</th><th>이메일</th><th>점수</th><th>응시일시</th><th>메일</th><th>삭제</th></tr></thead>
              <tbody id="adminRecordsBody"></tbody>
            </table>
          </div>
        </div>

        <div class="tab-panel" id="cohortPanel">
          <div class="table-wrap">
            <table>
              <thead><tr><th>입사월</th><th>응시자</th><th>평균 점수</th><th>최고 점수</th></tr></thead>
              <tbody id="cohortBody"></tbody>
            </table>
          </div>
        </div>

        <div class="tab-panel" id="wrongPanel">
          <div class="table-wrap">
            <table>
              <thead><tr><th>순위</th><th>문항</th><th>챕터</th><th>오답 수</th><th>오답률</th></tr></thead>
              <tbody id="wrongBody"></tbody>
            </table>
          </div>
        </div>

        <div class="tab-panel" id="distributionPanel">
          <div id="distributionChart" class="distribution-chart"></div>
        </div>

        <div class="tab-panel" id="sendPanel">
          <div class="send-toolbar">
            <button class="secondary-button" id="selectAllSendButton" type="button">전체선택</button>
            <button class="secondary-button" id="clearSendButton" type="button">전체해제</button>
            <button class="primary-button" id="sendSelectedButton" type="button">선택 결과 메일 발송</button>
          </div>
          <p class="panel-note">학생용 메일은 정답 번호를 포함하지 않고, 문항별 선택 번호와 정답/오답 여부만 발송합니다.</p>
          <div class="table-wrap">
            <table>
              <thead><tr><th>선택</th><th>이름</th><th>이메일</th><th>점수</th><th>응시일시</th></tr></thead>
              <tbody id="sendBody"></tbody>
            </table>
          </div>
        </div>

        <div class="tab-panel" id="answersPanel">
          <div class="filters">
            <label>챕터 <select id="filterChapter"><option value="">전체</option></select></label>
            <label>유형 <select id="filterType"><option value="">전체</option><option value="multiple">객관식</option><option value="short">단답</option><option value="essay">서술</option></select></label>
            <label>난이도 <select id="filterDifficulty"><option value="">전체</option></select></label>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>문항</th><th>챕터</th><th>유형</th><th>난이도</th><th>정답</th></tr></thead>
              <tbody id="answerKeyBody"></tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  </div>

  <dialog id="adminDialog" class="admin-dialog">
    <form method="dialog" id="adminPinForm">
      <h3>관리자 접근</h3>
      <p>PIN을 입력하세요.</p>
      <input id="adminPinInput" type="password" inputmode="numeric" autocomplete="off" placeholder="PIN" />
      <p id="adminPinError" class="error-text" hidden>PIN이 올바르지 않습니다.</p>
      <div class="dialog-actions">
        <button class="secondary-button" value="cancel" type="button" id="adminCancelButton">취소</button>
        <button class="primary-button" value="default" type="submit">확인</button>
      </div>
    </form>
  </dialog>

  <script src="questions.js"></script>
  <script src="app.js"></script>
</body>
</html>
