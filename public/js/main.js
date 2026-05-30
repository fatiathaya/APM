document.addEventListener('DOMContentLoaded', () => {
    initRangeSliders();
    initPredictWizard();
});

function initRangeSliders() {
    document.querySelectorAll('input[type="range"]').forEach((slider) => {
        const displayId = slider.getAttribute('data-value-display');
        const displayElement = document.getElementById(displayId);

        if (!displayElement) return;

        displayElement.textContent = slider.value;
        slider.addEventListener('input', (event) => {
            displayElement.textContent = event.target.value;
        });
    });
}

function initPredictWizard() {
    const form = document.getElementById('alzheimerPredictionForm');
    if (!form) return;

    const panels = Array.from(form.querySelectorAll('[data-step-panel]'));
    const stepButtons = Array.from(form.querySelectorAll('[data-step-trigger]'));
    const prevBtn = document.getElementById('predictPrevBtn');
    const nextBtn = document.getElementById('predictNextBtn');
    const submitBtn = document.getElementById('predictSubmitBtn');
    const progressBar = document.getElementById('predictProgressBar');
    const progressText = document.getElementById('predictProgressText');
    const currentStepLabel = document.getElementById('predictCurrentStepLabel');

    if (!panels.length || !stepButtons.length) return;

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

        panels.forEach((panel) => {
            panel.classList.toggle('is-active', Number(panel.dataset.stepPanel) === currentStep);
        });

        stepButtons.forEach((button) => {
            const step = Number(button.dataset.stepTrigger);
            const isActive = step === currentStep;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-current', isActive ? 'step' : 'false');

            const badge = button.querySelector('span.shrink-0');
            if (badge) {
                badge.classList.toggle('bg-blue-100', isActive);
                badge.classList.toggle('text-secondary-blue', isActive);
                badge.classList.toggle('bg-slate-100', !isActive);
                badge.classList.toggle('text-slate-500', !isActive);
            }
        });

        if (progressBar) {
            progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
        }

        if (progressText) {
            progressText.textContent = `Langkah ${currentStep} dari ${totalSteps}`;
        }

        if (currentStepLabel) {
            currentStepLabel.textContent = stepLabels[currentStep] || '';
        }

        if (prevBtn) {
            prevBtn.disabled = currentStep === 1;
            prevBtn.classList.toggle('opacity-40', currentStep === 1);
            prevBtn.classList.toggle('pointer-events-none', currentStep === 1);
        }

        if (nextBtn && submitBtn) {
            const isLastStep = currentStep === totalSteps;
            nextBtn.classList.toggle('hidden', isLastStep);
            submitBtn.classList.toggle('hidden', !isLastStep);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    stepButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setStep(Number(button.dataset.stepTrigger));
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => setStep(currentStep - 1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                setStep(currentStep + 1);
            }
        });
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!validateStep(currentStep)) return;

        for (let step = 1; step <= totalSteps; step += 1) {
            if (!validateStep(step)) {
                setStep(step);
                return;
            }
        }

        showInferenceLoader(form);
    });

    setStep(1);
}

function validateStep(step) {
    const panel = document.querySelector(`[data-step-panel="${step}"]`);
    if (!panel) return true;

    const fields = panel.querySelectorAll('input, select, textarea');
    for (const field of fields) {
        if (!field.checkValidity()) {
            field.reportValidity();
            field.focus();
            return false;
        }
    }

    if (step === 1) {
        const age = parseInt(document.getElementById('age')?.value, 10);
        if (Number.isNaN(age) || age < 50 || age > 90) {
            alert('Masukkan usia valid antara 50 dan 90 tahun.');
            document.getElementById('age')?.focus();
            return false;
        }
    }

    if (step === 2) {
        const mmse = parseInt(document.getElementById('mmse')?.value, 10);
        if (Number.isNaN(mmse) || mmse < 0 || mmse > 30) {
            alert('Masukkan skor MMSE valid antara 0 dan 30.');
            document.getElementById('mmse')?.focus();
            return false;
        }
    }

    if (step === 3) {
        const bmi = parseFloat(document.getElementById('bmi')?.value);
        if (Number.isNaN(bmi) || bmi < 15 || bmi > 40) {
            alert('Masukkan BMI valid antara 15.0 dan 40.0.');
            document.getElementById('bmi')?.focus();
            return false;
        }
    }

    return true;
}

function showInferenceLoader(form) {
    const overlay = document.createElement('div');
    overlay.id = 'inferenceLoaderOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    `;

    const loaderContent = document.createElement('div');
    loaderContent.className = 'glass-card text-center p-8 bg-white/95 rounded-3xl max-w-[450px] w-11/12 border border-blue-500/20';
    loaderContent.innerHTML = `
        <div class="inline-block animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-secondary-blue mb-6" role="status">
            <span class="sr-only">Loading...</span>
        </div>
        <h4 class="text-xl font-bold text-primary-blue mb-2">Analyzing Patient Profile</h4>
        <p class="text-slate-500 text-sm mb-4">Running XGBoost early detection algorithm...</p>
        <div class="w-full bg-slate-200 rounded-full h-2 mb-3">
            <div id="inferenceProgressBar" class="bg-secondary-blue h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
        <div id="inferenceStep" class="text-xs font-semibold text-slate-400 text-left mt-2">Initializing Decision Trees...</div>
    `;

    overlay.appendChild(loaderContent);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 50);

    const progressBar = document.getElementById('inferenceProgressBar');
    const stepText = document.getElementById('inferenceStep');
    const stages = [
        { progress: 20, text: 'Scaling numeric inputs (Age, BMI, MMSE)...' },
        { progress: 50, text: 'Traversing 150 XGBoost Decision Trees...' },
        { progress: 80, text: 'Aggregating feature weight vectors...' },
        { progress: 100, text: 'Generating prediction risk matrix...' }
    ];

    let stageIndex = 0;
    const progressInterval = setInterval(() => {
        if (stageIndex < stages.length) {
            progressBar.style.width = `${stages[stageIndex].progress}%`;
            stepText.textContent = stages[stageIndex].text;
            stageIndex += 1;
        } else {
            clearInterval(progressInterval);
            setTimeout(() => form.submit(), 400);
        }
    }, 500);
}
