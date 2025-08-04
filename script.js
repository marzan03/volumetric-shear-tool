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
        const ash1ResultElement = document.getElementById('ash1RequiredResult');
        const ash2ResultElement = document.getElementById('ash2RequiredResult');
        
        // Check if all result elements exist
        if (!hc1ResultElement || !hc2ResultElement || !agResultElement || 
            !achResultElement || !ash1ResultElement || !ash2ResultElement) {
            console.error('One or more result elements not found');
            return;
        }
        
        // Tie bar area lookup table (diameter in mm -> area in in²)
        const tieBarAreas = {
            10: 0.121,
            12: 0.175,
            16: 0.311,
            20: 0.487,
            25: 0.76
        };
        
        // Get tie bar diameter and number of legs
        const tieBarElement = document.getElementById('tieBar');
        const longDirectionElement = document.getElementById('longDirection');
        const shortDirectionElement = document.getElementById('shortDirection');
        
        if (!tieBarElement || !longDirectionElement || !shortDirectionElement) {
            console.error('Tie bar or direction elements not found');
            return;
        }
        
        const tieBarDiameter = parseFloat(tieBarElement.value);
        const longDirectionLegs = parseFloat(longDirectionElement.value);
        const shortDirectionLegs = parseFloat(shortDirectionElement.value);
        
        if (isNaN(tieBarDiameter) || isNaN(longDirectionLegs) || isNaN(shortDirectionLegs)) {
            alert('Please fill in tie bar diameter and number of legs.');
            return;
        }
        
        // Calculate provided areas
        const tieBarArea = tieBarAreas[tieBarDiameter] || 0;
        const Ash1Provided = tieBarArea * longDirectionLegs;
        const Ash2Provided = tieBarArea * shortDirectionLegs;
        
        // Update results
        hc1ResultElement.textContent = hc1.toFixed(2);
        hc2ResultElement.textContent = hc2.toFixed(2);
        agResultElement.textContent = ag.toFixed(2);
        achResultElement.textContent = ach.toFixed(2);
        ash1ResultElement.textContent = Ash1.toFixed(3);
        ash2ResultElement.textContent = Ash2.toFixed(3);
        
        // Update provided values
        const ash1ProvidedElement = document.getElementById('ash1ProvidedResult');
        const ash2ProvidedElement = document.getElementById('ash2ProvidedResult');
        const ash1StatusElement = document.getElementById('ash1Status');
        const ash2StatusElement = document.getElementById('ash2Status');
        
        if (ash1ProvidedElement && ash2ProvidedElement && ash1StatusElement && ash2StatusElement) {
            ash1ProvidedElement.textContent = Ash1Provided.toFixed(3);
            ash2ProvidedElement.textContent = Ash2Provided.toFixed(3);
            
            // Update status indicators
            if (Ash1Provided >= Ash1) {
                ash1StatusElement.textContent = 'OK';
            } else {
                ash1StatusElement.textContent = 'Not OK';
            }
            
            if (Ash2Provided >= Ash2) {
                ash2StatusElement.textContent = 'OK';
            } else {
                ash2StatusElement.textContent = 'Not OK';
            }
        }
        
        // Highlight the results section
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.classList.add('active');
        }
    }
    
    // PDF Generation Function
    async function generatePDF() {
        console.log('Generate PDF button clicked');
    
    // Check if jsPDF is available
    if (!window.jspdf) {
        alert('PDF library not loaded. Please refresh the page and try again.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    
    console.log('jsPDF initialized successfully');
        
        // Get input values
        const columnId = document.getElementById('columnId').value || '-';
        const tieBarMm = document.getElementById('tieBar').value || '-';
        const c1 = document.getElementById('c1').value || '-';
        const longDirection = document.getElementById('longDirection').value || '-';
        const c2 = document.getElementById('c2').value || '-';
        const shortDirection = document.getElementById('shortDirection').value || '-';
        const clearCover = document.getElementById('clearCover').value || '-';
        const fc = document.getElementById('fc').value || '-';
        const fy = document.getElementById('fy').value || '-';
        const tieSpacing = document.getElementById('tieSpacing').value || '-';
        const ash1Provided = '-'; // No input field for this
        const ash2Provided = '-'; // No input field for this
        
        // Get calculated results
        const hc1Result = document.getElementById('hc1Result').textContent || '-';
        const hc2Result = document.getElementById('hc2Result').textContent || '-';
        const agResult = document.getElementById('agResult').textContent || '-';
        const achResult = document.getElementById('achResult').textContent || '-';
        const ash1Required = document.getElementById('ash1RequiredResult').textContent || '-';
        const ash2Required = document.getElementById('ash2RequiredResult').textContent || '-';
        const ash1ProvidedResult = document.getElementById('ash1ProvidedResult').textContent || '-';
        const ash2ProvidedResult = document.getElementById('ash2ProvidedResult').textContent || '-';
        const ash1Status = document.getElementById('ash1Status').textContent || '-';
        const ash2Status = document.getElementById('ash2Status').textContent || '-';
        
        // Professional Report Header
        doc.setFontSize(18);
        doc.setFont('times', 'bold');
        doc.text('Adequecy of Transverse Reinforcement', 300, 20, { align: 'center' });
        
        // Add cross-section SVG diagram
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        
        
        // Load and embed the cross-section SVG with high resolution
         try {
             // Create a high-resolution canvas for better clarity
             const canvas = document.createElement('canvas');
             const ctx = canvas.getContext('2d');
             const scale = 3; // Higher resolution for better quality
             canvas.width = 120 * scale;
             canvas.height = 80 * scale;
             
             // Load the JPG file
             const img = new Image();
             
             await new Promise((resolve, reject) => {
                 img.onload = () => {
                     // Clear canvas with white background
                     ctx.fillStyle = 'white';
                     ctx.fillRect(0, 0, canvas.width, canvas.height);
                     
                     // Draw image with high quality settings
                     ctx.imageSmoothingEnabled = true;
                     ctx.imageSmoothingQuality = 'high';
                     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                     
                     const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
                      doc.addImage(imgData, 'PNG', 235, 45, 200, 150); // Smaller, centered image
                     resolve();
                 };
                 img.onerror = reject;
                 img.src = 'Cross Section.jpg';
             });
         } catch (error) {
             console.error('Error loading JPG:', error);
             // Fallback to clear diagram if JPG loading fails
             doc.setLineWidth(1);
             doc.rect(25, 45, 160, 120);
             doc.setFontSize(16);
             doc.text('Cross-Section Diagram', 335, 70, { align: 'center' });
        doc.text('(Please check SVG file)', 335, 90, { align: 'center' });
         }
        
        
        // General Input Section
         // Manual coordinates for General Input and Calculations sections
        const generalInputTitleY = 220;    // General Input title position
        const columnIdY = 240;              // Column ID position
        const fcFyY = 260;                  // f'c and fy values position
        const c1C2Y = 280;                  // C1 and C2 values position
        const clearCoverY = 300;            // Clear Cover value position
        const calculationsTitleY = 330;     // Calculations title position
        
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        doc.text('General Input', 40, generalInputTitleY, { align: 'left' });
        
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        doc.text(`Column ID: ${columnId}`, 80, columnIdY, { align: 'left' });
        doc.text(`f'c = ${fc} ksi, fy = ${fy} ksi`, 80, fcFyY, { align: 'left' });
        doc.text(`C1 = ${c1} in, C2 = ${c2} in`, 80, c1C2Y, { align: 'left' });
        doc.text(`Clear Cover, = ${clearCover} in`, 80, clearCoverY, { align: 'left' });
        
        // Add Engineering Calculations Section
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        doc.text('Calculations', 40, calculationsTitleY, { align: 'left' });
        
        // Parse input values as numbers for calculations
        const c1Num = parseFloat(c1);
        const c2Num = parseFloat(c2);
        const clearCoverNum = parseFloat(clearCover);
        const fcNum = parseFloat(fc);
        const fyNum = parseFloat(fy);
        const tieSpacingNum = parseFloat(tieSpacing);
        
        // Calculate derived values for PDF using current input values
        const hc1 = c1Num - 2 * clearCoverNum;
        const hc2 = c2Num - 2 * clearCoverNum;
        const Ag = c1Num * c2Num;
        const Ach = hc1 * hc2;
        
        // Calculate required reinforcement using the same formulas as performCalculations
        const term1 = (0.3 * tieSpacingNum * hc1) * ((Ag / Ach) - 1) * (fcNum / fyNum);
        const term2 = (0.09 * tieSpacingNum * hc1) * (fcNum / fyNum);
        const AshRequired = Math.max(term1, term2);
        
        const term3 = (0.3 * tieSpacingNum * hc2) * ((Ag / Ach) - 1) * (fcNum / fyNum);
        const term4 = (0.09 * tieSpacingNum * hc2) * (fcNum / fyNum);
        const AshRequired2 = Math.max(term3, term4);
        
        const AshMin = (0.09 * tieSpacingNum * hc1) * (fcNum / fyNum);
        const AshMin2 = (0.09 * tieSpacingNum * hc2) * (fcNum / fyNum);
        
        // Long Direction Calculations - Clean Serial Layout
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        
        // Coordinates for clean serial layout
        const leftMargin = 40;
        let currentY = 360;  // Start after Calculations title
        const lineSpacing = 20;
        
        // Long Direction Title
        doc.text('Long Direction', leftMargin, currentY);
        currentY += lineSpacing;
        
        // Main formula line
        doc.setFontSize(13);
        doc.setFont('times', 'normal');
        doc.text('Ash1 (required) = Max Of', leftMargin, currentY);
        currentY += lineSpacing;
        
        // Calculate results first
        const calc1 = (0.3 * tieSpacingNum * hc1) * ((Ag / Ach) - 1) * (fcNum / fyNum);
        const calc2 = (0.09 * tieSpacingNum * hc1) * (fcNum / fyNum);
        
        // First formula with calculation
        doc.text('Ash1 = 0.3*S0* hc1*[(Ag/Ach)-1] *(f\'c/ fy)', leftMargin + 20, currentY);
        currentY += lineSpacing;
        doc.text(`= 0.3 x ${tieSpacingNum} x ${hc1.toFixed(1)} x [(${Ag.toFixed(1)}/${Ach.toFixed(1)})-1] x (${fcNum}/${fyNum})`, leftMargin + 40, currentY);
        currentY += lineSpacing;
        doc.text(`= ${calc1.toFixed(2)} in² (Govern)`, leftMargin + 40, currentY);
        currentY += lineSpacing;
        
        // Second formula with calculation
        doc.text('Ash1 = 0.09*S0* hc1*(f\'c/ fy)', leftMargin + 20, currentY);
        currentY += lineSpacing;
        doc.text(`= 0.09 x ${tieSpacingNum} x ${hc1.toFixed(1)} x (${fcNum}/${fyNum})`, leftMargin + 40, currentY);
        currentY += lineSpacing;
        doc.text(`= ${calc2.toFixed(2)} in²`, leftMargin + 40, currentY);
        currentY += lineSpacing;
        
        // Provided area and status
        const ashProvided1 = parseFloat(document.getElementById('ash1ProvidedResult').textContent) || 0;
        doc.text(`Ash1 (provided) = ${ashProvided1.toFixed(3)} in²`, leftMargin, currentY);
        const status1 = ashProvided1 >= Math.max(calc1, calc2) ? 'Ok' : 'Not Ok';
        doc.text(status1, leftMargin + 200, currentY);
        currentY += lineSpacing * 2;
        
        // Short Direction calculations - Clean Serial Layout
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        
        // Short Direction Title
        doc.text('Short Direction', leftMargin, currentY);
        currentY += lineSpacing;
        
        doc.setFontSize(13);
        doc.setFont('times', 'normal');
        
        // Check if hc1 and hc2 are the same (same as long direction case)
        if (Math.abs(hc1 - hc2) < 0.01) {
            doc.text('Same As Long Direction', leftMargin, currentY);
        } else {
            // Main formula line
            doc.text('Ash2 (required) = Max Of', leftMargin, currentY);
            currentY += lineSpacing;
            
            // Calculate results first
            const calc1_short = (0.3 * tieSpacingNum * hc2) * ((Ag / Ach) - 1) * (fcNum / fyNum);
            const calc2_short = (0.09 * tieSpacingNum * hc2) * (fcNum / fyNum);
            
            // First formula with calculation
            doc.text('Ash2 = 0.3*S0* hc2*[(Ag/Ach)-1] *(f\'c/ fy)', leftMargin + 20, currentY);
            currentY += lineSpacing;
            doc.text(`= 0.3 x ${tieSpacingNum} x ${hc2.toFixed(1)} x [(${Ag.toFixed(1)}/${Ach.toFixed(1)})-1] x (${fcNum}/${fyNum})`, leftMargin + 40, currentY);
            currentY += lineSpacing;
            doc.text(`= ${calc1_short.toFixed(2)} in² (Govern)`, leftMargin + 40, currentY);
            currentY += lineSpacing;
            
            // Second formula with calculation
            doc.text('Ash2 = 0.09*S0* hc2*(f\'c/ fy)', leftMargin + 20, currentY);
            currentY += lineSpacing;
            doc.text(`= 0.09 x ${tieSpacingNum} x ${hc2.toFixed(1)} x (${fcNum}/${fyNum})`, leftMargin + 40, currentY);
            currentY += lineSpacing;
            doc.text(`= ${calc2_short.toFixed(2)} in²`, leftMargin + 40, currentY);
            currentY += lineSpacing;
            
            // Provided area and status
            const ashProvided2 = parseFloat(document.getElementById('ash2ProvidedResult').textContent) || 0;
            doc.text(`Ash2 (provided) = ${ashProvided2.toFixed(3)} in²`, leftMargin, currentY);
            const status2 = ashProvided2 >= Math.max(calc1_short, calc2_short) ? 'Ok' : 'Not Ok';
            doc.text(status2, leftMargin + 200, currentY);
        }
        
        // Generate PDF blob for preview
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Show PDF preview
        const previewContainer = document.getElementById('pdfPreviewContainer');
        const previewIframe = document.getElementById('pdfPreview');
        if (previewContainer && previewIframe) {
            previewIframe.src = pdfUrl;
            previewContainer.style.display = 'block';
        }
        
        // Store the PDF for download
        window.generatedPDF = doc;
        window.pdfFileName = `Transverse_Reinforcement_Report_${columnId.replace(/\s+/g, '_') || 'Report'}.pdf`;
        
        // Clean up previous PDF URL if exists
        if (window.currentPdfUrl) {
            URL.revokeObjectURL(window.currentPdfUrl);
        }
        
        // Store current PDF URL for cleanup
        window.currentPdfUrl = pdfUrl;
        
        // Show download button
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-block';
            downloadBtn.onclick = function() {
                if (window.generatedPDF) {
                    try {
                        window.generatedPDF.save(window.pdfFileName);
                        console.log('PDF download initiated successfully');
                    } catch (error) {
                        console.error('Error downloading PDF:', error);
                        alert('Error downloading PDF. Please try again.');
                    }
                }
            };
        }
        
        console.log('PDF generated successfully and ready for download');
}

    // Live Preview functionality
    let livePreviewEnabled = false;
    let livePreviewInterval = null;
    
    const enableLivePreviewBtn = document.getElementById('enableLivePreview');
    const refreshPreviewBtn = document.getElementById('refreshPreview');
    const livePreviewStatus = document.getElementById('livePreviewStatus');
    
    // Function to refresh PDF preview
    async function refreshPDFPreview() {
        try {
            await generatePDF();
            if (livePreviewStatus) {
                livePreviewStatus.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
            }
        } catch (error) {
            console.error('Error refreshing PDF preview:', error);
            if (livePreviewStatus) {
                livePreviewStatus.textContent = 'Error updating preview';
            }
        }
    }
    
    // Enable/Disable live preview
    if (enableLivePreviewBtn) {
        enableLivePreviewBtn.addEventListener('click', () => {
            livePreviewEnabled = !livePreviewEnabled;
            
            if (livePreviewEnabled) {
                enableLivePreviewBtn.textContent = 'Disable Live Preview';
                enableLivePreviewBtn.style.backgroundColor = '#dc3545';
                livePreviewStatus.textContent = 'Live preview enabled - Auto-refreshing every 3 seconds';
                
                // Start auto-refresh every 3 seconds
                livePreviewInterval = setInterval(refreshPDFPreview, 3000);
                
                // Initial refresh
                refreshPDFPreview();
            } else {
                enableLivePreviewBtn.textContent = 'Enable Live Preview';
                enableLivePreviewBtn.style.backgroundColor = '';
                livePreviewStatus.textContent = 'Live preview disabled';
                
                // Stop auto-refresh
                if (livePreviewInterval) {
                    clearInterval(livePreviewInterval);
                    livePreviewInterval = null;
                }
            }
        });
    }
    
    // Manual refresh button
    if (refreshPreviewBtn) {
        refreshPreviewBtn.addEventListener('click', refreshPDFPreview);
    }
    
    // Add event listener for the generate report button
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', async () => {
            // Generate PDF directly without showing calculations on page
            await generatePDF();
        });
    }
});
