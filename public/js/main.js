document.addEventListener('DOMContentLoaded', () => {
    initHamburgerMenu();
    initRangeSliders();
    initToggleSwitches();
    initPredictWizard();
    initScrollAnimations();
    initStatCounters();
    initTooltips();
});

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
function initHamburgerMenu() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');

    if (!btn || !menu) return;

    function openMenu() {
        btn.classList.add('is-open');
        menu.classList.add('is-open');
        if (overlay) overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        btn.classList.remove('is-open');
        menu.classList.remove('is-open');
        if (overlay) overlay.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    btn.addEventListener('click', () => {
        if (menu.classList.contains('is-open')) closeMenu();
        else openMenu();
    });

    if (overlay) overlay.addEventListener('click', closeMenu);

    // Close when clicking menu links
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

/* ============================================================
   RANGE SLIDERS
   ============================================================ */
function initRangeSliders() {
    document.querySelectorAll('input[type="range"]').forEach((slider) => {
        const displayId = slider.getAttribute('data-value-display');
        const displayEl = document.getElementById(displayId);
        if (!displayEl) return;

        displayEl.textContent = slider.value;
        slider.addEventListener('input', (e) => {
            displayEl.textContent = e.target.value;
        });
    });
}

/* ============================================================
   TOGGLE SWITCHES (radio-based Ya/Tidak)
   ============================================================ */
function initToggleSwitches() {
    document.querySelectorAll('.toggle-group').forEach((group) => {
        const options = group.querySelectorAll('.toggle-option');

        // Set initial active state
        options.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            if (radio && radio.checked) {
                option.classList.add('is-active');
            }
        });

        // Handle clicks
        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('is-active'));
                option.classList.add('is-active');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            });
        });
    });
}

/* ============================================================
   TOOLTIPS (dekat ikon ?, flip jika mepet tepi layar)
   ============================================================ */
function initTooltips() {
    const margin = 12;

    const positionTooltip = (wrapper) => {
        const content = wrapper.querySelector('.tooltip-content');
        if (!content) return;

        content.classList.remove('is-above', 'is-align-end');

        let rect = content.getBoundingClientRect();

        if (rect.bottom > window.innerHeight - margin) {
            content.classList.add('is-above');
            rect = content.getBoundingClientRect();
        }

        if (rect.right > window.innerWidth - margin) {
            content.classList.add('is-align-end');
        }
    };

    const showTooltip = (wrapper) => {
        document.querySelectorAll('.tooltip-wrapper.is-active').forEach((active) => {
            if (active !== wrapper) hideTooltip(active);
        });
        wrapper.classList.add('is-active');
        requestAnimationFrame(() => positionTooltip(wrapper));
    };

    const hideTooltip = (wrapper) => {
        wrapper.classList.remove('is-active');
        const content = wrapper.querySelector('.tooltip-content');
        if (content) {
            content.classList.remove('is-above', 'is-align-end');
        }
    };

    document.querySelectorAll('.tooltip-trigger').forEach((trigger) => {
        const wrapper = trigger.closest('.tooltip-wrapper');
        if (!wrapper) return;

        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('aria-label', 'Informasi');

        trigger.addEventListener('mouseenter', () => showTooltip(wrapper));
        trigger.addEventListener('mouseleave', () => hideTooltip(wrapper));
        trigger.addEventListener('focus', () => showTooltip(wrapper));
        trigger.addEventListener('blur', () => hideTooltip(wrapper));

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (wrapper.classList.contains('is-active')) {
                hideTooltip(wrapper);
            } else {
                showTooltip(wrapper);
            }
        });
    });

    window.addEventListener('resize', () => {
        document.querySelectorAll('.tooltip-wrapper.is-active').forEach(positionTooltip);
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.tooltip-wrapper.is-active').forEach(hideTooltip);
    });
}

/* ============================================================
   PREDICT WIZARD (Multi-step form)
   ============================================================ */
function initPredictWizard() {
    const form = document.getElementById('alzheimerPredictionForm');
    if (!form) return;

    const panels = Array.from(form.querySelectorAll('[data-step-panel]'));
    const stepButtons = Array.from(form.querySelectorAll('[data-step-trigger]'));
    const mobileSteppers = Array.from(document.querySelectorAll('[data-mobile-step]'));
    const prevBtn = document.getElementById('predictPrevBtn');
    const nextBtn = document.getElementById('predictNextBtn');
    const submitBtn = document.getElementById('predictSubmitBtn');
    const progressBar = document.getElementById('predictProgressBar');
    const progressText = document.getElementById('predictProgressText');
    const currentStepLabel = document.getElementById('predictCurrentStepLabel');
    const mobileLines = Array.from(document.querySelectorAll('.mobile-stepper-line'));

    if (!panels.length) return;

    let currentStep = 1;
    const totalSteps = panels.length;

    const stepLabels = {
        1: 'Demografi & Genetik',
        2: 'Kognitif & Fungsional',
        3: 'Riwayat Medis',
        4: 'Gaya Hidup'
    };

    function setStep(step) {
        currentStep = Math.min(Math.max(step, 1), totalSteps);

        // Toggle panels
        panels.forEach((panel) => {
            panel.classList.toggle('is-active', Number(panel.dataset.stepPanel) === currentStep);
        });

        // Update desktop sidebar buttons
        stepButtons.forEach((button) => {
            const s = Number(button.dataset.stepTrigger);
            const isActive = s === currentStep;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-current', isActive ? 'step' : 'false');

            const badge = button.querySelector('.step-badge');
            if (badge) {
                if (isActive) {
                    badge.classList.remove('bg-slate-100', 'text-slate-500');
                    badge.classList.add('bg-secondary-blue', 'text-white');
                } else {
                    badge.classList.remove('bg-secondary-blue', 'text-white');
                    badge.classList.add('bg-slate-100', 'text-slate-500');
                }
            }
        });

        // Update mobile stepper dots
        mobileSteppers.forEach(dot => {
            const s = Number(dot.dataset.mobileStep);
            dot.classList.toggle('is-active', s === currentStep);
        });

        // Update connector lines
        mobileLines.forEach((line, i) => {
            line.classList.toggle('is-active', i < currentStep - 1);
        });

        // Update progress bar
        if (progressBar) {
            progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
        }
        if (progressText) {
            progressText.textContent = `Langkah ${currentStep} dari ${totalSteps}`;
        }
        if (currentStepLabel) {
            currentStepLabel.textContent = stepLabels[currentStep] || '';
        }

        // Prev button state
        if (prevBtn) {
            prevBtn.disabled = currentStep === 1;
            prevBtn.classList.toggle('opacity-40', currentStep === 1);
            prevBtn.classList.toggle('pointer-events-none', currentStep === 1);
        }

        // Next / Submit buttons
        if (nextBtn && submitBtn) {
            const isLast = currentStep === totalSteps;
            nextBtn.classList.toggle('hidden', isLast);
            submitBtn.classList.toggle('hidden', !isLast);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Desktop sidebar step buttons
    stepButtons.forEach((button) => {
        button.addEventListener('click', () => setStep(Number(button.dataset.stepTrigger)));
    });

    // Mobile stepper buttons
    mobileSteppers.forEach(dot => {
        dot.addEventListener('click', () => setStep(Number(dot.dataset.mobileStep)));
    });

    if (prevBtn) prevBtn.addEventListener('click', () => setStep(currentStep - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) setStep(currentStep + 1);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        for (let s = 1; s <= totalSteps; s++) {
            if (!validateStep(s)) {
                setStep(s);
                return;
            }
        }

        showInferenceLoader(form);
    });

    setStep(1);
}

/* ============================================================
   STEP VALIDATION
   ============================================================ */
function validateStep(step) {
    const panel = document.querySelector(`[data-step-panel="${step}"]`);
    if (!panel) return true;

    // Only validate regular inputs (not hidden radios from toggles)
    const fields = panel.querySelectorAll('input[type="number"], input[type="text"], select, textarea');
    for (const field of fields) {
        if (!field.checkValidity()) {
            field.reportValidity();
            field.focus();
            return false;
        }
    }

    if (step === 1) {
        const age = parseInt(document.getElementById('age')?.value, 10);
        if (isNaN(age) || age < 50 || age > 90) {
            showValidationAlert('Masukkan usia valid antara 50 dan 90 tahun.', 'age');
            return false;
        }
    }

    if (step === 2) {
        const mmse = parseInt(document.getElementById('mmse')?.value, 10);
        if (isNaN(mmse) || mmse < 0 || mmse > 30) {
            showValidationAlert('Masukkan skor MMSE valid antara 0 dan 30.', 'mmse');
            return false;
        }
    }

    if (step === 3) {
        const bmi = parseFloat(document.getElementById('bmi')?.value);
        if (isNaN(bmi) || bmi < 15 || bmi > 40) {
            showValidationAlert('Masukkan BMI valid antara 15.0 dan 40.0.', 'bmi');
            return false;
        }
    }

    return true;
}

function showValidationAlert(message, fieldId) {
    // Remove any existing alert
    document.querySelector('.validation-alert')?.remove();

    const alert = document.createElement('div');
    alert.className = 'validation-alert fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2';
    alert.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> ${message}`;
    document.body.appendChild(alert);

    const field = document.getElementById(fieldId);
    if (field) field.focus();

    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

/* ============================================================
   INFERENCE LOADER OVERLAY
   ============================================================ */
function showInferenceLoader(form) {
    const overlay = document.createElement('div');
    overlay.id = 'inferenceLoaderOverlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        display: flex; justify-content: center; align-items: center;
        z-index: 9999; opacity: 0; transition: opacity 0.3s ease-in-out;
    `;

    overlay.innerHTML = `
        <div style="background: white; border-radius: 24px; padding: 40px 32px; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 25px 60px rgba(15,23,42,0.25);">
            <div style="position: relative; width: 72px; height: 72px; margin: 0 auto 24px;">
                <svg viewBox="0 0 72 72" style="position:absolute;top:0;left:0;width:100%;height:100%;animation:spin 1s linear infinite;">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#e2e8f0" stroke-width="5"/>
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round"
                        stroke-dasharray="47 141" stroke-dashoffset="0"/>
                </svg>
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:22px;">🧠</div>
            </div>
            <h4 style="font-size:1.2rem;font-weight:800;color:#0f172a;margin-bottom:8px;">Menganalisis Profil Pasien</h4>
            <p style="color:#64748b;font-size:0.85rem;margin-bottom:20px;">Menjalankan algoritma deteksi dini XGBoost...</p>
            <div style="background:#f1f5f9;border-radius:99px;height:8px;overflow:hidden;margin-bottom:8px;">
                <div id="inferenceProgressBar" style="height:100%;background:linear-gradient(90deg,#1e3a8a,#2563eb);border-radius:99px;width:0%;transition:width 0.4s ease;"></div>
            </div>
            <div id="inferenceStep" style="font-size:0.72rem;color:#94a3b8;text-align:left;font-weight:600;margin-top:6px;">Menginisialisasi Decision Trees...</div>
        </div>
        <style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.opacity = '1'; }, 50);

    const bar = document.getElementById('inferenceProgressBar');
    const stepText = document.getElementById('inferenceStep');
    const stages = [
        { progress: 20, text: 'Memuat variabel klinis (Usia, BMI, MMSE)...' },
        { progress: 45, text: 'Traversal 150 XGBoost Decision Trees...' },
        { progress: 72, text: 'Agregasi vektor bobot fitur...' },
        { progress: 92, text: 'Memproses skor probabilitas risiko...' },
        { progress: 100, text: 'Menghasilkan laporan analisis...' }
    ];

    let idx = 0;
    const interval = setInterval(() => {
        if (idx < stages.length) {
            bar.style.width = `${stages[idx].progress}%`;
            stepText.textContent = stages[idx].text;
            idx++;
        } else {
            clearInterval(interval);
            setTimeout(() => form.submit(), 500);
        }
    }, 450);
}

/* ============================================================
   SCROLL ANIMATIONS (IntersectionObserver)
   ============================================================ */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-animate');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

/* ============================================================
   STAT COUNTERS (animate numbers on scroll)
   ============================================================ */
function initStatCounters() {
    const counters = document.querySelectorAll('.stat-counter[data-target]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
        counters.forEach(el => {
            el.textContent = el.dataset.target + (el.dataset.suffix || '');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const decimals = target % 1 !== 0 ? 1 : 0;

    function step(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = (target * eased).toFixed(decimals);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}
