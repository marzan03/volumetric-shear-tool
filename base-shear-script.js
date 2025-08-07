// Highlight active menu item
const currentPage = window.location.pathname.split('/').pop();
const menuLinks = document.querySelectorAll('.dropdown-content a');
menuLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// Mobile dropdown menu functionality
const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(dropdown => {
    const dropdownToggle = dropdown.querySelector('a');
    const dropdownContent = dropdown.querySelector('.dropdown-content');
    
    dropdownToggle.addEventListener('click', function(e) {
        // Only prevent default for the main dropdown toggle, not the content links
        if (e.target === this) {
            e.preventDefault();
            dropdown.classList.toggle('active');
        }
    });
});

// Calculate button event listener
document.getElementById('calculate').addEventListener('click', performCalculations);

// Function to get zone coefficient from selected town
function getZoneCoefficient(townName) {
    const zoneSelect = document.getElementById('seismicZone');
    const selectedOption = zoneSelect.querySelector(`option[value="${townName}"]`);
    return selectedOption ? parseFloat(selectedOption.getAttribute('data-z')) : 0.20;
}

// Function to calculate seismic parameters from zone coefficient
function getSeismicParameters(zoneCoefficient) {
    // Convert zone coefficient to Ss and S1 based on BNBC 2020
    const Ss = zoneCoefficient * 2.5; // Approximate conversion
    const S1 = zoneCoefficient * 1.0; // Approximate conversion
    return { Ss, S1 };
}

// Add event listener for zone selection
document.addEventListener('DOMContentLoaded', function() {
    const seismicZoneSelect = document.getElementById('seismicZone');
    
    // Bangladesh towns with their seismic zone coefficients
    const bangladeshTowns = [
        { name: 'Dhaka', zone: 2, z: 0.20 },
        { name: 'Chittagong', zone: 3, z: 0.28 },
        { name: 'Sylhet', zone: 3, z: 0.28 },
        { name: 'Rangpur', zone: 2, z: 0.20 },
        { name: 'Rajshahi', zone: 2, z: 0.20 },
        { name: 'Khulna', zone: 2, z: 0.20 },
        { name: 'Barisal', zone: 2, z: 0.20 },
        { name: 'Mymensingh', zone: 2, z: 0.20 },
        { name: 'Comilla', zone: 2, z: 0.20 },
        { name: 'Cox\'s Bazar', zone: 3, z: 0.28 },
        { name: 'Teknaf', zone: 3, z: 0.28 }
    ];
    
    // Populate the seismic zone dropdown
    bangladeshTowns.forEach(town => {
        const option = document.createElement('option');
        option.value = town.name;
        option.textContent = `${town.name} (Zone ${town.zone})`;
        option.setAttribute('data-z', town.z);
        seismicZoneSelect.appendChild(option);
    });
    
    // Handle lateral force category change
    const lateralForceCategorySelect = document.getElementById('lateralForceCategory');
    const lateralForceSystemSelect = document.getElementById('lateralForceSystem');
    
    lateralForceCategorySelect.addEventListener('change', function() {
        const selectedCategory = this.value;
        const systemData = getLateralForceSystemData();
        
        // Clear and reset the system dropdown
        lateralForceSystemSelect.innerHTML = '';
        
        if (selectedCategory && systemData[selectedCategory]) {
            lateralForceSystemSelect.disabled = false;
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select System Type';
            lateralForceSystemSelect.appendChild(defaultOption);
            
            // Add system options
            const systems = systemData[selectedCategory].systems;
            Object.keys(systems).forEach(systemKey => {
                const option = document.createElement('option');
                option.value = systemKey;
                option.textContent = systems[systemKey].name;
                lateralForceSystemSelect.appendChild(option);
            });
        } else {
            lateralForceSystemSelect.disabled = true;
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select Category First';
            lateralForceSystemSelect.appendChild(defaultOption);
        }
    });
    
    seismicZoneSelect.addEventListener('change', function() {
        if (this.value) {
            // Get zone coefficient for calculations
            const zoneCoeff = getZoneCoefficient(this.value);
            
            // Automatically trigger calculation when zone is selected
            const calculateBtn = document.getElementById('calculate-btn');
            if (calculateBtn) {
                // Add a small delay to ensure the value is set
                setTimeout(() => {
                    if (document.getElementById('seismicWeight').value && 
                        document.getElementById('buildingHeight').value) {
                        performCalculations();
                    }
                }, 100);
            }
        }
    });
    
    // Initialize the lateral force system dropdown on page load
    // since 'moment_frame' is selected by default
    if (lateralForceCategorySelect.value === 'moment_frame') {
        // Trigger the change event to populate the system dropdown
        lateralForceCategorySelect.dispatchEvent(new Event('change'));
    }
});

// BNBC Table 6.2.19 - Lateral Force Resisting Systems Data
function getLateralForceSystemData() {
    return {
        'bearing_wall': {
            name: 'A. BEARING WALL SYSTEMS (no frame)',
            systems: {
                'special_reinforced_concrete': { name: '1. Special reinforced concrete shear walls', R: 5, omega: 2.5, Cd: 5, heightLimit: { B: 'NL', C: 'NL', D: 50 } },
                'ordinary_reinforced_concrete': { name: '2. Ordinary reinforced concrete shear walls', R: 4, omega: 2.5, Cd: 4, heightLimit: { B: 'NL', C: 'NL', D: 'NP' } },
                'ordinary_reinforced_masonry': { name: '3. Ordinary reinforced masonry shear walls', R: 2, omega: 2.5, Cd: 1.75, heightLimit: { B: 'NL', C: 50, D: 'NP' } },
                'ordinary_plain_masonry': { name: '4. Ordinary plain masonry shear walls', R: 1.5, omega: 2.5, Cd: 1.25, heightLimit: { B: 18, C: 'NP', D: 'NP' } }
            }
        },
        'building_frame': {
            name: 'B. BUILDING FRAME SYSTEMS (with bracing or shear wall)',
            systems: {
                'steel_eccentrically_braced': { name: '1. Steel eccentrically braced frames, moment resisting connections at columns away from links', R: 8, omega: 2, Cd: 4, heightLimit: { B: 'NL', C: 'NL', D: 50 } },
                'steel_eccentrically_braced_non_moment': { name: '2. Steel eccentrically braced frames, non-moment-resisting, connections at columns away from links', R: 7, omega: 2, Cd: 4, heightLimit: { B: 'NL', C: 'NL', D: 50 } },
                'special_steel_concentrically': { name: '3. Special steel concentrically braced frames', R: 6, omega: 2, Cd: 5, heightLimit: { B: 'NL', C: 'NL', D: 50 } },
                'ordinary_steel_concentrically': { name: '4. Ordinary steel concentrically braced frames', R: 3.25, omega: 2, Cd: 3.25, heightLimit: { B: 'NL', C: 'NL', D: 11 } },
                'special_reinforced_concrete_shear': { name: '5. Special reinforced concrete shear walls', R: 6, omega: 2.5, Cd: 5, heightLimit: { B: 'NL', C: 'NL', D: 50 } },
                'ordinary_reinforced_concrete_shear': { name: '6. Ordinary reinforced concrete shear walls', R: 5, omega: 2.5, Cd: 4.25, heightLimit: { B: 'NL', C: 'NL', D: 'NP' } },
                'ordinary_reinforced_masonry_shear': { name: '7. Ordinary reinforced masonry shear walls', R: 2, omega: 2.5, Cd: 2, heightLimit: { B: 'NL', C: 50, D: 'NP' } },
                'ordinary_plain_masonry_shear': { name: '8. Ordinary plain masonry shear walls', R: 1.5, omega: 2.5, Cd: 1.25, heightLimit: { B: 18, C: 'NP', D: 'NP' } }
            }
        },
        'moment_frame': {
            name: 'C. MOMENT RESISTING FRAME SYSTEMS (no shear wall)',
            systems: {
                'special_steel_moment': { name: '1. Special steel moment frames', R: 8, omega: 3, Cd: 5.5, heightLimit: { B: 'NL', C: 'NL', D: 'NL' } },
                'intermediate_steel_moment': { name: '2. Intermediate steel moment frames', R: 4.5, omega: 3, Cd: 4, heightLimit: { B: 'NL', C: 'NL', D: 35 } },
                'ordinary_steel_moment': { name: '3. Ordinary steel moment frames', R: 3.5, omega: 3, Cd: 3, heightLimit: { B: 'NL', C: 'NL', D: 'NP' } },
                'special_reinforced_concrete_moment': { name: '4. Special reinforced concrete moment frames', R: 8, omega: 3, Cd: 5.5, heightLimit: { B: 'NL', C: 'NL', D: 'NL' } },
                'intermediate_reinforced_concrete_moment': { name: '5. Intermediate reinforced concrete moment frames', R: 5, omega: 3, Cd: 4.5, heightLimit: { B: 'NL', C: 'NL', D: 'NP' } },
                'ordinary_reinforced_concrete_moment': { name: '6. Ordinary reinforced concrete moment frames', R: 3, omega: 3, Cd: 2.5, heightLimit: { B: 'NL', C: 'NP', D: 'NP' } }
            }
        },
        'dual_systems': {
            name: 'D. DUAL SYSTEMS: SPECIAL MOMENT FRAMES CAPABLE OF RESISTING AT LEAST 25% OF PRESCRIBED SEISMIC FORCES (with bracing or shear wall)',
            systems: {
                'steel_eccentrically_braced_special': { name: '1. Steel eccentrically braced frames', R: 8, omega: 2.5, Cd: 4, heightLimit: { B: 'NL', C: 'NL', D: 'NL' } },
                'special_steel_concentrically_braced': { name: '2. Special steel concentrically braced frames', R: 7, omega: 2.5, Cd: 5.5, heightLimit: { B: 'NL', C: 'NL', D: 'NL' } },
                'special_reinforced_concrete_shear_dual': { name: '3. Special reinforced concrete shear walls', R: 7, omega: 2.5, Cd: 5.5, heightLimit: { B: 'NL', C: 'NL', D: 'NL' } },
                'ordinary_reinforced_concrete_shear_dual': { name: '4. Ordinary reinforced concrete shear walls', R: 6, omega: 2.5, Cd: 5, heightLimit: { B: 'NL', C: 'NL', D: 'NP' } }
            }
        },
        'dual_intermediate': {
            name: 'E. DUAL SYSTEMS: INTERMEDIATE MOMENT FRAMES CAPABLE OF RESISTING AT LEAST 25% OF PRESCRIBED SEISMIC FORCES (with bracing or shear wall)',
            systems: {
                'steel_concentrically_braced_intermediate': { name: '1. Steel concentrically braced frames', R: 6, omega: 2.5, Cd: 5, heightLimit: { B: 'NL', C: 'NL', D: 35 } },
                'special_reinforced_concrete_shear_intermediate': { name: '2. Special reinforced concrete shear walls', R: 6.5, omega: 2.5, Cd: 5, heightLimit: { B: 'NL', C: 'NL', D: 50 } },
                'ordinary_reinforced_masonry_shear_intermediate': { name: '3. Ordinary reinforced masonry shear walls', R: 3, omega: 3, Cd: 3, heightLimit: { B: 'NL', C: 50, D: 'NP' } }
            }
        }
    };
}

// Helper functions for deriving factors from input parameters
function getImportanceFactor(occupancyCategory) {
    switch(occupancyCategory) {
        case 'I': return 1.0;
        case 'II': return 1.0;
        case 'III': return 1.25;
        case 'IV': return 1.5;
        default: return 1.0;
    }
}

function getResponseModificationFactor(lateralForceCategory, lateralForceSystem) {
    const systemData = getLateralForceSystemData();
    
    if (lateralForceCategory && lateralForceSystem && 
        systemData[lateralForceCategory] && 
        systemData[lateralForceCategory].systems[lateralForceSystem]) {
        return systemData[lateralForceCategory].systems[lateralForceSystem].R;
    }
    
    return 5; // Default value
}

function getDeflectionAmplificationFactor(lateralForceCategory, lateralForceSystem) {
    const systemData = getLateralForceSystemData();
    
    if (lateralForceCategory && lateralForceSystem && 
        systemData[lateralForceCategory] && 
        systemData[lateralForceCategory].systems[lateralForceSystem]) {
        return systemData[lateralForceCategory].systems[lateralForceSystem].Cd;
    }
    
    return 4.5; // Default value
}

function getSiteCoefficients(siteClass) {
    const siteCoefficients = {
        'SB': { Fa: 1.0, Fv: 1.0 },
        'SC': { Fa: 1.2, Fv: 1.8 },
        'SD': { Fa: 1.6, Fv: 2.4 }
    };
    return siteCoefficients[siteClass] || siteCoefficients['SC'];
}

function getSoilFactor(siteClass) {
    const soilFactors = {
        'SB': 1.15,
        'SC': 1.15,
        'SD': 1.35
    };
    return soilFactors[siteClass] || 1.15;
}

function getResponseSpectrumPeriods(siteClass) {
    const periods = {
        'SB': { TB: 0.15, TC: 0.5, TD: 2.0 },
        'SC': { TB: 0.2, TC: 0.6, TD: 2.0 },
        'SD': { TB: 0.2, TC: 0.8, TD: 2.0 }
    };
    return periods[siteClass] || periods['SC'];
}

function getHeightLimit(lateralForceCategory, lateralForceSystem, seismicDesignCategory) {
    const systemData = getLateralForceSystemData();
    
    if (lateralForceCategory && lateralForceSystem && seismicDesignCategory &&
        systemData[lateralForceCategory] && 
        systemData[lateralForceCategory].systems[lateralForceSystem]) {
        const heightLimits = systemData[lateralForceCategory].systems[lateralForceSystem].heightLimit;
        return heightLimits[seismicDesignCategory] || 'NP';
    }
    
    return 48; // Default value
}

function getOverstrengthFactor(lateralForceCategory, lateralForceSystem) {
    const systemData = getLateralForceSystemData();
    
    if (lateralForceCategory && lateralForceSystem && 
        systemData[lateralForceCategory] && 
        systemData[lateralForceCategory].systems[lateralForceSystem]) {
        return systemData[lateralForceCategory].systems[lateralForceSystem].omega;
    }
    
    return 2.5; // Default value
}

function getBuildingPeriodCoefficients(structureType) {
    const coefficients = {
        'concrete_moment': { Ct: 0.0466, m: 0.9 },
        'steel_moment': { Ct: 0.0724, m: 0.8 },
        'eccentrically_braced': { Ct: 0.0731, m: 0.75 },
        'all_other': { Ct: 0.0488, m: 0.75 }
    };
    return coefficients[structureType] || coefficients['concrete_moment'];
}

function getSeismicDesignCategory(zoneCoefficient, occupancyCategory, siteClass) {
    // Determine zone number based on coefficient
    let zone;
    if (zoneCoefficient <= 0.12) zone = 1;
    else if (zoneCoefficient <= 0.20) zone = 2;
    else if (zoneCoefficient <= 0.28) zone = 3;
    else zone = 4;
    
    // SDC mapping based on table provided
    const sdcTable = {
        'SB': {
            'I': { 1: 'B', 2: 'C', 3: 'D', 4: 'D' },
            'II': { 1: 'B', 2: 'C', 3: 'D', 4: 'D' },
            'III': { 1: 'B', 2: 'C', 3: 'D', 4: 'D' },
            'IV': { 1: 'C', 2: 'D', 3: 'D', 4: 'D' }
        },
        'SC': {
            'I': { 1: 'B', 2: 'C', 3: 'D', 4: 'D' },
            'II': { 1: 'B', 2: 'C', 3: 'D', 4: 'D' },
            'III': { 1: 'B', 2: 'C', 3: 'D', 4: 'D' },
            'IV': { 1: 'C', 2: 'D', 3: 'D', 4: 'D' }
        },
        'SD': {
            'I': { 1: 'C', 2: 'D', 3: 'D', 4: 'D' },
            'II': { 1: 'C', 2: 'D', 3: 'D', 4: 'D' },
            'III': { 1: 'C', 2: 'D', 3: 'D', 4: 'D' },
            'IV': { 1: 'D', 2: 'D', 3: 'D', 4: 'D' }
        }
    };
    
    return sdcTable[siteClass]?.[occupancyCategory]?.[zone] || 'D';
}

function performCalculations() {
    try {
        // Get input values
        const buildingId = document.getElementById('buildingId').value;
        const siteClass = document.getElementById('siteClass').value;
        const seismicZone = parseInt(document.getElementById('seismicZone').value);
        const occupancyCategory = document.getElementById('occupancyCategory').value;
        const lateralForceCategory = document.getElementById('lateralForceCategory').value;
        const lateralForceSystem = document.getElementById('lateralForceSystem').value;
        const structureType = document.getElementById('structureType').value;
        const buildingHeight = parseFloat(document.getElementById('buildingHeight').value);
        const seismicWeight = parseFloat(document.getElementById('seismicWeight').value);
        // Validate inputs
        if (isNaN(seismicWeight) || isNaN(buildingHeight)) {
            alert('Please enter valid numerical values for all parameters.');
            return;
        }
        
        if (!lateralForceCategory || !lateralForceSystem) {
            alert('Please select both Seismic Force–Resisting System Category and System Type.');
            return;
        }

        // Calculate approximate period using building period coefficients
        const { Ct, m } = getBuildingPeriodCoefficients(structureType);
        const approximatePeriod = Ct * Math.pow(buildingHeight, m);

        // Derive importance factor from occupancy category
        const importanceFactor = getImportanceFactor(occupancyCategory);
        
        // Derive response modification factor from lateral force system
        const responseModification = getResponseModificationFactor(lateralForceCategory, lateralForceSystem);
        
        // Derive deflection amplification factor
        const deflectionAmplification = getDeflectionAmplificationFactor(lateralForceCategory, lateralForceSystem);

        // Get seismic parameters based on selected town
        const selectedTown = document.getElementById('seismicZone').value;
        const zoneCoefficient = getZoneCoefficient(selectedTown);
        const seismicData = getSeismicParameters(zoneCoefficient);

        const Ss = seismicData.Ss;
        const S1 = seismicData.S1;

        // Get site coefficients based on site class
        const siteCoeff = getSiteCoefficients(siteClass);
        const Fa = siteCoeff.Fa;
        const Fv = siteCoeff.Fv;

        // Calculate SMS and SM1
        const SMS = Fa * Ss;
        const SM1 = Fv * S1;

        // Calculate SDS and SD1
        const SDS = (2/3) * SMS;
        const SD1 = (2/3) * SM1;

        // Get response spectrum periods for BNBC calculation
        const soilFactor = getSoilFactor(siteClass);
        const { TB, TC, TD } = getResponseSpectrumPeriods(siteClass);
        
        // Calculate seismic response coefficient Cs using BNBC equations 6.2.35a-d
        let Cs;
        const T = approximatePeriod;
        const S = soilFactor; // Soil factor from site class
        const eta = 1.0; // Damping correction factor (typically 1.0 for 5% damping)
        const R_over_I = responseModification / importanceFactor;

        if (T >= 0 && T <= TB) {
            // Equation 6.2.35a: Cs = S[1 + T/TB(2.5η - 1)]
            Cs = S * (1 + (T / TB) * (2.5 * eta - 1));
        } else if (T >= TB && T <= TC) {
            // Equation 6.2.35b: Cs = 2.5Sη
            Cs = 2.5 * S * eta;
        } else if (T >= TC && T <= TD) {
            // Equation 6.2.35c: Cs = 2.5Sη(TC/T)
            Cs = 2.5 * S * eta * (TC / T);
        } else {
            // Equation 6.2.35d: Cs = 2.5Sη(TCTD/T²) for T >= TD ≤ 4 sec
            const T_limited = Math.min(T, 4.0); // Limit T to 4 seconds as per BNBC
            Cs = 2.5 * S * eta * (TC * TD) / (Math.pow(T_limited, 2));
        }

        // Apply BNBC limits to Cs
        // Maximum Cs is typically the value at TB ≤ T ≤ TC: Cs = 2.5Sη
        const CsMax = 2.5 * S * eta;
        
        // Minimum Cs based on BNBC requirements
        const CsMin = Math.max(0.044 * SDS * importanceFactor, 0.01);
        
        // For seismic zone 3, additional minimum
        let CsMinFinal = CsMin;
        if (seismicZone === 3 && S1 >= 0.75) {
            CsMinFinal = Math.max(CsMin, 0.5 * S1);
        }

        // Apply limits to Cs
        Cs = Math.min(Cs, CsMax);
        Cs = Math.max(Cs, CsMinFinal);

        // Calculate Design Spectra Acceleration: Sa = 2/3*(Z*I/R)*Cs
        const designSpectraAcceleration = (2/3) * (zoneCoefficient * importanceFactor / responseModification) * Cs;

        // Calculate base shear: V = Sa * W
        const baseShear = designSpectraAcceleration * seismicWeight;

        // Calculate additional parameters
        const overstrengthFactor = getOverstrengthFactor(lateralForceCategory, lateralForceSystem);
        
        // Calculate Seismic Design Category
        const seismicDesignCategory = getSeismicDesignCategory(zoneCoefficient, occupancyCategory, siteClass);
        
        // Calculate height limit based on seismic design category
        const heightLimit = getHeightLimit(lateralForceCategory, lateralForceSystem, seismicDesignCategory);
        
        // Update results table
        document.getElementById('importance-factor-result').textContent = importanceFactor.toFixed(2);
        document.getElementById('seismic-design-category-result').textContent = seismicDesignCategory;
        document.getElementById('soil-factor-result').textContent = S.toFixed(2);
        document.getElementById('tb-result').textContent = TB.toFixed(3);
        document.getElementById('tc-result').textContent = TC.toFixed(3);
        document.getElementById('td-result').textContent = TD.toFixed(1);
        // Format height limit display
        let heightLimitDisplay;
        if (heightLimit === 'NL') {
            heightLimitDisplay = 'No Limit';
        } else if (heightLimit === 'NP') {
            heightLimitDisplay = 'Not Permitted';
        } else {
            heightLimitDisplay = heightLimit + ' m';
        }
        document.getElementById('height-limit-result').textContent = heightLimitDisplay;
        document.getElementById('response-reduction-result').textContent = responseModification.toFixed(1);
        document.getElementById('overstrength-result').textContent = overstrengthFactor.toFixed(1);
        document.getElementById('deflection-amplification-result').textContent = deflectionAmplification.toFixed(1);
        document.getElementById('ct-result').textContent = Ct.toFixed(4);
        document.getElementById('m-result').textContent = m.toFixed(2);
        document.getElementById('time-period-result').textContent = approximatePeriod.toFixed(3);
        document.getElementById('cs-result').textContent = Cs.toFixed(4);
        document.getElementById('sa-result').textContent = designSpectraAcceleration.toFixed(4);
        document.getElementById('base-shear-result').textContent = baseShear.toFixed(1);

        // Store calculation data for report generation
        window.calculationData = {
            inputs: {
                buildingId,
                siteClass,
                seismicZone: selectedTown,
                zoneCoefficient,
                occupancyCategory,
                seismicDesignCategory,
                lateralForceCategory,
                lateralForceSystem,
                structureType,
                buildingHeight,
                seismicWeight,
                fundamentalPeriod: approximatePeriod,
                importanceFactor,
                responseModification,
                deflectionAmplification,
                soilFactor: S,
                TB,
                TC,
                TD,
                heightLimit,
                overstrengthFactor,
                Ct,
                m,
                approximatePeriod,
                eta
            },
            intermediateValues: {
                Ss, S1, Fa, Fv, SMS, SM1, SDS, SD1, CsMax, CsMinFinal, R_over_I
            },
            results: {
                Cs,
                designSpectraAcceleration,
                baseShear
            }
        };

        console.log('Base Shear Calculation completed successfully');
        console.log('Base Shear:', baseShear.toFixed(1), 'kN');

    } catch (error) {
        console.error('Error in calculations:', error);
        alert('An error occurred during calculations. Please check your inputs.');
    }
}

// Generate Report functionality
document.getElementById('generateReportBtn').addEventListener('click', function() {
    if (!window.calculationData) {
        alert('Please perform calculations first.');
        return;
    }

    // Generate PDF and show preview
    generatePDFPreview();
    document.getElementById('pdfPreviewContainer').style.display = 'block';
    document.getElementById('downloadBtn').style.display = 'inline-block';
});




// PDF Download functionality
document.getElementById('downloadBtn').addEventListener('click', function() {
    if (!window.calculationData) {
        alert('Please perform calculations first.');
        return;
    }
    
    // Use stored PDF if available, otherwise generate new one
    if (window.generatedPDF) {
        const fileName = `Base_Shear_Report_${window.calculationData.inputs.buildingId.replace(/\s+/g, '_') || 'Report'}.pdf`;
        window.generatedPDF.save(fileName);
    } else {
        generatePDF();
    }
});

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = window.calculationData;
    
    // Generate PDF content
    generatePDFContent(doc, data);
    
    // Download the PDF
    const fileName = `Base_Shear_Report_${data.inputs.buildingId.replace(/\s+/g, '_') || 'Report'}.pdf`;
    doc.save(fileName);
}

// Function to generate PDF content (shared by preview and download)
function generatePDFContent(doc, data) {
    // Title
    doc.setFontSize(18);
    doc.setFont('Times New Roman', 'bold');
    doc.text('Calculation of Earthquake base shear parameters', 105, 20, { align: 'center' });
    
    let yPos = 40;
    
    // Step 1: Soil site class
    doc.setFontSize(12);
    doc.setFont('Times New Roman', 'bold');
    doc.text('1. Soil site class (BNBC 2020, Table: 6.2.13)', 20, yPos);
    doc.setFont('Times New Roman', 'normal');
    yPos += 10;
    doc.text('Site Class according to T6.2.13 = ' + data.inputs.siteClass, 20, yPos);
    yPos += 20;
    
    // Step 2: Seismic Zone Coefficient
     doc.setFont('Times New Roman', 'bold');
     doc.text('2. Seismic Zone Coefficient, Z', 20, yPos);
     doc.setFont('Times New Roman', 'normal');
     yPos += 10;
     doc.text('According to BNBC 2020, T6.2.14, Z = ' + parseFloat(data.inputs.zoneCoefficient).toFixed(2), 20, yPos);
     yPos += 20;
    
    // Step 3: Importance Factor
    doc.setFont('Times New Roman', 'bold');
    doc.text('3. Importance Factor, I', 20, yPos);
    doc.setFont('Times New Roman', 'normal');
    yPos += 10;
    doc.text('Occupancy Category (T6.1.1) for ' + data.inputs.occupancyCategory + ' Building = II; I = 1.0 (T6.2.17)', 20, yPos);
    yPos += 20;
    
    // Step 4: Seismic Design Category
     doc.setFont('Times New Roman', 'bold');
     doc.text('4. Determination of Seismic Design Category (SDC)', 20, yPos);
     doc.setFont('Times New Roman', 'normal');
     yPos += 10;
     doc.text('According to BNBC 2020, T6.2.18, SDC = ' + data.inputs.seismicDesignCategory, 20, yPos);
     yPos += 20;
    
    // Step 5: Response Reduction Factor
     doc.setFont('Times New Roman', 'bold');
     doc.text('5. Determination of Response Reduction Factor, R', 20, yPos);
     doc.setFont('Times New Roman', 'normal');
     yPos += 10;
     doc.text('According to BNBC 2020, T6.2.19, R = ' + parseFloat(data.inputs.responseModification).toFixed(2) + ' (' + data.inputs.lateralForceSystem + ')', 20, yPos);
     yPos += 20;
    
    // Step 6: Soil Factor and related parameters
     doc.setFont('Times New Roman', 'bold');
     doc.text('6. Soil Factor (S) and other related parameters (Tb, Tc, Td)', 20, yPos);
     doc.setFont('Times New Roman', 'normal');
     yPos += 10;
     const soilFactor = getSoilFactor(data.inputs.siteClass);
     // Use the actual values from stored data instead of recalculating
     doc.text('According to BNBC 2020, T6.2.16, S = ' + parseFloat(soilFactor).toFixed(2) + ', Tb= ' + parseFloat(data.inputs.TB).toFixed(3) + ', Tc= ' + parseFloat(data.inputs.TC).toFixed(3) + ', Td= ' + parseFloat(data.inputs.TD).toFixed(1), 20, yPos);
     yPos += 20;
    
    // Step 7: Building Period
     doc.setFont('Times New Roman', 'bold');
     doc.text('7. Time Period Approximate (Ta)', 20, yPos);
     doc.setFont('Times New Roman', 'normal');
     yPos += 10;
     // Use the actual Ct value from stored data with full precision
     doc.text('According to BNBC 2020, T6.2.20, Ct = ' + parseFloat(data.inputs.Ct).toFixed(4) + ', m = ' + parseFloat(data.inputs.m).toFixed(2) + ' (MRF)', 20, yPos);
     yPos += 8;
     doc.text('hn = ' + parseFloat(data.inputs.buildingHeight).toFixed(2) + ' m', 20, yPos);
     yPos += 8;
     doc.text('T = Ct (hn)^m = ' + parseFloat(data.inputs.Ct).toFixed(4) + ' × ' + parseFloat(data.inputs.buildingHeight).toFixed(2) + '^' + parseFloat(data.inputs.m).toFixed(2) + ' = ' + parseFloat(data.inputs.fundamentalPeriod).toFixed(2) + ' sec.', 20, yPos);
     yPos += 20;
    
    // Step 8: Damping correction factor
     doc.setFont('Times New Roman', 'bold');
     doc.text('8. Damping correction factor, eta = 1.00', 20, yPos);
     yPos += 20;
    
    // Check if we need a new page
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }
    
    // Step 9: Normalized acceleration response spectrum
    doc.setFont('Times New Roman', 'bold');
    doc.text('9. Calculation of Normalized acceleration response spectrum, Cs', 20, yPos);
    doc.setFont('Times New Roman', 'normal');
    yPos += 10;
    doc.text('According to Equation 6.2.1', 20, yPos);
    yPos += 8;
    
    // Calculate Cs based on period ranges
     const T = parseFloat(data.inputs.fundamentalPeriod);
     const Z = parseFloat(data.inputs.zoneCoefficient);
     const I = parseFloat(data.inputs.importanceFactor);
     const S = parseFloat(soilFactor);
     
     let csValue;
     let csFormula;
     
     // Use the actual values from stored data to match results table
     const Tb = parseFloat(data.inputs.TB);
     const Tc = parseFloat(data.inputs.TC);
     const Td = parseFloat(data.inputs.TD);
     
     if (T <= Tb) {
         csValue = (2.5 * Z * I * S).toFixed(2);
         csFormula = 'Cs = 2.5 × Z × I × S = 2.5 × ' + Z.toFixed(2) + ' × ' + I.toFixed(2) + ' × ' + S.toFixed(2) + ' = ' + csValue;
     } else if (T <= Tc) {
         csValue = (2.5 * Z * I * S).toFixed(2);
         csFormula = 'Cs = 2.5 × Z × I × S = 2.5 × ' + Z.toFixed(2) + ' × ' + I.toFixed(2) + ' × ' + S.toFixed(2) + ' = ' + csValue;
     } else if (T <= Td) {
         csValue = (1.25 * Z * I * S * Tc / T).toFixed(2);
         csFormula = 'Cs = 1.25 × Z × I × S × Tc/T = 1.25 × ' + Z.toFixed(2) + ' × ' + I.toFixed(2) + ' × ' + S.toFixed(2) + ' × ' + Tc.toFixed(2) + '/' + T.toFixed(2) + ' = ' + csValue;
     } else {
         csValue = (1.25 * Z * I * S * Tc * Td / (T * T)).toFixed(2);
         csFormula = 'Cs = 1.25 × Z × I × S × Tc × Td/T² = 1.25 × ' + Z.toFixed(2) + ' × ' + I.toFixed(2) + ' × ' + S.toFixed(2) + ' × ' + Tc.toFixed(2) + ' × ' + Td.toFixed(2) + '/' + T.toFixed(2) + '² = ' + csValue;
     }
     
     doc.text(csFormula, 20, yPos);
     yPos += 20;
    
    // Step 10: Seismic Weight
     doc.setFont('Times New Roman', 'bold');
     doc.text('10. Seismic Weight (Mass Source), W = ' + parseFloat(data.inputs.seismicWeight).toFixed(2), 20, yPos);
     yPos += 20;
     
     // Step 11: Design Spectra Acceleration
     doc.setFont('Times New Roman', 'bold');
     doc.text('11. Design Spectra Acceleration, Sa', 20, yPos);
     doc.setFont('Times New Roman', 'normal');
     yPos += 10;
     const saValue = data.results.designSpectraAcceleration.toFixed(4);
     doc.text('Sa = 2/3 × (Z × I / R) × Cs = 2/3 × (' + Z.toFixed(2) + ' × ' + I.toFixed(2) + ' / ' + parseFloat(data.inputs.responseModification).toFixed(2) + ') × ' + csValue + ' = ' + saValue + ' g', 20, yPos);
     yPos += 20;
     
     // Step 12: Base Shear Calculation
     doc.setFont('Times New Roman', 'bold');
     doc.text('12. Determination of Seismic Base Shear, V', 20, yPos);
     doc.setFont('Times New Roman', 'normal');
     yPos += 10;
     const baseShearCalc = parseFloat(data.results.baseShear).toFixed(2);
     doc.text('V = Sa × W = ' + saValue + ' × ' + parseFloat(data.inputs.seismicWeight).toFixed(2) + ' = ' + baseShearCalc + ' kip', 20, yPos);
     yPos += 30;
    
    // Footer
    doc.setFontSize(10);
    doc.setFont('Times New Roman', 'normal');
    doc.text('Generated by StrucVision - Base Shear Calculator', 105, 280, { align: 'center' });
    doc.text('Reference: BNBC 2020, Part 6, Chapter 2', 105, 290, { align: 'center' });
}

// Reference tooltip functionality
const referenceIcon = document.getElementById('referenceIcon');
const referenceTooltip = document.getElementById('referenceTooltip');

referenceIcon.addEventListener('mouseenter', function() {
    referenceTooltip.style.display = 'block';
});

referenceIcon.addEventListener('mouseleave', function() {
    referenceTooltip.style.display = 'none';
});

// PDF Preview functionality
let livePreviewEnabled = false;
let livePreviewInterval = null;

document.getElementById('enableLivePreview').addEventListener('click', function() {
    livePreviewEnabled = !livePreviewEnabled;
    const btn = document.getElementById('enableLivePreview');
    const status = document.getElementById('livePreviewStatus');
    
    if (livePreviewEnabled) {
        btn.textContent = 'Disable Live Preview';
        btn.style.backgroundColor = '#dc3545';
        status.textContent = 'Live preview enabled - Auto-refreshing every 3 seconds';
        
        // Start auto-refresh every 3 seconds
        livePreviewInterval = setInterval(() => {
            if (window.calculationData) {
                generatePDFPreview();
                status.textContent = `Live preview enabled - Last updated: ${new Date().toLocaleTimeString()}`;
            }
        }, 3000);
        
        // Initial refresh
        if (window.calculationData) {
            generatePDFPreview();
        }
    } else {
        btn.textContent = 'Enable Live Preview';
        btn.style.backgroundColor = '';
        status.textContent = 'Live preview disabled';
        
        // Stop auto-refresh
        if (livePreviewInterval) {
            clearInterval(livePreviewInterval);
            livePreviewInterval = null;
        }
    }
});

document.getElementById('refreshPreview').addEventListener('click', function() {
    if (!window.calculationData) {
        alert('Please perform calculations first.');
        return;
    }
    
    generatePDFPreview();
    document.getElementById('livePreviewStatus').textContent = `Preview refreshed at ${new Date().toLocaleTimeString()}`;
});

// Function to generate PDF and show in preview
function generatePDFPreview() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = window.calculationData;
    
    // Generate the same PDF content as the download function
    generatePDFContent(doc, data);
    
    // Generate PDF blob for preview
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Check if device is mobile
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Show PDF preview
    const previewContainer = document.getElementById('pdfPreviewContainer');
    const previewIframe = document.getElementById('pdfPreview');
    
    if (previewContainer && previewIframe) {
        if (isMobile) {
            // For mobile devices, show a message and direct download option
            previewContainer.innerHTML = `
                <h3>PDF Report Generated</h3>
                <p style="margin: 15px 0; color: #666; font-size: 14px;">PDF preview is not fully supported on mobile devices. Please download the PDF to view it.</p>
                <button class="download-btn" onclick="downloadPDF()" style="display: inline-block; margin: 10px 0;">Download PDF Report</button>
                <p style="margin: 10px 0; font-size: 12px; color: #888;">Tip: After downloading, you can open the PDF with your device's PDF viewer app.</p>
            `;
        } else {
            // For desktop devices, show iframe preview
            previewIframe.src = pdfUrl;
        }
    }
    
    // Store the PDF for download
    window.generatedPDF = doc;
    
    // Clean up previous PDF URL if exists
    if (window.currentPdfUrl) {
        URL.revokeObjectURL(window.currentPdfUrl);
    }
    
    // Store current PDF URL for cleanup
    window.currentPdfUrl = pdfUrl;
}

// Global downloadPDF function for mobile and desktop use
window.downloadPDF = function() {
    if (window.generatedPDF) {
        try {
            const fileName = `Base_Shear_Report_${window.calculationData.inputs.buildingId.replace(/\s+/g, '_') || 'Report'}.pdf`;
            window.generatedPDF.save(fileName);
            console.log('PDF download initiated successfully');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Error downloading PDF. Please try again.');
        }
    } else {
        alert('Please generate a PDF report first.');
    }
}