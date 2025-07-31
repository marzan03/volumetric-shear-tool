document.addEventListener('DOMContentLoaded', function() {
    // Get the calculate button and add click event listener
    const calculateButton = document.getElementById('calculate');
    calculateButton.addEventListener('click', performCalculations);
    
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
        const ash1 = 0.827; // constant
        const ash2 = 0.492; // constant
        
        // Display results
        document.getElementById('hc1Result').textContent = hc1.toFixed(2);
        document.getElementById('hc2Result').textContent = hc2.toFixed(2);
        document.getElementById('agResult').textContent = ag.toFixed(2);
        document.getElementById('achResult').textContent = ach.toFixed(2);
        document.getElementById('ash1Result').textContent = ash1.toFixed(3);
        document.getElementById('ash2Result').textContent = ash2.toFixed(3);
        
        // Highlight the results section
        document.querySelector('.results-section').classList.add('active');
    }
});