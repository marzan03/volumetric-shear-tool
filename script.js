document.addEventListener('DOMContentLoaded', function() {
    // Highlight active menu item based on current page
    highlightActiveMenuItem();
    
    function highlightActiveMenuItem() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Default to home.html if no page is specified
        const activePage = currentPage === '' ? 'home.html' : currentPage;
        
        // Remove any existing active classes
        document.querySelectorAll('.menu-items a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current page link
        if (activePage === 'home.html') {
            document.querySelector('.menu-items a[href="home.html"]').classList.add('active');
        } else if (activePage === 'index.html') {
            // For tools dropdown, we need to handle differently
            const toolsLink = document.querySelector('.menu-items .dropdown a[href="#"]:not([class*="dropdown-content"])');
            if (toolsLink && toolsLink.textContent.trim().startsWith('Tools')) {
                toolsLink.classList.add('active');
            }
        }
    }
    // Get the calculate button and add click event listener if it exists
    const calculateButton = document.getElementById('calculate');
    if (calculateButton) {
        calculateButton.addEventListener('click', performCalculations);
    }
    
    // Mobile dropdown menu functionality
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Function to handle mobile dropdown behavior
    function setupMobileDropdowns() {
        if (window.innerWidth <= 768) {
            // For mobile devices, make dropdowns toggle on click
            dropdowns.forEach(dropdown => {
                const dropdownLink = dropdown.querySelector('a');
                // Remove existing event listeners by cloning and replacing
                const newDropdownLink = dropdownLink.cloneNode(true);
                dropdownLink.parentNode.replaceChild(newDropdownLink, dropdownLink);
                
                newDropdownLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    const content = this.nextElementSibling;
                    
                    // Close all other dropdowns
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            const otherContent = otherDropdown.querySelector('.dropdown-content');
                            otherContent.style.maxHeight = null;
                        }
                    });
                    
                    // Toggle current dropdown
                    if (content.style.maxHeight) {
                        content.style.maxHeight = null;
                    } else {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                });
            });
        } else {
            // For desktop, reset dropdown styles
            dropdowns.forEach(dropdown => {
                const content = dropdown.querySelector('.dropdown-content');
                content.style.maxHeight = null;
            });
        }
    }
    
    // Initial setup
    setupMobileDropdowns();
    
    // Update on window resize
    window.addEventListener('resize', setupMobileDropdowns);
    
    // Function to perform all calculations
    function performCalculations() {
        // Get input values
        const c1 = parseFloat(document.getElementById('c1').value);
        const c2 = parseFloat(document.getElementById('c2').value);
        const clearCover = parseFloat(document.getElementById('clearCover').value);
        const fc = parseFloat(document.getElementById('fc').value);
        const fy = parseFloat(document.getElementById('fy').value);
        const tieSpacing = parseFloat(document.getElementById('tieSpacing').value);
        
        // Validate inputs
        if (isNaN(c1) || isNaN(c2) || isNaN(clearCover) || isNaN(fc) || isNaN(fy) || isNaN(tieSpacing)) {
            alert('Please fill in all fields with valid numbers.');
            return;
        }
        
        // Perform calculations
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
        
        // Display results
        document.getElementById('hc1Result').textContent = hc1.toFixed(2);
        document.getElementById('hc2Result').textContent = hc2.toFixed(2);
        document.getElementById('agResult').textContent = ag.toFixed(2);
        document.getElementById('achResult').textContent = ach.toFixed(2);
        document.getElementById('ash1Result').textContent = Ash1.toFixed(3);
        document.getElementById('ash2Result').textContent = Ash2.toFixed(3);
        
        
        // Highlight the results section
        document.querySelector('.results-section').classList.add('active');
    }
});