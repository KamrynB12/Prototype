const citizenId = "C-1001";
const demoDate = "Oct 19, 2026";

const applications = [
  {
    id: "CR-2026-1042",
    citizenId,
    name: "Jordan Davis",
    email: "jordan.davis@example.com",
    age: "32",
    ssnLast4: "••••",
    certificate: "Birth certificate",
    submitted: "Oct 16, 2026",
    status: "In review",
    decisionDate: "",
    assignedTo: "demo-admin",
    match: "Matched",
    reason: "",
    document: "Identity_document.pdf",
    events: [{ title: "Application submitted", detail: "Oct 16, 2026 · Request received" }]
  },
  {
    id: "CR-2026-1038",
    citizenId: "C-1002",
    name: "Taylor Morgan",
    email: "taylor.morgan@example.com",
    age: "41",
    ssnLast4: "••••",
    certificate: "Marriage certificate",
    submitted: "Oct 14, 2026",
    status: "Needs review",
    decisionDate: "",
    assignedTo: "demo-admin",
    match: "Mismatch flagged",
    reason: "",
    document: "Supporting_document.pdf",
    events: [{ title: "Application submitted", detail: "Oct 14, 2026 · Request received" }]
  },
  {
    id: "CR-2026-1021",
    citizenId,
    name: "Jordan Davis",
    email: "jordan.davis@example.com",
    age: "32",
    ssnLast4: "••••",
    certificate: "Proof of residency",
    submitted: "Oct 08, 2026",
    status: "Approved",
    decisionDate: "Oct 11, 2026",
    assignedTo: "demo-admin",
    match: "Matched",
    reason: "Applicant information matched available records and the request met certificate issuance requirements.",
    document: "Residency_record.pdf",
    events: [
      { title: "Application approved", detail: "Oct 11, 2026 · Demo email notification sent" },
      { title: "Application submitted", detail: "Oct 08, 2026 · Request received" }
    ]
  },
  {
    id: "CR-2026-1015",
    citizenId: "C-1003",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    age: "28",
    ssnLast4: "••••",
    certificate: "Birth certificate",
    submitted: "Oct 05, 2026",
    status: "Rejected",
    decisionDate: "Oct 07, 2026",
    assignedTo: "demo-admin",
    match: "Matched",
    reason: "The uploaded proof of identity was not legible. Please submit a clearer copy.",
    document: "Identity_document.pdf",
    events: [
      { title: "Application denied", detail: "Oct 07, 2026 · Demo email notification sent" },
      { title: "Application submitted", detail: "Oct 05, 2026 · Request received" }
    ]
  }
];

const state = { role: "citizen", page: "dashboard", selectedId: null, filter: "all", search: "", adminCategory: "assigned" };
const navItems = {
  citizen: [
    ["dashboard", "Overview", "⌂"],
    ["applications", "My applications", "▤"],
    ["new", "Request a certificate", "+"],
    ["documents", "My documents", "▧"]
  ],
  admin: [
    ["dashboard", "Overview", "⌂"],
    ["applications", "Application queue", "▤"],
    ["history", "Admin history", "◷"],
    ["documents", "Documents", "▧"]
  ]
};

const main = document.querySelector("#main-content");
const navigation = document.querySelector("#navigation");
const pageLabels = { dashboard: "Overview", applications: "Applications", history: "Admin history", new: "New request", documents: "Documents", detail: "Application details" };
const loginPage = document.querySelector("#login-page");
const appShell = document.querySelector("#app-shell");
const chatWidget = document.querySelector("#chat-widget");
const chatLauncher = document.querySelector("#chat-launcher");

function visibleApplications() {
  return state.role === "citizen"
    ? applications.filter(application => application.citizenId === citizenId)
    : applications.filter(application => application.assignedTo === "demo-admin");
}

function statusClass(status) {
  return ({ "Needs review": "pending", "In review": "review", Approved: "approved", Rejected: "rejected" })[status] || "review";
}

function statusPill(status) {
  return `<span class="status ${statusClass(status)}">${status}</span>`;
}

function setNavigation() {
  const items = navItems[state.role];
  navigation.innerHTML = items.map(([id, label, icon]) =>
    `<a class="nav-link ${state.page === id || (state.page === "detail" && (id === "applications" || id === state.detailReturnPage)) ? "active" : ""}" href="#" data-page="${id}">
      <span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>
      ${state.role === "admin" && id === "applications" ? `<span class="nav-count">${visibleApplications().filter(item => item.status === "Needs review" || item.status === "In review").length}</span>` : ""}
    </a>`
  ).join("");
}

function pageHeading(title, intro, button = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${state.role === "admin" ? "STAFF WORKSPACE" : "CITIZEN PORTAL"}</div><h1>${title}</h1><p class="page-intro">${intro}</p></div>${button}</div>`;
}

function applicationTable(items, { admin = false, compact = false } = {}) {
  if (!items.length) return `<div class="empty-state">Nothing to show just yet.</div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>REQUEST</th>${admin ? "<th>APPLICANT</th>" : ""}<th>SUBMITTED</th><th>STATUS</th>${admin ? "<th>RECORD CHECK</th>" : ""}</tr></thead>
    <tbody>${items.map(item => `<tr data-open="${item.id}">
      <td><span class="cell-title">${item.certificate}</span><span class="cell-subtitle">${item.id}</span></td>
      ${admin ? `<td><span class="cell-title">${item.name}</span><span class="cell-subtitle">${item.email}</span></td>` : ""}
      <td>${item.submitted}</td><td>${statusPill(item.status)}</td>
      ${admin ? `<td>${item.match === "Mismatch flagged" ? '<span class="status flagged">Mismatch flagged</span>' : '<span class="cell-title">Matched</span>'}</td>` : ""}
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function renderCitizenDashboard() {
  const mine = visibleApplications();
  const inProgress = mine.filter(item => item.status === "Needs review" || item.status === "In review").length;
  const approved = mine.filter(item => item.status === "Approved").length;
  const recent = [...mine].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 4);
  main.innerHTML = `
    <div class="welcome-card"><div><div class="eyebrow">YOUR CIVICDESK ACCOUNT</div><h1>Good afternoon, Jordan</h1><p>Request an official certificate, keep track of its progress, and find your documents in one place.</p></div><span class="welcome-badge">Account verified</span></div>
    <div class="stats-grid">
      <div class="stat-card"><div><div class="stat-label">Total requests</div><div class="stat-value">${mine.length}</div></div><span class="stat-icon">▤</span></div>
      <div class="stat-card"><div><div class="stat-label">In progress</div><div class="stat-value">${inProgress}</div></div><span class="stat-icon amber">◷</span></div>
      <div class="stat-card"><div><div class="stat-label">Approved</div><div class="stat-value">${approved}</div></div><span class="stat-icon blue">✓</span></div>
    </div>
    <div class="notice"><span class="notice-icon">ⓘ</span><div><strong>How requests work</strong><br>Complete the required information and upload supporting documents. An administrator reviews your request before any certificate can be issued.</div></div>
    <section class="panel"><div class="panel-heading"><div><h2>Recent applications</h2><p>Keep an eye on your requests and their latest status.</p></div><a href="#" class="text-link" data-page="applications">View all →</a></div>${applicationTable(recent)}</section>
  `;
}

function renderAdminDashboard() {
  const assigned = visibleApplications();
  const flagged = assigned.filter(item => item.match === "Mismatch flagged");
  const pending = assigned.filter(item => item.status === "Needs review" || item.status === "In review");
  const categories = {
    assigned: { title: "Assigned applications", description: "All applications assigned to your review queue.", items: assigned },
    awaiting: { title: "Awaiting review", description: "Requests that still need an administrator decision.", items: pending },
    discrepancies: { title: "Record discrepancies", description: "Requests flagged because submitted information did not match available records.", items: flagged }
  };
  const selectedCategory = categories[state.adminCategory] || categories.assigned;
  main.innerHTML = `
    ${pageHeading("Good afternoon, Casey", "Here’s an overview of the certificate requests assigned to your team.", '<a class="button secondary small" href="#" data-page="applications">Open application queue →</a>')}
    <div class="stats-grid">
      <button class="stat-card stat-card-button" type="button" data-admin-category="assigned" aria-pressed="${state.adminCategory === "assigned"}"><span><span class="stat-label">Assigned to you</span><span class="stat-value">${assigned.length}</span></span><span class="stat-icon">▤</span></button>
      <button class="stat-card stat-card-button" type="button" data-admin-category="awaiting" aria-pressed="${state.adminCategory === "awaiting"}"><span><span class="stat-label">Awaiting review</span><span class="stat-value">${pending.length}</span></span><span class="stat-icon amber">◷</span></button>
      <button class="stat-card stat-card-button" type="button" data-admin-category="discrepancies" aria-pressed="${state.adminCategory === "discrepancies"}"><span><span class="stat-label">Record discrepancies</span><span class="stat-value">${flagged.length}</span></span><span class="stat-icon blue">⚑</span></button>
    </div>
    ${flagged.length ? `<div class="notice"><span class="notice-icon">⚑</span><div><strong>${flagged.length} request needs a closer look.</strong><br>Submitted information did not match the available records. Review the flagged application before making a decision.</div></div>` : ""}
    <section class="panel"><div class="panel-heading"><div><h2>${selectedCategory.title}</h2><p>${selectedCategory.description}</p></div><span class="nav-count">${selectedCategory.items.length}</span></div>${applicationTable(selectedCategory.items, { admin: true })}</section>
    <p class="readonly-note">You can review request documents, but official documents cannot be changed in this portal.</p>`;
}

function renderApplicationList() {
  const all = visibleApplications();
  const statuses = ["all", "Needs review", "In review", "Approved", "Rejected"];
  const filtered = all.filter(item => {
    const statusMatches = state.filter === "all" || item.status === state.filter;
    const term = state.search.toLowerCase();
    const searchMatches = !term || `${item.id} ${item.name} ${item.certificate}`.toLowerCase().includes(term);
    return statusMatches && searchMatches;
  });
  main.innerHTML = `
    ${pageHeading(state.role === "admin" ? "Application queue" : "My applications", state.role === "admin" ? "Review requests assigned to your team and record a decision." : "See the latest status of your certificate requests.", state.role === "citizen" ? '<a class="button" href="#" data-page="new"><span>＋</span> New request</a>' : "")}
    <section class="panel"><div class="panel-heading"><div><h2>${state.role === "admin" ? "Assigned requests" : "All requests"}</h2><p>${state.role === "admin" ? `${all.length} assigned applications` : `${all.length} applications in your account`}</p></div>
      <div class="filter-row"><input class="search-input" id="application-search" type="search" placeholder="${state.role === "admin" ? "Search requests" : "Search certificates"}" value="${escapeHtml(state.search)}" aria-label="Search applications"><select class="select-input" id="status-filter" aria-label="Filter by status">${statuses.map(status => `<option value="${status}" ${state.filter === status ? "selected" : ""}>${status === "all" ? "All statuses" : status}</option>`).join("")}</select></div>
    </div>${applicationTable(filtered, { admin: state.role === "admin" })}</section>
    ${state.role === "citizen" ? '<div class="contact-card">Questions about a request? Contact the certificate administrator at <a href="mailto:certificates@example.gov">certificates@example.gov</a> or call (555) 010-2020.</div>' : '<p class="readonly-note">Staff access in this preview is limited to assigned applications and their related documents.</p>'}`;
}

function renderAdminHistory() {
  if (state.role !== "admin") {
    state.page = "applications";
    render();
    return;
  }
  const decided = applications
    .filter(item => item.status === "Approved" || item.status === "Rejected")
    .sort((a, b) => b.decisionDate.localeCompare(a.decisionDate));
  main.innerHTML = `
    ${pageHeading("Admin history", "Review all approved and denied applications, their decision dates, applicant information, and recorded reasons.", "")}
    <section class="panel"><div class="panel-heading"><div><h2>Completed decisions</h2><p>Showing ${decided.length} approved or denied ${decided.length === 1 ? "application" : "applications"}.</p></div></div>
      ${decided.length ? `<div class="table-wrap"><table>
        <thead><tr><th>APPLICATION</th><th>APPLICANT</th><th>DECISION</th><th>DECISION DATE</th><th>DECISION REASON</th></tr></thead>
        <tbody>${decided.map(item => `<tr data-open="${item.id}">
          <td><span class="cell-title">${escapeHtml(item.certificate)}</span><span class="cell-subtitle">${item.id}</span></td>
          <td><span class="cell-title">${escapeHtml(item.name)}</span><span class="cell-subtitle">${escapeHtml(item.email)}</span></td>
          <td>${statusPill(item.status)}</td>
          <td>${escapeHtml(item.decisionDate || "Date not recorded")}</td>
          <td class="history-reason">${escapeHtml(item.reason || "No decision reason recorded.")}</td>
        </tr>`).join("")}</tbody>
      </table></div>` : '<div class="empty-state">Approved and denied applications will appear here.</div>'}
    </section>
    <p class="readonly-note">Select an application to view the applicant’s full request details and decision history.</p>`;
}

function renderNewRequest() {
  main.innerHTML = `
    ${pageHeading("Request a certificate", "Fill in the details below. Required information must be complete before your request can be reviewed.", "")}
    <div class="notice"><span class="notice-icon">ⓘ</span><div><strong>Demo form — do not enter real personal information.</strong><br>This preview does not securely submit or store applications. Use fictional details only.</div></div>
    <div class="form-layout"><form class="panel form-panel" id="request-form" autocomplete="off">
      <section class="form-section"><h2>Certificate details</h2><p>Tell us which official document you need.</p><div class="form-grid">
        <div class="field full"><label for="certificate-type">Certificate type <span aria-hidden="true">*</span></label><select required id="certificate-type" name="certificate"><option value="">Choose a certificate</option><option>Birth certificate</option><option>Marriage certificate</option><option>Death certificate</option><option>Proof of residency</option></select></div>
        <div class="field full"><label for="request-purpose">Reason for request</label><textarea id="request-purpose" name="purpose" placeholder="Briefly describe why you need this certificate"></textarea></div>
      </div></section>
      <section class="form-section"><h2>Applicant information</h2><p>Enter details as they appear in official records.</p><div class="form-grid">
        <div class="field"><label for="full-name">Full legal name *</label><input required id="full-name" name="name" placeholder="e.g. Jordan Davis"></div>
        <div class="field"><label for="age">Age *</label><input required id="age" name="age" type="number" min="0" max="125" placeholder="Your age"></div>
        <div class="field"><label for="email">Email address *</label><input required id="email" name="email" type="email" placeholder="you@example.com"></div>
        <div class="field"><label for="ssn">Social Security number *</label><input required id="ssn" name="ssn" type="password" inputmode="numeric" maxlength="11" placeholder="XXX-XX-XXXX" autocomplete="new-password"><span class="field-hint">Fictional value only in this demo. Real SSNs must never be entered here.</span></div>
      </div></section>
      <section class="form-section"><h2>Supporting documents</h2><p>Attach documents needed to verify your request.</p>
        <div class="upload-box"><span class="upload-icon" aria-hidden="true">⇧</span><div class="upload-copy"><strong>Choose a supporting file</strong><span>PDF, JPG, or PNG · Up to 10 MB</span></div><input type="file" id="supporting-file" aria-label="Upload supporting document" accept=".pdf,.jpg,.jpeg,.png"></div>
      </section>
      <div class="form-actions"><button class="button secondary" type="button" data-page="applications">Cancel</button><button class="button" type="submit">Submit request →</button></div>
    </form>
    <aside class="panel side-card"><h3>What happens next?</h3><p>Every request is reviewed by an administrator before a certificate can be issued.</p><div class="steps">
      <div class="step"><span class="step-number">1</span><div class="step-copy"><strong>Submit your request</strong><span>Complete all required fields and include supporting information.</span></div></div>
      <div class="step"><span class="step-number">2</span><div class="step-copy"><strong>Administrator review</strong><span>Your details are checked against available records.</span></div></div>
      <div class="step"><span class="step-number">3</span><div class="step-copy"><strong>Get an update</strong><span>Your application status changes after a decision. Email is simulated in this demo.</span></div></div>
    </div></aside></div>`;
}

function renderDocuments() {
  const related = visibleApplications().filter(item => item.document && (item.status === "Approved" || state.role === "admin"));
  main.innerHTML = `
    ${pageHeading(state.role === "admin" ? "Related documents" : "My documents", state.role === "admin" ? "View documents attached to applications assigned to your work." : "Access documents related to your own certificate requests.", "")}
    <div class="notice"><span class="notice-icon">▧</span><div><strong>Read-only access</strong><br>Official documents are available for review only and cannot be edited through this portal.</div></div>
    <section class="panel"><div class="panel-heading"><div><h2>${state.role === "admin" ? "Assigned application documents" : "Available documents"}</h2><p>${related.length} ${related.length === 1 ? "document" : "documents"} available</p></div></div>
    ${related.length ? related.map(item => `<div class="file-card"><span class="file-type">PDF</span><div class="file-name"><strong>${escapeHtml(item.document)}</strong><span>${escapeHtml(item.certificate)} · ${item.id}</span></div><span class="readonly-label">READ ONLY</span><button class="button secondary small" type="button" data-open="${item.id}">View request</button></div>`).join("") : '<div class="empty-state">Documents will appear here when available.</div>'}
    </section>${state.role === "citizen" ? '<p class="readonly-note">You can only view documents associated with your own account.</p>' : '<p class="readonly-note">Only documents associated with applications assigned to your review queue are shown.</p>'}`;
}

function renderDetail() {
  const item = applications.find(application => application.id === state.selectedId && (state.role === "admin" || application.citizenId === citizenId));
  if (!item) {
    state.page = "applications";
    render();
    return;
  }
  const admin = state.role === "admin";
  const returnPage = state.detailReturnPage === "history" && admin ? "history" : "applications";
  main.innerHTML = `
    <div class="detail-header"><button class="back-button" type="button" data-page="${returnPage}" aria-label="Back to ${returnPage === "history" ? "admin history" : "applications"}">←</button><div><div class="eyebrow">${admin ? "APPLICATION REVIEW" : "YOUR REQUEST"}</div><h1>${escapeHtml(item.certificate)}</h1><p>${item.id} <span aria-hidden="true">·</span> Submitted ${item.submitted}${item.decisionDate ? ` <span aria-hidden="true">·</span> Decision ${escapeHtml(item.decisionDate)}` : ""}</p></div><div style="margin-left:auto">${statusPill(item.status)}</div></div>
    ${admin && item.match === "Mismatch flagged" ? '<div class="flag-banner"><strong>⚑ Record discrepancy detected.</strong> The submitted information does not match available records. Verify the details against the official source before deciding.</div>' : ""}
    <section class="panel"><div class="panel-heading"><div><h2>${admin ? "Applicant information" : "Request information"}</h2><p>${admin ? "Details submitted for this certificate request." : "Information provided with your application."}</p></div></div>
      <div style="padding:17px 19px"><div class="details-grid">
        <div class="detail-field"><span>Applicant</span><strong>${escapeHtml(item.name)}</strong></div><div class="detail-field"><span>Email address</span><strong>${escapeHtml(item.email)}</strong></div><div class="detail-field"><span>Age</span><strong>${escapeHtml(item.age)}</strong></div>
        <div class="detail-field"><span>Social Security number</span><strong>${item.ssnLast4}</strong></div><div class="detail-field"><span>Record check</span><strong>${escapeHtml(item.match)}</strong></div><div class="detail-field"><span>Assigned reviewer</span><strong>${admin ? "Casey Admin" : "Certificate team"}</strong></div>
      </div>${item.status === "Approved" || item.status === "Rejected" ? `<div class="contact-card"><strong>${item.status === "Approved" ? "Approval reason" : "Denial reason"}:</strong> ${escapeHtml(item.reason || "No decision reason recorded.")}${item.status === "Rejected" ? '<br>Need help? Contact <a href="mailto:certificates@example.gov">certificates@example.gov</a> or call (555) 010-2020.' : ""}</div>` : ""}
      <div class="record-actions">${item.document ? `<button class="button secondary small" type="button" data-file="${item.id}">▧ View supporting document</button>` : ""}
        ${admin && (item.status === "Needs review" || item.status === "In review") ? `<button class="button" type="button" data-decision="approve" data-id="${item.id}">Approve request</button><button class="button danger" type="button" data-decision="reject" data-id="${item.id}">Deny request</button>` : ""}
      </div><p class="readonly-note">Official documents are read-only. ${admin ? "Administrator decisions update the demo status and simulate an email notification." : "You can view only your own request information and documents."}</p></div>
    </section>
    <div class="section-title">Request activity</div><section class="panel"><div class="timeline">${item.events.map(event => `<div class="timeline-item"><span class="timeline-marker"></span><div class="timeline-copy"><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(event.detail)}</span></div></div>`).join("")}</div></section>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function render() {
  setNavigation();
  document.querySelector("#page-label").textContent = pageLabels[state.page] || "Overview";
  if (state.page === "dashboard") state.role === "admin" ? renderAdminDashboard() : renderCitizenDashboard();
  if (state.page === "applications") renderApplicationList();
  if (state.page === "history") renderAdminHistory();
  if (state.page === "new") renderNewRequest();
  if (state.page === "documents") renderDocuments();
  if (state.page === "detail") renderDetail();
}

function updateProfile() {
  const isAdmin = state.role === "admin";
  document.querySelector("#user-name").textContent = isAdmin ? "Casey Admin" : "Jordan Davis";
  document.querySelector("#user-role").textContent = isAdmin ? "Administrator preview" : "Citizen account";
  document.querySelector("#user-avatar").textContent = isAdmin ? "CA" : "JD";
  document.querySelector("#role-switch").value = state.role;
}

function setChatOpen(isOpen) {
  const citizenSignedIn = !appShell.hidden && state.role === "citizen";
  chatWidget.hidden = !isOpen || !citizenSignedIn;
  chatLauncher.hidden = !citizenSignedIn || isOpen;
  if (isOpen && citizenSignedIn) document.querySelector("#chat-input").focus();
  else if (citizenSignedIn) chatLauncher.focus();
}

function resetChatConversation() {
  document.querySelector("#chat-messages").innerHTML = "";
  addChatMessage("Hi Jordan! I can help explain how certificate requests work. What would you like to know?", "assistant");
}

function addChatMessage(text, type) {
  const message = document.createElement("div");
  message.className = `chat-message ${type === "citizen" ? "citizen-message" : "assistant-message"}`;
  message.textContent = text;
  document.querySelector("#chat-messages").append(message);
  message.scrollIntoView({ block: "nearest" });
}

function getChatReply(question) {
  const text = question.toLowerCase();
  if (/\b(status|progress|track|where is|application)\b/.test(text)) {
    return "You can check your requests in My applications. Open a request to see its current status and activity. I can’t look up or access your individual application in this demo.";
  }
  if (/\b(request|apply|certificate|form|submit)\b/.test(text)) {
    return "Choose Request a certificate, select the document type, and complete all required fields. An administrator must review the request before a certificate can be issued. This demo form is not a real submission service.";
  }
  if (/\b(deny|denied|reject|rejected|reason|appeal)\b/.test(text)) {
    return "If a request is denied, its status details should explain the reason and any next steps. For help with a decision, contact the certificate administrator at certificates@example.gov or (555) 010-2020.";
  }
  if (/\b(email|contact|help|administrator|admin|phone|call|support)\b/.test(text)) {
    return "You can contact the certificate administrator at certificates@example.gov or call (555) 010-2020. The Need a hand? option also links to support.";
  }
  if (/\b(document|upload|file|proof)\b/.test(text)) {
    return "Attach the supporting file in the certificate request form. Documents related to your own requests appear under My documents when available. This prototype doesn’t securely upload or store files.";
  }
  if (/\b(ssn|social security|password|private|privacy|secure|personal)\b/.test(text)) {
    return "Please don’t share an SSN, password, or other sensitive personal information here. This chat is a local demo and isn’t connected to a secure service.";
  }
  return "I can explain how to request a certificate, check application statuses, understand denial notices, or contact support. This is a demo assistant and doesn’t connect to a live AI service.";
}

function toast(message) {
  const region = document.querySelector("#toast-region");
  const element = document.createElement("div");
  element.className = "toast";
  element.textContent = message;
  region.append(element);
  window.setTimeout(() => element.remove(), 3800);
}

function openApplication(id) {
  state.detailReturnPage = state.page;
  state.selectedId = id;
  state.page = "detail";
  render();
}

document.querySelector("#login-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  state.role = document.querySelector("#login-role").value;
  state.page = "dashboard";
  state.selectedId = null;
  updateProfile();
  loginPage.hidden = true;
  appShell.hidden = false;
  render();
  if (state.role === "citizen") {
    resetChatConversation();
    setChatOpen(true);
  } else {
    setChatOpen(false);
  }
});

document.querySelector("#sign-out").addEventListener("click", () => {
  state.page = "dashboard";
  state.selectedId = null;
  document.querySelector("#login-form").reset();
  appShell.hidden = true;
  setChatOpen(false);
  document.querySelector("#chat-messages").innerHTML = "";
  loginPage.hidden = false;
});

document.querySelector("#chat-close").addEventListener("click", () => setChatOpen(false));
chatLauncher.addEventListener("click", () => setChatOpen(true));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !chatWidget.hidden) setChatOpen(false);
});

document.querySelector("#chat-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.querySelector("#chat-input");
  const question = input.value.trim();
  if (!question) return;
  addChatMessage(question, "citizen");
  addChatMessage(getChatReply(question), "assistant");
  input.value = "";
  input.focus();
});

document.querySelector("#chat-suggestions").addEventListener("click", event => {
  const button = event.target.closest("[data-chat-question]");
  if (!button) return;
  const question = button.dataset.chatQuestion;
  addChatMessage(question, "citizen");
  addChatMessage(getChatReply(question), "assistant");
});

navigation.addEventListener("click", event => {
  const link = event.target.closest("[data-page]");
  if (!link) return;
  event.preventDefault();
  state.page = link.dataset.page;
  state.selectedId = null;
  render();
});

document.querySelector(".brand").addEventListener("click", event => {
  event.preventDefault();
  state.page = "dashboard";
  render();
});

document.querySelector("#role-switch").addEventListener("change", event => {
  state.role = event.target.value;
  state.page = "dashboard";
  state.selectedId = null;
  state.search = "";
  state.filter = "all";
  updateProfile();
  render();
  setChatOpen(false);
});

main.addEventListener("click", event => {
  const categoryButton = event.target.closest("[data-admin-category]");
  if (categoryButton) {
    state.adminCategory = categoryButton.dataset.adminCategory;
    renderAdminDashboard();
    return;
  }
  const pageLink = event.target.closest("[data-page]");
  if (pageLink) {
    event.preventDefault();
    state.page = pageLink.dataset.page;
    state.selectedId = null;
    render();
    return;
  }
  const decision = event.target.closest("[data-decision]");
  if (decision) {
    const item = applications.find(application => application.id === decision.dataset.id);
    if (!item) return;
    if (decision.dataset.decision === "reject") {
      const reason = window.prompt("Enter the reason for denying this request:");
      if (!reason || !reason.trim()) {
        if (reason !== null) toast("A denial reason is required before you can submit this decision.");
        return;
      }
      item.status = "Rejected";
      item.reason = reason.trim();
      item.decisionDate = demoDate;
      item.events.unshift({ title: "Application denied", detail: `${demoDate} · Demo email notification sent` });
      toast(`Request denied. A demo email notification was sent to ${item.email}.`);
    } else {
      item.status = "Approved";
      item.reason = "Applicant information matched available records and the request met certificate issuance requirements.";
      item.decisionDate = demoDate;
      item.events.unshift({ title: "Application approved", detail: `${demoDate} · Demo email notification sent` });
      toast(`Request approved. A demo email notification was sent to ${item.email}.`);
    }
    render();
    return;
  }
  const row = event.target.closest("[data-open]");
  if (row) openApplication(row.dataset.open);
  const fileButton = event.target.closest("[data-file]");
  if (fileButton) toast("Read-only document preview: " + (applications.find(item => item.id === fileButton.dataset.file)?.document || "document"));
});

main.addEventListener("change", event => {
  if (event.target.id === "status-filter") {
    state.filter = event.target.value;
    renderApplicationList();
  }
});

main.addEventListener("input", event => {
  if (event.target.id === "application-search") {
    const cursor = event.target.selectionStart;
    state.search = event.target.value;
    renderApplicationList();
    const input = document.querySelector("#application-search");
    input.focus();
    input.setSelectionRange(cursor, cursor);
  }
  if (event.target.id === "ssn") {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 9);
    event.target.value = digits.length > 5
      ? `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
      : digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
  }
});

main.addEventListener("submit", event => {
  if (event.target.id !== "request-form") return;
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity()) return;
  const formData = new FormData(form);
  const file = form.querySelector("#supporting-file").files[0];
  const enteredSsn = String(formData.get("ssn") || "").replace(/\D/g, "");
  if (enteredSsn.length !== 9) {
    toast("Enter a 9-digit fictional SSN to complete the demo form.");
    return;
  }
  const name = String(formData.get("name")).trim();
  const id = `CR-2026-${Math.floor(1100 + Math.random() * 8900)}`;
  applications.unshift({
    id,
    citizenId,
    name,
    email: String(formData.get("email")).trim(),
    age: String(formData.get("age")),
    ssnLast4: `•••• ${enteredSsn.slice(-4)}`,
    certificate: String(formData.get("certificate")),
    submitted: demoDate,
    status: "Needs review",
    assignedTo: "demo-admin",
    match: "Not checked",
    reason: "",
    document: file ? file.name : "",
    events: [{ title: "Application submitted", detail: `${demoDate} · Request received` }]
  });
  form.reset();
  state.page = "applications";
  state.filter = "all";
  state.search = "";
  render();
  toast("Demo application submitted. Your request is awaiting administrator review.");
});

document.querySelector(".notification-button").addEventListener("click", () => {
  toast("Notifications are simulated in this prototype.");
});

updateProfile();
