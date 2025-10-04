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

        // Habitat modules for canvas rendering
        this.modules = [
            { x: 100, y: 100, width: 150, height: 100, type: 'living', name: 'Living Quarters' },
            { x: 300, y: 100, width: 150, height: 100, type: 'lab', name: 'Research Lab' },
            { x: 500, y: 100, width: 150, height: 100, type: 'recycling', name: 'Recycling Bay' },
            { x: 200, y: 250, width: 150, height: 100, type: 'storage', name: 'Storage' },
            { x: 400, y: 250, width: 150, height: 100, type: 'greenhouse', name: 'Greenhouse' }
        ];

        this.initializeStoryDialogs();
        this.init();
    }

    init() {
        this.updateUI();
        this.renderHabitat();

        // Show story dialog on game start
        setTimeout(() => {
            this.showStoryDialog();
        }, 1000);
        this.generateRecyclingOptions();
        this.createAtmosphericEffects();
        this.generateCrewPortraits();
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
        this.ctx.lineTo(800, 185);
        this.ctx.lineTo(800, 220);
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
        this.ctx.lineTo(800, 235);
        this.ctx.lineTo(800, 300);
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
        this.ctx.lineTo(800, 285);
        this.ctx.lineTo(800, 350);
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
            { x: 50, y: 340, width: 25, height: 15 },
            { x: 300, y: 355, width: 18, height: 12 },
            { x: 550, y: 345, width: 22, height: 18 },
            { x: 720, y: 350, width: 20, height: 14 }
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
        moduleGradient.addColorStop(0, baseColor);
        moduleGradient.addColorStop(0.5, this.lightenColor(baseColor, 20));
        moduleGradient.addColorStop(1, this.darkenColor(baseColor, 20));

        this.ctx.fillStyle = moduleGradient;
        this.ctx.fillRect(module.x, module.y, module.width, module.height);

        // Module border with glow effect
        this.ctx.strokeStyle = '#00BFFF';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#00BFFF';
        this.ctx.shadowBlur = 10;
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

        // Module label with futuristic font
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 11px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 3;
        this.ctx.fillText(module.name, module.x + module.width / 2, module.y + module.height / 2 + 4);
        this.ctx.shadowBlur = 0;

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

        // Outer tube
        this.ctx.beginPath();
        this.ctx.moveTo(250, 150);
        this.ctx.lineTo(300, 150);
        this.ctx.moveTo(450, 150);
        this.ctx.lineTo(500, 150);
        this.ctx.moveTo(275, 200);
        this.ctx.lineTo(275, 250);
        this.ctx.moveTo(350, 250);
        this.ctx.lineTo(400, 250);
        this.ctx.stroke();

        // Inner glow
        this.ctx.strokeStyle = '#00BFFF';
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = '#00BFFF';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(250, 150);
        this.ctx.lineTo(300, 150);
        this.ctx.moveTo(450, 150);
        this.ctx.lineTo(500, 150);
        this.ctx.moveTo(275, 200);
        this.ctx.lineTo(275, 250);
        this.ctx.moveTo(350, 250);
        this.ctx.lineTo(400, 250);
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
        this.ctx.arc(400, 300, 280, Math.PI, 0);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Shimmer effect
        const time = Date.now() * 0.003;
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI / 6) * i + time;
            const x = 400 + Math.cos(angle) * 280;
            const y = 300 + Math.sin(angle) * 280;

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
        // Floating dust particles
        const time = Date.now() * 0.001;
        for (let i = 0; i < 15; i++) {
            const x = (i * 50 + Math.sin(time + i) * 20) % this.canvas.width;
            const y = 100 + Math.cos(time + i * 0.5) * 30;
            const opacity = 0.1 + Math.sin(time + i) * 0.1;

            this.ctx.fillStyle = `rgba(205, 133, 63, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1 + Math.sin(time + i) * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
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
            this.renderHabitat();
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
                'background-controls': 'Background Settings'
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
}

// Initialize game when page loads
let game;
window.addEventListener('load', () => {
    game = new MarsRecyclingGame();
});