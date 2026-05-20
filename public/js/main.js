document.addEventListener('DOMContentLoaded', () => {
    // 1. Update Range Slider Display Values
    const rangeSliders = document.querySelectorAll('input[type="range"]');
    rangeSliders.forEach(slider => {
        const displayId = slider.getAttribute('data-value-display');
        const displayElement = document.getElementById(displayId);
        
        if (displayElement) {
            // Initial value
            displayElement.textContent = slider.value;
            
            // Value change listener
            slider.addEventListener('input', (e) => {
                displayElement.textContent = e.target.value;
            });
        }
    });

    // 2. Form Submission Simulation & Validation
    const predictionForm = document.getElementById('alzheimerPredictionForm');
    if (predictionForm) {
        predictionForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Pause submission to validate and show animated processing state
            
            // Basic Client-side Validations
            const age = parseInt(document.getElementById('age').value);
            const bmi = parseFloat(document.getElementById('bmi').value);
            const mmse = parseInt(document.getElementById('mmse').value);

            if (isNaN(age) || age < 50 || age > 90) {
                alert('Please enter a valid age between 50 and 90.');
                document.getElementById('age').focus();
                return;
            }

            if (isNaN(bmi) || bmi < 15 || bmi > 40) {
                alert('Please enter a valid BMI between 15.0 and 40.0.');
                document.getElementById('bmi').focus();
                return;
            }

            if (isNaN(mmse) || mmse < 0 || mmse > 30) {
                alert('Please enter a valid MMSE score between 0 and 30.');
                document.getElementById('mmse').focus();
                return;
            }

            // Create and display a modern glassmorphism processing overlay
            showInferenceLoader();
        });
    }

    function showInferenceLoader() {
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

        // Fade in overlay
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 50);

        // Update progress stages to simulate ML inference
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
                stageIndex++;
            } else {
                clearInterval(progressInterval);
                // Finally, submit the form to the backend
                setTimeout(() => {
                    predictionForm.submit();
                }, 400);
            }
        }, 500);
    }
});
