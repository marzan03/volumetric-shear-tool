document.addEventListener('DOMContentLoaded', function() {
    // Highlight active menu item based on current page
    highlightActiveMenuItem();
    
    function highlightActiveMenuItem() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Default to home.html if no page is specified
        const activePage = currentPage === '' ? 'home.html' : currentPage;
        
        // Remove any existing active classes
        const menuLinks = document.querySelectorAll('.menu-items a');
        if (menuLinks && menuLinks.length > 0) {
            menuLinks.forEach(link => {
                link.classList.remove('active');
            });
        }
        
        // Add active class to current page link
        if (activePage === 'home.html') {
            const homeLink = document.querySelector('.menu-items a[href="home.html"]');
            if (homeLink) {
                homeLink.classList.add('active');
            }
        } else if (activePage === 'index.html') {
            // For tools dropdown, we need to handle differently
            const toolsLink = document.querySelector('.menu-items .dropdown a[href="#"]:not([class*="dropdown-content"])');
            if (toolsLink && toolsLink.textContent.trim().startsWith('Tools')) {
                toolsLink.classList.add('active');
            }
        }
    }
    
    // Mobile dropdown menu functionality
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Function to handle mobile dropdown behavior
    function setupMobileDropdowns() {
        if (!dropdowns || dropdowns.length === 0) {
            return; // Exit if no dropdowns are found
        }
        
        const isMobile = window.innerWidth <= 768;
        
        // Reset all dropdowns first
        dropdowns.forEach(dropdown => {
            const content = dropdown.querySelector('.dropdown-content');
            if (content) {
                content.style.maxHeight = null;
            }
            
            // Remove any existing click event listeners by cloning and replacing
            const dropdownLink = dropdown.querySelector('a');
            if (dropdownLink) {
                const newDropdownLink = dropdownLink.cloneNode(true);
                dropdownLink.parentNode.replaceChild(newDropdownLink, dropdownLink);
                
                if (isMobile) {
                    // For mobile devices, add click event listeners
                    newDropdownLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        const content = this.nextElementSibling;
                        if (!content) return;
                        
                        // Close all other dropdowns
                        dropdowns.forEach(otherDropdown => {
                            if (otherDropdown !== dropdown) {
                                const otherContent = otherDropdown.querySelector('.dropdown-content');
                                if (otherContent) {
                                    otherContent.style.maxHeight = null;
                                }
                            }
                        });
                        
                        // Toggle current dropdown
                        if (content.style.maxHeight) {
                            content.style.maxHeight = null;
                        } else {
                            content.style.maxHeight = content.scrollHeight + 'px';
                        }
                    });
                }
            }
        });
    }
    
    // Initial setup
    setupMobileDropdowns();
    
    // Update on window resize
    window.addEventListener('resize', setupMobileDropdowns);
    
    // Get the calculate button and add click event listener if it exists
    const calculateButton = document.getElementById('calculate');
    if (calculateButton) {
        calculateButton.addEventListener('click', performCalculations);
    }
  
    function performCalculations() {
        // Get input elements
        const c1Element = document.getElementById('c1');
        const c2Element = document.getElementById('c2');
        const clearCoverElement = document.getElementById('clearCover');
        const fcElement = document.getElementById('fc');
        const fyElement = document.getElementById('fy');
        const tieSpacingElement = document.getElementById('tieSpacing');
        
        // Check if all elements exist
        if (!c1Element || !c2Element || !clearCoverElement || !fcElement || !fyElement || !tieSpacingElement) {
            console.error('One or more input elements not found');
            return;
        }
        
        // Parse values
        const c1 = parseFloat(c1Element.value);
        const c2 = parseFloat(c2Element.value);
        const clearCover = parseFloat(clearCoverElement.value);
        const fc = parseFloat(fcElement.value);
        const fy = parseFloat(fyElement.value);
        const tieSpacing = parseFloat(tieSpacingElement.value);

        if (isNaN(c1) || isNaN(c2) || isNaN(clearCover) || isNaN(fc) || isNaN(fy) || isNaN(tieSpacing)) {
            alert('Please fill in all fields with valid numbers.');
            return;
        }

        const hc1 = c1 - 2 * clearCover;
        const hc2 = c2 - 2 * clearCover;
        const ag = c1 * c2;
        const ach = hc1 * hc2;

        const term1 = (0.3 * tieSpacing * hc1) * ((ag / ach) - 1) * (fc / fy);
        const term2 = (0.09 * tieSpacing * hc1) * (fc / fy);
        const Ash1 = Math.max(term1, term2);

        const term3 = (0.3 * tieSpacing * hc2) * ((ag / ach) - 1) * (fc / fy);
        const term4 = (0.09 * tieSpacing * hc2) * (fc / fy);
        const Ash2 = Math.max(term3, term4);

        // Get result elements
        const hc1ResultElement = document.getElementById('hc1Result');
        const hc2ResultElement = document.getElementById('hc2Result');
        const agResultElement = document.getElementById('agResult');
        const achResultElement = document.getElementById('achResult');
        const ash1ResultElement = document.getElementById('ash1Result');
        const ash2ResultElement = document.getElementById('ash2Result');
        
        // Check if all result elements exist
        if (!hc1ResultElement || !hc2ResultElement || !agResultElement || 
            !achResultElement || !ash1ResultElement || !ash2ResultElement) {
            console.error('One or more result elements not found');
            return;
        }
        
        // Update results
        hc1ResultElement.textContent = hc1.toFixed(2);
        hc2ResultElement.textContent = hc2.toFixed(2);
        agResultElement.textContent = ag.toFixed(2);
        achResultElement.textContent = ach.toFixed(2);
        ash1ResultElement.textContent = Ash1.toFixed(3);
        ash2ResultElement.textContent = Ash2.toFixed(3);
        
        // Highlight the results section
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.classList.add('active');
        }
    }
});
