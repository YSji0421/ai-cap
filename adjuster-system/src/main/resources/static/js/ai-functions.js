// ===== 토스트 알림 =====
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== AI 요약 생성 =====
function generateSummary(consultationId) {
    const btn = document.getElementById('btn-summary');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '요약 생성 중...';

    fetch(`/api/consultations/${consultationId}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const resultEl = document.getElementById('summary-result');
            if (resultEl) resultEl.textContent = data.summaryContent;

            const section = document.getElementById('summary-section');
            if (section) section.style.display = 'block';

            const manualSection = document.getElementById('manual-summary-section');
            if (manualSection) manualSection.style.display = 'none';

            showToast(data.message, 'success');
        } else {
            const manualSection = document.getElementById('manual-summary-section');
            if (manualSection) manualSection.style.display = 'block';
            showToast(data.message, 'warning');
        }
    })
    .catch(() => {
        const manualSection = document.getElementById('manual-summary-section');
        if (manualSection) manualSection.style.display = 'block';
        showToast('요약 생성 중 오류가 발생했습니다.', 'error');
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = originalText;
    });
}

// ===== 키워드 추출 =====
function extractKeywords(consultationId) {
    const btn = document.getElementById('btn-keywords');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '키워드 추출 중...';

    fetch(`/api/consultations/${consultationId}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('keywords-container');
        if (!container) return;

        container.innerHTML = '';
        if (data.success && data.keywords && data.keywords.length > 0) {
            data.keywords.forEach(kw => {
                const badge = document.createElement('span');
                badge.className = 'badge badge-keyword';
                badge.textContent = kw;
                container.appendChild(badge);
            });
            showToast(data.message, 'success');
        } else {
            container.textContent = '관련 키워드를 찾지 못했습니다.';
            showToast('관련 키워드가 없습니다.', 'warning');
        }
    })
    .catch(() => showToast('키워드 추출 중 오류가 발생했습니다.', 'error'))
    .finally(() => {
        btn.disabled = false;
        btn.textContent = originalText;
    });
}

// ===== 수동 요약 저장 =====
function saveManualSummary(consultationId) {
    const input = document.getElementById('manual-summary-input');
    if (!input || !input.value.trim()) {
        showToast('요약 내용을 입력하세요.', 'warning');
        return;
    }

    fetch(`/api/consultations/${consultationId}/summary/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: input.value.trim() })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const resultEl = document.getElementById('summary-result');
            if (resultEl) resultEl.textContent = input.value.trim();

            const section = document.getElementById('summary-section');
            if (section) section.style.display = 'block';

            const manualSection = document.getElementById('manual-summary-section');
            if (manualSection) manualSection.style.display = 'none';

            showToast('요약이 저장되었습니다.', 'success');
        }
    })
    .catch(() => showToast('저장 중 오류가 발생했습니다.', 'error'));
}

// ===== 상태 변경 확인 =====
function confirmStatusChange(form, newStatus) {
    const labels = {
        'IN_PROGRESS': '진행중',
        'COMPLETED': '완료',
        'ON_HOLD': '보류',
        'RECEIVED': '접수'
    };
    const label = labels[newStatus] || newStatus;
    if (confirm(`상태를 "${label}"(으)로 변경하시겠습니까?`)) {
        form.submit();
    }
}
