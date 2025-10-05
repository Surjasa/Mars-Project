class MarsRecyclingGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Background image support
        this.backgroundImage = null;
        this.backgroundLoaded = false;

        // Game state
        this.sol = 1;
        this.crew = 4;
        this.power = 100;
        this.water = 85;

        // Waste inventory
        this.waste = {
            fabric: 0,
            packaging: 0,
            eva: 0,
            foam: 0
        };

        // Products inventory
        this.products = {
            insulation: 0,
            wipes: 0,
            panels: 0,
            containers: 0,
            composites: 0,
            tools: 0,
            cushioning: 0
        };

        // Recycling systems
        this.recyclingSystems = [
            {
                id: 'fabric-to-insulation',
                name: 'Fabric Spinner',
                input: { fabric: 3 },
                output: { insulation: 2 },
                powerCost: 5,
                waterCost: 0,
                description: 'Spin fabrics into thermal insulation'
            },
            {
                id: 'fabric-to-wipes',
                name: 'Fabric Weaver',
                input: { fabric: 2 },
                output: { wipes: 4 },
                powerCost: 3,
                waterCost: 1,
                description: 'Weave fabrics into cleaning wipes'
            },
            {
                id: 'packaging-to-panels',
                name: 'Thermal Melter',
                input: { packaging: 4 },
                output: { panels: 2 },
                powerCost: 8,
                waterCost: 0,
                description: 'Melt packaging into structural panels'
            },
            {
                id: 'packaging-to-containers',
                name: 'Mold Former',
                input: { packaging: 3 },
                output: { containers: 3 },
                powerCost: 6,
                waterCost: 0,
                description: 'Form packaging into storage containers'
            },
            {
                id: 'eva-to-composites',
                name: 'Composite Processor',
                input: { eva: 2 },
                output: { composites: 1 },
                powerCost: 10,
                waterCost: 2,
                description: 'Convert EVA waste into structural composites'
            },
            {
                id: 'foam-to-cushioning',
                name: 'Foam Reprocessor',
                input: { foam: 3 },
                output: { cushioning: 4 },
                powerCost: 4,
                waterCost: 0,
                description: 'Reprocess foam into tool cushioning'
            }
        ];

        // Crew members data
        this.crewMembers = [
            {
                id: 'chen',
                name: 'Chen',
                role: 'Commander',
                type: 'commander',
                emoji: '👨‍🚀',
                status: 'active',
                activity: 'Monitoring systems',
                lastActivity: Date.now()
            },
            {
                id: 'rodriguez',
                name: 'Rodriguez',
                role: 'Scientist',
                type: 'scientist',
                emoji: '👩‍🔬',
                status: 'active',
                activity: 'Research analysis',
                lastActivity: Date.now()
            },
            {
                id: 'kim',
                name: 'Kim',
                role: 'Engineer',
                type: 'engineer',
                emoji: '👨‍🔧',
                status: 'active',
                activity: 'Equipment maintenance',
                lastActivity: Date.now()
            },
            {
                id: 'park',
                name: 'Park',
                role: 'Biologist',
                type: 'biologist',
                emoji: '👩‍🌾',
                status: 'active',
                activity: 'Greenhouse monitoring',
                lastActivity: Date.now()
            }
        ];

        // Habitat modules for canvas rendering - optimized for 1100x600 canvas
        this.modules = [
            { x: 220, y: 120, width: 160, height: 100, type: 'living', name: 'Living Quarters', hovered: false },
            { x: 420, y: 120, width: 160, height: 100, type: 'lab', name: 'Research Lab', hovered: false },
            { x: 620, y: 120, width: 160, height: 100, type: 'recycling', name: 'Recycling Bay', hovered: false },
            { x: 320, y: 280, width: 160, height: 100, type: 'storage', name: 'Storage', hovered: false },
            { x: 520, y: 280, width: 160, height: 100, type: 'greenhouse', name: 'Greenhouse', hovered: false }
        ];

        // Initialize interior view state
        this.currentView = 'habitat'; // 'habitat' or 'interior'
        this.selectedModule = null;
        this.currentInteriorIndex = 0;
        this.interiorAreas = [];

        this.initializeStoryDialogs();
        this.init();
    }

    init() {

        this.updateUI();
        this.renderHabitat();

        // Add canvas click listener for module selection
        this.canvas.addEventListener('click', (event) => {
            this.handleCanvasClick(event);
        });

        // Add double-click listener to exit interior view
        this.canvas.addEventListener('dblclick', (event) => {
            if (this.currentView === 'interior') {
                this.exitInteriorView();
            }
        });

        // Add canvas mousemove listener for hover effects
        this.canvas.addEventListener('mousemove', (event) => {
            this.handleCanvasHover(event);
        });

        // Add canvas mouseleave listener to clear hover states
        this.canvas.addEventListener('mouseleave', () => {
            this.clearAllHoverStates();
        });



        // Add navigation button handlers
        const backBtn = document.getElementById('back-btn');
        const nextBtn = document.getElementById('next-btn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // Always restore the canvas to the main habitat view
                this.restoreCanvasToHabitat();

                if (this.currentView === 'interior') {
                    this.navigateInterior('back');
                } else {
                    this.exitInteriorView();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentView === 'interior') {
                    this.navigateInterior('next');
                } else {
                    this.exitInteriorView();
                }
            });
        }

        // Show story dialog on game start
        setTimeout(() => {
            this.showStoryDialog();
        }, 1000);
        this.generateRecyclingOptions();
        this.createAtmosphericEffects();
        this.generateCrewPortraits();
        this.generateCrewQuarters();
        this.setupBackgroundControls();
        this.setBackground();
        // Load the Mars landscape image
        this.loadBackgroundImage('mars.png');

        this.startAnimationLoop();

        // Start intervals
        setInterval(() => this.generateDailyWaste(), 10000); // Every 10 seconds = 1 Sol
        setInterval(() => this.advanceDay(), 10000);
        setInterval(() => this.addCrewNarrative(), 15000); // Crew messages every 15 seconds
        setInterval(() => this.updateCrewActivities(), 8000); // Update crew activities every 8 seconds
    }

    // 👉 New method inside your class
    setBackground() {
        const button = document.getElementById("toggleBackgroundControls");
        const panel = document.getElementById("background-controls");

        if (button && panel) {
            button.addEventListener("click", () => {
                if (panel.classList.contains("hidden")) {
                    panel.classList.remove("hidden");
                    button.textContent = "🎨 Hide Background Controls";
                } else {
                    panel.classList.add("hidden");
                    button.textContent = "🎨 Show Background Controls";
                }
            });

        }
    }


    createAtmosphericEffects() {
        // Add floating dust particles to the page
        const dustContainer = document.createElement('div');
        dustContainer.className = 'dust-particles';
        document.body.appendChild(dustContainer);

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'dust-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            dustContainer.appendChild(particle);
        }

        // Add atmospheric classes to UI elements
        document.getElementById('game-canvas').classList.add('atmospheric-glow');
        document.getElementById('control-panel').classList.add('atmospheric-glow');
        document.querySelector('header').classList.add('atmospheric-glow');
    }

    collectWaste(type) {
        this.waste[type] += Math.floor(Math.random() * 3) + 1;
        this.showNotification(`Collected ${type} waste!`);
        this.updateUI();
    }

    generateDailyWaste() {
        // Simulate daily waste generation from crew activities
        const wasteTypes = Object.keys(this.waste);
        wasteTypes.forEach(type => {
            this.waste[type] += Math.floor(Math.random() * 2) + 1;
        });
        this.showNotification('Daily waste generated from crew activities');
        this.updateUI();
    }

    advanceDay() {
        this.sol++;
        this.power = Math.max(50, this.power - Math.floor(Math.random() * 5));
        this.water = Math.max(30, this.water - Math.floor(Math.random() * 3));
        this.updateUI();
    }

    canRecycle(system) {
        // Check if we have enough resources
        for (let [resource, amount] of Object.entries(system.input)) {
            if (this.waste[resource] < amount) return false;
        }
        if (this.power < system.powerCost) return false;
        if (this.water < system.waterCost) return false;
        return true;
    }

    recycle(systemId) {
        const system = this.recyclingSystems.find(s => s.id === systemId);
        if (!system || !this.canRecycle(system)) return;

        // Consume inputs
        for (let [resource, amount] of Object.entries(system.input)) {
            this.waste[resource] -= amount;
        }
        this.power -= system.powerCost;
        this.water -= system.waterCost;

        // Generate outputs
        for (let [product, amount] of Object.entries(system.output)) {
            this.products[product] += amount;
        }

        // Enhanced feedback with processing details
        const outputText = Object.entries(system.output)
            .map(([product, amount]) => `${amount} ${product}`)
            .join(', ');

        this.showNotification(`🔄 ${system.name} processed successfully!`);
        this.showNotification(`✨ Created: ${outputText}`);

        // Add processing visual effect
        this.triggerProcessingEffect();

        // Check for mission completion
        this.checkMissionCompletion();

        this.updateUI();
        this.generateRecyclingOptions();
    }

    triggerProcessingEffect() {
        // Find recycling module and add visual effect
        const recyclingModule = this.modules.find(m => m.type === 'recycling');
        if (recyclingModule) {
            // This will be visible in the next render cycle
            recyclingModule.processing = true;
            setTimeout(() => {
                recyclingModule.processing = false;
            }, 2000);
        }
    }

    generateRecyclingOptions() {
        const container = document.getElementById('recycling-buttons');
        container.innerHTML = '';

        this.recyclingSystems.forEach(system => {
            const div = document.createElement('div');
            div.className = 'recycling-option';

            const canUse = this.canRecycle(system);
            const inputText = Object.entries(system.input)
                .map(([resource, amount]) => `${amount} ${resource}`)
                .join(', ');
            const outputText = Object.entries(system.output)
                .map(([product, amount]) => `${amount} ${product}`)
                .join(', ');

            div.innerHTML = `
                <h4>${system.name}</h4>
                <div class="requirements">
                    Needs: ${inputText}<br>
                    Power: ${system.powerCost}% | Water: ${system.waterCost}L<br>
                    Produces: ${outputText}
                </div>
                <button onclick="game.recycle('${system.id}')" ${!canUse ? 'disabled' : ''}>
                    ${canUse ? 'Recycle' : 'Insufficient Resources'}
                </button>
            `;

            container.appendChild(div);
        });
    }

    updateUI() {
        // Update status display
        document.getElementById('sol-counter').textContent = this.sol;
        document.getElementById('crew-count').textContent = this.crew;

        // Update power with warning colors
        const powerElement = document.getElementById('power-level');
        powerElement.textContent = this.power;
        powerElement.className = this.power < 30 ? 'low-power' : '';

        // Update water with warning colors
        const waterElement = document.getElementById('water-level');
        waterElement.textContent = this.water;
        waterElement.className = this.water < 40 ? 'low-water' : '';

        // Update waste inventory
        Object.keys(this.waste).forEach(type => {
            const element = document.getElementById(`${type}-count`);
            if (element) element.textContent = this.waste[type];
        });

        // Update products inventory with enhanced styling
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = '';
        Object.entries(this.products).forEach(([product, amount]) => {
            if (amount > 0) {
                const div = document.createElement('div');
                div.className = 'product-item holographic';
                div.innerHTML = `
                    <span>${this.getProductIcon(product)} ${product}:</span>
                    <span>${amount}</span>
                `;
                productsList.appendChild(div);
            }
        });

        // Check for critical resource warnings
        this.checkResourceWarnings();

        // Update crew portraits
        this.updateCrewPortraits();
    }

    getProductIcon(product) {
        const icons = {
            insulation: '🧊',
            wipes: '🧽',
            panels: '📋',
            containers: '📦',
            composites: '🔧',
            tools: '🛠️',
            cushioning: '🛡️'
        };
        return icons[product] || '📦';
    }

    checkResourceWarnings() {
        if (this.power < 20) {
            this.showNotification('⚠️ CRITICAL: Power levels dangerously low!');
        } else if (this.power < 40) {
            this.showNotification('⚡ Warning: Power running low');
        }

        if (this.water < 30) {
            this.showNotification('⚠️ CRITICAL: Water reserves critically low!');
        } else if (this.water < 50) {
            this.showNotification('💧 Warning: Water levels decreasing');
        }
    }

    renderHabitat() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Check if we're in interior view
        console.log('renderHabitat - currentView:', this.currentView, 'selectedModule:', this.selectedModule);
        if (this.currentView === 'interior' && this.selectedModule) {
            console.log('Rendering interior view');
            this.renderModuleInterior(this.selectedModule);
            return;
        }

        // Draw background image if loaded, otherwise use gradient
        if (this.backgroundLoaded) {
            this.drawBackgroundImage();
        } else {
            // Draw Martian sky gradient (fallback)
            const skyGradient = this.ctx.createLinearGradient(0, 0, 0, 350);
            skyGradient.addColorStop(0, '#E6B88A');    // Pale peachy sky
            skyGradient.addColorStop(0.3, '#D2A679');  // Light salmon
            skyGradient.addColorStop(0.6, '#C4956B');  // Warm tan
            skyGradient.addColorStop(0.8, '#B8845D');  // Dusty brown
            skyGradient.addColorStop(1, '#A67C52');    // Deeper brown
            this.ctx.fillStyle = skyGradient;
            this.ctx.fillRect(0, 0, this.canvas.width, 350);
        }


        // Draw realistic Mars terrain and rock formations
        this.drawMartianLandscape();

        // Draw Mars surface with authentic regolith


        // Add realistic regolith texture and rocks
        this.drawRegolithTexture();

        // Draw long shadows from modules (Mars has long shadows)
        this.drawModuleShadows();

        // Draw habitat modules with enhanced visuals
        this.modules.forEach(module => {
            this.drawEnhancedModule(module);
        });

        // Draw crew members in modules
        this.drawCrewInModules();

        // Draw connecting tubes with glow
        this.drawConnectingTubes();

        // Draw atmospheric dome with shimmer effect
        this.drawAtmosphericDome();

        // Add atmospheric dust particles
        this.drawAtmosphericParticles();

        // Draw dim Mars sun
        this.drawMartianSun();
    }

    drawMartianLandscape() {
        // Far distant mountains (very faded)
        this.ctx.fillStyle = 'rgba(160, 82, 45, 0.4)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 200);
        this.ctx.lineTo(200, 180);
        this.ctx.lineTo(400, 190);
        this.ctx.lineTo(600, 175);
        this.ctx.lineTo(1000, 185);
        this.ctx.lineTo(1000, 220);
        this.ctx.lineTo(0, 220);
        this.ctx.closePath();
        this.ctx.fill();

        // Mid-distance rocky formations
        this.ctx.fillStyle = '#A0522D';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 260);
        this.ctx.lineTo(120, 240);
        this.ctx.lineTo(180, 250);
        this.ctx.lineTo(280, 230);
        this.ctx.lineTo(350, 245);
        this.ctx.lineTo(480, 225);
        this.ctx.lineTo(580, 240);
        this.ctx.lineTo(700, 220);
        this.ctx.lineTo(1000, 235);
        this.ctx.lineTo(1000, 300);
        this.ctx.lineTo(0, 300);
        this.ctx.closePath();
        this.ctx.fill();

        // Closer rocky outcrops with more detail
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 320);
        this.ctx.lineTo(100, 300);
        this.ctx.lineTo(150, 310);
        this.ctx.lineTo(220, 295);
        this.ctx.lineTo(300, 305);
        this.ctx.lineTo(380, 290);
        this.ctx.lineTo(450, 300);
        this.ctx.lineTo(520, 285);
        this.ctx.lineTo(600, 295);
        this.ctx.lineTo(680, 280);
        this.ctx.lineTo(750, 290);
        this.ctx.lineTo(1000, 285);
        this.ctx.lineTo(1000, 350);
        this.ctx.lineTo(0, 350);
        this.ctx.closePath();
        this.ctx.fill();

        // Add realistic rock shadows and depth
        this.ctx.fillStyle = 'rgba(101, 67, 33, 0.6)';
        this.ctx.beginPath();
        this.ctx.moveTo(100, 300);
        this.ctx.lineTo(150, 310);
        this.ctx.lineTo(155, 315);
        this.ctx.lineTo(105, 305);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(380, 290);
        this.ctx.lineTo(450, 300);
        this.ctx.lineTo(455, 305);
        this.ctx.lineTo(385, 295);
        this.ctx.closePath();
        this.ctx.fill();

        // Add some individual large rocks/boulders
        this.drawMartianBoulders();
    }

    drawRegolithTexture() {
        // Add varied sized rocks and regolith texture
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * this.canvas.width;
            const y = 380 + Math.random() * 220;
            const size = Math.random() * 4 + 0.5;

            // Vary the rock colors for realism
            const rockColors = [
                'rgba(160, 82, 45, 0.6)',   // Sienna
                'rgba(139, 69, 19, 0.7)',   // Saddle brown
                'rgba(205, 133, 63, 0.5)',  // Peru
                'rgba(101, 67, 33, 0.8)',   // Dark brown
                'rgba(184, 134, 11, 0.4)'   // Dark goldenrod
            ];

            this.ctx.fillStyle = rockColors[Math.floor(Math.random() * rockColors.length)];
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Add some larger scattered rocks
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.canvas.width;
            const y = 380 + Math.random() * 180;
            const width = Math.random() * 8 + 3;
            const height = Math.random() * 6 + 2;

            this.ctx.fillStyle = `rgba(139, 69, 19, ${0.6 + Math.random() * 0.3})`;
            this.ctx.fillRect(x, y, width, height);

            // Add shadow to rocks
            this.ctx.fillStyle = 'rgba(101, 67, 33, 0.4)';
            this.ctx.fillRect(x + width * 0.7, y + height, width * 0.8, height * 0.3);
        }

        // Add fine dust texture
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.canvas.width;
            const y = 380 + Math.random() * 220;

            this.ctx.fillStyle = `rgba(205, 133, 63, ${0.1 + Math.random() * 0.2})`;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }

    drawMartianBoulders() {
        // Add some distinctive large boulders like in Mars photos
        const boulders = [
            { x: 80, y: 420, width: 25, height: 15 },
            { x: 280, y: 440, width: 18, height: 12 },
            { x: 480, y: 430, width: 22, height: 18 },
            { x: 680, y: 435, width: 20, height: 14 },
            { x: 880, y: 425, width: 16, height: 10 },
            { x: 1020, y: 445, width: 18, height: 12 }
        ];

        boulders.forEach(boulder => {
            // Main boulder
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(boulder.x, boulder.y, boulder.width, boulder.height);

            // Boulder highlight (sun-facing side)
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(boulder.x, boulder.y, boulder.width * 0.6, boulder.height * 0.4);

            // Boulder shadow
            this.ctx.fillStyle = 'rgba(101, 67, 33, 0.7)';
            this.ctx.fillRect(
                boulder.x + boulder.width * 0.8,
                boulder.y + boulder.height,
                boulder.width * 1.2,
                boulder.height * 0.4
            );
        });
    }

    drawModuleShadows() {
        this.modules.forEach(module => {
            // Long shadows cast by golden sunlight
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(
                module.x + 30,
                module.y + module.height + 10,
                module.width * 1.5,
                20
            );
        });
    }

    drawEnhancedModule(module) {
        // Module base with metallic gradient
        const moduleGradient = this.ctx.createLinearGradient(
            module.x, module.y,
            module.x + module.width, module.y + module.height
        );
        const baseColor = this.getModuleColor(module.type);

        // Brighten colors if hovered
        const color1 = module.hovered ? this.lightenColor(baseColor, 30) : baseColor;
        const color2 = module.hovered ? this.lightenColor(baseColor, 40) : this.lightenColor(baseColor, 20);
        const color3 = module.hovered ? baseColor : this.darkenColor(baseColor, 20);

        moduleGradient.addColorStop(0, color1);
        moduleGradient.addColorStop(0.5, color2);
        moduleGradient.addColorStop(1, color3);

        this.ctx.fillStyle = moduleGradient;
        this.ctx.fillRect(module.x, module.y, module.width, module.height);

        // Enhanced hover effect with pulsing glow
        if (module.hovered || module.clicked) {
            // Add pulsing outer glow
            const time = Date.now() * 0.005;
            const pulseIntensity = module.clicked ? 1 : (Math.sin(time) + 1) * 0.5;
            const glowColor = module.clicked ? '#FF4500' : '#FFD700';

            this.ctx.strokeStyle = glowColor;
            this.ctx.lineWidth = 3 + pulseIntensity * 2;
            this.ctx.shadowColor = glowColor;
            this.ctx.shadowBlur = 15 + pulseIntensity * 10;
            this.ctx.strokeRect(module.x - 2, module.y - 2, module.width + 4, module.height + 4);
            this.ctx.shadowBlur = 0;
        }

        // Module border with glow effect
        const borderColor = module.clicked ? '#FF4500' : (module.hovered ? '#FFD700' : '#00BFFF');
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = (module.hovered || module.clicked) ? 3 : 2;
        this.ctx.shadowColor = borderColor;
        this.ctx.shadowBlur = (module.hovered || module.clicked) ? 15 : 10;
        this.ctx.strokeRect(module.x, module.y, module.width, module.height);
        this.ctx.shadowBlur = 0;

        // Windows/viewports
        if (module.type === 'living' || module.type === 'lab') {
            this.ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
            this.ctx.fillRect(module.x + 10, module.y + 10, 30, 20);
            this.ctx.strokeStyle = '#87CEEB';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(module.x + 10, module.y + 10, 30, 20);
        }

        // Status lights
        const lightX = module.x + module.width - 15;
        const lightY = module.y + 10;
        this.ctx.fillStyle = '#00FF00';
        this.ctx.shadowColor = '#00FF00';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(lightX, lightY, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Special effects for Living Quarters (clickable indicator)
        if (module.type === 'living') {
            // Add a pulsing indicator
            const time = Date.now() * 0.003;
            const pulseAlpha = (Math.sin(time) + 1) * 0.3 + 0.4;

            // Draw clickable indicator bar
            this.ctx.fillStyle = `rgba(255, 255, 0, ${pulseAlpha})`;
            this.ctx.fillRect(module.x + 5, module.y + module.height - 15, module.width - 10, 10);
        }

        // Module label with futuristic font
        this.ctx.fillStyle = module.hovered ? '#FFD700' : '#FFFFFF';
        this.ctx.font = module.hovered ? 'bold 12px monospace' : 'bold 11px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = module.hovered ? 5 : 3;
        this.ctx.fillText(module.name, module.x + module.width / 2, module.y + module.height / 2 + 4);
        this.ctx.shadowBlur = 0;

        // Show hover tooltip
        if (module.hovered) {
            this.drawModuleTooltip(module);
        }

        // Recycling module special effects
        if (module.type === 'recycling') {
            this.drawRecyclingEffects(module);
        }
    }

    drawRecyclingEffects(module) {
        // Glowing processing indicator
        const time = Date.now() * 0.005;
        const glowIntensity = (Math.sin(time) + 1) * 0.5;

        this.ctx.fillStyle = `rgba(255, 165, 0, ${0.3 + glowIntensity * 0.4})`;
        this.ctx.fillRect(module.x + 5, module.y + module.height - 15, module.width - 10, 10);

        // Processing particles
        for (let i = 0; i < 3; i++) {
            const particleX = module.x + 20 + i * 40 + Math.sin(time + i) * 5;
            const particleY = module.y + 30 + Math.cos(time + i) * 3;

            this.ctx.fillStyle = '#FFD700';
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 5;
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }

    drawConnectingTubes() {
        // Enhanced tubes with inner glow
        this.ctx.strokeStyle = '#4A4A4A';
        this.ctx.lineWidth = 12;
        this.ctx.lineCap = 'round';

        // Outer tube - Fixed coordinates to properly connect modules
        this.ctx.beginPath();
        // Living Quarters to Research Lab (top row, left connection)
        this.ctx.moveTo(380, 170);  // Right edge of Living Quarters
        this.ctx.lineTo(420, 170);  // Left edge of Research Lab
        // Research Lab to Recycling Bay (top row, right connection)  
        this.ctx.moveTo(580, 170);  // Right edge of Research Lab
        this.ctx.lineTo(620, 170);  // Left edge of Recycling Bay
        // Vertical connection from Research Lab down
        this.ctx.moveTo(500, 220);  // Bottom center of Research Lab
        this.ctx.lineTo(500, 280);  // Top of lower level
        // Storage to Greenhouse (bottom row connection)
        this.ctx.moveTo(480, 330);  // Right edge of Storage
        this.ctx.lineTo(520, 330);  // Left edge of Greenhouse
        // Connect vertical tube to Storage
        this.ctx.moveTo(500, 280);  // From vertical tube
        this.ctx.lineTo(480, 280);  // To Storage right edge
        this.ctx.stroke();

        // Inner glow - Same coordinates as outer tube
        this.ctx.strokeStyle = '#00BFFF';
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = '#00BFFF';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        // Living Quarters to Research Lab
        this.ctx.moveTo(380, 170);
        this.ctx.lineTo(420, 170);
        // Research Lab to Recycling Bay
        this.ctx.moveTo(580, 170);
        this.ctx.lineTo(620, 170);
        // Vertical connection
        this.ctx.moveTo(500, 220);
        this.ctx.lineTo(500, 280);
        // Storage to Greenhouse
        this.ctx.moveTo(480, 330);
        this.ctx.lineTo(520, 330);
        // Connect to Storage
        this.ctx.moveTo(500, 280);
        this.ctx.lineTo(480, 280);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawAtmosphericDome() {
        // Main dome structure
        this.ctx.strokeStyle = 'rgba(0, 191, 255, 0.4)';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = 'rgba(0, 191, 255, 0.6)';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(500, 300, 280, Math.PI, 0);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Shimmer effect
        const time = Date.now() * 0.003;
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI / 6) * i + time;
            const x = 650 + Math.cos(angle) * 350;
            const y = 300 + Math.sin(angle) * 350;

            if (y <= 300) { // Only draw on upper dome
                this.ctx.fillStyle = `rgba(0, 255, 255, ${0.1 + Math.sin(time + i) * 0.1})`;
                this.ctx.shadowColor = '#00FFFF';
                this.ctx.shadowBlur = 10;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        }
    }

    drawAtmosphericParticles() {
        // Floating dust particles with shimmer effect
        const time = Date.now() * 0.001;
        for (let i = 0; i < 15; i++) {
            const x = (i * 50 + Math.sin(time + i) * 20) % this.canvas.width;
            const y = 100 + Math.cos(time + i * 0.5) * 30;

            // Create shimmer effect - alternates between golden and bright white
            const shimmerCycle = Math.sin(time * 0.3 + i) * 0.5 + 0.5;
            const baseOpacity = 0.6 + Math.sin(time + i) * 0.2;

            // Interpolate between golden and white colors
            const r = Math.floor(255);
            const g = Math.floor(215 + (255 - 215) * shimmerCycle);
            const b = Math.floor(0 + (255 - 0) * shimmerCycle * 0.3);

            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${baseOpacity})`;

            // Add glow effect
            this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
            this.ctx.shadowBlur = 4 + shimmerCycle * 4;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 1 + Math.sin(time + i) * 0.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Reset shadow
            this.ctx.shadowBlur = 0;
        }
    }

    drawMartianSun() {
        // Dim golden sun
        const sunX = 650;
        const sunY = 80;

        // Sun glow
        const sunGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 40);
        sunGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        sunGradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.4)');
        sunGradient.addColorStop(1, 'rgba(255, 140, 0, 0.1)');

        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
        this.ctx.fill();

        // Sun core
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, 12, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    getModuleColor(type) {
        const colors = {
            living: '#4A90E2',
            lab: '#7ED321',
            recycling: '#F5A623',
            storage: '#9013FE',
            greenhouse: '#50E3C2'
        };
        return colors[type] || '#666';
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        document.getElementById('notifications').appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Story dialog system
    initializeStoryDialogs() {
        this.storyDialogs = [
            {
                title: "Mars Colony Mission Brief",
                content: "Welcome to Mars Colony Alpha, Commander. You are part of humanity's first permanent settlement on the Red Planet.",
                speaker: "Mission Control",
                icon: ""
            },
            {
                title: "The Challenge",
                content: "Our supply lines from Earth are limited and expensive. Every resource must be carefully managed and recycled to ensure our survival.",
                speaker: "Colony Administrator",
                icon: "⚠️"
            },
            {
                title: "Your Mission",
                content: "As the Recycling Operations Manager, your task is to transform waste materials into useful products that will sustain our colony.",
                speaker: "Chief Engineer",
                icon: "🔧"
            },
            {
                title: "The Process",
                content: "Collect various waste items, process them through our recycling systems, and create essential supplies for the colony's continued operation.",
                speaker: "Resource Specialist",
                icon: "♻️"
            },
            {
                title: "Success Criteria",
                content: "Successfully recycle materials to create tools, building components, and life support supplies. The colony's future depends on your efficiency!",
                speaker: "Mission Commander",
                icon: "🎯"
            }
        ];
        this.currentDialogIndex = 0;
        this.gameStarted = false;
        this.missionCompleted = false;
    }

    showStoryDialog() {
        if (this.currentDialogIndex >= this.storyDialogs.length) {
            this.startGame();
            return;
        }

        const dialog = this.storyDialogs[this.currentDialogIndex];
        const dialogElement = document.createElement('div');
        dialogElement.className = 'story-dialog-overlay';

        dialogElement.innerHTML = `
            <div class="story-dialog">
                <img src="mar2.png" class="character-image" alt="Mars Astronaut" />
                <div class="dialog-header">
                    <div class="dialog-icon">${dialog.icon}</div>
                    <div class="dialog-title-section">
                        <h2 class="dialog-title">${dialog.title}</h2>
                        <p class="dialog-speaker">${dialog.speaker}</p>
                    </div>
                    <div class="dialog-controls">
                        <span class="dialog-counter">${this.currentDialogIndex + 1}/${this.storyDialogs.length}</span>
                    </div>
                </div>
                <div class="dialog-content">
                    <p>${dialog.content}</p>
                </div>
                <div class="dialog-footer">
                    ${this.currentDialogIndex < this.storyDialogs.length - 1 ?
                '<button class="dialog-btn next-btn">Next</button>' :
                '<button class="dialog-btn close-btn">Start Mission</button>'
            }
                </div>
            </div>
        `;

        document.body.appendChild(dialogElement);

        // Add event listeners
        const nextBtn = dialogElement.querySelector('.next-btn');
        const closeBtn = dialogElement.querySelector('.close-btn');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                dialogElement.remove();
                this.currentDialogIndex++;
                this.showStoryDialog();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                dialogElement.remove();
                this.startGame();
            });
        }
    }

    startGame() {
        this.gameStarted = true;
        this.showNotification('🎮 Mission started! Begin collecting and recycling waste materials.');
    }

    checkMissionCompletion() {
        if (!this.gameStarted || this.missionCompleted) return;

        // Mission completion criteria: create at least 2 different types of products with minimum quantities
        const productTypes = Object.keys(this.products);
        const completedProducts = productTypes.filter(product => this.products[product] >= 3);

        // Check if player has created at least 3 different product types with sufficient quantities
        if (completedProducts.length >= 3) {
            this.missionCompleted = true;
            setTimeout(() => {
                this.showMissionSuccess();
            }, 2000); // Delay to let the last notification show
        }
    }

    handleLivingQuartersClick() {
        console.log('Living Quarters button clicked!');

        // Show living quarters dialogue
        this.showLivingQuartersDialogue();

        this.showNotification('🏠 Entering Living Quarters...');
        this.toggleCanvasBackgroundWithImage('living.png');
        this.markModuleAsClicked('living');
        this.enterInteriorView('living');
        this.switchPanel('crew-section');
        this.showNotification('👨‍🚀 Living Quarters interior view activated');
    }

    handleResearchLabClick() {
        console.log('Research Lab button clicked!');

        // Show research lab dialogue
        this.showResearchLabDialogue();

        this.showNotification('🔬 Entering Research Lab...');
        this.toggleCanvasBackgroundWithImage('research2.png');
        this.markModuleAsClicked('lab');
        this.enterInteriorView('lab');
        this.switchPanel('crew-section');
        this.showNotification('🧪 Research Lab interior view activated');
    }

    handleRecyclingBayClick() {
        console.log('=== RECYCLING BAY CLICKED ===');

        // Show dialogue immediately without other operations that might cause errors
        try {
            this.showRecyclingBayDialogue();
            console.log('Dialogue shown successfully');
        } catch (error) {
            console.error('Error showing dialogue:', error);
        }

        this.showNotification('♻️ Entering Recycling Bay...');
        this.toggleCanvasBackgroundWithImage('mars1.png');
        this.markModuleAsClicked('recycling');
        this.enterInteriorView('recycling');
        this.switchPanel('recycling-options');
        this.showNotification('🔄 Recycling Bay interior view activated');
    }

    handleStorageClick() {
        console.log('Storage button clicked!');

        // Show storage dialogue
        this.showStorageDialogue();

        this.showNotification('📦 Entering Storage...');
        this.toggleCanvasBackgroundWithImage('storage.png');
        this.markModuleAsClicked('storage');
        this.enterInteriorView('storage');
        this.switchPanel('products-inventory');
        this.showNotification('📋 Storage interior view activated');
    }

    handleGreenhouseClick() {
        console.log('Greenhouse button clicked!');

        // Show greenhouse dialogue
        this.showGreenhouseDialogue();

        this.showNotification('🌱 Entering Greenhouse...');
        this.toggleCanvasBackgroundWithImage('greenhouse.png');
        this.markModuleAsClicked('greenhouse');
        this.enterInteriorView('greenhouse');
        this.switchPanel('crew-section');
        this.showNotification('🌿 Greenhouse interior view activated');
    }

    markModuleAsClicked(moduleType) {
        const module = this.modules.find(m => m.type === moduleType);
        if (module) {
            module.clicked = true;
            setTimeout(() => {
                module.clicked = false;
            }, 500);
        }
    }

    restoreCanvasToHabitat() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error('Canvas not found!');
            return;
        }

        // Restore the canvas content (border always stays visible)
        canvas.style.removeProperty('background');  // Remove override to restore original CSS background
        canvas.style.transition = 'background 0.5s ease';
        this.canvasBackgroundHidden = false;

        // Reset to habitat view to show all modules
        this.currentView = 'habitat';
        this.selectedModule = null;
        this.currentInteriorIndex = 0;

        // Hide navigation buttons since we're back to main view
        const navButtons = document.getElementById('canvas-navigation');
        if (navButtons) {
            navButtons.style.display = 'none';
        }

        // Re-render the habitat with all modules
        this.renderHabitat();

        console.log('Canvas restored to habitat view via back button');
        this.showNotification('🏠 Returned to Mars habitat overview');
    }

    toggleCanvasBackground() {
        // Default to living.png for backward compatibility
        this.toggleCanvasBackgroundWithImage('living.png');
    }

    toggleCanvasBackgroundWithImage(imagePath) {
        const canvas = document.getElementById('game-canvas');
        console.log('toggleCanvasBackgroundWithImage called with:', imagePath);
        if (!canvas) {
            console.error('Canvas not found!');
            return;
        }

        // Initialize the property if it doesn't exist
        if (this.canvasBackgroundHidden === undefined) {
            this.canvasBackgroundHidden = false;
        }

        console.log('Current canvas background hidden state:', this.canvasBackgroundHidden);

        // Toggle based on current state
        if (this.canvasBackgroundHidden) {
            // Show the canvas content - restore original Mars habitat background
            canvas.style.removeProperty('background');  // Remove any CSS overrides
            this.canvasBackgroundHidden = false;
            console.log('Showing canvas background');
            this.showNotification('🎨 Canvas background restored');
            // Re-render the habitat (this will clear the image and draw the habitat)
            this.renderHabitat();
        } else {
            // Hide the canvas content and show the specified background image
            this.canvasBackgroundHidden = true;
            this.currentBackgroundImage = imagePath;
            console.log('Hiding canvas background, showing', imagePath);

            // Clear the canvas content first
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Load and draw the specified image directly on the canvas
            const backgroundImage = new Image();
            backgroundImage.onload = () => {
                console.log(imagePath + ' loaded successfully');
                // Draw the image to fill the entire canvas
                this.ctx.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
            };
            backgroundImage.onerror = () => {
                console.error('Failed to load ' + imagePath);
                // Fallback: set a background color based on module type
                const fallbackColors = {
                    'living.png': '#2C3E50',
                    'research2.png': '#1ABC9C',
                    'recycling.png': '#E67E22',
                    'storage.png': '#9B59B6',
                    'greenhouse.png': '#27AE60'
                };
                this.ctx.fillStyle = fallbackColors[imagePath] || '#34495E';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            };
            backgroundImage.src = imagePath;
        }
    }

    handleLivingQuartersTab() {
        // Toggle canvas background when accessing Living Quarters tab
        this.toggleCanvasBackground();

        // Switch to the living quarters panel (if it exists)
        this.switchPanel('living-quarters');

        // Show notification
        this.showNotification('🏠 Living Quarters tab accessed - Background toggled');
    }

    enterInteriorView(moduleType) {
        console.log('Entering interior view for:', moduleType);

        // Set interior view state
        this.currentView = 'interior';
        this.selectedModule = this.modules.find(m => m.type === moduleType);
        this.currentInteriorIndex = 0;

        console.log('Current view set to:', this.currentView);
        console.log('Selected module:', this.selectedModule);

        // Define interior rooms/areas for Living Quarters
        this.interiorAreas = [
            {
                name: 'Crew Quarters',
                description: 'Personal sleeping and rest areas for crew members',
                background: '#2C3E50'
            },
            {
                name: 'Common Area',
                description: 'Shared living space for meals and recreation',
                background: '#34495E'
            },
            {
                name: 'Medical Bay',
                description: 'Basic medical facilities and health monitoring',
                background: '#1ABC9C'
            },
            {
                name: 'Communications Hub',
                description: 'Earth communication and data transmission center',
                background: '#3498DB'
            }
        ];

        // Show navigation buttons
        const navButtons = document.getElementById('canvas-navigation');
        if (navButtons) {
            navButtons.style.display = 'flex';
            console.log('Navigation buttons shown');
        } else {
            console.log('Navigation buttons element not found');
        }



        // Update navigation button states
        this.updateNavigationButtons();

        // Render the interior view
        console.log('About to render habitat with interior view');
        this.renderHabitat();
    }

    exitInteriorView() {
        // Reset to habitat view
        this.currentView = 'habitat';
        this.selectedModule = null;
        this.currentInteriorIndex = 0;

        // Hide navigation buttons
        const navButtons = document.getElementById('canvas-navigation');
        if (navButtons) {
            navButtons.style.display = 'none';
        }



        // Render habitat view
        this.renderHabitat();

        this.showNotification('🏠 Returned to habitat overview');
    }

    navigateInterior(direction) {
        if (!this.interiorAreas || this.currentView !== 'interior') return;

        if (direction === 'next') {
            this.currentInteriorIndex = (this.currentInteriorIndex + 1) % this.interiorAreas.length;
        } else if (direction === 'back') {
            this.currentInteriorIndex = (this.currentInteriorIndex - 1 + this.interiorAreas.length) % this.interiorAreas.length;
        }

        this.updateNavigationButtons();
        this.renderHabitat();

        const currentArea = this.interiorAreas[this.currentInteriorIndex];
        this.showNotification(`📍 ${currentArea.name}: ${currentArea.description}`);
    }

    updateNavigationButtons() {
        const backBtn = document.getElementById('back-btn');
        const nextBtn = document.getElementById('next-btn');

        if (backBtn && nextBtn && this.interiorAreas) {
            // Always enable both buttons for cycling through areas
            backBtn.disabled = false;
            nextBtn.disabled = false;

            // Update button titles for better UX
            const currentArea = this.interiorAreas[this.currentInteriorIndex];
            const prevIndex = (this.currentInteriorIndex - 1 + this.interiorAreas.length) % this.interiorAreas.length;
            const nextIndex = (this.currentInteriorIndex + 1) % this.interiorAreas.length;

            backBtn.title = `Previous: ${this.interiorAreas[prevIndex].name}`;
            nextBtn.title = `Next: ${this.interiorAreas[nextIndex].name}`;
        }
    }

    showMissionSuccess() {
        const dialogElement = document.createElement('div');
        dialogElement.className = 'story-dialog-overlay';

        dialogElement.innerHTML = `
            <div class="story-dialog success-dialog">
                <img src="mar2.png" class="character-image success-character" alt="Mars Astronaut" />
                <div class="dialog-header">
                    <div class="dialog-icon">🏆</div>
                    <div class="dialog-title-section">
                        <h2 class="dialog-title">Mission Successful!</h2>
                        <p class="dialog-speaker">Colony Command</p>
                    </div>
                </div>
                <div class="dialog-content">
                    <p>Congratulations, Commander! Your exceptional recycling operations have secured the colony's future. You have successfully transformed waste into valuable resources, ensuring our survival on Mars.</p>
                    <div class="success-stats">
                        <div class="stat-item">
                            <span class="stat-icon">♻️</span>
                            <span>Materials Recycled</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">🔧</span>
                            <span>Products Created</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">🌟</span>
                            <span>Colony Sustained</span>
                        </div>
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="dialog-btn close-btn">Continue Operations</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialogElement);

        const closeBtn = dialogElement.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            dialogElement.remove();
        });
    }

    // Recycling Bay Scene Dialogue - Three Sequential Dialogues
    showRecyclingBayDialogue() {
        // Initialize dialogue sequence for recycling bay
        this.recyclingDialogueIndex = 0;
        this.recyclingDialogues = [
            {
                title: "Scene 3: Recycling Machine – Turning Trash Into Tools",
                speaker: "Visual Description",
                icon: "🏭",
                content: "Visual: Machine"
            },
            {
                title: "Scene 3: Recycling Machine – Turning Trash Into Tools",
                speaker: "Machine Scientist Dr. Han",
                icon: "👨‍🔬",
                content: "Back on Earth, trash is a problem. Here, it might just get us home."
            },
            {
                title: "Scene 3: Recycling Machine – Turning Trash Into Tools",
                speaker: "Engineer Lira",
                icon: "👩‍🔧",
                content: "Aluminum for structure, plastics for heat-resistant plates, nylon for insulation can help us."
            }
        ];

        this.showRecyclingDialogueStep();
    }

    showRecyclingDialogueStep() {
        if (this.recyclingDialogueIndex >= this.recyclingDialogues.length) {
            return; // All dialogues completed
        }

        const dialogue = this.recyclingDialogues[this.recyclingDialogueIndex];
        const dialogElement = document.createElement('div');

        // Custom styling for smaller recycling bay dialogues
        dialogElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        dialogElement.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #2a2a3e 0%, #1e2a4e 50%, #1a3470 100%);
                border: 2px solid #ff6b35;
                border-radius: 12px;
                width: 70%;
                max-width: 600px;
                height: 180px;
                padding: 15px;
                color: white;
                position: relative;
                box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(255, 107, 53, 0.3); padding-bottom: 10px;">
                    <div style="font-size: 2em; margin-right: 15px;">${dialogue.icon}</div>
                    <div style="flex: 1;">
                        <h3 style="color: #ff6b35; margin: 0; font-size: 1.1em;">${dialogue.title}</h3>
                    </div>
                    <div style="background: rgba(255, 107, 53, 0.2); color: #ff6b35; padding: 4px 8px; border-radius: 4px; font-size: 0.7em; font-weight: bold;">
                        ${this.recyclingDialogueIndex + 1}/${this.recyclingDialogues.length}
                    </div>
                </div>
                <div style="margin-bottom: 15px; line-height: 1.4; font-size: 0.95em;">
                    <p style="margin: 0;">${dialogue.content}</p>
                </div>
                <div style="text-align: center;">
                    <button id="recycling-next-${this.recyclingDialogueIndex}" style="
                        background: linear-gradient(135deg, #ff6b35, #e55a2b);
                        color: white;
                        border: none;
                        padding: 8px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 12px;
                        box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
                    ">${this.recyclingDialogueIndex < this.recyclingDialogues.length - 1 ? 'NEXT' : 'CONTINUE'}</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialogElement);

        const nextBtn = document.getElementById(`recycling-next-${this.recyclingDialogueIndex}`);
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                dialogElement.remove();
                this.recyclingDialogueIndex++;

                // Show next dialogue in sequence
                if (this.recyclingDialogueIndex < this.recyclingDialogues.length) {
                    setTimeout(() => {
                        this.showRecyclingDialogueStep();
                    }, 300);
                }
            });
        }
    }

    // Generic Habitat Module Dialogue System
    showHabitatDialogue(moduleType, dialogues, colorTheme) {
        this.currentDialogueIndex = 0;
        this.currentDialogues = dialogues;
        this.currentColorTheme = colorTheme;
        this.showHabitatDialogueStep();
    }

    showHabitatDialogueStep() {
        if (this.currentDialogueIndex >= this.currentDialogues.length) {
            return; // All dialogues completed
        }

        const dialogue = this.currentDialogues[this.currentDialogueIndex];
        const theme = this.currentColorTheme;
        const dialogElement = document.createElement('div');

        dialogElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        dialogElement.innerHTML = `
            <div style="
                background: linear-gradient(135deg, ${theme.bgGradient});
                border: 2px solid ${theme.borderColor};
                border-radius: 12px;
                width: 70%;
                max-width: 600px;
                height: 180px;
                padding: 15px;
                color: white;
                position: relative;
                box-shadow: 0 0 20px ${theme.shadowColor};
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid ${theme.borderColor}40; padding-bottom: 10px;">
                    <div style="font-size: 2em; margin-right: 15px;">${dialogue.icon}</div>
                    <div style="flex: 1;">
                        <h3 style="color: ${theme.titleColor}; margin: 0; font-size: 1.1em;">${dialogue.title}</h3>
                    </div>
                    <div style="background: ${theme.counterBg}; color: ${theme.counterColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.7em; font-weight: bold;">
                        ${this.currentDialogueIndex + 1}/${this.currentDialogues.length}
                    </div>
                </div>
                <div style="margin-bottom: 15px; line-height: 1.4; font-size: 0.95em;">
                    <p style="margin: 0;">${dialogue.content}</p>
                </div>
                <div style="text-align: center;">
                    <button id="habitat-next-${this.currentDialogueIndex}" style="
                        background: linear-gradient(135deg, ${theme.buttonGradient});
                        color: white;
                        border: none;
                        padding: 8px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 12px;
                        box-shadow: 0 2px 8px ${theme.shadowColor};
                    ">${this.currentDialogueIndex < this.currentDialogues.length - 1 ? 'NEXT' : 'CONTINUE'}</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialogElement);

        const nextBtn = document.getElementById(`habitat-next-${this.currentDialogueIndex}`);
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                dialogElement.remove();
                this.currentDialogueIndex++;

                if (this.currentDialogueIndex < this.currentDialogues.length) {
                    setTimeout(() => {
                        this.showHabitatDialogueStep();
                    }, 300);
                }
            });
        }
    }

    // Living Quarters Dialogue
    showLivingQuartersDialogue() {
        const dialogues = [
            {
                title: "Scene 1: Living Quarters – Home Away From Home",
                icon: "🏠",
                content: "Visual: The crew's personal living space with sleeping quarters and recreation area."
            },
            {
                title: "Scene 1: Living Quarters – Home Away From Home",
                icon: "👨‍🚀",
                content: "Commander Chen: 'This is where we rest, recharge, and remember what we're fighting for.'"
            },
            {
                title: "Scene 1: Living Quarters – Home Away From Home",
                icon: "👩‍🚀",
                content: "Mission Specialist: 'Every comfort here helps us stay human in this alien world.'"
            }
        ];

        const colorTheme = {
            bgGradient: "#2a3e2a 0%, #1e4e2a 50%, #1a7030 100%",
            borderColor: "#4A90E2",
            titleColor: "#4A90E2",
            counterBg: "rgba(74, 144, 226, 0.2)",
            counterColor: "#4A90E2",
            buttonGradient: "#4A90E2, #357ABD",
            shadowColor: "rgba(74, 144, 226, 0.4)"
        };

        this.showHabitatDialogue('living', dialogues, colorTheme);
    }

    // Research Lab Dialogue
    showResearchLabDialogue() {
        const dialogues = [
            {
                title: "Scene 2: Research Lab – Discovery and Innovation",
                icon: "🔬",
                content: "Visual: Advanced scientific equipment and analysis stations."
            },
            {
                title: "Scene 2: Research Lab – Discovery and Innovation",
                icon: "👩‍🔬",
                content: "Dr. Rodriguez: 'Every sample we analyze brings us closer to understanding Mars.'"
            },
            {
                title: "Scene 2: Research Lab – Discovery and Innovation",
                icon: "🧪",
                content: "Lab Assistant: 'The data we collect here could change everything we know about life.'"
            }
        ];

        const colorTheme = {
            bgGradient: "#2a2e3a 0%, #1e2e4a 50%, #1a3070 100%",
            borderColor: "#7ED321",
            titleColor: "#7ED321",
            counterBg: "rgba(126, 211, 33, 0.2)",
            counterColor: "#7ED321",
            buttonGradient: "#7ED321, #6BC91A",
            shadowColor: "rgba(126, 211, 33, 0.4)"
        };

        this.showHabitatDialogue('lab', dialogues, colorTheme);
    }

    // Storage Dialogue
    showStorageDialogue() {
        const dialogues = [
            {
                title: "Scene 4: Storage Facility – Resources and Supplies",
                icon: "📦",
                content: "Visual: Organized storage compartments with essential supplies and equipment."
            },
            {
                title: "Scene 4: Storage Facility – Resources and Supplies",
                icon: "👨‍🔧",
                content: "Supply Manager: 'Every item here is precious. We must use our resources wisely.'"
            },
            {
                title: "Scene 4: Storage Facility – Resources and Supplies",
                icon: "📋",
                content: "Inventory Specialist: 'Proper organization means the difference between success and failure.'"
            }
        ];

        const colorTheme = {
            bgGradient: "#3a2a3e 0%, #4a1e4e 50%, #701a70 100%",
            borderColor: "#9013FE",
            titleColor: "#9013FE",
            counterBg: "rgba(144, 19, 254, 0.2)",
            counterColor: "#9013FE",
            buttonGradient: "#9013FE, #7B1FA2",
            shadowColor: "rgba(144, 19, 254, 0.4)"
        };

        this.showHabitatDialogue('storage', dialogues, colorTheme);
    }

    // Greenhouse Dialogue
    showGreenhouseDialogue() {
        const dialogues = [
            {
                title: "Scene 5: Greenhouse – Life and Growth",
                icon: "🌱",
                content: "Visual: Thriving plants and hydroponic systems providing food and oxygen."
            },
            {
                title: "Scene 5: Greenhouse – Life and Growth",
                icon: "👩‍🌾",
                content: "Biologist Park: 'These plants are our lifeline. They give us food, oxygen, and hope.'"
            },
            {
                title: "Scene 5: Greenhouse – Life and Growth",
                icon: "🌿",
                content: "Agricultural Specialist: 'Every leaf that grows is a victory against the harsh Martian environment.'"
            }
        ];

        const colorTheme = {
            bgGradient: "#2a3e2a 0%, #1e4e2a 50%, #1a5030 100%",
            borderColor: "#50E3C2",
            titleColor: "#50E3C2",
            counterBg: "rgba(80, 227, 194, 0.2)",
            counterColor: "#50E3C2",
            buttonGradient: "#50E3C2, #4DD0E1",
            shadowColor: "rgba(80, 227, 194, 0.4)"
        };

        this.showHabitatDialogue('greenhouse', dialogues, colorTheme);
    }

    // Helper functions for color manipulation
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const factor = (100 - percent) / 100; // Convert to multiplication factor
        const R = Math.floor((num >> 16) * factor);
        const G = Math.floor((num >> 8 & 0x00FF) * factor);
        const B = Math.floor((num & 0x0000FF) * factor);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // Add crew narrative system
    addCrewNarrative() {
        const narratives = [
            "Commander Chen: 'The recycling bay is running efficiently. Great work!'",
            "Dr. Rodriguez: 'We could use more insulation in the greenhouse module.'",
            "Engineer Kim: 'Those new storage containers are perfect for the lab equipment.'",
            "Biologist Park: 'The air recycling system is working beautifully with our new filters.'",
            "Mission Control: 'Sol report looking good. Keep up the innovative recycling!'",
            "Commander Chen: 'Every piece of waste turned into something useful keeps us alive out here.'",
            "Dr. Rodriguez: 'The crew morale is high - nothing like turning trash into treasure!'",
            "Engineer Kim: 'These composite materials are stronger than anything we brought from Earth.'"
        ];

        if (Math.random() < 0.3) { // 30% chance per cycle
            const narrative = narratives[Math.floor(Math.random() * narratives.length)];
            this.showNarrative(narrative);
        }
    }

    showNarrative(message) {
        const notification = document.createElement('div');
        notification.className = 'notification narrative';
        notification.innerHTML = `<strong>📡</strong> ${message}`;

        document.getElementById('notifications').appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Enhanced animation loop
    startAnimationLoop() {
        const animate = () => {
            // Only render habitat if canvas background is not hidden (living quarters mode)
            if (!this.canvasBackgroundHidden) {
                this.renderHabitat();
            }
            requestAnimationFrame(animate);
        };
        animate();
    }

    // Crew management methods
    generateCrewPortraits() {
        const container = document.getElementById('crew-portraits');
        container.innerHTML = '';

        this.crewMembers.forEach(member => {
            const div = document.createElement('div');
            div.className = `crew-member ${member.type}`;
            div.id = `crew-${member.id}`;

            div.innerHTML = `
                <div class="crew-portrait">${member.emoji}</div>
                <div class="crew-name">${member.name}</div>
                <div class="crew-role">${member.role}</div>
                <div class="crew-status" id="status-${member.id}">${member.status}</div>
            `;

            container.appendChild(div);
        });
    }

    updateCrewPortraits() {
        this.crewMembers.forEach(member => {
            const memberElement = document.getElementById(`crew-${member.id}`);
            const statusElement = document.getElementById(`status-${member.id}`);

            if (memberElement && statusElement) {
                // Update status display
                statusElement.textContent = member.status;
                statusElement.className = `crew-status ${member.status}`;

                // Update member element class
                memberElement.className = `crew-member ${member.type} ${member.status}`;
            }
        });
    }

    updateCrewActivities() {
        const activities = {
            commander: [
                'Monitoring systems', 'Reviewing reports', 'Planning operations',
                'Coordinating crew', 'System diagnostics', 'Mission planning'
            ],
            scientist: [
                'Research analysis', 'Data collection', 'Sample testing',
                'Experiment setup', 'Lab maintenance', 'Report writing'
            ],
            engineer: [
                'Equipment maintenance', 'System repairs', 'Tool calibration',
                'Module inspection', 'Power optimization', 'Recycling oversight'
            ],
            biologist: [
                'Greenhouse monitoring', 'Plant cultivation', 'Air quality check',
                'Ecosystem analysis', 'Seed preparation', 'Growth tracking'
            ]
        };

        // Update each crew member's activity
        this.crewMembers.forEach(member => {
            if (member.status === 'active' && activities[member.type]) {
                const memberActivities = activities[member.type];
                const randomActivity = memberActivities[Math.floor(Math.random() * memberActivities.length)];
                member.activity = randomActivity;
                member.lastActivity = Date.now();
            }
        });

        // Update the UI to reflect new activities
        this.updateCrewPortraits();
    }

    generateCrewQuarters() {
        const container = document.getElementById('crew-quarters-list');
        if (!container) return;

        container.innerHTML = '';

        this.crewMembers.forEach(member => {
            const quarterDiv = document.createElement('div');
            quarterDiv.className = 'quarter-item occupied';
            quarterDiv.innerHTML = `
                <div>${member.emoji} ${member.name}</div>
                <div style="font-size: 9px; color: #ccc;">${member.role}</div>
            `;
            container.appendChild(quarterDiv);
        });
    }

    getCrewMemberByName(name) {
        return this.crewMembers.find(member =>
            member.name.toLowerCase() === name.toLowerCase()
        );
    }

    // Enhanced narrative system with crew member context
    addCrewNarrativeEnhanced() {
        const narrativeTemplates = [
            {
                speaker: 'chen', messages: [
                    'The recycling bay is running efficiently. Great work!',
                    'Every piece of waste turned into something useful keeps us alive out here.',
                    'Mission status is green. Keep up the excellent work, team.',
                    'Resource management is critical. Stay focused on efficiency.'
                ]
            },
            {
                speaker: 'rodriguez', messages: [
                    'We could use more insulation in the greenhouse module.',
                    'The crew morale is high - nothing like turning trash into treasure!',
                    'My analysis shows our recycling efficiency has improved 15%.',
                    'The atmospheric readings are stable thanks to our air filters.'
                ]
            },
            {
                speaker: 'kim', messages: [
                    'Those new storage containers are perfect for the lab equipment.',
                    'These composite materials are stronger than anything we brought from Earth.',
                    'I\'ve optimized the recycling systems for better power efficiency.',
                    'The fabrication units are running at peak performance.'
                ]
            },
            {
                speaker: 'park', messages: [
                    'The air recycling system is working beautifully with our new filters.',
                    'Plant growth has increased 20% with the improved growing medium.',
                    'The ecosystem balance is perfect - our waste-to-resource cycle is working.',
                    'Oxygen production is up thanks to the enhanced plant containers.'
                ]
            }
        ];

        if (Math.random() < 0.3) {
            const template = narrativeTemplates[Math.floor(Math.random() * narrativeTemplates.length)];
            const message = template.messages[Math.floor(Math.random() * template.messages.length)];
            const speaker = this.getCrewMemberByName(template.speaker);

            if (speaker) {
                // Temporarily highlight the speaking crew member
                this.highlightCrewMember(speaker.id);
                this.showNarrative(`${speaker.name}: "${message}"`);
            }
        }
    }

    highlightCrewMember(memberId) {
        const memberElement = document.getElementById(`crew-${memberId}`);
        if (memberElement) {
            memberElement.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.6)';
            memberElement.style.transform = 'scale(1.05)';

            setTimeout(() => {
                memberElement.style.boxShadow = '';
                memberElement.style.transform = '';
            }, 3000);
        }
    }

    drawCrewInModules() {
        const time = Date.now() * 0.002;

        // Assign crew members to modules based on their roles
        const crewAssignments = [
            { member: this.crewMembers[0], module: this.modules[0] }, // Commander in Living Quarters
            { member: this.crewMembers[1], module: this.modules[1] }, // Scientist in Lab
            { member: this.crewMembers[2], module: this.modules[2] }, // Engineer in Recycling Bay
            { member: this.crewMembers[3], module: this.modules[4] }  // Biologist in Greenhouse
        ];

        crewAssignments.forEach((assignment, index) => {
            const { member, module } = assignment;

            // Calculate crew member position with slight movement
            const centerX = module.x + module.width / 2;
            const centerY = module.y + module.height / 2;
            const offsetX = Math.sin(time + index) * 3;
            const offsetY = Math.cos(time + index * 0.7) * 2;

            // Draw crew member as a small animated figure
            this.ctx.save();

            // Body
            this.ctx.fillStyle = this.getCrewColor(member.type);
            this.ctx.shadowColor = this.getCrewColor(member.type);
            this.ctx.shadowBlur = 5;
            this.ctx.beginPath();
            this.ctx.arc(centerX + offsetX, centerY + offsetY, 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Helmet glow
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(centerX + offsetX, centerY + offsetY, 5, 0, Math.PI * 2);
            this.ctx.stroke();

            // Activity indicator
            if (member.status === 'busy') {
                this.ctx.fillStyle = '#FFA500';
                this.ctx.beginPath();
                this.ctx.arc(centerX + offsetX + 6, centerY + offsetY - 6, 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (member.status === 'critical') {
                this.ctx.fillStyle = '#FF4444';
                this.ctx.beginPath();
                this.ctx.arc(centerX + offsetX + 6, centerY + offsetY - 6, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        });
    }

    getCrewColor(type) {
        const colors = {
            commander: '#FFD700',
            scientist: '#7ED321',
            engineer: '#F5A623',
            biologist: '#50E3C2'
        };
        return colors[type] || '#00BFFF';
    }

    // Sidebar panel switching functionality
    switchPanel(panelId) {
        const controlPanel = document.getElementById('control-panel');

        // If sidebar is collapsed, expand it when switching panels
        if (controlPanel.classList.contains('collapsed')) {
            controlPanel.classList.remove('collapsed');
        }

        // Remove active class from all nav items and panels
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Add active class to selected nav item and panel
        const navItem = document.querySelector(`[data-panel="${panelId}"]`);
        const panel = document.getElementById(panelId);

        if (navItem && panel) {
            navItem.classList.add('active');
            panel.classList.add('active');

            // Show notification about panel switch
            const panelNames = {
                'crew-section': 'Crew Status',
                'waste-inventory': 'Waste Inventory',
                'recycling-options': 'Recycling Systems',
                'products-inventory': 'Products',
                'background-controls': 'Background Settings',
                'living-quarters': 'Living Quarters',
                'research-lab': 'Research Lab',
                'storage-facility': 'Storage Facility',
                'greenhouse-module': 'Greenhouse Module'
            };

            this.showNotification(`📋 Switched to: ${panelNames[panelId]}`);
        }
    }

    // Toggle sidebar visibility
    toggleSidebar() {
        const controlPanel = document.getElementById('control-panel');
        controlPanel.classList.toggle('collapsed');

        if (controlPanel.classList.contains('collapsed')) {
            this.showNotification('📋 Sidebar collapsed');
        } else {
            this.showNotification('📋 Sidebar expanded');
        }
    }

    // Handle canvas clicks for module selection
    handleCanvasClick(event) {
        if (this.currentView === 'interior') {
            // If in interior view, return to habitat view
            this.currentView = 'habitat';
            this.selectedModule = null;
            this.showNotification('🏠 Returned to habitat overview');
            this.renderHabitat();
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // Check if click is within any module bounds
        console.log('Canvas clicked at:', x, y);
        for (let module of this.modules) {
            console.log('Checking module:', module.name, 'bounds:', module.x, module.y, module.width, module.height);
            if (x >= module.x && x <= module.x + module.width &&
                y >= module.y && y <= module.y + module.height) {

                console.log('Module clicked:', module.name, module.type);
                // Special handling for each module type - toggle canvas background
                if (module.type === 'living') {
                    this.handleLivingQuartersClick();
                    break;
                } else if (module.type === 'lab') {
                    this.handleResearchLabClick();
                    break;
                } else if (module.type === 'recycling') {
                    console.log('Calling handleRecyclingBayClick');
                    this.handleRecyclingBayClick();
                    break;
                } else if (module.type === 'storage') {
                    this.handleStorageClick();
                    break;
                } else if (module.type === 'greenhouse') {
                    this.handleGreenhouseClick();
                    break;
                }

                // Switch to the corresponding panel based on module type
                this.switchToModulePanel(module);
                break;
            }
        }
    }

    // Switch to panel based on clicked module
    switchToModulePanel(module) {
        // Add click animation effect
        this.triggerModuleClickEffect(module);

        if (module.type === 'living') {
            // Special handling for Living Quarters - hide control panel content
            this.toggleLivingQuartersView();
            this.showNotification(`🏠 Accessed ${module.name}`);
        } else {
            // Handle other modules normally
            const modulePanelMap = {
                'lab': 'research-lab',
                'recycling': 'recycling-options',
                'storage': 'storage-facility',
                'greenhouse': 'greenhouse-module'
            };

            const panelId = modulePanelMap[module.type];
            if (panelId) {
                this.switchPanel(panelId);
                this.showNotification(`🏠 Accessed ${module.name}`);
            }
        }
    }



    // Handle canvas hover for module highlighting
    handleCanvasHover(event) {
        // Skip if not in habitat view or if canvas background is hidden (living quarters mode)
        if (this.currentView !== 'habitat' || this.canvasBackgroundHidden) {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        let hoveredModule = null;

        // Check if mouse is over any module
        for (let module of this.modules) {
            const isHovered = x >= module.x && x <= module.x + module.width &&
                y >= module.y && y <= module.y + module.height;

            if (isHovered) {
                hoveredModule = module;
                break;
            }
        }

        // Update hover states
        let needsRedraw = false;
        for (let module of this.modules) {
            const wasHovered = module.hovered;
            module.hovered = (module === hoveredModule);

            if (wasHovered !== module.hovered) {
                needsRedraw = true;
            }
        }

        if (hoveredModule && hoveredModule.type === 'living') {
            this.canvas.style.cursor = 'pointer'; // Show pointer for clickable Living Quarters
        } else {
            // Change cursor style for other modules
            if (hoveredModule) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }

        // Redraw if hover state changed
        if (needsRedraw && !this.canvasBackgroundHidden) {
            this.renderHabitat();
        }
    }

    // Clear all hover states
    clearAllHoverStates() {
        let needsRedraw = false;
        for (let module of this.modules) {
            if (module.hovered) {
                module.hovered = false;
                needsRedraw = true;
            }
        }



        this.canvas.style.cursor = 'default';

        if (needsRedraw && !this.canvasBackgroundHidden) {
            this.renderHabitat();
        }
    }

    // Draw tooltip for hovered module
    drawModuleTooltip(module) {
        const tooltipText = this.getModuleTooltipText(module);
        const tooltipX = module.x + module.width + 10;
        const tooltipY = module.y - 10;
        const padding = 8;

        // Measure text
        this.ctx.font = '12px monospace';
        const textMetrics = this.ctx.measureText(tooltipText);
        const tooltipWidth = textMetrics.width + padding * 2;
        const tooltipHeight = 25;

        // Draw tooltip background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

        // Draw tooltip border
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

        // Draw tooltip text
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(tooltipText, tooltipX + padding, tooltipY + 16);
    }

    // Get tooltip text for module
    getModuleTooltipText(module) {
        const tooltips = {
            'living': 'Click to manage crew quarters',
            'lab': 'Click to access research facilities',
            'recycling': 'Click to process waste materials',
            'storage': 'Click to view inventory storage',
            'greenhouse': 'Click to tend to crops'
        };
        return tooltips[module.type] || 'Click to interact';
    }

    // Greenhouse functionality
    harvestCrop(cropType) {
        this.showNotification(`🌱 Harvested ${cropType}! Added to food supplies.`);
        // Add to products or create food inventory
        if (!this.products.food) this.products.food = 0;
        this.products.food += Math.floor(Math.random() * 3) + 2;
        this.updateUI();
    }

    // Background image methods
    loadBackgroundImage(imagePath) {
        this.backgroundImage = new Image();
        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true;
            console.log('Background image loaded successfully');
        };
        this.backgroundImage.onerror = () => {
            console.log('Failed to load background image, using default gradient');
            this.backgroundLoaded = false;
        };
        this.backgroundImage.src = imagePath;
    }

    drawBackgroundImage() {
        if (this.backgroundLoaded && this.backgroundImage) {
            // Draw the background image to fit the canvas
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);

            // Add atmospheric overlay to blend with game elements
            const overlay = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            overlay.addColorStop(0, 'rgba(230, 184, 138, 0.1)');
            overlay.addColorStop(0.3, 'rgba(196, 149, 107, 0.05)');
            overlay.addColorStop(0.7, 'rgba(139, 69, 19, 0.1)');
            overlay.addColorStop(1, 'rgba(101, 67, 33, 0.2)');

            this.ctx.fillStyle = overlay;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // Method to change background image dynamically
    changeBackground(imagePath) {
        this.loadBackgroundImage(imagePath);
    }

    // Method to apply filters to background
    applyBackgroundFilter(filterType = 'mars') {
        const filters = {
            mars: 'sepia(0.8) saturate(1.2) hue-rotate(15deg) brightness(0.9)',
            dust: 'sepia(0.6) saturate(0.8) blur(0.5px) brightness(0.8)',
            storm: 'sepia(0.9) saturate(1.5) hue-rotate(25deg) brightness(0.7) contrast(1.2)',
            clear: 'sepia(0.3) saturate(1.1) brightness(1.1)',
            night: 'sepia(0.7) saturate(0.6) brightness(0.4) hue-rotate(200deg)'
        };

        this.canvas.style.filter = filters[filterType] || filters.mars;
        this.showNotification(`🌍 Atmosphere changed to: ${filterType}`);
    }

    // Setup background controls
    setupBackgroundControls() {
        const uploadInput = document.getElementById('background-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.loadBackgroundImage(e.target.result);
                        this.showNotification('🖼️ Background image uploaded successfully!');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // Load preset backgrounds (you can add actual image URLs here)
    loadPresetBackground(preset) {
        const presets = {
            rover: 'mars-landscape.jpg', // The Mars rover landscape image
            mars1: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#E6B88A"/>
                            <stop offset="30%" style="stop-color:#D2A679"/>
                            <stop offset="60%" style="stop-color:#C4956B"/>
                            <stop offset="100%" style="stop-color:#B8845D"/>
                        </linearGradient>
                        <linearGradient id="ground" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#A67C52"/>
                            <stop offset="50%" style="stop-color:#8B4513"/>
                            <stop offset="100%" style="stop-color:#654321"/>
                        </linearGradient>
                    </defs>
                    <rect width="800" height="350" fill="url(#sky)"/>
                    <rect y="350" width="800" height="250" fill="url(#ground)"/>
                    <polygon points="0,300 150,250 300,280 450,240 600,270 800,250 800,350 0,350" fill="#8B4513" opacity="0.8"/>
                    <circle cx="150" cy="320" r="8" fill="#654321"/>
                    <circle cx="400" cy="340" r="12" fill="#654321"/>
                    <circle cx="650" cy="330" r="6" fill="#654321"/>
                </svg>
            `),
            mars2: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="crater" cx="50%" cy="40%" r="60%">
                            <stop offset="0%" style="stop-color:#654321"/>
                            <stop offset="70%" style="stop-color:#8B4513"/>
                            <stop offset="100%" style="stop-color:#A67C52"/>
                        </radialGradient>
                    </defs>
                    <rect width="800" height="600" fill="#C4956B"/>
                    <ellipse cx="400" cy="400" rx="300" ry="150" fill="url(#crater)"/>
                    <ellipse cx="400" cy="400" rx="200" ry="100" fill="#654321"/>
                    <circle cx="200" cy="200" r="20" fill="#8B4513"/>
                    <circle cx="600" cy="150" r="15" fill="#8B4513"/>
                </svg>
            `),
            mars3: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="desert" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#E6B88A"/>
                            <stop offset="100%" style="stop-color:#8B4513"/>
                        </linearGradient>
                    </defs>
                    <rect width="800" height="600" fill="url(#desert)"/>
                    <path d="M0,400 Q200,350 400,380 T800,370 L800,600 L0,600 Z" fill="#A67C52"/>
                    <path d="M0,450 Q300,420 600,440 T800,430 L800,600 L0,600 Z" fill="#8B4513"/>
                    <ellipse cx="100" cy="500" rx="30" ry="8" fill="#654321" opacity="0.6"/>
                    <ellipse cx="500" cy="480" rx="40" ry="10" fill="#654321" opacity="0.6"/>
                    <ellipse cx="700" cy="520" rx="25" ry="6" fill="#654321" opacity="0.6"/>
                </svg>
            `)
        };

        if (presets[preset]) {
            this.loadBackgroundImage(presets[preset]);
            this.showNotification(`🏔️ Loaded preset: ${preset}`);
        }
    }



    // Render module interior view
    renderModuleInterior(module) {
        console.log('renderModuleInterior called for module:', module);

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Get current interior area
        const currentArea = this.interiorAreas ? this.interiorAreas[this.currentInteriorIndex] : null;
        console.log('Current area:', currentArea);

        // Draw interior background based on current area
        this.drawInteriorAreaBackground(currentArea);

        // Draw interior elements based on module type and current area
        switch (module.type) {
            case 'living':
                console.log('Drawing living quarters interior');
                this.drawLivingQuartersInterior(currentArea);
                break;
            case 'lab':
                this.drawResearchLabInterior(currentArea);
                break;
            case 'recycling':
                this.drawRecyclingBayInterior(currentArea);
                break;
            case 'storage':
                this.drawStorageInterior(currentArea);
                break;
            case 'greenhouse':
                this.drawGreenhouseInterior(currentArea);
                break;
        }

        // Draw area title and description
        this.drawAreaInfo(currentArea);
    }

    drawAreaInfo(area) {
        if (!area) return;

        // Draw semi-transparent overlay for text
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 20, this.canvas.width - 40, 80);

        // Draw border
        this.ctx.strokeStyle = '#00BFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(20, 20, this.canvas.width - 40, 80);

        // Draw area name
        this.ctx.fillStyle = '#00BFFF';
        this.ctx.font = 'bold 24px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(area.name, this.canvas.width / 2, 50);

        // Draw area description
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(area.description, this.canvas.width / 2, 75);

        // Draw navigation indicator
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${this.currentInteriorIndex + 1} / ${this.interiorAreas.length}`, this.canvas.width - 30, 90);
    }

    drawInteriorAreaBackground(area) {
        // Draw interior walls with area-specific colors
        const baseColor = area ? area.background : '#2C3E50';
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, this.darkenColor(baseColor, 20));
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw floor
        this.ctx.fillStyle = '#7F8C8D';
        this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);

        // Draw floor grid pattern
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.canvas.height - 100);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = this.canvas.height - 100; i < this.canvas.height; i += 25) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        // Draw ceiling lights
        for (let i = 100; i < this.canvas.width; i += 200) {
            this.ctx.fillStyle = '#F39C12';
            this.ctx.shadowColor = '#F39C12';
            this.ctx.shadowBlur = 20;
            this.ctx.fillRect(i, 20, 60, 10);
            this.ctx.shadowBlur = 0;
        }

        // Module title
        this.ctx.fillStyle = '#ECF0F1';
        this.ctx.font = 'bold 24px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(module.name, this.canvas.width / 2, 60);
    }

    drawLivingQuartersInterior(area) {
        if (!area) return;

        switch (area.name) {
            case 'Crew Quarters':
                // Draw beds
                for (let i = 0; i < 4; i++) {
                    const x = 100 + (i % 2) * 300;
                    const y = 150 + Math.floor(i / 2) * 150;

                    this.ctx.fillStyle = '#8E44AD';
                    this.ctx.fillRect(x, y, 120, 60);
                    this.ctx.fillStyle = '#9B59B6';
                    this.ctx.fillRect(x + 10, y + 10, 100, 40);
                }

                // Draw personal lockers
                this.ctx.fillStyle = '#34495E';
                this.ctx.fillRect(50, 200, 40, 100);
                this.ctx.fillRect(550, 200, 40, 100);
                this.ctx.fillRect(50, 350, 40, 100);
                this.ctx.fillRect(550, 350, 40, 100);
                break;

            case 'Common Area':
                // Draw dining table
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(250, 250, 300, 100);

                // Draw chairs
                for (let i = 0; i < 6; i++) {
                    const x = 200 + (i % 3) * 150;
                    const y = 200 + Math.floor(i / 3) * 200;
                    this.ctx.fillStyle = '#654321';
                    this.ctx.fillRect(x, y, 40, 40);
                }

                // Draw entertainment screen
                this.ctx.fillStyle = '#2C3E50';
                this.ctx.fillRect(100, 100, 200, 120);
                this.ctx.fillStyle = '#3498DB';
                this.ctx.fillRect(110, 110, 180, 100);
                break;

            case 'Medical Bay':
                // Draw medical bed
                this.ctx.fillStyle = '#E8F8F5';
                this.ctx.fillRect(200, 200, 150, 80);
                this.ctx.fillStyle = '#D5DBDB';
                this.ctx.fillRect(210, 210, 130, 60);

                // Draw medical equipment
                this.ctx.fillStyle = '#1ABC9C';
                this.ctx.fillRect(400, 150, 80, 100);
                this.ctx.fillRect(500, 180, 60, 70);

                // Draw medical cabinet
                this.ctx.fillStyle = '#BDC3C7';
                this.ctx.fillRect(100, 150, 80, 120);
                break;

            case 'Communications Hub':
                // Draw communication consoles
                this.ctx.fillStyle = '#2C3E50';
                this.ctx.fillRect(150, 200, 120, 80);
                this.ctx.fillRect(350, 200, 120, 80);
                this.ctx.fillRect(550, 200, 120, 80);

                // Draw screens
                this.ctx.fillStyle = '#3498DB';
                this.ctx.fillRect(160, 160, 100, 60);
                this.ctx.fillRect(360, 160, 100, 60);
                this.ctx.fillRect(560, 160, 100, 60);

                // Draw antenna indicator
                this.ctx.fillStyle = '#E74C3C';
                this.ctx.beginPath();
                this.ctx.arc(400, 100, 20, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
    }

    drawResearchLabInterior() {
        // Draw lab benches
        this.ctx.fillStyle = '#95A5A6';
        this.ctx.fillRect(100, 200, 600, 80);
        this.ctx.fillRect(100, 350, 600, 80);

        // Draw equipment
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillRect(150, 150, 60, 50);
        this.ctx.fillRect(300, 150, 80, 50);
        this.ctx.fillRect(450, 150, 70, 50);

        // Draw screens
        this.ctx.fillStyle = '#27AE60';
        this.ctx.fillRect(160, 160, 40, 30);
        this.ctx.fillRect(310, 160, 60, 30);
        this.ctx.fillRect(460, 160, 50, 30);
    }

    drawRecyclingBayInterior() {
        // Draw recycling machines
        this.ctx.fillStyle = '#E67E22';
        this.ctx.fillRect(100, 200, 100, 120);
        this.ctx.fillRect(300, 200, 100, 120);
        this.ctx.fillRect(500, 200, 100, 120);

        // Draw conveyor belts
        this.ctx.fillStyle = '#7F8C8D';
        this.ctx.fillRect(50, 350, 700, 30);

        // Draw processing indicators
        const time = Date.now() * 0.005;
        for (let i = 0; i < 3; i++) {
            const x = 150 + i * 200;
            const glow = (Math.sin(time + i) + 1) * 0.5;
            this.ctx.fillStyle = `rgba(255, 165, 0, ${0.5 + glow * 0.5})`;
            this.ctx.fillRect(x, 180, 100, 20);
        }
    }

    drawStorageInterior() {
        // Draw storage shelves
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                const x = 100 + col * 150;
                const y = 150 + row * 120;

                this.ctx.fillStyle = '#95A5A6';
                this.ctx.fillRect(x, y, 120, 80);

                // Draw stored items
                this.ctx.fillStyle = '#3498DB';
                this.ctx.fillRect(x + 10, y + 10, 30, 30);
                this.ctx.fillStyle = '#E74C3C';
                this.ctx.fillRect(x + 50, y + 10, 30, 30);
                this.ctx.fillStyle = '#F39C12';
                this.ctx.fillRect(x + 10, y + 45, 30, 25);
            }
        }
    }

    drawGreenhouseInterior() {
        // Draw growing beds
        this.ctx.fillStyle = '#8B4513';
        for (let i = 0; i < 6; i++) {
            const x = 80 + (i % 3) * 200;
            const y = 200 + Math.floor(i / 3) * 150;
            this.ctx.fillRect(x, y, 160, 80);

            // Draw plants
            this.ctx.fillStyle = '#27AE60';
            for (let j = 0; j < 8; j++) {
                const plantX = x + 20 + (j % 4) * 30;
                const plantY = y + 20 + Math.floor(j / 4) * 30;
                this.ctx.beginPath();
                this.ctx.arc(plantX, plantY, 8, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw irrigation system
        this.ctx.strokeStyle = '#3498DB';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(50, 100);
        this.ctx.lineTo(750, 100);
        this.ctx.moveTo(200, 100);
        this.ctx.lineTo(200, 450);
        this.ctx.moveTo(400, 100);
        this.ctx.lineTo(400, 450);
        this.ctx.moveTo(600, 100);
        this.ctx.lineTo(600, 450);
        this.ctx.stroke();
    }

    drawExitButton() {
        // Draw exit button
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.fillRect(this.canvas.width - 100, 20, 80, 40);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 14px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('EXIT', this.canvas.width - 60, 45);
    }
}

// Initialize game when page loads
let game;
window.addEventListener('load', () => {
    game = new MarsRecyclingGame();
});