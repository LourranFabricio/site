// Handle window resize to close mobile menu on desktop
window.addEventListener('resize', function() {
    if (window.innerWidth >= 768 && isMobileMenuOpen) {
        toggleMobileMenu();
    }
});

// Add smooth scrolling for all anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Ensure smooth scrolling is enabled
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.classList.contains('btn-hover')) {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 10px 25px rgba(24, 24, 24, 0.2)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        }
    });
    
    // Add hover effects to carousel cards
    const carouselCards = document.querySelectorAll('.carousel-card');
    carouselCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        });
    });
});

// Intersection Observer for animations (optional enhancement)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for fade-in animation
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(section);
    });
});

