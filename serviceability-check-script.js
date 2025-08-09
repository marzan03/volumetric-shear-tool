// Wind Force Displacement Analysis Tool
// Calculate allowable displacement using formula: (elevation/500)*12

let windData = [];

// Initialize event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupColumnPasteListeners();
    setupTablePasteHandler();
    
    // Load sample data by default for demonstration
    fillSampleData();
});

// Setup paste listeners for column-wise pasting
function setupColumnPasteListeners() {
    const tableBody = document.querySelector('#dataTable tbody');
    if (!tableBody) {
        return;
    }
    
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        setupRowEventListeners(row, index);
    });
}

function setupRowEventListeners(row, rowIndex) {
    const inputs = row.querySelectorAll('input');
    
    inputs.forEach((input, colIndex) => {
        input.addEventListener('paste', function(e) {
            handleColumnPaste(e, rowIndex, colIndex);
        });
    });
}

function handleColumnPaste(event, startRowIndex, columnIndex) {
    const pastedData = (event.clipboardData || window.clipboardData).getData('text');
    const lines = pastedData.split('\n').filter(line => line.trim() !== '');
    
    // If only one line, use default paste behavior
    if (lines.length <= 1) {
        return; // Let default paste behavior handle single values
    }
    
    // Prevent default paste for multi-line data
    event.preventDefault();
    
    const tableBody = document.querySelector('#dataTable tbody');
    const rows = tableBody.querySelectorAll('tr');
    
    // Ensure we have enough rows for the pasted data
    const requiredRows = startRowIndex + lines.length;
    if (requiredRows > rows.length) {
        adjustTableRows(requiredRows);
        // Re-get rows after adjustment
        const updatedRows = tableBody.querySelectorAll('tr');
        fillPastedData(updatedRows, lines, startRowIndex, columnIndex);
    } else {
        fillPastedData(rows, lines, startRowIndex, columnIndex);
    }
}

function fillPastedData(rows, lines, startRowIndex, columnIndex) {
    lines.forEach((line, index) => {
        const targetRowIndex = startRowIndex + index;
        if (targetRowIndex < rows.length) {
            const targetRow = rows[targetRowIndex];
            const targetInput = targetRow.querySelectorAll('input')[columnIndex];
            
            if (targetInput) {
                // For Location column (index 2), always set to "Top"
                if (columnIndex === 2) {
                    targetInput.value = "Top";
                } else {
                    targetInput.value = line.trim();
                }
                
                // If pasting into elevation column (index 1), calculate allowable displacement
                if (columnIndex === 1) {
                    const elevation = parseFloat(line.trim());
                    if (!isNaN(elevation)) {
                        const allowableCell = targetRow.querySelector('.allowable-cell');
                        if (allowableCell) {
                            const allowable = (elevation / 500) * 12;
                            allowableCell.textContent = allowable.toFixed(2);
                        }
                    }
                }
            }
        }
    });
    
    // Data filled successfully (no alert message)
}

// Alternative table-level paste handler
function setupTablePasteHandler() {
    const table = document.getElementById('dataTable');
    if (!table) {
        return;
    }
    
    table.addEventListener('paste', function(e) {
        const activeElement = document.activeElement;
        if (!activeElement || activeElement.tagName !== 'INPUT') return;
        
        const pastedData = (e.clipboardData || window.clipboardData).getData('text');
        const lines = pastedData.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length > 1) {
            e.preventDefault();
            
            // Find the row and column of the active input
             const row = activeElement.closest('tr');
             const tableBody = document.querySelector('#dataTable tbody');
             const rows = Array.from(tableBody.querySelectorAll('tr'));
            const rowIndex = rows.indexOf(row);
            
            const inputs = Array.from(row.querySelectorAll('input'));
            const colIndex = inputs.indexOf(activeElement);
            
            
            
            // Ensure enough rows exist
            const requiredRows = rowIndex + lines.length;
            if (requiredRows > rows.length) {
                adjustTableRows(requiredRows);
            }
            
            // Fill the data
            const updatedRows = Array.from(tableBody.querySelectorAll('tr'));
            lines.forEach((line, index) => {
                const targetRowIndex = rowIndex + index;
                if (targetRowIndex < updatedRows.length) {
                    const targetRow = updatedRows[targetRowIndex];
                    const targetInput = targetRow.querySelectorAll('input')[colIndex];
                    
                    if (targetInput) {
                        // For Location column (index 2), always set to "Top"
                        if (colIndex === 2) {
                            targetInput.value = "Top";
                        } else {
                            targetInput.value = line.trim();
                        }
                        
                        // Auto-calculate allowable for elevation column
                        if (colIndex === 1) {
                            const elevation = parseFloat(line.trim());
                            if (!isNaN(elevation)) {
                                const allowableCell = targetRow.querySelector('.allowable-cell');
                                if (allowableCell) {
                                    const allowable = (elevation / 500) * 12;
                                    allowableCell.textContent = allowable.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
            
            // Data filled successfully (no alert message)
        }
    });
}





// Switch between input methods
function switchInputMethod(method) {
    const manualInput = document.getElementById('manualInput');
    const pasteInput = document.getElementById('pasteInput');
    const tabs = document.querySelectorAll('.tab-btn');
    
    // Remove active class from all tabs
    tabs.forEach(tab => tab.classList.remove('active'));
    
    if (method === 'manual') {
        manualInput.classList.add('active');
        pasteInput.classList.remove('active');
        document.querySelector('.tab-btn:first-child').classList.add('active');
    } else {
        manualInput.classList.remove('active');
        pasteInput.classList.add('active');
        document.querySelector('.tab-btn:last-child').classList.add('active');
    }
}

// Calculate allowable displacement for a single elevation input
function calculateAllowable(elevationInput) {
    const elevation = parseFloat(elevationInput.value);
    const row = elevationInput.closest('tr');
    const allowableCell = row.querySelector('.allowable-cell');
    
    if (!isNaN(elevation) && elevation > 0) {
        const allowable = (elevation / 500) * 12;
        allowableCell.textContent = allowable.toFixed(2);
    } else {
        allowableCell.textContent = '0.00';
    }
}

// Adjust table rows based on the specified count
function adjustTableRows(targetCount) {
    const rowCount = targetCount || parseInt(document.getElementById('rowCount').value);
    const tableBody = document.getElementById('dataTableBody');
    const currentRows = tableBody.querySelectorAll('tr').length;
    
    if (rowCount > currentRows) {
        // Add rows
        for (let i = currentRows; i < rowCount; i++) {
            addSingleRow();
        }
    } else if (rowCount < currentRows) {
        // Remove rows
        for (let i = currentRows; i > rowCount; i--) {
            removeLastRow();
        }
    }
    
    // Update row count input
    const rowCountInput = document.getElementById('rowCount');
    if (rowCountInput) {
        rowCountInput.value = rowCount;
    }
    
    // Re-setup paste listeners for all rows
    setupColumnPasteListeners();
}

// Add a single row to the table
function addSingleRow() {
    const tableBody = document.getElementById('dataTableBody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td><input type="text" placeholder="Story" class="story-input"></td>
        <td><input type="number" step="0.01" placeholder="0" class="elevation-input" oninput="calculateAllowable(this)"></td>
        <td><input type="text" placeholder="Top" class="location-input"></td>
        <td><input type="number" step="0.001" placeholder="0" class="x-dir-input"></td>
        <td><input type="number" step="0.001" placeholder="0" class="y-dir-input"></td>
        <td class="allowable-cell">0.00</td>
    `;
    
    tableBody.appendChild(newRow);
    
    // Add event listeners to the new row
    setupRowEventListeners(newRow, tableBody.children.length - 1);
    
    // Update row count input
    document.getElementById('rowCount').value = tableBody.children.length;
}

// Remove the last row from the table
function removeLastRow() {
    const tableBody = document.getElementById('dataTableBody');
    if (tableBody.children.length > 1) {
        tableBody.removeChild(tableBody.lastElementChild);
        // Update row count input
        document.getElementById('rowCount').value = tableBody.children.length;
    }
}



// Fill sample data into the table
function fillSampleData() {
    // First adjust table to have 11 rows for sample data
    document.getElementById('rowCount').value = 11;
    adjustTableRows();
    
    const sampleData = [
        { story: 'ROOF', elevation: 95, location: 'Top', xDir: 1.717, yDir: 1.422 },
        { story: '8F', elevation: 85, location: 'Top', xDir: 1.606, yDir: 1.322 },
        { story: '7F', elevation: 75, location: 'Top', xDir: 1.471, yDir: 1.201 },
        { story: '6F', elevation: 65, location: 'Top', xDir: 1.314, yDir: 1.065 },
        { story: '5F', elevation: 55, location: 'Top', xDir: 1.137, yDir: 0.913 },
        { story: '4F', elevation: 45, location: 'Top', xDir: 0.941, yDir: 0.749 },
        { story: '3F', elevation: 35, location: 'Top', xDir: 0.729, yDir: 0.574 },
        { story: '2F', elevation: 25, location: 'Top', xDir: 0.503, yDir: 0.390 },
        { story: '1F', elevation: 15, location: 'Top', xDir: 0.271, yDir: 0.207 },
        { story: 'MZ', elevation: 7.5, location: 'Top', xDir: 0.111, yDir: 0.092 },
        { story: 'GF', elevation: 0, location: 'Top', xDir: 0, yDir: 0 }
    ];
    
    const tableBody = document.getElementById('dataTableBody');
    const rows = tableBody.querySelectorAll('tr');
    
    sampleData.forEach((data, index) => {
        if (index < rows.length) {
            const row = rows[index];
            row.querySelector('.story-input').value = data.story;
            row.querySelector('.elevation-input').value = data.elevation;
            row.querySelector('.location-input').value = data.location;
            row.querySelector('.x-dir-input').value = data.xDir;
            row.querySelector('.y-dir-input').value = data.yDir;
            
            // Calculate and update allowable
            const allowable = data.elevation > 0 ? (data.elevation / 500) * 12 : 0;
            row.querySelector('.allowable-cell').textContent = allowable.toFixed(2);
        }
    });
}

// Clear all data from the table
function clearTable() {
    if (confirm('Are you sure you want to clear all data?')) {
        const tableBody = document.getElementById('dataTableBody');
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            row.querySelector('.story-input').value = '';
            row.querySelector('.elevation-input').value = '';
            row.querySelector('.location-input').value = '';
            row.querySelector('.x-dir-input').value = '';
            row.querySelector('.y-dir-input').value = '';
            row.querySelector('.allowable-cell').textContent = '0.00';
        });
        
        // Clear results
        document.getElementById('resultsSection').style.display = 'none';
        windData = [];
        
        // Hide PDF preview
        document.getElementById('pdfPreviewContainer').style.display = 'none';
    }
}



// Collect data from the table
function collectTableData() {
    const tableBody = document.getElementById('dataTableBody');
    const rows = tableBody.querySelectorAll('tr');
    const data = [];
    
    rows.forEach(row => {
        const story = row.querySelector('.story-input').value.trim();
        const elevation = parseFloat(row.querySelector('.elevation-input').value);
        const location = row.querySelector('.location-input').value.trim();
        const xDir = parseFloat(row.querySelector('.x-dir-input').value);
        const yDir = parseFloat(row.querySelector('.y-dir-input').value);
        const allowable = parseFloat(row.querySelector('.allowable-cell').textContent);
        
        if (story && !isNaN(elevation) && !isNaN(xDir) && !isNaN(yDir)) {
            data.push({
                story,
                elevation,
                location,
                xDir,
                yDir,
                allowable
            });
        }
    });
    
    return data;
}

// Calculate and display results
function calculateResults() {
    windData = collectTableData();
    
    if (windData.length === 0) {
        alert('Please enter some data first.');
        return;
    }
    
    // Analyze each row
    const results = windData.map(row => {
        const xStatus = row.xDir <= row.allowable ? 'PASS' : 'FAIL';
        const yStatus = row.yDir <= row.allowable ? 'PASS' : 'FAIL';
        
        return {
            ...row,
            xStatus,
            yStatus
        };
    });
    
    // Display results
    displayResults(results);
    displaySummary(results);
    createDisplacementChart(results);
    
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    
    // Store results globally for PDF generation
    window.windAnalysisResults = results;
}

// Display results in the table
function displayResults(results) {
    const tableBody = document.getElementById('resultsTableBody');
    tableBody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.story}</td>
            <td>${result.elevation.toFixed(2)}</td>
            <td>${result.location}</td>
            <td>${result.xDir.toFixed(3)}</td>
            <td class="${result.xStatus.toLowerCase()}">${result.xStatus}</td>
            <td>${result.yDir.toFixed(3)}</td>
            <td class="${result.yStatus.toLowerCase()}">${result.yStatus}</td>
            <td>${result.allowable.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Display summary of results
function displaySummary(results) {
    const summaryContainer = document.getElementById('resultsSummary');
    
    const totalStories = results.length;
    const xPassCount = results.filter(r => r.xStatus === 'PASS').length;
    const yPassCount = results.filter(r => r.yStatus === 'PASS').length;
    const overallPassCount = results.filter(r => r.xStatus === 'PASS' && r.yStatus === 'PASS').length;
    
    const maxXDisplacement = Math.max(...results.map(r => r.xDir));
    const maxYDisplacement = Math.max(...results.map(r => r.yDir));
    const maxXStory = results.find(r => r.xDir === maxXDisplacement)?.story || 'N/A';
    const maxYStory = results.find(r => r.yDir === maxYDisplacement)?.story || 'N/A';
    
    const overallCompliance = overallPassCount === totalStories;
    
    let summaryHTML = `
        <div class="summary-header">
            <h3><i class="fas fa-chart-bar"></i> Analysis Summary</h3>
            <div class="overall-status ${overallCompliance ? 'pass' : 'fail'}">
                <i class="fas fa-${overallCompliance ? 'check-circle' : 'exclamation-triangle'}"></i>
                ${overallCompliance ? 'ALL STORIES COMPLIANT' : 'COMPLIANCE ISSUES FOUND'}
            </div>
        </div>
        
        <div class="summary-stats">
            <div class="stat-item">
                <div class="stat-value">${totalStories}</div>
                <div class="stat-label">Total Stories</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${overallPassCount}</div>
                <div class="stat-label">Compliant Stories</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${xPassCount}/${totalStories}</div>
                <div class="stat-label">X-Direction Pass</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${yPassCount}/${totalStories}</div>
                <div class="stat-label">Y-Direction Pass</div>
            </div>
        </div>
        
        <div class="summary-details">
            <div class="detail-item">
                <strong>Maximum X-Direction Displacement:</strong> ${maxXDisplacement.toFixed(3)}" at ${maxXStory}
            </div>
            <div class="detail-item">
                <strong>Maximum Y-Direction Displacement:</strong> ${maxYDisplacement.toFixed(3)}" at ${maxYStory}
            </div>
        </div>
    `;
    
    if (!overallCompliance) {
        const failedStories = results.filter(r => r.xStatus === 'FAIL' || r.yStatus === 'FAIL');
        summaryHTML += `
            <div class="failed-stories">
                <h4><i class="fas fa-exclamation-triangle"></i> Non-Compliant Stories:</h4>
                <ul>
        `;
        
        failedStories.forEach(story => {
            const issues = [];
            if (story.xStatus === 'FAIL') issues.push('X-Direction');
            if (story.yStatus === 'FAIL') issues.push('Y-Direction');
            summaryHTML += `<li><strong>${story.story}:</strong> ${issues.join(', ')} exceeds allowable displacement</li>`;
        });
        
        summaryHTML += `
                </ul>
            </div>
        `;
    }
    
    summaryContainer.innerHTML = summaryHTML;
}

// Create displacement chart
function createDisplacementChart(results) {
    const ctx = document.getElementById('displacementChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.displacementChart && typeof window.displacementChart.destroy === 'function') {
        window.displacementChart.destroy();
    }
    
    // Prepare data for the chart
    const elevations = results.map(r => r.elevation);
    const xDisplacements = results.map(r => r.xDir);
    const yDisplacements = results.map(r => r.yDir);
    const allowableDisplacements = results.map(r => r.allowable);
    
    // Create chart
    try {
        window.displacementChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: elevations,
            datasets: [
                {
                    label: 'X-dir [D = 0.5L+0.7(WX)]',
                    data: xDisplacements.map((x, i) => ({ x: x, y: elevations[i] })),
                    borderColor: '#2563eb',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointBackgroundColor: '#2563eb',
                    tension: 0.1
                },
                {
                    label: 'Y-dir [D = 0.5L+0.7(WY)]',
                    data: yDisplacements.map((y, i) => ({ x: y, y: elevations[i] })),
                    borderColor: '#dc2626',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointBackgroundColor: '#dc2626',
                    tension: 0.1
                },
                {
                    label: 'Allowable',
                    data: allowableDisplacements.map((a, i) => ({ x: a, y: elevations[i] })),
                    borderColor: '#16a34a',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointBackgroundColor: '#16a34a',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio || 1,
            animation: {
                duration: 0 // Disable animation for better PDF capture
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Total Displacement for Wind',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line'
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Displacement (in)'
                    },
                    grid: {
                        display: true,
                        color: '#e0e0e0'
                    },
                    min: 0
                },
                y: {
                    title: {
                        display: true,
                        text: 'Elevation (ft)'
                    },
                    grid: {
                        display: true,
                        color: '#e0e0e0'
                    },
                    min: 0
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    } catch (error) {
        console.error('Error creating displacement chart:', error);
        // Show user-friendly error message
        const chartContainer = document.getElementById('displacementChart').parentElement;
        chartContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Chart could not be loaded. Please refresh the page and try again.</p>';
    }
}

// Generate PDF report
function generatePDF() {
    if (!window.windAnalysisResults) {
        alert('Please calculate results first.');
        return;
    }
    
    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            alert('PDF library not loaded. Please refresh the page and try again.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const results = window.windAnalysisResults;
        
        // Add title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Lateral deflection due to Wind', 105, 30, { align: 'center' });
        
        let yPos = 50;
        
        // Get chart canvas and add to PDF with border
        const chartCanvas = document.getElementById('displacementChart');
        if (chartCanvas) {
            const chartImgData = chartCanvas.toDataURL('image/png');
            doc.addImage(chartImgData, 'PNG', 20, yPos, 170, 85);
            // Add border around chart
            doc.setLineWidth(0.2);
            doc.rect(20, yPos, 170, 85);
            yPos += 95;
        }
        
        // Calculate maximum displacements and allowable limits
        const maxXDisplacement = Math.max(...results.map(r => r.xDir));
        const maxYDisplacement = Math.max(...results.map(r => r.yDir));
        const maxElevation = Math.max(...results.map(r => r.elevation));
        const allowableLimit = (maxElevation / 500) * 12;
        
        // Add results table
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        
        // Table headers
        doc.text('Story', 20, yPos);
        doc.text('Elev.(ft)', 45, yPos);
        doc.text('Location', 70, yPos);
        doc.text('X-Dir(in)', 95, yPos);
        doc.text('X-Status', 120, yPos);
        doc.text('Y-Dir(in)', 145, yPos);
        doc.text('Y-Status', 170, yPos);
        doc.text('Allow.(in)', 190, yPos);
        
        // Draw line under headers
        doc.line(20, yPos + 2, 210, yPos + 2);
        
        yPos += 8;
        doc.setFont(undefined, 'normal');
        
        // Add data rows
        results.forEach((result, index) => {
            if (yPos > 270) { // Start new page if needed
                doc.addPage();
                yPos = 20;
            }
            
            doc.text(result.story, 20, yPos);
            doc.text(result.elevation.toFixed(1), 45, yPos);
            doc.text(result.location, 70, yPos);
            doc.text(result.xDir.toFixed(3), 95, yPos);
            
            // Color code status
            doc.setTextColor(result.xStatus === 'PASS' ? 0 : 255, result.xStatus === 'PASS' ? 128 : 0, 0);
            doc.text(result.xStatus, 120, yPos);
            doc.setTextColor(0, 0, 0);
            
            doc.text(result.yDir.toFixed(3), 145, yPos);
            
            doc.setTextColor(result.yStatus === 'PASS' ? 0 : 255, result.yStatus === 'PASS' ? 128 : 0, 0);
            doc.text(result.yStatus, 170, yPos);
            doc.setTextColor(0, 0, 0);
            
            doc.text(result.allowable.toFixed(2), 190, yPos);
            
            yPos += 6;
        });
        
        // Add analysis text with reduced spacing
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        
        doc.text(`Maximum lateral deflection due to D+0.5L+0.7W for X = ${maxXDisplacement.toFixed(3)} in and for Y = ${maxYDisplacement.toFixed(3)} in`, 20, yPos);
        yPos += 10;
        
        doc.text(`Allowable limit for Lateral deflection due to Wind = H/500 = ${maxElevation.toFixed(1)}/500 = ${allowableLimit.toFixed(3)} in`, 20, yPos);
        yPos += 10;
        
        const maxOverallDisplacement = Math.max(maxXDisplacement, maxYDisplacement);
        const complianceStatus = maxOverallDisplacement < allowableLimit ? 'okay' : 'not okay';
        doc.text(`Maximum deflection < Allowable deflection (${complianceStatus})`, 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.text('Ref: Sec. 1.5.6.2, 2.7.5, Part-VI, BNBC 2020', 20, yPos);
        
        // Remove footer as per user requirements
        
        // Generate PDF blob
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Check if device is mobile
        const isMobile = window.innerWidth <= 768 || 
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0) ||
                        (navigator.msMaxTouchPoints > 0);
        
        // Show PDF preview
        const previewContainer = document.getElementById('pdfPreviewContainer');
        previewContainer.style.display = 'block';
        
        if (isMobile) {
            // Mobile-friendly interface
            previewContainer.innerHTML = `
                <div class="mobile-pdf-message">
                    <h4>PDF Report Generated</h4>
                    <p>PDF preview is not supported on mobile devices. Please download the file to view it.</p>
                    <button onclick="downloadPDF('${pdfUrl}', 'Wind_Displacement_Analysis_Report.pdf')" class="download-btn mobile-download">
                        <i class="fas fa-download"></i> Download PDF Report
                    </button>
                    <p class="mobile-tip">Tip: Use your device's PDF viewer to open the downloaded file.</p>
                </div>
            `;
        } else {
            // Desktop interface with iframe
            previewContainer.innerHTML = `
                <div class="pdf-controls">
                    <button onclick="downloadPDF('${pdfUrl}', 'Wind_Displacement_Analysis_Report.pdf')" class="download-btn">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                </div>
                <iframe src="${pdfUrl}" width="100%" height="600px" style="border: 1px solid #ddd; border-radius: 4px;"></iframe>
            `;
        }
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Global function for PDF download
function downloadPDF(url, filename) {
    try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error downloading PDF. Please try again.');
    }
}

// Story Drift Variables
let storyDriftData = [];

// Story Drift Functions
function adjustStoryDriftTableRows() {
    const targetCount = parseInt(document.getElementById('storyDriftRowCount').value);
    const wxTableBody = document.getElementById('storyDriftWxTableBody');
    const wyTableBody = document.getElementById('storyDriftWyTableBody');
    const currentCount = wxTableBody.children.length;
    
    if (targetCount > currentCount) {
        // Add rows
        for (let i = currentCount; i < targetCount; i++) {
            addStoryDriftSingleRow();
        }
    } else if (targetCount < currentCount) {
        // Remove rows
        for (let i = currentCount; i > targetCount; i--) {
            removeStoryDriftLastRow();
        }
    }
    
    document.getElementById('storyDriftRowCount').value = targetCount;
}

function addStoryDriftSingleRow() {
    const wxTableBody = document.getElementById('storyDriftWxTableBody');
    const wyTableBody = document.getElementById('storyDriftWyTableBody');
    
    const wxDefaultData = [
        { story: 'Roof Top', elevation: 55, displacement: 1.31 },
        { story: 'Roof', elevation: 45, displacement: 1.14 },
        { story: '4th', elevation: 35, displacement: 0.94 },
        { story: '3rd', elevation: 25, displacement: 0.73 },
        { story: '2nd', elevation: 15, displacement: 0.50 },
        { story: '1st', elevation: 7.5, displacement: 0.27 },
        { story: 'GF', elevation: 0, displacement: 0.00 }
    ];
    
    const wyDefaultData = [
        { story: 'Roof Top', elevation: 55, displacement: 1.25 },
        { story: 'Roof', elevation: 45, displacement: 1.20 },
        { story: '4th', elevation: 35, displacement: 1.00 },
        { story: '3rd', elevation: 25, displacement: 0.73 },
        { story: '2nd', elevation: 15, displacement: 0.50 },
        { story: '1st', elevation: 7.5, displacement: 0.27 },
        { story: 'GF', elevation: 0, displacement: 0.00 }
    ];
    
    const currentRowIndex = wxTableBody.children.length;
    const wxDefaultValues = currentRowIndex < wxDefaultData.length ? wxDefaultData[currentRowIndex] : { story: '', elevation: 0, displacement: 0 };
    const wyDefaultValues = currentRowIndex < wyDefaultData.length ? wyDefaultData[currentRowIndex] : { story: '', elevation: 0, displacement: 0 };
    
    // Create Wx row
    const wxNewRow = document.createElement('tr');
    wxNewRow.innerHTML = `
        <td><input type="text" placeholder="Story" class="story-drift-wx-story-input" value="${wxDefaultValues.story}"></td>
        <td><input type="text" placeholder="Direction" class="story-drift-wx-direction-input" value="X" readonly></td>
        <td><input type="number" step="0.01" placeholder="0" class="story-drift-wx-elevation-input" value="${wxDefaultValues.elevation}" oninput="calculateStoryDriftValues(this, 'wx')"></td>
        <td class="story-drift-wx-height-cell">0.00</td>
        <td><input type="number" step="0.001" placeholder="0" class="story-drift-wx-displacement-input" value="${wxDefaultValues.displacement}" oninput="calculateStoryDriftValues(this, 'wx')"></td>
        <td class="story-drift-wx-drift-cell">0.00</td>
        <td class="story-drift-wx-allowable-cell">0.00</td>
        <td class="story-drift-wx-remark-cell">Ok</td>
    `;
    
    // Create Wy row
    const wyNewRow = document.createElement('tr');
    wyNewRow.innerHTML = `
        <td><input type="text" placeholder="Story" class="story-drift-wy-story-input" value="${wyDefaultValues.story}"></td>
        <td><input type="text" placeholder="Direction" class="story-drift-wy-direction-input" value="Y" readonly></td>
        <td><input type="number" step="0.01" placeholder="0" class="story-drift-wy-elevation-input" value="${wyDefaultValues.elevation}" oninput="calculateStoryDriftValues(this, 'wy')"></td>
        <td class="story-drift-wy-height-cell">0.00</td>
        <td><input type="number" step="0.001" placeholder="0" class="story-drift-wy-displacement-input" value="${wyDefaultValues.displacement}" oninput="calculateStoryDriftValues(this, 'wy')"></td>
        <td class="story-drift-wy-drift-cell">0.00</td>
        <td class="story-drift-wy-allowable-cell">0.00</td>
        <td class="story-drift-wy-remark-cell">Ok</td>
    `;
    
    wxTableBody.appendChild(wxNewRow);
    wyTableBody.appendChild(wyNewRow);
    
    // Update row count input
    document.getElementById('storyDriftRowCount').value = wxTableBody.children.length;
    
    // Trigger calculations for the new rows
    calculateStoryDriftValues(null, 'wx');
    calculateStoryDriftValues(null, 'wy');
}

function removeStoryDriftLastRow() {
    const wxTableBody = document.getElementById('storyDriftWxTableBody');
    const wyTableBody = document.getElementById('storyDriftWyTableBody');
    
    if (wxTableBody.children.length > 0) {
        wxTableBody.removeChild(wxTableBody.lastElementChild);
        wyTableBody.removeChild(wyTableBody.lastElementChild);
        
        // Update row count input
        document.getElementById('storyDriftRowCount').value = wxTableBody.children.length;
    }
}

// Helper function to get current time period value
function getCurrentTimePeriod() {
    try {
        const timePeriodElement = document.getElementById('timePeriodResult');
        if (timePeriodElement && timePeriodElement.textContent) {
            const timePeriod = parseFloat(timePeriodElement.textContent);
            return isNaN(timePeriod) ? 0 : timePeriod;
        }
        return 0; // Default to 0 if not available
    } catch (error) {
        console.error('Error getting time period:', error);
        return 0;
    }
}

// Function to update all story drift allowable values when time period changes
function updateStoryDriftAllowableValues() {
    // Update Wx table
    const wxTableBody = document.getElementById('storyDriftWxTableBody');
    if (wxTableBody) {
        const wxRows = Array.from(wxTableBody.querySelectorAll('tr'));
        wxRows.forEach(row => {
            const firstInput = row.querySelector('input');
            if (firstInput) {
                calculateStoryDriftValues(firstInput, 'wx');
            }
        });
    }
    
    // Update Wy table
    const wyTableBody = document.getElementById('storyDriftWyTableBody');
    if (wyTableBody) {
        const wyRows = Array.from(wyTableBody.querySelectorAll('tr'));
        wyRows.forEach(row => {
            const firstInput = row.querySelector('input');
            if (firstInput) {
                calculateStoryDriftValues(firstInput, 'wy');
            }
        });
    }
}

// Function to calculate Story Height ft from Story Height in
function calculateStoryDriftValues(input, table) {
    const tableBody = document.getElementById(`storyDrift${table.charAt(0).toUpperCase() + table.slice(1)}TableBody`);
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    
    // Calculate for all rows
    rows.forEach((row, index) => {
        const elevationInput = row.querySelector(`.story-drift-${table}-elevation-input`);
        const heightCell = row.querySelector(`.story-drift-${table}-height-cell`);
        const displacementInput = row.querySelector(`.story-drift-${table}-displacement-input`);
        const driftCell = row.querySelector(`.story-drift-${table}-drift-cell`);
        const allowableCell = row.querySelector(`.story-drift-${table}-allowable-cell`);
        const remarkCell = row.querySelector(`.story-drift-${table}-remark-cell`);
        
        const currentElevation = parseFloat(elevationInput.value) || 0;
        const currentDisplacement = parseFloat(displacementInput.value) || 0;
        
        // Calculate Story Height (difference between current and next elevation)
        let storyHeight = 0;
        if (index < rows.length - 1) {
            const nextRow = rows[index + 1];
            const nextElevationInput = nextRow.querySelector(`.story-drift-${table}-elevation-input`);
            const nextElevation = parseFloat(nextElevationInput.value) || 0;
            storyHeight = currentElevation - nextElevation;
        }
        heightCell.textContent = storyHeight.toFixed(2);
        
        // Calculate Drift (current displacement minus displacement of story below)
        let drift = 0;
        if (index < rows.length - 1) {
            const belowRow = rows[index + 1];
            const belowDisplacementInput = belowRow.querySelector(`.story-drift-${table}-displacement-input`);
            const belowDisplacement = parseFloat(belowDisplacementInput.value) || 0;
            drift = currentDisplacement - belowDisplacement;
        }
        driftCell.textContent = drift.toFixed(3);
        
        // Get current time period for allowable drift calculation
        const timePeriod = getCurrentTimePeriod();
        
        // Calculate Allowable Drift based on time period
        // If T >= 0.7 sec: use 0.004, otherwise use 0.005
        const driftCoefficient = timePeriod >= 0.7 ? 0.004 : 0.005;
        const allowableDrift = driftCoefficient * storyHeight * 12;
        allowableCell.textContent = allowableDrift.toFixed(3);
        
        // Calculate Remark
        const remark = drift <= allowableDrift ? "Ok" : "Not Ok";
        remarkCell.textContent = remark;
    });
}



function clearStoryDriftTable() {
    if (confirm('Are you sure you want to clear all data?')) {
        const wxTableBody = document.getElementById('storyDriftWxTableBody');
        const wyTableBody = document.getElementById('storyDriftWyTableBody');
        
        // Clear Wx table
        const wxRows = wxTableBody.querySelectorAll('tr');
        wxRows.forEach(row => {
            row.querySelector('.story-drift-wx-story-input').value = '';
            row.querySelector('.story-drift-wx-direction-input').value = 'X';
            row.querySelector('.story-drift-wx-elevation-input').value = '';
            row.querySelector('.story-drift-wx-height-cell').textContent = '0.00';
            row.querySelector('.story-drift-wx-displacement-input').value = '';
            row.querySelector('.story-drift-wx-drift-cell').textContent = '0.000';
            row.querySelector('.story-drift-wx-allowable-cell').textContent = '0.000';
            row.querySelector('.story-drift-wx-remark-cell').textContent = '';
        });
        
        // Clear Wy table
        const wyRows = wyTableBody.querySelectorAll('tr');
        wyRows.forEach(row => {
            row.querySelector('.story-drift-wy-story-input').value = '';
            row.querySelector('.story-drift-wy-direction-input').value = 'Y';
            row.querySelector('.story-drift-wy-elevation-input').value = '';
            row.querySelector('.story-drift-wy-height-cell').textContent = '0.00';
            row.querySelector('.story-drift-wy-displacement-input').value = '';
            row.querySelector('.story-drift-wy-drift-cell').textContent = '0.000';
            row.querySelector('.story-drift-wy-allowable-cell').textContent = '0.000';
            row.querySelector('.story-drift-wy-remark-cell').textContent = '';
        });
        
        // Clear results
        document.getElementById('storyDriftResultsSection').style.display = 'none';
        storyDriftData = [];
        
        // Hide PDF preview
        document.getElementById('storyDriftPdfPreviewContainer').style.display = 'none';
    }
}

function fillStoryDriftSampleData() {
    // Ensure we have enough rows
    adjustStoryDriftTableRows();
    
    const wxSampleData = [
        { story: 'Roof Top', elevation: 55, displacement: 1.31 },
        { story: 'Roof', elevation: 45, displacement: 1.14 },
        { story: '4th', elevation: 35, displacement: 0.94 },
        { story: '3rd', elevation: 25, displacement: 0.73 },
        { story: '2nd', elevation: 15, displacement: 0.50 },
        { story: '1st', elevation: 7.5, displacement: 0.27 },
        { story: 'GF', elevation: 0, displacement: 0.00 }
    ];
    
    const wySampleData = [
        { story: 'Roof Top', elevation: 55, displacement: 1.25 },
        { story: 'Roof', elevation: 45, displacement: 1.20 },
        { story: '4th', elevation: 35, displacement: 1.00 },
        { story: '3rd', elevation: 25, displacement: 0.73 },
        { story: '2nd', elevation: 15, displacement: 0.50 },
        { story: '1st', elevation: 7.5, displacement: 0.27 },
        { story: 'GF', elevation: 0, displacement: 0.00 }
    ];
    
    const wxTableBody = document.getElementById('storyDriftWxTableBody');
    const wyTableBody = document.getElementById('storyDriftWyTableBody');
    
    // Fill Wx table
    const wxRows = wxTableBody.querySelectorAll('tr');
    wxRows.forEach((row, index) => {
        if (index < wxSampleData.length) {
            const data = wxSampleData[index];
            row.querySelector('.story-drift-wx-story-input').value = data.story;
            row.querySelector('.story-drift-wx-direction-input').value = 'X';
            row.querySelector('.story-drift-wx-elevation-input').value = data.elevation;
            row.querySelector('.story-drift-wx-displacement-input').value = data.displacement;
        }
    });
    
    // Fill Wy table
    const wyRows = wyTableBody.querySelectorAll('tr');
    wyRows.forEach((row, index) => {
        if (index < wySampleData.length) {
            const data = wySampleData[index];
            row.querySelector('.story-drift-wy-story-input').value = data.story;
            row.querySelector('.story-drift-wy-direction-input').value = 'Y';
            row.querySelector('.story-drift-wy-elevation-input').value = data.elevation;
            row.querySelector('.story-drift-wy-displacement-input').value = data.displacement;
        }
    });
    
    // Trigger calculations for both tables
    calculateStoryDriftValues(null, 'wx');
    calculateStoryDriftValues(null, 'wy');
}

// Initialize the tool
document.addEventListener('DOMContentLoaded', function() {
    // Calculate initial allowable value
    const initialElevationInput = document.querySelector('.elevation-input');
    if (initialElevationInput && initialElevationInput.placeholder) {
        const elevation = parseFloat(initialElevationInput.placeholder);
        if (!isNaN(elevation)) {
            const allowable = (elevation / 500) * 12;
            const allowableCell = initialElevationInput.closest('tr').querySelector('.allowable-cell');
            allowableCell.textContent = allowable.toFixed(2);
        }
    }
    
    // Initialize story drift tables
    setTimeout(() => {
        if (document.getElementById('storyDriftWxTableBody')) {
            adjustStoryDriftTableRows();
            fillStoryDriftSampleData();
            setupStoryDriftColumnPasteListeners();
            
            // Connect analyze button
            const analyzeBtn = document.getElementById('analyzeStoryDriftBtn');
            if (analyzeBtn) {
                analyzeBtn.addEventListener('click', calculateStoryDriftResults);
            }
            
            // Connect PDF generation button
            const pdfBtn = document.getElementById('generateStoryDriftPdfBtn');
            if (pdfBtn) {
                pdfBtn.addEventListener('click', generateStoryDriftPDF);
            }
        }
        
        // Initialize time period calculation
        initializeTimePeriod();
    }, 100);
});

// Story Drift Data Collection and Analysis Functions
function collectStoryDriftTableData() {
    const wxTableBody = document.getElementById('storyDriftWxTableBody');
    const wyTableBody = document.getElementById('storyDriftWyTableBody');
    const wxRows = wxTableBody.querySelectorAll('tr');
    const wyRows = wyTableBody.querySelectorAll('tr');
    const data = [];
    
    // Collect Wx data
    wxRows.forEach(row => {
        const story = row.querySelector('.story-drift-wx-story-input').value.trim();
        const direction = row.querySelector('.story-drift-wx-direction-input').value;
        const elevationIn = parseFloat(row.querySelector('.story-drift-wx-elevation-input').value);
        const elevationFt = parseFloat(row.querySelector('.story-drift-wx-elevation-input').value);
        const storyHeight = parseFloat(row.querySelector('.story-drift-wx-height-cell').textContent);
        const displacement = parseFloat(row.querySelector('.story-drift-wx-displacement-input').value);
        const drift = parseFloat(row.querySelector('.story-drift-wx-drift-cell').textContent);
        const allowable = parseFloat(row.querySelector('.story-drift-wx-allowable-cell').textContent);
        const remark = row.querySelector('.story-drift-wx-remark-cell').textContent.trim();
        
        if (story && !isNaN(elevationIn) && !isNaN(displacement) && !isNaN(drift)) {
            data.push({
                story,
                direction,
                elevationIn,
                elevationFt,
                storyHeight,
                displacement,
                drift,
                allowable,
                remark,
                table: 'wx'
            });
        }
    });
    
    // Collect Wy data
    wyRows.forEach(row => {
        const story = row.querySelector('.story-drift-wy-story-input').value.trim();
        const direction = row.querySelector('.story-drift-wy-direction-input').value;
        const elevationIn = parseFloat(row.querySelector('.story-drift-wy-elevation-input').value);
        const elevationFt = parseFloat(row.querySelector('.story-drift-wy-elevation-input').value);
        const storyHeight = parseFloat(row.querySelector('.story-drift-wy-height-cell').textContent);
        const displacement = parseFloat(row.querySelector('.story-drift-wy-displacement-input').value);
        const drift = parseFloat(row.querySelector('.story-drift-wy-drift-cell').textContent);
        const allowable = parseFloat(row.querySelector('.story-drift-wy-allowable-cell').textContent);
        const remark = row.querySelector('.story-drift-wy-remark-cell').textContent.trim();
        
        if (story && !isNaN(elevationIn) && !isNaN(displacement) && !isNaN(drift)) {
            data.push({
                story,
                direction,
                elevationIn,
                elevationFt,
                storyHeight,
                displacement,
                drift,
                allowable,
                remark,
                table: 'wy'
            });
        }
    });
    
    return data;
}

// Main analysis function called from the button
function analyzeStoryDrift() {
    calculateStoryDriftResults();
}

function calculateStoryDriftResults() {
    storyDriftData = collectStoryDriftTableData();
    
    if (storyDriftData.length === 0) {
        alert('Please enter some data first.');
        return;
    }
    
    // Analyze each row
    const results = storyDriftData.map(row => {
        const driftStatus = row.drift <= row.allowable ? 'PASS' : 'FAIL';
        
        return {
            ...row,
            driftStatus
        };
    });
    
    // Display results
    displayStoryDriftResults(results);
    displayStoryDriftSummary(results);
    createStoryDriftChart(results);
    
    // Show results section
    document.getElementById('storyDriftResultsSection').style.display = 'block';
    document.getElementById('storyDriftResultsSection').scrollIntoView({ behavior: 'smooth' });
    
    // Store results globally for PDF generation
    window.storyDriftAnalysisResults = results;
}

function displayStoryDriftResults(results) {
    const tableBody = document.getElementById('storyDriftResultsTableBody');
    tableBody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.story}</td>
            <td>${result.table.toUpperCase()}</td>
            <td>${result.direction}</td>
            <td>${result.elevationFt.toFixed(2)}</td>
            <td>${result.displacement.toFixed(3)}</td>
            <td>${result.drift.toFixed(3)}</td>
            <td class="${result.driftStatus.toLowerCase()}">${result.driftStatus}</td>
            <td>${result.allowable.toFixed(3)}</td>
            <td>${result.remark}</td>
        `;
        tableBody.appendChild(row);
    });
}

function displayStoryDriftSummary(results) {
    const summaryContainer = document.getElementById('storyDriftResultsSummary');
    
    const totalEntries = results.length;
    const passCount = results.filter(r => r.driftStatus === 'PASS').length;
    const failCount = results.filter(r => r.driftStatus === 'FAIL').length;
    
    const maxDrift = Math.max(...results.map(r => r.drift));
    const maxDriftEntry = results.find(r => r.drift === maxDrift);
    
    const overallCompliance = failCount === 0;
    
    let summaryHTML = `
        <div class="summary-header">
            <h3><i class="fas fa-chart-bar"></i> Story Drift Analysis Summary</h3>
            <div class="overall-status ${overallCompliance ? 'pass' : 'fail'}">
                <i class="fas fa-${overallCompliance ? 'check-circle' : 'exclamation-triangle'}"></i>
                ${overallCompliance ? 'ALL ENTRIES COMPLIANT' : 'COMPLIANCE ISSUES FOUND'}
            </div>
        </div>
        
        <div class="summary-stats">
            <div class="stat-item">
                <div class="stat-value">${totalEntries}</div>
                <div class="stat-label">Total Entries</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${passCount}</div>
                <div class="stat-label">Compliant</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${failCount}</div>
                <div class="stat-label">Non-Compliant</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${maxDrift.toFixed(3)}"</div>
                <div class="stat-label">Max Drift</div>
            </div>
        </div>
        
        <div class="summary-details">
            <p><strong>Maximum Story Drift:</strong> ${maxDrift.toFixed(3)}" at ${maxDriftEntry?.story || 'N/A'} (${maxDriftEntry?.direction || 'N/A'} direction)</p>
            <p><strong>Compliance Rate:</strong> ${((passCount / totalEntries) * 100).toFixed(1)}%</p>
        </div>
    `;
    
    summaryContainer.innerHTML = summaryHTML;
}

function createStoryDriftChart(results) {
    const ctx = document.getElementById('storyDriftChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.storyDriftChart && typeof window.storyDriftChart.destroy === 'function') {
        window.storyDriftChart.destroy();
    }
    
    // Separate Wx and Wy data
    const wxData = results.filter(result => result.table === 'wx');
    const wyData = results.filter(result => result.table === 'wy');
    
    // Sort by elevation for proper line connection
    const sortedWxData = wxData.sort((a, b) => a.elevationFt - b.elevationFt);
    const sortedWyData = wyData.sort((a, b) => a.elevationFt - b.elevationFt);
    
    // Prepare chart data for Wx direction
    const wxChartData = [];
    const wxAllowableData = [];
    
    sortedWxData.forEach(result => {
        wxChartData.push({
            x: result.drift,
            y: result.elevationFt
        });
        wxAllowableData.push({
            x: result.allowable,
            y: result.elevationFt
        });
    });
    
    // Prepare chart data for Wy direction
    const wyChartData = [];
    const wyAllowableData = [];
    
    sortedWyData.forEach(result => {
        wyChartData.push({
            x: result.drift,
            y: result.elevationFt
        });
        wyAllowableData.push({
            x: result.allowable,
            y: result.elevationFt
        });
    });
    
    // Create chart with improved quality
    try {
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        window.storyDriftChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Wx Drift',
                        data: wxChartData,
                        borderColor: '#2563eb',
                        backgroundColor: 'transparent',
                        borderWidth: 4, // Increased line width for better visibility
                        borderDash: [5, 5], // Dashed line
                        pointRadius: 0,
                        pointBackgroundColor: '#2563eb',
                        tension: 0.1,
                        fill: false,
                        cubicInterpolationMode: 'monotone' // Smoother curve
                    },
                    {
                        label: 'Wy Drift',
                        data: wyChartData,
                        borderColor: '#dc2626',
                        backgroundColor: 'transparent',
                        borderWidth: 4, // Increased line width for better visibility
                        borderDash: [5, 5], // Dashed line
                        pointRadius: 0,
                        pointBackgroundColor: '#dc2626',
                        tension: 0.1,
                        fill: false,
                        cubicInterpolationMode: 'monotone' // Smoother curve
                    },
                    {
                        label: 'Allowable',
                        data: wxAllowableData.length > 0 ? wxAllowableData : wyAllowableData,
                        borderColor: '#16a34a',
                        backgroundColor: 'transparent',
                        borderWidth: 4, // Increased line width for better visibility
                        borderDash: [], // Solid line
                        pointRadius: 0,
                        pointBackgroundColor: '#16a34a',
                        tension: 0.1,
                        fill: false,
                        cubicInterpolationMode: 'monotone' // Smoother curve
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Wind Interstory Drift',
                        font: {
                            size: 18,
                            weight: 'bold',
                            family: 'Arial, Helvetica, sans-serif'
                        },
                        padding: {
                            top: 10,
                            bottom: 15
                        },
                        color: '#111827'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'center',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'line',
                            boxWidth: 60,
                            padding: 15,
                            font: {
                                size: 13,
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 10,
                        cornerRadius: 6,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.x.toFixed(4);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Drift Ratio',
                            font: {
                                weight: 'bold',
                                size: 14
                            },
                            padding: 10
                        },
                        grid: {
                            display: true,
                            color: '#d1d5db',
                            lineWidth: 1.5,
                            drawBorder: true,
                            drawOnChartArea: true,
                            drawTicks: true
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            padding: 5,
                            precision: 2
                        },
                        min: 0
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Elevation (ft)',
                            font: {
                                weight: 'bold',
                                size: 14
                            },
                            padding: 10
                        },
                        grid: {
                            display: true,
                            color: '#d1d5db',
                            lineWidth: 1.5,
                            drawBorder: true,
                            drawOnChartArea: true,
                            drawTicks: true
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            padding: 5
                        },
                        min: 0,
                        max: Math.max(...results.map(r => r.elevationFt)) + 5,
                        reverse: false // Y-axis from bottom (0) to top (highest)
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    } catch (error) {
        console.error('Error creating story drift chart:', error);
        const chartContainer = document.getElementById('storyDriftChart').parentElement;
        chartContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Chart could not be loaded. Please refresh the page and try again.</p>';
    }
}

// Story Drift PDF Generation
function generateStoryDriftPDF() {
    if (!window.storyDriftAnalysisResults || window.storyDriftAnalysisResults.length === 0) {
        alert('Please analyze the data first before generating PDF.');
        return;
    }

    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            alert('PDF library not loaded. Please refresh the page and try again.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const results = window.storyDriftAnalysisResults;
        
        // Add title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Story Drift (wind)', 105, 30, { align: 'center' });
        
        let yPos = 50;
        
        // Get chart canvas and add to PDF with optimized quality/size balance
        const chartCanvas = document.getElementById('storyDriftChart');
        if (chartCanvas) {
            // Create a high-resolution version of the chart with optimized settings
            const tempCanvas = document.createElement('canvas');
            const scaleFactor = 3; // Reduced from 5 to 3 for smaller file size
            tempCanvas.width = chartCanvas.width * scaleFactor;
            tempCanvas.height = chartCanvas.height * scaleFactor;
            
            const tempCtx = tempCanvas.getContext('2d');
            // Enable anti-aliasing with medium quality for balance
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'medium';
            
            // Clear the canvas with white background
            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Scale and draw the original chart
            tempCtx.scale(scaleFactor, scaleFactor);
            tempCtx.drawImage(chartCanvas, 0, 0);
            
            // Get image data as JPEG with 85% quality for smaller file size
            const chartImgData = tempCanvas.toDataURL('image/jpeg', 0.85);
            
            // Add the optimized image to PDF
            doc.addImage(chartImgData, 'JPEG', 20, yPos, 170, 85);
            // Add thin border around chart
            doc.setLineWidth(0.2);
            doc.rect(20, yPos, 170, 85);
            yPos += 95;
        }
        
        // Calculate maximum drift and allowable limits
        const maxDrift = Math.max(...results.map(r => r.drift));
        const maxDriftEntry = results.find(r => r.drift === maxDrift);
        const maxDriftRowStoryHeight = maxDriftEntry ? maxDriftEntry.storyHeight : 0;
        
        // Get current time period for allowable drift calculation
        const timePeriod = getCurrentTimePeriod();
        
        // Calculate Allowable Drift based on time period
        // If T >= 0.7 sec: use 0.004, otherwise use 0.005
        const driftCoefficient = timePeriod >= 0.7 ? 0.004 : 0.005;
        const allowableLimit = driftCoefficient * maxDriftRowStoryHeight * 12;
        
        // Add results table with simplified formatting
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        
        // Table headers with simple underline
        doc.text('Story', 20, yPos);
        doc.text('Load Case', 45, yPos);
        doc.text('Dir', 75, yPos);
        doc.text('Height(ft)', 90, yPos);
        doc.text('Disp(in)', 115, yPos);
        doc.text('Drift(in)', 140, yPos);
        doc.text('Status', 165, yPos);
        doc.text('Allow(in)', 185, yPos);
        
        // Simple underline for headers
        doc.line(20, yPos + 2, 200, yPos + 2);
        
        yPos += 6;
        doc.setFont(undefined, 'normal');
        
        // Add data rows with simplified formatting
        results.forEach((result, index) => {
            if (yPos > 270) { // Start new page if needed
                doc.addPage();
                yPos = 20;
            }
            
            doc.text(result.story, 20, yPos);
            doc.text(result.table.toUpperCase(), 45, yPos);
            doc.text(result.direction, 75, yPos);
            doc.text(result.elevationFt.toFixed(1), 90, yPos);
            doc.text(result.displacement.toFixed(3), 115, yPos);
            doc.text(result.drift.toFixed(3), 140, yPos);
            
            // Simplified color coding for status
            if (result.driftStatus === 'FAIL') {
                doc.setTextColor(150, 0, 0); // Dark red for FAIL
            } else {
                doc.setTextColor(0, 100, 0); // Dark green for PASS
            }
            doc.text(result.driftStatus, 165, yPos);
            doc.setTextColor(0, 0, 0); // Reset to black
            
            doc.text(result.allowable.toFixed(3), 185, yPos);
            
            yPos += 5; // Reduced row height
        });
        
        // Add analysis text
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        
        doc.text(`Maximum drift value = ${maxDrift.toFixed(3)} in at ${maxDriftEntry?.story || 'N/A'} (${maxDriftEntry?.direction || 'N/A'} direction)`, 20, yPos);
        yPos += 6;
        
        doc.text(`Allowable drift = ${driftCoefficient.toFixed(3)} × ${maxDriftRowStoryHeight.toFixed(1)} × 12 = ${allowableLimit.toFixed(3)} in`, 20, yPos);
        yPos += 6;
        
        const complianceStatus = allowableLimit > maxDrift ? 'OK' : 'Not Ok';
        doc.text(`Comparison: Allowable drift > Maximum drift (${complianceStatus})`, 20, yPos);
        yPos += 8;
        
        doc.setFontSize(9);
        doc.text('Reference: BNBC 2020, Part 6, Chapter 1, Sec 1.5.6.1 - Storey Drift Limitation, Page: 3080', 20, yPos);
        
        // Create PDF blob and URL
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Check if mobile device
        const isMobile = 
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0) ||
                        (navigator.msMaxTouchPoints > 0);
        
        // Show PDF preview
        const previewContainer = document.getElementById('storyDriftPdfPreviewContainer');
        previewContainer.style.display = 'block';
        
        if (isMobile) {
            // Mobile-friendly interface
            previewContainer.innerHTML = `
                <div class="mobile-pdf-message">
                    <h4>PDF Report Generated</h4>
                    <p>PDF preview is not supported on mobile devices. Please download the file to view it.</p>
                    <button onclick="downloadStoryDriftPDF('${pdfUrl}', 'Story_Drift_Wind_Analysis_Report.pdf')" class="download-btn mobile-download">
                        <i class="fas fa-download"></i> Download PDF Report
                    </button>
                    <p class="mobile-tip">Tip: Use your device's PDF viewer to open the downloaded file.</p>
                </div>
            `;
        } else {
            // Desktop interface with iframe
            previewContainer.innerHTML = `
                <div class="pdf-controls">
                    <button onclick="downloadStoryDriftPDF('${pdfUrl}', 'Story_Drift_Wind_Analysis_Report.pdf')" class="download-btn">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                </div>
                <iframe src="${pdfUrl}" width="100%" height="600px" style="border: 1px solid #ddd; border-radius: 4px;"></iframe>
            `;
        }
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Global function for Story Drift PDF download
function downloadStoryDriftPDF(url, filename) {
    try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error downloading PDF. Please try again.');
    }
}

// Setup copy-paste functionality for story drift tables
function setupStoryDriftColumnPasteListeners() {
    // Wx table paste listeners
    const wxHeaders = [
        '.story-drift-wx-story-input',
        '.story-drift-wx-direction-input',
        '.story-drift-wx-elevation-input',
        '.story-drift-wx-displacement-input'
    ];
    
    wxHeaders.forEach(selector => {
        const inputs = document.querySelectorAll(selector);
        inputs.forEach(input => {
            input.addEventListener('paste', (e) => handleStoryDriftColumnPaste(e, selector, 'wx'));
        });
    });
    
    // Wy table paste listeners
    const wyHeaders = [
        '.story-drift-wy-story-input',
        '.story-drift-wy-direction-input',
        '.story-drift-wy-elevation-input',
        '.story-drift-wy-displacement-input'
    ];
    
    wyHeaders.forEach(selector => {
        const inputs = document.querySelectorAll(selector);
        inputs.forEach(input => {
            input.addEventListener('paste', (e) => handleStoryDriftColumnPaste(e, selector, 'wy'));
        });
    });
}

function handleStoryDriftColumnPaste(event, columnSelector, tableType) {
    event.preventDefault();
    
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('text');
    
    if (!pastedData) return;
    
    const lines = pastedData.split('\n').filter(line => line.trim() !== '');
    const inputs = document.querySelectorAll(columnSelector);
    
    const startIndex = Array.from(inputs).indexOf(event.target);
    
    lines.forEach((line, index) => {
        const targetIndex = startIndex + index;
        if (targetIndex < inputs.length) {
            inputs[targetIndex].value = line.trim();
        }
    });
    
    // Ensure we have enough rows
    const neededRows = startIndex + lines.length;
    const currentRows = inputs.length;
    
    if (neededRows > currentRows) {
        const rowsToAdd = neededRows - currentRows;
        for (let i = 0; i < rowsToAdd; i++) {
            addStoryDriftSingleRow();
        }
        
        // Re-setup paste listeners for new rows
        setTimeout(() => {
            setupStoryDriftColumnPasteListeners();
        }, 100);
    }
    
    // Trigger calculations after pasting
    setTimeout(() => {
        calculateStoryDriftValues(null, tableType);
    }, 50);
}

// Building Time Period Calculation Functions (copied from base-shear-script.js)
function getBuildingPeriodCoefficients(structureType) {
    const coefficients = {
        'concrete_moment': { Ct: 0.0466, m: 0.9 },
        'steel_moment': { Ct: 0.0724, m: 0.8 },
        'eccentrically_braced': { Ct: 0.0731, m: 0.75 },
        'all_other': { Ct: 0.0488, m: 0.75 }
    };
    return coefficients[structureType] || coefficients['concrete_moment'];
}

function calculateTimePeriod() {
    try {
        const structureType = document.getElementById('structureType').value;
        const buildingHeight = parseFloat(document.getElementById('buildingHeight').value);
        
        if (isNaN(buildingHeight) || buildingHeight <= 0) {
            alert('Please enter a valid building height.');
            return;
        }
        
        // Get coefficients based on structure type
        const { Ct, m } = getBuildingPeriodCoefficients(structureType);
        
        // Calculate time period: T = Ct * H^m
        const timePeriod = Ct * Math.pow(buildingHeight, m);
        
        // Update results display
        document.getElementById('ctResult').textContent = Ct.toFixed(4);
        document.getElementById('mResult').textContent = m.toFixed(2);
        document.getElementById('timePeriodResult').textContent = timePeriod.toFixed(3);
        
        console.log(`Time Period Calculation: T = ${Ct} × ${buildingHeight}^${m} = ${timePeriod.toFixed(3)} sec`);
        
        // Update story drift allowable values when time period changes
        updateStoryDriftAllowableValues();
        
    } catch (error) {
        console.error('Error in time period calculation:', error);
        alert('An error occurred during time period calculation. Please check your inputs.');
    }
}

// Initialize time period calculation on page load
function initializeTimePeriod() {
    // Set default values and calculate initial time period
    const structureTypeSelect = document.getElementById('structureType');
    const buildingHeightInput = document.getElementById('buildingHeight');
    
    if (structureTypeSelect && buildingHeightInput) {
        // Add event listeners for automatic calculation
        structureTypeSelect.addEventListener('change', calculateTimePeriod);
        buildingHeightInput.addEventListener('input', calculateTimePeriod);
        
        // Calculate initial time period
        calculateTimePeriod();
    }
}

// ===== EARTHQUAKE DISPLACEMENT FUNCTIONS =====

let eqData = [];

function calculateAllowableEQ(elevationInput) {
    const elevation = parseFloat(elevationInput.value);
    if (!isNaN(elevation)) {
        // Get importance factor from the input field
        const iValue = parseFloat(document.getElementById('iValueEQ').value) || 1.0;
        
        // Determine coefficient based on importance factor
        let coefficient;
        if (iValue === 1.0) {
            coefficient = 0.020;
        } else if (iValue === 1.25) {
            coefficient = 0.015;
        } else if (iValue === 1.5) {
            coefficient = 0.010;
        } else {
            // Default to 0.020 for other values
            coefficient = 0.020;
        }
        
        // Calculate allowable using new formula: coefficient × Elevation × 12
        const allowable = coefficient * elevation * 12;
        const allowableCell = elevationInput.closest('tr').querySelector('.allowable-cell');
        if (allowableCell) {
            allowableCell.textContent = allowable.toFixed(2);
        }
    }
}

function calculateAmplifiedEQ(input, direction) {
    const value = parseFloat(input.value);
    const cdValue = parseFloat(document.getElementById('cdValueEQ').value) || 5.0;
    const iValue = parseFloat(document.getElementById('iValueEQ').value) || 1.0;
    
    const row = input.closest('tr');
    const amplifiedInput = direction === 'x' ? 
        row.querySelector('.amplified-x-input') : 
        row.querySelector('.amplified-y-input');
    
    if (amplifiedInput) {
        if (!isNaN(value) && value !== 0) {
            const amplifiedValue = value * (cdValue / iValue);
            amplifiedInput.value = amplifiedValue.toFixed(3);
        } else {
            amplifiedInput.value = '';
        }
    }
}

function updateAllAmplifiedValuesEQ() {
    const tableBody = document.getElementById('dataTableBodyEQ');
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const xInput = row.querySelector('.x-dir-input');
        const yInput = row.querySelector('.y-dir-input');
        
        if (xInput) calculateAmplifiedEQ(xInput, 'x');
        if (yInput) calculateAmplifiedEQ(yInput, 'y');
    });
}

function updateAllAllowableValuesEQ() {
    const tableBody = document.getElementById('dataTableBodyEQ');
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const elevationInput = row.querySelector('.elevation-input');
        if (elevationInput && elevationInput.value) {
            calculateAllowableEQ(elevationInput);
        }
    });
}

function adjustTableRowsEQ(targetCount) {
    if (typeof targetCount === 'undefined') {
        targetCount = parseInt(document.getElementById('rowCountEQ').value);
    }
    
    const tableBody = document.getElementById('dataTableBodyEQ');
    const currentRows = tableBody.querySelectorAll('tr').length;
    
    if (targetCount > currentRows) {
        for (let i = currentRows; i < targetCount; i++) {
            addSingleRowEQ();
        }
    } else if (targetCount < currentRows) {
        for (let i = currentRows; i > targetCount; i--) {
            removeLastRowEQ();
        }
    }
    
    document.getElementById('rowCountEQ').value = targetCount;
}

function addSingleRowEQ() {
    const tableBody = document.getElementById('dataTableBodyEQ');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td><input type="text" placeholder="Story" class="story-input"></td>
        <td><input type="number" step="0.01" placeholder="0" class="elevation-input" oninput="calculateAllowableEQ(this)"></td>
        <td><input type="text" placeholder="Location" class="location-input"></td>
        <td><input type="number" step="0.001" placeholder="0" class="x-dir-input" oninput="calculateAmplifiedEQ(this, 'x')"></td>
        <td><input type="number" step="0.001" placeholder="0" class="amplified-x-input" readonly></td>
        <td><input type="number" step="0.001" placeholder="0" class="y-dir-input" oninput="calculateAmplifiedEQ(this, 'y')"></td>
        <td><input type="number" step="0.001" placeholder="0" class="amplified-y-input" readonly></td>
        <td class="allowable-cell">0.00</td>
    `;
    
    tableBody.appendChild(newRow);
    setupRowEventListenersEQ(newRow, tableBody.children.length - 1);
    
    // Update row count input
    document.getElementById('rowCountEQ').value = tableBody.children.length;
}

function removeLastRowEQ() {
    const tableBody = document.getElementById('dataTableBodyEQ');
    if (tableBody.children.length > 1) {
        tableBody.removeChild(tableBody.lastElementChild);
        // Update row count input
        document.getElementById('rowCountEQ').value = tableBody.children.length;
    }
}

function setupRowEventListenersEQ(row, rowIndex) {
    const inputs = row.querySelectorAll('input');
    inputs.forEach((input, columnIndex) => {
        input.addEventListener('paste', (event) => {
            handleColumnPasteEQ(event, rowIndex, columnIndex);
        });
    });
}

function handleColumnPasteEQ(event, startRowIndex, columnIndex) {
    event.preventDefault();
    
    const pastedData = (event.clipboardData || window.clipboardData).getData('text');
    const lines = pastedData.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length > 1) {
        const tableBody = document.getElementById('dataTableBodyEQ');
        const currentRows = tableBody.querySelectorAll('tr').length;
        const neededRows = startRowIndex + lines.length;
        
        if (neededRows > currentRows) {
            adjustTableRowsEQ(neededRows);
        }
        
        fillPastedDataEQ(tableBody.querySelectorAll('tr'), lines, startRowIndex, columnIndex);
    } else {
        event.target.value = pastedData.trim();
        if (columnIndex === 1) { // Elevation column
            calculateAllowableEQ(event.target);
        }
    }
}

function fillPastedDataEQ(rows, lines, startRowIndex, columnIndex) {
    lines.forEach((line, lineIndex) => {
        const rowIndex = startRowIndex + lineIndex;
        if (rowIndex < rows.length) {
            const row = rows[rowIndex];
            const inputs = row.querySelectorAll('input');
            
            if (columnIndex < inputs.length) {
                const values = line.split('\t');
                
                values.forEach((value, valueIndex) => {
                    const targetColumnIndex = columnIndex + valueIndex;
                    if (targetColumnIndex < inputs.length) {
                        inputs[targetColumnIndex].value = value.trim();
                        
                        if (targetColumnIndex === 1) { // Elevation column
                            calculateAllowableEQ(inputs[targetColumnIndex]);
                        } else if (targetColumnIndex === 3) { // X-Dir column
                            calculateAmplifiedEQ(inputs[targetColumnIndex], 'x');
                        } else if (targetColumnIndex === 5) { // Y-Dir column
                            calculateAmplifiedEQ(inputs[targetColumnIndex], 'y');
                        }
                    }
                });
            }
        }
    });
}

function fillSampleDataEQ() {
    const sampleData = [
        ['ROOF', '76', 'Top', '1.345788', '', '2.473209'],
        ['6F', '66', 'Top', '1.157996', '', '2.197646'],
        ['5F', '56', 'Top', '0.954631', '', '1.870366'],
        ['4F', '46', 'Top', '0.744253', '', '1.492481'],
        ['3F', '36', 'Top', '0.535893', '', '1.077718'],
        ['2F', '26', 'Top', '0.336477', '', '0.671082'],
        ['1F', '16', 'Top', '0.16201', '', '0.312591'],
        ['GF', '6', 'Top', '0.035034', '', '0.056265'],
        ['Base', '0', 'Top', '0', '', '0']
    ];
    
    adjustTableRowsEQ(sampleData.length);
    
    const tableBody = document.getElementById('dataTableBodyEQ');
    const rows = tableBody.querySelectorAll('tr');
    
    sampleData.forEach((data, index) => {
        if (index < rows.length) {
            const inputs = rows[index].querySelectorAll('input');
            // Fill only the input columns (skip amplified columns)
            if (inputs.length >= 7) {
                inputs[0].value = data[0]; // Story
                inputs[1].value = data[1]; // Elevation
                inputs[2].value = data[2]; // Location
                inputs[3].value = data[3]; // X-Dir
                inputs[5].value = data[5]; // Y-Dir (skip amplified X-Dir at index 4)
                
                // Calculate allowable for elevation
                calculateAllowableEQ(inputs[1]);
                
                // Calculate amplified values
                calculateAmplifiedEQ(inputs[3], 'x'); // X-Dir
                calculateAmplifiedEQ(inputs[5], 'y'); // Y-Dir
            }
        }
    });
}

function clearTableEQ() {
    const tableBody = document.getElementById('dataTableBodyEQ');
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
        });
        
        const allowableCell = row.querySelector('.allowable-cell');
        if (allowableCell) {
            allowableCell.textContent = '0.00';
        }
    });
}

function collectTableDataEQ() {
    const tableBody = document.getElementById('dataTableBodyEQ');
    const rows = tableBody.querySelectorAll('tr');
    const data = [];
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const allowableCell = row.querySelector('.allowable-cell');
        
        if (inputs.length >= 7) {
            const story = inputs[0].value.trim();
            const elevation = parseFloat(inputs[1].value) || 0;
            const location = inputs[2].value.trim();
            const xDir = parseFloat(inputs[3].value) || 0;
            const amplifiedXDir = parseFloat(inputs[4].value) || 0;
            const yDir = parseFloat(inputs[5].value) || 0;
            const amplifiedYDir = parseFloat(inputs[6].value) || 0;
            const allowable = parseFloat(allowableCell.textContent) || 0;
            
            if (story || elevation || xDir || yDir) {
                data.push({
                    story,
                    elevation,
                    location,
                    xDir,
                    amplifiedXDir,
                    yDir,
                    amplifiedYDir,
                    allowable
                });
            }
        }
    });
    
    return data;
}

function calculateResultsEQ() {
    eqData = collectTableDataEQ();
    
    if (eqData.length === 0) {
        alert('Please enter some data before calculating.');
        return;
    }
    
    const results = eqData.map(row => {
        const maxDisplacement = Math.max(Math.abs(row.amplifiedXDir), Math.abs(row.amplifiedYDir));
        const status = maxDisplacement <= row.allowable ? 'PASS' : 'FAIL';
        const remark = maxDisplacement <= row.allowable ? 'OK' : 'Exceeds Limit';
        
        return {
            ...row,
            maxDisplacement,
            status,
            remark
        };
    });
    
    displayResultsEQ(results);
    displaySummaryEQ(results);
    createDisplacementChartEQ(results);
    
    // Store results globally for PDF generation
    window.eqAnalysisResults = results;
    
    // Show results section
    document.getElementById('resultsSectionEQ').style.display = 'block';
    
    // Scroll to results
    document.getElementById('resultsSectionEQ').scrollIntoView({ behavior: 'smooth' });
}

function displayResultsEQ(results) {
    const tableBody = document.getElementById('resultsTableBodyEQ');
    tableBody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        row.className = result.status === 'FAIL' ? 'fail-row' : 'pass-row';
        
        row.innerHTML = `
            <td>${result.story}</td>
            <td>${result.elevation.toFixed(2)}</td>
            <td>${result.location}</td>
            <td>${result.xDir.toFixed(3)}</td>
            <td>${result.yDir.toFixed(3)}</td>
            <td>${result.maxDisplacement.toFixed(3)}</td>
            <td>${result.allowable.toFixed(2)}</td>
            <td class="status-${result.status.toLowerCase()}">${result.status}</td>
            <td>${result.remark}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function displaySummaryEQ(results) {
    const summaryDiv = document.getElementById('resultsSummaryEQ');
    
    const totalStories = results.length;
    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    
    const maxDisplacement = Math.max(...results.map(r => r.maxDisplacement));
    const maxDisplacementStory = results.find(r => r.maxDisplacement === maxDisplacement);
    
    const minAllowable = Math.min(...results.map(r => r.allowable));
    const maxAllowable = Math.max(...results.map(r => r.allowable));
    
    const overallCompliance = failCount === 0;
    const failedStories = results.filter(r => r.status === 'FAIL');
    
    let summaryHTML = `
        <div class="summary-header">
            <h3><i class="fas fa-chart-bar"></i> Lateral Displacement Analysis Summary</h3>
            <div class="overall-status ${overallCompliance ? 'pass' : 'fail'}">
                <i class="fas fa-${overallCompliance ? 'check-circle' : 'exclamation-triangle'}"></i>
                ${overallCompliance ? 'ALL STORIES COMPLIANT' : 'COMPLIANCE ISSUES FOUND'}
            </div>
        </div>
        
        <div class="summary-stats">
            <div class="stat-item">
                <div class="stat-value">${totalStories}</div>
                <div class="stat-label">Total Stories</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${passCount}</div>
                <div class="stat-label">Compliant</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${failCount}</div>
                <div class="stat-label">Non-Compliant</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${maxDisplacement.toFixed(3)}"</div>
                <div class="stat-label">Max Displacement</div>
            </div>
        </div>
        
        <div class="summary-details">
            <div class="detail-item"><strong>Maximum Displacement:</strong> ${maxDisplacement.toFixed(3)}" at ${maxDisplacementStory ? maxDisplacementStory.story : 'N/A'}</div>
            <div class="detail-item"><strong>Allowable Range:</strong> ${minAllowable.toFixed(2)} - ${maxAllowable.toFixed(2)} in</div>
            <div class="detail-item"><strong>Compliance Rate:</strong> ${((passCount / totalStories) * 100).toFixed(1)}%</div>
        </div>
    `;
    
    if (failedStories.length > 0) {
        summaryHTML += `
            <div class="failed-stories">
                <h4><i class="fas fa-exclamation-triangle"></i> Non-Compliant Stories</h4>
                <ul>
                    ${failedStories.map(story => 
                        `<li>${story.story}: ${story.maxDisplacement.toFixed(3)}" (Allowable: ${story.allowable.toFixed(2)}")</li>`
                    ).join('')}
                </ul>
            </div>
        `;
    }
    
    summaryDiv.innerHTML = summaryHTML;
}

function createDisplacementChartEQ(results) {
    const canvas = document.getElementById('displacementChartEQ');
    const ctx = canvas.getContext('2d');
    
    // Set high-resolution canvas for better quality
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual canvas size in memory (scaled up for high DPI)
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    
    // Scale the canvas back down using CSS
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Scale the drawing context so everything draws at the correct size
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Enable maximum quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.textRenderingOptimization = 'optimizeQuality';
    
    // Destroy existing chart if it exists
    if (window.eqDisplacementChart) {
        window.eqDisplacementChart.destroy();
    }
    
    // Sort data by elevation for proper chart display
    const sortedResults = [...results].sort((a, b) => a.elevation - b.elevation);
    
    const elevations = sortedResults.map(r => r.elevation);
    const xDisplacements = sortedResults.map(r => Math.abs(r.amplifiedXDir));
    const yDisplacements = sortedResults.map(r => Math.abs(r.amplifiedYDir));
    const allowableValues = sortedResults.map(r => r.allowable);
    
    window.eqDisplacementChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Ex (2020)',
                    data: xDisplacements.map((x, i) => ({ x: x, y: elevations[i] })),
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(54, 162, 235)'
                },
                {
                    label: 'Ey (2020)',
                    data: yDisplacements.map((y, i) => ({ x: y, y: elevations[i] })),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(255, 99, 132)'
                },
                {
                    label: 'Allowable',
                    data: allowableValues.map((a, i) => ({ x: a, y: elevations[i] })),
                    borderColor: 'rgb(128, 128, 128)',
                    backgroundColor: 'rgba(128, 128, 128, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(128, 128, 128)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'SEISMIC TOTAL DISPLACEMENT',
                    font: {
                        size: 18,
                        weight: 'bold',
                        family: 'Arial, Helvetica, sans-serif'
                    },
                    padding: {
                        top: 10,
                        bottom: 15
                    },
                    color: '#111827'
                },
                legend: {
                    display: true,
                    position: 'top',
                    align: 'center',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line',
                        boxWidth: 60,
                        padding: 15,
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 10,
                    cornerRadius: 6,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.x.toFixed(3) + ' in at ' + context.parsed.y.toFixed(1) + ' ft';
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Displacement (in)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#374151'
                    },
                    grid: {
                        color: '#e5e7eb',
                        lineWidth: 1.5
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        padding: 8,
                        callback: function(value) {
                            return value.toFixed(3);
                        }
                    },
                    beginAtZero: true
                },
                y: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Elevation (ft)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#374151'
                    },
                    grid: {
                        color: '#e5e7eb',
                        lineWidth: 1.5
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        padding: 8
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function generatePDFEQ() {
    if (typeof window.jspdf === 'undefined') {
        alert('PDF library not loaded. Please refresh the page and try again.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const results = window.eqAnalysisResults;
    
    // Add title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Lateral Displacement Analysis (Earthquake)', 105, 30, { align: 'center' });
    
    let yPos = 50;
    
    // Get chart canvas and add to PDF with border (ultra high resolution)
    const chartCanvas = document.getElementById('displacementChartEQ');
    if (chartCanvas) {
        // Create an optimized version of the chart for smaller file size
        const tempCanvas = document.createElement('canvas');
        const scaleFactor = 3; // Reduced scale factor for smaller file size
        
        // Set canvas size with moderate resolution
        tempCanvas.width = chartCanvas.width * scaleFactor;
        tempCanvas.height = chartCanvas.height * scaleFactor;
        
        const tempCtx = tempCanvas.getContext('2d');
        
        // Enable good quality rendering with optimization
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'medium';
        
        // Clear the canvas with white background
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Scale the context for rendering
        tempCtx.scale(scaleFactor, scaleFactor);
        
        // Draw the original chart
        tempCtx.drawImage(chartCanvas, 0, 0);
        
        // Get image data with optimized quality (JPEG format for smaller size)
        const chartImgData = tempCanvas.toDataURL('image/jpeg', 0.85);
        
        // Add the optimized image to PDF with precise positioning
        doc.addImage(chartImgData, 'JPEG', 20, yPos, 170, 85);
        
        // Add border around chart with fine line width
        doc.setLineWidth(0.2);
        doc.rect(20, yPos, 170, 85);
        yPos += 95;
    }
    
    // Calculate maximum displacement and allowable limits
    const maxDisplacement = Math.max(...results.map(r => r.maxDisplacement));
    const maxDisplacementEntry = results.find(r => r.maxDisplacement === maxDisplacement);
    const allowableDisplacement = maxDisplacementEntry ? maxDisplacementEntry.allowable : 0;
    
    // Calculate Allowable Displacement (H/400 for earthquake)
    const maxElevation = Math.max(...results.map(r => r.elevation));
    const calculatedAllowable = (maxElevation * 12) / 400; // Convert to inches
    
    // Add summary information
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Analysis Summary:', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    const summaryLines = [
        `Maximum Displacement: ${maxDisplacement.toFixed(3)} in`,
        `Critical Story: ${maxDisplacementEntry ? maxDisplacementEntry.story : 'N/A'}`,
        `Allowable Displacement: ${allowableDisplacement.toFixed(2)} in (H/400)`,
        `Building Height: ${maxElevation} ft`,
        `Calculation: Allowable = ${maxElevation} × 12 ÷ 400 = ${calculatedAllowable.toFixed(2)} in`,
        `Overall Status: ${maxDisplacement <= allowableDisplacement ? 'PASS' : 'FAIL'}`
    ];
    
    summaryLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 8;
    });
    
    yPos += 10;
    
    // Add input parameters section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Input Parameters:', 20, yPos);
    yPos += 12;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Get input values from the form
    const cdValue = document.getElementById('cdValueEQ')?.value || 'N/A';
    const iValue = document.getElementById('iValueEQ')?.value || 'N/A';
    
    const inputParams = [
        `Deflection Amplification Factor (Cd): ${cdValue}`,
        `Importance Factor (I): ${iValue}`,
        `Allowable Drift Limit: H/400 (Earthquake)`
    ];
    
    inputParams.forEach(param => {
        doc.text(param, 20, yPos);
        yPos += 7;
    });
    
    yPos += 10;
    
    // Add detailed results table with enhanced formatting
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Detailed Analysis Results:', 20, yPos);
    yPos += 15;
    
    // Simplified table for smaller file size
     const tableStartY = yPos;
     const rowHeight = 7;
     
     // Simple table headers
     doc.setFontSize(9);
     doc.setFont(undefined, 'bold');
     const headers = ['Story', 'Elevation', 'Location', 'X-Dir', 'Ampl X', 'Y-Dir', 'Ampl Y', 'Max Disp', 'Allowable', 'Status'];
     const colWidths = [15, 18, 18, 15, 15, 15, 15, 18, 18, 13];
     let xPos = 20;
     
     headers.forEach((header, index) => {
         doc.text(header, xPos, yPos);
         xPos += colWidths[index];
     });
     
     yPos += rowHeight;
     
     // Simple underline for headers
     doc.setDrawColor(0, 0, 0);
     doc.setLineWidth(0.3);
     doc.line(20, yPos - 2, 190, yPos - 2);
    
    // Simplified table data
     doc.setFont(undefined, 'normal');
     doc.setFontSize(8);
     
     results.forEach((result, index) => {
         if (yPos > 270) { // Start new page if needed
             doc.addPage();
             yPos = 30;
         }
         
         xPos = 20;
         const rowData = [
             result.story || 'N/A',
             result.elevation.toFixed(1),
             result.location || 'N/A',
             result.xDir.toFixed(3),
             result.amplifiedXDir.toFixed(3),
             result.yDir.toFixed(3),
             result.amplifiedYDir.toFixed(3),
             result.maxDisplacement.toFixed(3),
             result.allowable.toFixed(3),
             result.status
         ];
         
         rowData.forEach((data, colIndex) => {
             // Simple color coding for status only
             if (colIndex === rowData.length - 1) {
                 if (result.status === 'FAIL') {
                     doc.setTextColor(200, 0, 0); // Darker red for FAIL
                 } else {
                     doc.setTextColor(0, 100, 0); // Darker green for PASS
                 }
             } else {
                 doc.setTextColor(0, 0, 0); // Black text for other columns
             }
             
             doc.text(data.toString(), xPos, yPos);
             xPos += colWidths[colIndex];
         });
         
         doc.setTextColor(0, 0, 0); // Reset text color
         yPos += rowHeight;
     });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`, 20, 285);
        doc.text('StrucVision - Earthquake Displacement Analysis', 105, 285, { align: 'center' });
    }
    
    // Download the PDF
    const filename = `earthquake-displacement-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}

// Initialize EQ table when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize EQ displacement table with default rows
    setTimeout(() => {
        if (document.getElementById('dataTableBodyEQ')) {
            adjustTableRowsEQ(11);
            
            // Setup paste listeners for EQ table
            const eqTableBody = document.getElementById('dataTableBodyEQ');
            if (eqTableBody) {
                const rows = eqTableBody.querySelectorAll('tr');
                rows.forEach((row, index) => {
                    setupRowEventListenersEQ(row, index);
                });
            }
            
            // Add event listener for importance factor changes
            const iValueInput = document.getElementById('iValueEQ');
            if (iValueInput) {
                iValueInput.addEventListener('input', function() {
                    updateAllAllowableValuesEQ();
                    updateAllAmplifiedValuesEQ();
                });
            }
        }
    }, 100);
});