// Set the angle for a specific force
function setForceAngle(forceType, angle) {
    // Enforce gravity always pointing downward (180°)
    if (forceType === 'gravity') {
        angle = 180; // Always force gravity to point downward
    }
    
    // Find the force
    const forceIndex = gameState.appliedForces.findIndex(f => f.type === forceType);
    
    if (forceIndex >= 0) {
        // Update the angle
        gameState.appliedForces[forceIndex].angle = parseInt(angle);
        
        // Update FBD
        updateFBD();
        
        // Update UI to show active angle
        updateAngleButtonsUI(forceType, angle);
        
        // Update force status
        updateForceStatus();
    } else {
        // If force doesn't exist yet, add it with the specified angle
        gameState.appliedForces.push({
            type: forceType,
            magnitude: 1,
            angle: parseInt(angle)
        });
        
        // Update FBD
        updateFBD();
        
        // Update UI
        updateAngleButtonsUI(forceType, angle);
        
        // Update force status
        updateForceStatus();
    }
}

// Update the UI to show which angle button is active
function updateAngleButtonsUI(forceType, activeAngle) {
    // Get all angle buttons for this force type
    const angleButtons = document.querySelectorAll(`.angle-btn[data-force="${forceType}"]`);
    
    // Remove active class from all buttons
    angleButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Add active class to the selected button
    const activeButton = document.querySelector(`.angle-btn[data-force="${forceType}"][data-angle="${activeAngle}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Update all angle buttons UI based on current forces
function updateAllAngleButtonsUI() {
    // Reset all buttons
    document.querySelectorAll('.angle-btn').forEach(button => {
        button.classList.remove('active');
    });
    
    // Set active buttons based on current forces
    gameState.appliedForces.forEach(force => {
        const button = document.querySelector(`.angle-btn[data-force="${force.type}"][data-angle="${force.angle}"]`);
        if (button) {
            button.classList.add('active');
        }
    });
}

// Update the force status display
function updateForceStatus() {
    const currentLevel = levels.find(l => l.id === gameState.level);
    if (!currentLevel) return;
    
    const statusList = document.getElementById('force-status-list');
    statusList.innerHTML = '';
    
    // For each required force
    currentLevel.requiredForces.forEach(requiredForce => {
        // Create status item
        const statusItem = document.createElement('div');
        statusItem.className = 'force-status-item';
        
        // Create status indicator
        const indicator = document.createElement('div');
        indicator.className = 'status-indicator';
        
        // Create label
        const label = document.createElement('div');
        label.className = 'status-label';
        
        // Find if this force is applied
        const appliedForce = gameState.appliedForces.find(f => f.type === requiredForce.type);
        
        if (!appliedForce) {
            // Force is missing
            indicator.classList.add('status-missing');
            label.textContent = `${getForceName(requiredForce.type)}: Missing`;
        } else if (appliedForce.angle !== requiredForce.angle) {
            // Force has incorrect angle
            indicator.classList.add('status-incorrect');
            label.textContent = `${getForceName(requiredForce.type)}: Incorrect angle (${appliedForce.angle}° instead of ${requiredForce.angle}°)`;
        } else {
            // Force is correct
            indicator.classList.add('status-correct');
            label.textContent = `${getForceName(requiredForce.type)}: Correct!`;
        }
        
        // Add elements to status item
        statusItem.appendChild(indicator);
        statusItem.appendChild(label);
        
        // Add status item to list
        statusList.appendChild(statusItem);
    });
}

// Draw angle indicators on the diagram
function drawAngleIndicators(container) {
    // Create angle indicator container
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'angle-indicators';
    
    // Add angle markers at 30-degree intervals
    for (let angle = 0; angle < 360; angle += 30) {
        // Create marker
        const marker = document.createElement('div');
        marker.className = 'angle-marker';
        
        // Position marker - 0° is at North
        const radius = 120; // Distance from center
        
        // Convert from true bearing (0° at North) to standard math angle (0° at East)
        // True bearing: 0° = North, 90° = East, 180° = South, 270° = West
        // Math angle: 0° = East, 90° = North, 180° = West, 270° = South
        const mathAngle = (90 - angle) % 360;
        const angleRad = mathAngle * Math.PI / 180;
        
        const x = Math.cos(angleRad) * radius;
        const y = -Math.sin(angleRad) * radius; // Negative because y increases downward in CSS
        
        marker.style.left = `calc(50% + ${x}px)`;
        marker.style.top = `calc(50% + ${y}px)`;
        
        // Add angle label
        const label = document.createElement('div');
        label.className = 'angle-label';
        label.textContent = `${angle}°`;
        
        // Position label slightly outside marker
        const labelRadius = radius + 15;
        const labelX = Math.cos(angleRad) * labelRadius;
        const labelY = -Math.sin(angleRad) * labelRadius;
        
        label.style.left = `calc(50% + ${labelX}px)`;
        label.style.top = `calc(50% + ${labelY}px)`;
        
        // Add to container
        indicatorContainer.appendChild(marker);
        indicatorContainer.appendChild(label);
    }
    
    // Add reference lines
    const referenceLines = document.createElement('div');
    referenceLines.className = 'reference-lines';
    
    // Horizontal line
    const horizontalLine = document.createElement('div');
    horizontalLine.className = 'reference-line horizontal';
    referenceLines.appendChild(horizontalLine);
    
    // Vertical line
    const verticalLine = document.createElement('div');
    verticalLine.className = 'reference-line vertical';
    referenceLines.appendChild(verticalLine);
    
    // Add to container
    indicatorContainer.appendChild(referenceLines);
    container.appendChild(indicatorContainer);
}

// Get full force name from type
function getForceName(forceType) {
    switch(forceType) {
        case 'gravity':
            return 'Gravity';
        case 'normal':
            return 'Normal Force';
        case 'friction':
            return 'Friction';
        case 'applied':
            return 'Applied Force';
        default:
            return forceType;
    }
}
// Draw incline angle indicator on the physics world
function drawInclineAngleIndicator(container, inclineAngleDegrees) {
    // Create angle indicator container
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'incline-angle-indicator';
    
    // Position the indicator near the inclined plane
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight - 100;
    
    // Create the angle arc
    const arcRadius = 60;
    const arc = document.createElement('div');
    arc.className = 'incline-angle-arc';
    arc.style.width = `${arcRadius * 2}px`;
    arc.style.height = `${arcRadius * 2}px`;
    arc.style.left = `${centerX - arcRadius}px`;
    arc.style.top = `${centerY - arcRadius}px`;
    
    // Always use the positive angle value between 0-90 degrees
    const displayAngle = inclineAngleDegrees;
    
    // Create the angle label
    const label = document.createElement('div');
    label.className = 'incline-angle-label';
    label.textContent = `${displayAngle}°`;
    
    // Position the label between the inclined plane and horizontal
    // Calculate the position to be exactly between the two lines
    const halfAngleRad = (inclineAngleDegrees / 2) * Math.PI / 180;
    const labelDistance = arcRadius * 0.6; // Shorter distance to keep it between the lines
    const labelX = centerX + Math.cos(halfAngleRad) * labelDistance;
    const labelY = centerY - Math.sin(halfAngleRad) * labelDistance;
    
    label.style.left = `${labelX}px`;
    label.style.top = `${labelY}px`;
    
    // Create horizontal reference line
    const horizontalLine = document.createElement('div');
    horizontalLine.className = 'incline-reference-line horizontal';
    horizontalLine.style.width = `${arcRadius}px`;
    horizontalLine.style.left = `${centerX}px`;
    horizontalLine.style.top = `${centerY}px`;
    
    // Create incline reference line
    const inclineLine = document.createElement('div');
    inclineLine.className = 'incline-reference-line inclined';
    inclineLine.style.width = `${arcRadius}px`;
    inclineLine.style.left = `${centerX}px`;
    inclineLine.style.top = `${centerY}px`;
    inclineLine.style.transform = `rotate(-${inclineAngleDegrees}deg)`;
    
    // Add elements to container
    indicatorContainer.appendChild(arc);
    indicatorContainer.appendChild(label);
    indicatorContainer.appendChild(horizontalLine);
    indicatorContainer.appendChild(inclineLine);
    container.appendChild(indicatorContainer);
}
// Draw incline angle indicator that's perfectly aligned with the actual planes
function drawAlignedInclineAngleIndicator(container, inclineAngleDegrees, inclinePosition, groundPosition) {
    // Remove any existing angle indicators first
    const existingIndicators = container.querySelectorAll('.incline-angle-indicator');
    existingIndicators.forEach(indicator => {
        indicator.remove();
    });
    
    // Create angle indicator container
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'incline-angle-indicator';
    
    // The angle vertex should be at the intersection of the inclined plane and the ground
    // For our setup, this is approximately at the position of the inclined plane
    const vertexX = inclinePosition.x;
    const vertexY = inclinePosition.y;
    
    // Create the angle arc
    const arcRadius = 50;
    const arc = document.createElement('div');
    arc.className = 'incline-angle-arc';
    arc.style.width = `${arcRadius * 2}px`;
    arc.style.height = `${arcRadius * 2}px`;
    arc.style.left = `${vertexX - arcRadius}px`;
    arc.style.top = `${vertexY - arcRadius}px`;
    
    // Create the angle label
    const label = document.createElement('div');
    label.className = 'incline-angle-label';
    label.textContent = `${inclineAngleDegrees}°`;
    
    // Position the label between the inclined plane and horizontal
    // Calculate the position to be exactly between the two lines
    const halfAngleRad = (inclineAngleDegrees / 2) * Math.PI / 180;
    const labelDistance = arcRadius * 0.7;
    const labelX = vertexX + Math.cos(Math.PI - halfAngleRad) * labelDistance;
    const labelY = vertexY + Math.sin(Math.PI - halfAngleRad) * labelDistance;
    
    label.style.left = `${labelX}px`;
    label.style.top = `${labelY}px`;
    
    // Create horizontal reference line (aligned with ground)
    const horizontalLine = document.createElement('div');
    horizontalLine.className = 'incline-reference-line horizontal';
    horizontalLine.style.width = `${arcRadius}px`;
    horizontalLine.style.left = `${vertexX}px`;
    horizontalLine.style.top = `${vertexY}px`;
    horizontalLine.style.transform = 'rotate(180deg)'; // Point left (horizontal)
    
    // Create incline reference line (aligned with inclined plane)
    const inclineLine = document.createElement('div');
    inclineLine.className = 'incline-reference-line inclined';
    inclineLine.style.width = `${arcRadius}px`;
    inclineLine.style.left = `${vertexX}px`;
    inclineLine.style.top = `${vertexY}px`;
    inclineLine.style.transform = `rotate(${180 - inclineAngleDegrees}deg)`; // Align with incline
    
    // Add elements to container
    indicatorContainer.appendChild(arc);
    indicatorContainer.appendChild(label);
    indicatorContainer.appendChild(horizontalLine);
    indicatorContainer.appendChild(inclineLine);
    container.appendChild(indicatorContainer);
}
