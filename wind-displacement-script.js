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
});