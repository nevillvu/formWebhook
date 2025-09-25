const WEBHOOK_URL = 'https://n8n.sysflow.me/webhook/inputForm';

let lastSubmitTime = 0;
const RATE_LIMIT_SECONDS = 10;

const supportedDomains = [
  "genk.vn",
  "vatvostudio.vn",
  "9to5mac.com",
  "macrumors.com",
  "24h.com.vn"
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

    // Lấy thêm trạng thái checkbox và timestamp nếu có
    if (formType === 'auto') {
        data.postNow = document.getElementById('post-now-auto').checked;
        data.schedule = document.getElementById('schedule-auto').value.trim();
    } else if (formType === 'manual') {
        data.postNow = document.getElementById('post-now-info').checked;
        data.schedule = document.getElementById('schedule-info').value.trim();
    } else if (formType === 'list') {
        data.postNow = document.getElementById('post-now-list').checked;
        data.schedule = document.getElementById('schedule-list').value.trim();
    } else if (formType === 'transcript') {
        data.postNow = document.getElementById('post-now-transcript').checked;
        data.schedule = document.getElementById('schedule-transcript').value.trim();
    }

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

function setupPostNow(tab) {
  const cb = document.getElementById(`post-now-${tab}`);
  const input = document.getElementById(`schedule-${tab}`);
  const error = document.getElementById(`schedule-${tab}-error`);
  const convert = document.getElementById(`schedule-${tab}-convert`);
  if (!cb) return;
  cb.addEventListener('change', () => {
    if (cb.checked) {
      input.style.display = 'block';
      setTimeout(() => input.classList.add('show'), 10);
    } else {
      input.classList.remove('show');
      setTimeout(() => input.style.display = 'none', 300);
      error.textContent = '';
      if (convert) {
        convert.textContent = '';
        convert.classList.remove('show');
      }
    }
  });
  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (!/^\d{10,}$/.test(val)) {
      error.textContent = 'Sai định dạng UNIX Timestamp';
      if (convert) {
        convert.textContent = '';
        convert.classList.remove('show');
      }
    } else {
      error.textContent = '';
      // Convert timestamp
      const date = new Date(Number(val) * 1000);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');
      const formatted = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
      if (convert) {
        convert.textContent = formatted;
        convert.classList.add('show');
      }
    }
  });
}
setupPostNow('auto');
setupPostNow('info');
setupPostNow('list');
setupPostNow('transcript');

// Lấy trạng thái checkbox và giá trị timestamp
const isChecked = document.getElementById('post-now-auto').checked;
const unixTimestamp = document.getElementById('schedule-auto').value.trim();

// Ví dụ log ra console
console.log('Đăng ngay:', isChecked);
console.log('UNIX timestamp:', unixTimestamp);

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

// Hàm kiểm tra nhiều link hợp lệ (cho phép bỏ trống)
function isValidMultiUrl(str) {
  if (!str.trim()) return true;
  const links = str.split(/\s+|\n+/).filter(Boolean);
  return links.every(link => {
    try {
      const u = new URL(link.trim());
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  });
}

// Hàm gắn kiểm tra realtime cho từng trường
function setupLinkValidation(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;
  function validate() {
    if (!isValidMultiUrl(input.value)) {
      error.textContent = "Sai định dạng link!";
    } else {
      error.textContent = "";
    }
  }
  input.addEventListener('input', validate);
  input.addEventListener('blur', validate);
}

// Gắn cho các trường ở cả 2 tab
setupLinkValidation('img-link', 'img-link-error');
setupLinkValidation('affiliate-link', 'affiliate-link-error');
setupLinkValidation('transcript-img-link', 'transcript-img-link-error');
setupLinkValidation('transcript-affiliate-link', 'transcript-affiliate-link-error');