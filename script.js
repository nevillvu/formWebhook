const WEBHOOK_URL = 'https://n8n.sysflow.me/webhook-test/inputForm';

let lastSubmitTime = 0;
const RATE_LIMIT_SECONDS = 10;

const supportedDomains = [
  "genk.vn",
  "vatvostudio.vn",
  "9to5mac.com",
  "macrumors.com"
];

// Chức năng chuyển tab
function showForm(formType) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (formType === 'automatic') {
    document.getElementById('automatic-form').classList.add('active');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
  } else if (formType === 'manual') {
    document.getElementById('manual-form').classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
  } else if (formType === 'transcript') {
    document.getElementById('transcript-form').classList.add('active');
    document.querySelectorAll('.tab-btn')[2].classList.add('active');
  }
}

// Chức năng clear form
function clearForm(formId) {
    document.getElementById(formId).reset();
}

// Chức năng hiển thị trạng thái
function updateStatus(message, type) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.style.backgroundColor =
        type === 'success' ? '#10b981' :
        type === 'error' ? '#ef4444' :
        '#6b7280';
    statusMessage.style.opacity = '1';

    setTimeout(() => {
        statusMessage.style.opacity = '0';
    }, 3000);
}

// Gửi dữ liệu vào webhook + rate limit
async function sendData(formElement, formType) {
    const currentTime = Date.now();
    const timeSinceLastSubmit = (currentTime - lastSubmitTime) / 1000;

    if (timeSinceLastSubmit < RATE_LIMIT_SECONDS) {
        const timeLeft = Math.ceil(RATE_LIMIT_SECONDS - timeSinceLastSubmit);
        updateStatus(`Vui lòng chờ ${timeLeft} giây trước khi gửi lại. ⏳`, 'error');
        return;
    }

    lastSubmitTime = currentTime;

    const submitBtn = formElement.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';

    const formData = new FormData(formElement);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    data.formType = formType;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            updateStatus('Gửi thành công! ✅', 'success');
        } else {
            updateStatus('Có lỗi khi gửi. ❌', 'error');
        }
    } catch (error) {
        updateStatus('Mạng hoặc server bị lỗi. ❌', 'error');
        console.error('Error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gửi';
    }
}

// Lắng nghe sự kiện submit form
document.getElementById('auto-form').addEventListener('submit', function(event) {
    event.preventDefault();
    sendData(this, 'auto');
});

document.getElementById('manual-form-content').addEventListener('submit', function(event) {
    event.preventDefault();
    sendData(this, 'manual');
});

document.getElementById('transcript-form-content').addEventListener('submit', function(event) {
    event.preventDefault();
    sendData(this, 'transcript');
});

document.getElementById('auto-text-input').addEventListener('input', function() {
  const value = this.value.trim();
  let domain = "";
  let isValidDomain = false;
  try {
    if (value.startsWith("http")) {
      domain = (new URL(value)).hostname.replace(/^www\./, '');
      isValidDomain = !!domain && domain.includes(".");
    } else if (value.includes(".")) {
      domain = value.replace(/^www\./, '').split('/')[0];
      isValidDomain = !!domain && domain.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    }
  } catch (e) {
    domain = "";
    isValidDomain = false;
  }
  const statusDiv = document.getElementById('domain-status');
  if (value.length === 0) {
    statusDiv.innerHTML = "";
  } else if (!isValidDomain) {
    statusDiv.innerHTML = `<span class="domain-status-animate" style="
      display:inline-block;
      background:#fff7e6;
      color:#d97706;
      font-weight:bold;
      border-radius:6px;
      padding:4px 12px;
      margin-top:4px;
      ">
      ⚠️ Không phải định dạng domain hợp lệ
    </span>`;
  } else if (supportedDomains.includes(domain)) {
    statusDiv.innerHTML = `<span class="domain-status-animate" style="
      display:inline-block;
      background:#e6f9ec;
      color:#16a34a;
      font-weight:bold;
      border-radius:6px;
      padding:4px 12px;
      margin-top:4px;
      ">
      ✅ Đã hỗ trợ
    </span>`;
  } else {
    statusDiv.innerHTML = `<span class="domain-status-animate" style="
      display:inline-block;
      background:#ffeaea;
      color:#dc2626;
      font-weight:bold;
      border-radius:6px;
      padding:4px 12px;
      margin-top:4px;
      ">
      ❌ Chưa hỗ trợ
    </span>`;
  }
});

// Chặn chuột phải và F12
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  updateStatus('Chức năng chuột phải đã bị tắt. 🔒', 'info');
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
    e.preventDefault();
    updateStatus('Công cụ nhà phát triển đã bị chặn. ⛔', 'info');
  }
});