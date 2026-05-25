/* ==========================================================================
   Voxe - Interactive Logic & Simulator (2026 Dark Premium)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------------
    // 1. Menu Mobile (Hamburger Menu)
    // ----------------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is active
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ----------------------------------------------------------------------
    // 2. Animação Scroll Reveal (Intersection Observer)
    // ----------------------------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-fade-up, .reveal-fade-right');
    
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Aumenta o delay para 200ms para um efeito mais visível e elegante
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, 200);
                observer.unobserve(entry.target); // Anima apenas uma vez
            }
        });
    }, {
        threshold: 0.05, // Dispara mais cedo ao rolar a página
        rootMargin: "0px 0px -20px 0px"
    });
    
    revealElements.forEach(element => {
        revealOnScroll.observe(element);
    });

    // ----------------------------------------------------------------------
    // 3. Simulador de Preço e ROI (Modal e Cálculos)
    // ----------------------------------------------------------------------
    const calculatorModal = document.getElementById('calculatorModal');
    const modalClose = document.getElementById('modalClose');
    const billingSelector = document.getElementById('billingSelector');
    const vetSlider = document.getElementById('vetSlider');
    const vetValueText = document.getElementById('vetValue');
    const aiToggle = document.getElementById('aiToggle');
    
    // Output Elements
    const recPlanName = document.getElementById('recPlanName');
    const estGrowth = document.getElementById('estGrowth');
    const estRoi = document.getElementById('estRoi');
    const estInvestment = document.getElementById('estInvestment');
    const whatsappSimulatedBtn = document.getElementById('whatsappSimulatedBtn');
    
    // State
    let selectedBillingLevel = 1; // 1 to 4
    let vetCount = 3;
    let isAiActive = false;

    // Open Modal and Pre-set state if buttons clicked
    const calcBtns = document.querySelectorAll('.btn-calculator');
    calcBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const requestedPlan = e.target.getAttribute('data-plan');
            
            // Adjust defaults based on which button was clicked
            if (requestedPlan === 'dominar') {
                selectedBillingLevel = 2; // R$ 50k to 120k
                vetCount = 5;
                isAiActive = true;
            } else {
                selectedBillingLevel = 1; // R$ 50k
                vetCount = 2;
                isAiActive = false;
            }
            
            // Apply states to UI
            updateUIFromState();
            calculateSimulation();
            
            // Show modal
            calculatorModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // prevent scroll
        });
    });

    // Close Modal
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            calculatorModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close modal clicking outside container
    window.addEventListener('click', (e) => {
        if (e.target === calculatorModal) {
            calculatorModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle Billing Level Pill Selection
    if (billingSelector) {
        const pills = billingSelector.querySelectorAll('.pill-btn');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                selectedBillingLevel = parseInt(pill.getAttribute('data-value'));
                calculateSimulation();
            });
        });
    }

    // Handle Slider Input
    if (vetSlider) {
        vetSlider.addEventListener('input', (e) => {
            vetCount = parseInt(e.target.value);
            vetValueText.textContent = `${vetCount} ${vetCount === 1 ? 'Vet' : 'Vets'}`;
            calculateSimulation();
        });
    }

    // Handle AI Toggle
    if (aiToggle) {
        aiToggle.addEventListener('change', (e) => {
            isAiActive = e.target.checked;
            calculateSimulation();
        });
    }

    // Handle Qualification Form Submission (Alpha Style)
    const qualificationForm = document.getElementById('qualificationForm');
    if (qualificationForm) {
        qualificationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const qBilling = document.getElementById('qBilling');
            const qVets = document.getElementById('qVets');
            const qAiToggle = document.getElementById('qAiToggle');
            
            if (qBilling && qVets) {
                selectedBillingLevel = parseInt(qBilling.value) || 1;
                vetCount = parseInt(qVets.value) || 3;
                isAiActive = qAiToggle ? qAiToggle.checked : false;
                
                // Synchronize modal state with the new values
                updateUIFromState();
                calculateSimulation();
                
                // Open Simulation Modal
                if (calculatorModal) {
                    calculatorModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    }

    // Helper to synchronize inputs with the current state (called on modal open)
    function updateUIFromState() {
        // Update Billing pills
        if (billingSelector) {
            const pills = billingSelector.querySelectorAll('.pill-btn');
            pills.forEach(p => {
                if (parseInt(p.getAttribute('data-value')) === selectedBillingLevel) {
                    p.classList.add('active');
                } else {
                    p.classList.remove('active');
                }
            });
        }
        
        // Update slider
        if (vetSlider) {
            vetSlider.value = vetCount;
            vetValueText.textContent = `${vetCount} ${vetCount === 1 ? 'Vet' : 'Vets'}`;
        }
        
        // Update AI Toggle
        if (aiToggle) {
            aiToggle.checked = isAiActive;
        }
    }

    // Mathematical Simulation & Plan Recommendation Algorithm
    function calculateSimulation() {
        let plan = "Vet Crescer";
        let growthVal = 0;
        let roi = 4.2;
        let investmentVal = "Consulte";
        
        // Determine recommended plan
        // If billing is Level 2+ or they selected AI, we recommend Vet Dominar
        if (selectedBillingLevel >= 2 || isAiActive) {
            plan = "Vet Dominar";
        } else {
            plan = "Vet Crescer";
        }
        
        // Estimated Growth Calculation
        // base growth factor per vet + billing level multiplier
        let baseGrowthPerVet = 4500;
        let billingMultiplier = 1.0;
        
        switch (selectedBillingLevel) {
            case 1: billingMultiplier = 1.0; break; // < 50k
            case 2: billingMultiplier = 1.3; break; // 50k - 120k
            case 3: billingMultiplier = 1.7; break; // 120k - 250k
            case 4: billingMultiplier = 2.4; break; // > 250k
        }
        
        growthVal = vetCount * baseGrowthPerVet * billingMultiplier;
        
        // Boost growth if AI is active (triage 24h/capture efficiency)
        if (isAiActive) {
            growthVal *= 1.25; // 25% faturamento extra capturado pela IA no WhatsApp
        }
        
        // Suggested Investment suggestion
        if (plan === "Vet Crescer") {
            investmentVal = "R$ 2.800";
            roi = 4.0 + (selectedBillingLevel * 0.3) + (vetCount * 0.05);
        } else {
            // Vet Dominar
            if (selectedBillingLevel === 2) {
                investmentVal = "R$ 4.500";
            } else if (selectedBillingLevel === 3) {
                investmentVal = "R$ 6.200";
            } else if (selectedBillingLevel === 4) {
                investmentVal = "R$ 8.900+";
            } else {
                // level 1 + AI
                investmentVal = "R$ 4.200";
            }
            roi = 4.8 + (selectedBillingLevel * 0.4) + (vetCount * 0.08);
        }
        
        // Cap ROI display for realism
        if (roi > 6.8) roi = 6.8;
        
        // Format outputs
        recPlanName.textContent = plan;
        estRoi.textContent = `${roi.toFixed(1)}x`;
        
        // Format Growth to Brazilian Real String
        estGrowth.textContent = `+R$ ${Math.round(growthVal).toLocaleString('pt-BR')}`;
        
        if (typeof investmentVal === 'number' || !investmentVal.includes('Consulta')) {
            estInvestment.textContent = investmentVal;
        } else {
            estInvestment.textContent = "Sob Consulta";
        }
        
        // Dynamic WhatsApp Link Builder
        let textBilling = "Até R$ 50k";
        if (selectedBillingLevel === 2) textBilling = "R$ 50k a R$ 120k";
        if (selectedBillingLevel === 3) textBilling = "R$ 120k a R$ 250k";
        if (selectedBillingLevel === 4) textBilling = "Acima de R$ 250k";
        
        const qNameInput = document.getElementById('qName');
        const qClinicaInput = document.getElementById('qClinica');
        const qName = qNameInput ? qNameInput.value.trim() : '';
        const qClinica = qClinicaInput ? qClinicaInput.value.trim() : '';
        
        let introText = "Olá! Realizei a simulação de ROI no site da Voxe.";
        if (qName && qClinica) {
            introText = `Olá! Meu nome é ${qName}, represento o(a) ${qClinica}. Concluí o preenchimento do Diagnóstico de Crescimento no site da Voxe e obtive esta projeção:`;
        } else if (qName) {
            introText = `Olá! Meu nome é ${qName}. Concluí o Diagnóstico de Crescimento no site da Voxe e obtive esta projeção:`;
        }
        
        const waBase = "https://wa.me/5511999999999";
        const messageText = `${introText}
- Faturamento atual: ${textBilling}
- Equipe: ${vetCount} ${vetCount === 1 ? 'veterinário' : 'veterinários'}
- Módulo IA WhatsApp: ${isAiActive ? 'Sim, desejado' : 'Não ativado'}
- Plano Recomendado: ${plan}
- Crescimento Mensal Estimado: ${estGrowth.textContent} (ROI de ${estRoi.textContent})

Gostaria de validar estes números e agendar a reunião de diagnóstico de 8 horas.`;
        
        const encodedMessage = encodeURIComponent(messageText);
        whatsappSimulatedBtn.setAttribute('href', `${waBase}?text=${encodedMessage}`);
    }

    // ----------------------------------------------------------------------
    // 4. Slider de Sócios (Quem está por trás da Voxe)
    // ----------------------------------------------------------------------
    const partnerSlides = document.querySelectorAll('.partner-slide');
    const sliderDots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentPartnerIndex = 0;

    if (partnerSlides.length > 0 && sliderDots.length > 0) {
        function showPartner(index) {
            if (index < 0) {
                index = partnerSlides.length - 1;
            } else if (index >= partnerSlides.length) {
                index = 0;
            }
            
            currentPartnerIndex = index;
            
            partnerSlides.forEach(slide => {
                slide.classList.remove('active');
            });
            sliderDots.forEach(dot => {
                dot.classList.remove('active');
            });
            
            partnerSlides[currentPartnerIndex].classList.add('active');
            sliderDots[currentPartnerIndex].classList.add('active');
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showPartner(currentPartnerIndex - 1);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showPartner(currentPartnerIndex + 1);
            });
        }
        
        sliderDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-index'));
                showPartner(index);
            });
        });
    }
});
