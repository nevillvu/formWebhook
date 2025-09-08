const WEBHOOK_URL = 'https://n8n.sysflow.me/webhook-test/inputForm';

let lastSubmitTime = 0;
const RATE_LIMIT_SECONDS = 10;

// Chức năng chuyển tab
function showForm(formId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.getElementById(formId + '-form').classList.add('active');
    event.currentTarget.classList.add('active');
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

