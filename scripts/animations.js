// Animation Utilities and Helpers

// Intersection Observer for scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });

    // Observe menu entries
    document.querySelectorAll('.menu-entry').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animationDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Cart badge animation
function animateCartBadge(count) {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.textContent = count;
        badge.classList.remove('bounce');
        // Force reflow
        void badge.offsetWidth;
        badge.classList.add('bounce');
    }
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '10000',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '300px'
    });
    
    // Set background based on type
    const colors = {
        success: 'linear-gradient(135deg, #4CAF50, #45a049)',
        error: 'linear-gradient(135deg, #f44336, #d32f2f)',
        info: 'linear-gradient(135deg, #2196F3, #1976D2)',
        warning: 'linear-gradient(135deg, #ff9800, #f57c00)'
    };
    toast.style.background = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('fade-in');
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Loading spinner component
function showLoadingSpinner(container, message = 'Loading...') {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner-wrapper';
    spinner.innerHTML = `
        <div class="spinner"></div>
        <p>${message}</p>
    `;
    
    // Style the wrapper
    Object.assign(spinner.style, {
        textAlign: 'center',
        padding: '40px',
        color: '#666'
    });
    
    if (typeof container === 'string') {
        document.querySelector(container).innerHTML = '';
        document.querySelector(container).appendChild(spinner);
    } else {
        container.innerHTML = '';
        container.appendChild(spinner);
    }
}

// Confetti effect for celebrations
function createConfettiEffect(duration = 3000) {
    const colors = ['#971010', '#4CAF50', '#FFD700', '#FF69B4', '#00CED1', '#FF6347'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        Object.assign(confetti.style, {
            position: 'fixed',
            width: '10px',
            height: '10px',
            background: colors[Math.floor(Math.random() * colors.length)],
            left: Math.random() * 100 + '%',
            top: '-10px',
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            opacity: '1',
            zIndex: '9999',
            pointerEvents: 'none'
        });
        
        document.body.appendChild(confetti);
        
        // Animate the confetti
        const animDuration = Math.random() * 1000 + 2000;
        const xMovement = (Math.random() - 0.5) * 200;
        
        confetti.animate([
            { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) translateX(${xMovement}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: animDuration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        // Remove after animation
        setTimeout(() => confetti.remove(), animDuration);
    }
}

// Number count-up animation
function animateNumber(element, start, end, duration = 1000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        if (typeof element === 'string') {
            document.querySelector(element).textContent = Math.round(current);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// Ripple effect on button click
function addRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    Object.assign(ripple.style, {
        width: size + 'px',
        height: size + 'px',
        left: x + 'px',
        top: y + 'px',
        position: 'absolute',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.6)',
        transform: 'scale(0)',
        animation: 'ripple 0.6s ease-out',
        pointerEvents: 'none'
    });
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Ripple animation CSS is defined in animations.css

// Apply ripple effect to all buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button, .item-btn').forEach(button => {
        button.addEventListener('click', addRippleEffect);
    });
});

// Smooth scroll to element
function smoothScrollTo(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
        const top = element.offsetTop - offset;
        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });
    }
}

// Fade in elements on page load
function fadeInOnLoad() {
    document.querySelectorAll('.fade-on-load').forEach((el, index) => {
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.transition = 'opacity 0.6s ease-out';
            el.style.opacity = '1';
        }, index * 100);
    });
}

// Initialize animations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initScrollAnimations();
        fadeInOnLoad();
    });
} else {
    initScrollAnimations();
    fadeInOnLoad();
}

// Export functions for use in other scripts
window.animationUtils = {
    initScrollAnimations,
    animateCartBadge,
    showToast,
    showLoadingSpinner,
    createConfettiEffect,
    animateNumber,
    addRippleEffect,
    smoothScrollTo,
    fadeInOnLoad
};
