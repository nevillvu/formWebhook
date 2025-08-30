// CONFIG
const WEBHOOK_URL = "https://n8n.sysflow.me/webhook-test/inputForm";

// DOM
const radioAuto = document.getElementById("radioAuto");
const radioManual = document.getElementById("radioManual");

const autoSection = document.getElementById("autoSection");
const manualSection = document.getElementById("manualSection");

const formActions = document.getElementById("formActions");
const form = document.getElementById("appForm");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");

// ================= Helper =================
function setRequiredForSection(section, requiredFields = []) {
  const fields = section.querySelectorAll("textarea, select, input");
  fields.forEach(f => {
    // field nào nằm trong danh sách requiredFields thì set required = true
    if (requiredFields.includes(f.id)) {
      f.required = true;
    } else {
      f.required = false;
    }
  });
}

function setStatus(msg, type = "muted") {
  if (!statusEl) return;
  statusEl.className = `status ${type}`;
  statusEl.textContent = msg;
}

function updateSection() {
  if (radioAuto.checked) {
    autoSection.classList.remove("hidden");
    manualSection.classList.add("hidden");
    formActions.classList.remove("hidden");

    // Auto: chỉ URL bắt buộc
    setRequiredForSection(autoSection, ["urlAuto"]);
    setRequiredForSection(manualSection, []);
  } else if (radioManual.checked) {
    manualSection.classList.remove("hidden");
    autoSection.classList.add("hidden");
    formActions.classList.remove("hidden");

    // Manual: Project + Content bắt buộc
    setRequiredForSection(manualSection, ["projectManual", "contentManual"]);
    setRequiredForSection(autoSection, []);
  } else {
    autoSection.classList.add("hidden");
    manualSection.classList.add("hidden");
    formActions.classList.add("hidden");

    setRequiredForSection(autoSection, []);
    setRequiredForSection(manualSection, []);
  }
}

// ================= Radio click =================
radioAuto.addEventListener("click", updateSection);
radioManual.addEventListener("click", updateSection);

// ================= Submit =================
let lastSubmitAt = 0;
const RATE_WINDOW_MS = 8000;

form.addEventListener("submit", async e => {
  e.preventDefault();

  const now = Date.now();
  if (now - lastSubmitAt < RATE_WINDOW_MS) {
    return setStatus(
      `Bạn đang gửi quá nhanh. Đợi ${Math.ceil((RATE_WINDOW_MS - (now - lastSubmitAt)) / 1000)}s…`,
      "err"
    );
  }
  lastSubmitAt = now;

  setStatus("Đang gửi dữ liệu…", "muted");

  const fd = new FormData(form);
  fd.append("_client_ts", String(now));
  fd.append("_client_ua", navigator.userAgent || "unknown");

  try {
    const res = await fetch(WEBHOOK_URL, { method: "POST", body: fd });
    if (res.ok) {
      let displayMsg = "";
      try {
        const data = await res.clone().json();
        if (data.message) displayMsg = `✅ ${data.message}`;
        else displayMsg = JSON.stringify(data);
      } catch {
        displayMsg = await res.text();
      }
      setStatus(displayMsg, "ok");
    } else {
      setStatus(`❌ Server trả lỗi ${res.status}.`, "err");
    }
  } catch {
    setStatus("❌ Không thể kết nối webhook.", "err");
  }
});

// ================= Reset =================
resetBtn.addEventListener("click", () => {
  form.reset();
  updateSection();
  setStatus("Đã reset form.", "muted");
});

// ================= Khởi tạo =================
document.addEventListener("DOMContentLoaded", updateSection);