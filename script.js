// CONFIG
const WEBHOOK_URL = "https://n8n.sysflow.me/webhook/inputForm";

// DOM
const radioChat = document.getElementById("radioChat");
const radioForm = document.getElementById("radioForm");
const chatSection = document.getElementById("chatSection");
const formSection = document.getElementById("formSection");
const formActions = document.getElementById("formActions");
const form = document.getElementById("appForm");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");

// ================= Helper =================
function setRequiredForSection(section, isRequired) {
  const fields = section.querySelectorAll("input, textarea, select");
  fields.forEach(f => f.required = isRequired);
}

function setStatus(msg, type = "muted") {
  if (!statusEl) return;
  statusEl.className = `status ${type}`;
  statusEl.textContent = msg;
}

function updateSection() {
  if (radioChat.checked) {
    chatSection.classList.remove("hidden");
    formSection.classList.add("hidden");
    formActions.classList.remove("hidden");
    setRequiredForSection(chatSection, true);
    setRequiredForSection(formSection, false);
  } else if (radioForm.checked) {
    formSection.classList.remove("hidden");
    chatSection.classList.add("hidden");
    formActions.classList.remove("hidden");
    setRequiredForSection(formSection, true);
    setRequiredForSection(chatSection, false);
  } else {
    chatSection.classList.add("hidden");
    formSection.classList.add("hidden");
    formActions.classList.add("hidden");
    setRequiredForSection(chatSection, false);
    setRequiredForSection(formSection, false);
  }
}

// ================= Radio click =================
radioChat.addEventListener("click", updateSection);
radioForm.addEventListener("click", updateSection);

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
        // thử parse JSON
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

// ================= Chặn F12 / chuột phải =================
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("keydown", e => {
  const k = e.key.toUpperCase();
  if (
    k === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(k)) ||
    (e.ctrlKey && k === "U")
  ) {
    e.preventDefault();
  }
});

// ================= Khởi tạo =================
document.addEventListener("DOMContentLoaded", updateSection);
