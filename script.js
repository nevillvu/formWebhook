// CONFIG
const WEBHOOK_URL = "https://cndn.net/webhook/submit";
const STATIC_TOKEN = "MY_STATIC_SECRET_TOKEN";

// inject token (base64, không lộ plain text trong source)
function injectToken() {
  document.getElementById("__token").value = btoa(STATIC_TOKEN);
}
injectToken();

// radio toggle
const radioChat = document.getElementById("radioChat");
const radioForm = document.getElementById("radioForm");
const chatSection = document.getElementById("chatSection");
const formSection = document.getElementById("formSection");

function updateSection() {
  if (radioChat.checked) {
    chatSection.classList.add("show");
    formSection.classList.remove("show");
  } else {
    formSection.classList.add("show");
    chatSection.classList.remove("show");
  }
}
radioChat.addEventListener("change", updateSection);
radioForm.addEventListener("change", updateSection);

// rate limit + submit
let lastSubmitAt = 0;
const RATE_WINDOW_MS = 8000;

const form = document.getElementById("appForm");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");

function setStatus(msg, type = "muted") {
  statusEl.className = `status ${type}`;
  statusEl.textContent = msg;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const now = Date.now();
  if (now - lastSubmitAt < RATE_WINDOW_MS) {
    return setStatus(
      `Bạn đang gửi quá nhanh. Đợi ${Math.ceil(
        (RATE_WINDOW_MS - (now - lastSubmitAt)) / 1000
      )}s…`,
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
      const text = await res.text().catch(() => "OK");
      setStatus(`Gửi thành công: ${text.slice(0, 180)}`, "ok");
    } else {
      setStatus(`Server trả lỗi ${res.status}.`, "err");
    }
  } catch (err) {
    setStatus("Không thể kết nối webhook.", "err");
  }
});

resetBtn.addEventListener("click", () => {
  form.reset();
  injectToken();
  updateSection();
  setStatus("Đã reset form.", "muted");
});

// chặn F12 / chuột phải (cơ bản)
/*document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (
    k === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(k.toUpperCase())) ||
    (e.ctrlKey && k.toUpperCase() === "U")
  ) {
    e.preventDefault();
  }
});
*/