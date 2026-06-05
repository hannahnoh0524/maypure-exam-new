:root {
  --bg: #f6f4ef;
  --surface: #ffffff;
  --surface-soft: #fbfaf7;
  --ink: #22211f;
  --muted: #76716a;
  --line: #e9e3da;
  --primary: #8f6f4f;
  --primary-strong: #6f5136;
  --primary-soft: #f2e8dd;
  --danger: #b54747;
  --danger-soft: #fff0f0;
  --success: #257753;
  --success-soft: #eaf7f0;
  --warning: #9a6b0f;
  --warning-soft: #fff6df;
  --shadow: 0 20px 60px rgba(50, 38, 25, 0.10);
  --radius-xl: 28px;
  --radius-lg: 20px;
  --radius-md: 14px;
}

* { box-sizing: border-box; }
html { min-height: 100%; }
body {
  margin: 0;
  min-height: 100%;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(143,111,79,0.18), transparent 32rem),
    linear-gradient(180deg, #fbfaf7 0%, var(--bg) 100%);
}
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: .55; }

.app-shell { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 28px 0 56px; }
.topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 28px; }
.brand-wrap { display: flex; align-items: center; gap: 14px; }
.brand-mark { width: 52px; height: 52px; border-radius: 17px; background: var(--ink); color: #fff; display: grid; place-items: center; font-weight: 800; letter-spacing: -.04em; }
.eyebrow { margin: 0 0 4px; font-size: 13px; font-weight: 700; color: var(--primary); letter-spacing: .08em; text-transform: uppercase; }
h1, h2, h3, p { margin-top: 0; }
h1 { margin: 0; font-size: clamp(22px, 3vw, 32px); letter-spacing: -.05em; }
.view { display: none; }
.view.is-active { display: block; }

.hero-card, .result-card, .question-card, .admin-header, .admin-metrics, .tab-panel, .exam-sidebar {
  background: rgba(255,255,255,.92);
  border: 1px solid rgba(233,227,218,.9);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
}
.hero-card { display: grid; grid-template-columns: 1.1fr .9fr; gap: 32px; padding: clamp(28px, 5vw, 56px); min-height: 520px; align-items: center; }
.hero-copy h2 { font-size: clamp(34px, 6vw, 64px); line-height: 1.02; letter-spacing: -.07em; margin: 22px 0 18px; }
.hero-copy p { max-width: 520px; color: var(--muted); line-height: 1.75; font-size: 17px; }
.pill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; background: var(--primary-soft); color: var(--primary-strong); font-weight: 700; font-size: 13px; }
.candidate-form { background: var(--surface-soft); border: 1px solid var(--line); border-radius: 24px; padding: 24px; display: grid; gap: 16px; }
label { display: grid; gap: 8px; font-weight: 700; color: var(--ink); }
label span, label { font-size: 14px; }
input, select, textarea { width: 100%; border: 1px solid var(--line); border-radius: 14px; padding: 13px 14px; background: #fff; color: var(--ink); outline: none; transition: border-color .18s, box-shadow .18s; }
input:focus, select:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(143,111,79,.14); }
.form-note, .panel-note { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.6; }

.primary-button, .secondary-button, .ghost-button, .danger-button {
  border: 0;
  border-radius: 14px;
  min-height: 44px;
  padding: 0 18px;
  font-weight: 800;
  transition: transform .16s, box-shadow .16s, background .16s;
}
.primary-button { background: var(--ink); color: #fff; box-shadow: 0 12px 26px rgba(34,33,31,.15); }
.primary-button:hover { transform: translateY(-1px); }
.secondary-button { background: #fff; color: var(--ink); border: 1px solid var(--line); }
.ghost-button { background: rgba(255,255,255,.62); color: var(--ink); border: 1px solid var(--line); }
.danger-button { background: var(--danger); color: #fff; }

.exam-layout { display: grid; grid-template-columns: 300px 1fr; gap: 22px; align-items: start; }
.exam-sidebar { padding: 18px; position: sticky; top: 20px; display: grid; gap: 14px; }
.timer-card, .progress-card { border: 1px solid var(--line); background: var(--surface-soft); border-radius: 20px; padding: 18px; }
.timer-card span, .progress-card span { display: block; color: var(--muted); font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.timer-card strong { font-size: 32px; letter-spacing: -.04em; }
.progress-head { display: flex; justify-content: space-between; align-items: center; }
.progress-head strong { font-size: 14px; }
.progress-track { height: 9px; border-radius: 999px; background: #eee8df; overflow: hidden; }
.progress-bar { height: 100%; width: 0%; background: var(--primary); transition: width .2s ease; }
.question-nav { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; max-height: 420px; overflow: auto; padding-right: 4px; }
.nav-dot { height: 38px; border-radius: 12px; border: 1px solid var(--line); background: #fff; font-weight: 800; color: var(--muted); }
.nav-dot.is-current { background: var(--ink); color: #fff; border-color: var(--ink); }
.nav-dot.is-answered:not(.is-current) { background: var(--primary-soft); color: var(--primary-strong); border-color: #e2cbb5; }
.question-card { padding: clamp(24px, 4vw, 42px); min-height: 560px; display: flex; flex-direction: column; }
.question-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
.question-meta span { padding: 7px 10px; border-radius: 999px; background: var(--surface-soft); border: 1px solid var(--line); font-weight: 800; color: var(--muted); font-size: 13px; }
.question-card h2 { font-size: clamp(24px, 3.2vw, 38px); line-height: 1.35; letter-spacing: -.04em; margin-bottom: 28px; }
.choice-area { display: grid; gap: 12px; margin-bottom: 28px; }
.choice-label { display: flex; gap: 13px; align-items: flex-start; padding: 16px; border: 1px solid var(--line); border-radius: 18px; background: #fff; cursor: pointer; transition: border-color .16s, box-shadow .16s, background .16s; }
.choice-label:hover { border-color: #d8c7b6; box-shadow: 0 10px 24px rgba(50,38,25,.06); }
.choice-label input { width: 18px; height: 18px; margin: 3px 0 0; flex: 0 0 auto; }
.choice-number { width: 26px; height: 26px; border-radius: 9px; background: var(--primary-soft); color: var(--primary-strong); display: grid; place-items: center; font-weight: 900; font-size: 13px; flex: 0 0 auto; }
.short-answer, .essay-answer { min-height: 54px; }
.essay-answer { min-height: 160px; resize: vertical; }
.question-actions { margin-top: auto; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }

.result-card { padding: clamp(24px, 4vw, 42px); }
.result-header { display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; }
.result-header h2, .admin-header h2 { font-size: clamp(28px, 4vw, 44px); letter-spacing: -.05em; margin-bottom: 0; }
.result-header p, .admin-header p { color: var(--muted); margin: 0; line-height: 1.6; }
.score-grid, .admin-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.score-grid div, .admin-metrics div { background: var(--surface-soft); border: 1px solid var(--line); border-radius: 20px; padding: 18px; }
.score-grid span, .admin-metrics span { display: block; color: var(--muted); font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.score-grid strong, .admin-metrics strong { font-size: 28px; letter-spacing: -.04em; }
.table-headline { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 12px; }
.table-headline h3 { margin: 0; }
.table-headline p { margin: 0; color: var(--muted); font-size: 13px; }
.table-wrap { width: 100%; overflow: auto; border: 1px solid var(--line); border-radius: 18px; background: #fff; }
table { width: 100%; border-collapse: collapse; min-width: 720px; }
th, td { padding: 13px 14px; border-bottom: 1px solid var(--line); text-align: left; font-size: 14px; vertical-align: middle; }
th { background: var(--surface-soft); color: var(--muted); font-weight: 900; white-space: nowrap; }
tr:last-child td { border-bottom: 0; }
.status { display: inline-flex; align-items: center; padding: 6px 9px; border-radius: 999px; font-weight: 900; font-size: 12px; }
.status.correct { background: var(--success-soft); color: var(--success); }
.status.incorrect { background: var(--danger-soft); color: var(--danger); }
.status.review { background: var(--warning-soft); color: var(--warning); }
.result-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; flex-wrap: wrap; }

.admin-header { padding: 26px; display: flex; justify-content: space-between; gap: 18px; align-items: center; margin-bottom: 18px; }
.admin-actions, .send-toolbar, .filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.admin-metrics { box-shadow: var(--shadow); border-radius: var(--radius-xl); padding: 0; background: transparent; border: 0; }
.tabs { display: flex; gap: 8px; overflow: auto; margin: 22px 0 14px; }
.tab { border: 1px solid var(--line); background: rgba(255,255,255,.75); color: var(--muted); border-radius: 999px; padding: 10px 16px; font-weight: 900; }
.tab.is-active { background: var(--ink); color: #fff; border-color: var(--ink); }
.tab-panel { display: none; padding: 18px; box-shadow: none; border-radius: 22px; }
.tab-panel.is-active { display: block; }
.send-toolbar { margin-bottom: 12px; }
.panel-note { margin-bottom: 14px; }
.filters { margin-bottom: 14px; }
.filters label { min-width: 180px; }
.icon-button { width: 34px; height: 34px; border-radius: 11px; border: 1px solid var(--line); background: #fff; color: var(--danger); font-weight: 900; }
.distribution-chart { display: grid; gap: 12px; }
.bar-row { display: grid; grid-template-columns: 80px 1fr 60px; gap: 12px; align-items: center; }
.bar-track { height: 28px; border-radius: 999px; background: var(--surface-soft); overflow: hidden; border: 1px solid var(--line); }
.bar-fill { height: 100%; background: var(--primary); border-radius: 999px; }

.admin-dialog { border: 0; border-radius: 24px; padding: 0; box-shadow: var(--shadow); width: min(420px, calc(100% - 36px)); }
.admin-dialog::backdrop { background: rgba(34,33,31,.36); backdrop-filter: blur(3px); }
.admin-dialog form { padding: 26px; display: grid; gap: 14px; }
.admin-dialog h3 { margin: 0; font-size: 24px; letter-spacing: -.04em; }
.admin-dialog p { margin: 0; color: var(--muted); }
.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; }
.error-text { color: var(--danger)!important; font-weight: 800; }
.empty-state { color: var(--muted); padding: 24px; text-align: center; }
.muted { color: var(--muted); }

@media (max-width: 920px) {
  .hero-card, .exam-layout { grid-template-columns: 1fr; }
  .exam-sidebar { position: static; }
  .question-nav { grid-template-columns: repeat(8, 1fr); max-height: 180px; }
  .score-grid, .admin-metrics { grid-template-columns: repeat(2, 1fr); }
  .admin-header { flex-direction: column; align-items: stretch; }
}

@media (max-width: 560px) {
  .app-shell { width: min(100% - 24px, 1180px); padding-top: 18px; }
  .topbar { align-items: flex-start; }
  .brand-mark { width: 44px; height: 44px; }
  .hero-card, .result-card, .question-card { border-radius: 22px; padding: 22px; }
  .question-nav { grid-template-columns: repeat(5, 1fr); }
  .score-grid, .admin-metrics { grid-template-columns: 1fr; }
  .table-headline { align-items: flex-start; flex-direction: column; }
}
