/* ==========================================================================
   Voxe Lógica JavaScript - Enxuta & Performance (2026 B2B Premium)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------------
    // 1. Menu Mobile
    // ----------------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });
        
        // Fechar menu ao clicar em links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('open');
            });
        });
    }

    // ----------------------------------------------------------------------
    // 2. Calculadora de Prejuízo Oculto
    // ----------------------------------------------------------------------
    const leadRange = document.getElementById('leadRange');
    const convRange = document.getElementById('convRange');
    const leadDisplay = document.getElementById('leadDisplay');
    const convDisplay = document.getElementById('convDisplay');
    const calcBillingSelector = document.getElementById('calcBillingSelector');
    const lostConsultations = document.getElementById('lostConsultations');
    const lostRevenue = document.getElementById('lostRevenue');
    const recoverRevenueBtn = document.getElementById('recoverRevenueBtn');

    let calcContacts = 200;
    let calcConversion = 15;
    let calcTicket = 160; 
    let calcBillingLevel = 1;

    function updateCalculator() {
        if (!leadRange || !convRange) return;
        
        if (leadDisplay) leadDisplay.textContent = `${calcContacts} ${calcContacts === 1 ? 'mensagem' : 'mensagens'}`;
        if (convDisplay) convDisplay.textContent = `${calcConversion}%`;

        // Alvo saudável de conversão: 70% com automação + recepção treinada
        const targetConversion = 70;
        let lostPct = (targetConversion - calcConversion) / 100;
        if (lostPct < 0) lostPct = 0;

        const lostConsultationsVal = Math.round(calcContacts * lostPct);
        const lostRevenueVal = lostConsultationsVal * calcTicket;

        if (lostConsultations) lostConsultations.textContent = `-${lostConsultationsVal}`;
        if (lostRevenue) lostRevenue.textContent = `R$ ${lostRevenueVal.toLocaleString('pt-BR')}`;
    }

    if (leadRange && convRange) {
        // Inicializar com valores padrões
        calcContacts = parseInt(leadRange.value) || 200;
        calcConversion = parseInt(convRange.value) || 15;
        updateCalculator();

        leadRange.addEventListener('input', (e) => {
            calcContacts = parseInt(e.target.value);
            updateCalculator();
        });

        convRange.addEventListener('input', (e) => {
            calcConversion = parseInt(e.target.value);
            updateCalculator();
        });
    }

    if (calcBillingSelector) {
        const calcPills = calcBillingSelector.querySelectorAll('.calc-pill');
        calcPills.forEach(pill => {
            pill.addEventListener('click', () => {
                calcPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                
                calcTicket = parseInt(pill.getAttribute('data-ticket')) || 160;
                calcBillingLevel = parseInt(pill.getAttribute('data-value')) || 1;
                updateCalculator();
            });
        });
    }

    if (recoverRevenueBtn) {
        recoverRevenueBtn.addEventListener('click', () => {
            openModal();
        });
    }

    // ----------------------------------------------------------------------
    // 3. Modal de Diagnóstico (Respondi)
    // ----------------------------------------------------------------------
    const modal = document.getElementById('respondiModal');
    const openBtns = document.querySelectorAll('.open-diagnostico-btn');
    const closeBtn = document.getElementById('closeModalBtn');
    
    function openModal() {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Evita scroll do fundo
        }
    }
    
    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    if (openBtns.length > 0) {
        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // ----------------------------------------------------------------------
    // 4. FAQ Accordion
    // ----------------------------------------------------------------------
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');
        
        if (trigger && content) {
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherContent = otherItem.querySelector('.faq-content');
                    if (otherContent) {
                        otherContent.style.maxHeight = '0';
                    }
                });
                
                if (!isActive) {
                    item.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        }
    });

    // ----------------------------------------------------------------------
    // 5. Animacao de Numeros (Stats Counter)
    // ----------------------------------------------------------------------
    const statsNumbers = document.querySelectorAll('.cpu-result-number');
    
    const animateStats = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetVal = parseInt(target.getAttribute('data-target'), 10);
                const duration = 1500; // 1.5 segundos
                const startTime = performance.now();
                
                const updateNumber = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Ease out cubic
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const currentVal = Math.floor(easeProgress * targetVal);
                    
                    target.textContent = currentVal;
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateNumber);
                    } else {
                        target.textContent = targetVal;
                    }
                };
                
                requestAnimationFrame(updateNumber);
                observer.unobserve(target); // Anima apenas uma vez
            }
        });
    };
    
    const statsObserver = new IntersectionObserver(animateStats, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    statsNumbers.forEach(num => statsObserver.observe(num));

    // ----------------------------------------------------------------------
    // 6. Partners Slider Logic (Autoplay + Controls)
    // ----------------------------------------------------------------------
    const partnerSlides = document.querySelectorAll('.partner-slide');
    const sliderDots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const sliderWrapper = document.querySelector('.partners-slider-wrapper');
    let currentPartnerIndex = 0;
    let autoplayInterval = null;
    const autoplayDelay = 8000; // 8 segundos de rotação (ajustado para leitura confortável)

    if (partnerSlides.length > 0 && sliderDots.length > 0) {
        function showPartner(index) {
            // Remove active classes
            partnerSlides[currentPartnerIndex].classList.remove('active');
            sliderDots[currentPartnerIndex].classList.remove('active');
            
            // Loop index boundaries
            if (index >= partnerSlides.length) {
                currentPartnerIndex = 0;
            } else if (index < 0) {
                currentPartnerIndex = partnerSlides.length - 1;
            } else {
                currentPartnerIndex = index;
            }
            
            // Add active classes
            partnerSlides[currentPartnerIndex].classList.add('active');
            sliderDots[currentPartnerIndex].classList.add('active');
        }
        
        // Funções do Sistema Automático (Autoplay)
        function startAutoplay() {
            if (!autoplayInterval) {
                autoplayInterval = setInterval(() => {
                    showPartner(currentPartnerIndex + 1);
                }, autoplayDelay);
            }
        }

        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        // Inicializa o sistema automático
        startAutoplay();

        // Pausa automática quando o usuário está lendo/passando o mouse por cima
        if (sliderWrapper) {
            sliderWrapper.addEventListener('mouseenter', () => {
                stopAutoplay(); // Para o autoplay para não interromper a leitura
            });
            
            sliderWrapper.addEventListener('mouseleave', () => {
                startAutoplay(); // Retoma quando a pessoa tira o mouse (parou de ler)
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showPartner(currentPartnerIndex - 1);
                resetAutoplay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showPartner(currentPartnerIndex + 1);
                resetAutoplay();
            });
        }
        
        sliderDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-index'));
                showPartner(index);
                resetAutoplay();
            });
        });
    }
});

