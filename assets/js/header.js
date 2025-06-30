// Mobile menu state
let isMobileMenuOpen = false;

// Check if screen is mobile (below 50% screen size)
function isMobileScreen() {
    return window.innerWidth <= 959;
}

// Toggle mobile menu function - only works on mobile screens
function toggleMobileMenu() {
    // Only allow mobile menu on screens below 50% size
    if (!isMobileScreen()) {
        return;
    }
    
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    isMobileMenuOpen = !isMobileMenuOpen;
    
    if (isMobileMenuOpen) {
        mobileMenu.style.display = 'block';
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
    } else {
        mobileMenu.style.display = 'none';
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    }
}

// Smooth scroll to section function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Close mobile menu if open and on mobile screen
    if (isMobileMenuOpen && isMobileScreen()) {
        toggleMobileMenu();
    }
}

// Handle window resize to ensure proper navbar behavior
window.addEventListener('resize', function() {
    // If screen becomes desktop size, hide mobile menu
    if (!isMobileScreen() && isMobileMenuOpen) {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        
        mobileMenu.style.display = 'none';
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
        isMobileMenuOpen = false;
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (isMobileMenuOpen && 
        !mobileMenu.contains(event.target) && 
        !mobileMenuButton.contains(event.target)) {
        toggleMobileMenu();
    }
});
