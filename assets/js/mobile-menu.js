document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');

    if (mobileMenuBtn && mobileMenuOverlay && mobileMenuCloseBtn) {
        // Open menu
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('invisible', 'opacity-0');
            mobileMenuOverlay.classList.add('opacity-100');
            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        });

        // Close menu
        const closeMenu = () => {
            mobileMenuOverlay.classList.remove('opacity-100');
            mobileMenuOverlay.classList.add('opacity-0');

            // Wait for transition before hiding
            setTimeout(() => {
                mobileMenuOverlay.classList.add('invisible');
            }, 300); // 300ms matches Tailwind duration-300

            // Restore body scrolling
            document.body.style.overflow = '';
        };

        mobileMenuCloseBtn.addEventListener('click', closeMenu);

        // Close when clicking on a link inside the menu
        const mobileLinks = mobileMenuOverlay.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
});
