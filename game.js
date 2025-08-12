// Shadow Escape - 2D Horror Arcade Game
// Complete Game Implementation

class Game {    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, paused, gameOver, victory
        this.currentLevel = 1;
        this.maxLevels = 3;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.keys = [];
        this.walls = [];
        this.exit = null;
        this.particles = [];
        
        // Input handling
        this.keys_pressed = {};
        
        // Game settings
        this.playerHealth = 100;
        this.maxHealth = 100;
        this.keysCollected = 0;
        this.totalKeys = 3;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Visual effects
        this.screenShake = 0;
        this.flashEffect = 0;
        
        this.initializeEventListeners();
        this.initializeScreens();
    }    initializeEventListeners() {
        // Menu buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('instructions-btn').addEventListener('click', () => this.showInstructions());
        document.getElementById('close-dialog').addEventListener('click', () => this.hideInstructions());
        
        // Game buttons
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.showMainMenu());
        
        // Game over buttons
        document.getElementById('try-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.showMainMenu());
        
        // Victory buttons
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('victory-menu-btn').addEventListener('click', () => this.showMainMenu());
          // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys_pressed[e.code] = true;
            if (e.code === 'Escape' && this.gameState === 'playing') {
                this.pauseGame();
            }
            // Close instructions dialog with ESC key
            if (e.code === 'Escape' && !document.getElementById('instructions-dialog').classList.contains('hidden')) {
                this.hideInstructions();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys_pressed[e.code] = false;
        });

        // Close dialog when clicking outside the content
        document.getElementById('instructions-dialog').addEventListener('click', (e) => {
            if (e.target === document.getElementById('instructions-dialog')) {
                this.hideInstructions();
            }
        });
    }    initializeScreens() {
        this.showScreen('menu-screen');
        // Ensure instructions dialog is hidden by default
        document.getElementById('instructions-dialog').classList.add('hidden');
    }showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }    showInstructions() {
        document.getElementById('instructions-dialog').classList.remove('hidden');
    }

    hideInstructions() {
        document.getElementById('instructions-dialog').classList.add('hidden');
    }

    startGame() {
        this.gameState = 'playing';
        this.currentLevel = 1;
        this.playerHealth = this.maxHealth;
        this.showScreen('game-screen');
        this.loadLevel(this.currentLevel);
        this.updateTheme();
        this.gameLoop();
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showScreen('pause-screen');
        }
    }

    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showScreen('game-screen');
            this.gameLoop();
        }
    }

    restartGame() {
        this.currentLevel = 1;
        this.playerHealth = this.maxHealth;
        this.gameState = 'playing';
        this.showScreen('game-screen');
        this.loadLevel(this.currentLevel);
        this.updateTheme();
        this.gameLoop();
    }    showMainMenu() {
        this.gameState = 'menu';
        this.showScreen('menu-screen');
        document.body.className = ''; // Reset theme
    }

    updateTheme() {
        document.body.className = `theme-level${this.currentLevel}`;
        
        // Update canvas border and UI elements dynamically
        const canvas = document.getElementById('game-canvas');
        const colors = {
            1: '#e94560', // Level 1 accent
            2: '#7dd87d', // Level 2 accent  
            3: '#ff4757'  // Level 3 accent
        };
        canvas.style.borderColor = colors[this.currentLevel];
    }

    loadLevel(levelNumber) {
        // Clear previous level
        this.enemies = [];
        this.keys = [];
        this.walls = [];
        this.particles = [];
        this.keysCollected = 0;
        
        // Update UI
        document.getElementById('level-text').textContent = `Level ${levelNumber}`;
        document.getElementById('keys-count').textContent = `0/${this.totalKeys}`;
        
        // Create player
        this.player = new Player(100, 100);
        
        // Level-specific generation
        switch(levelNumber) {
            case 1:
                this.generateLevel1();
                break;
            case 2:
                this.generateLevel2();
                break;
            case 3:
                this.generateLevel3();
                break;
        }
        
        this.updateHealthBar();
    }

    generateLevel1() {
        // Office Building Theme - Simple layout for tutorial
        this.createWalls([
            // Outer walls
            {x: 0, y: 0, width: 800, height: 20},
            {x: 0, y: 580, width: 800, height: 20},
            {x: 0, y: 0, width: 20, height: 600},
            {x: 780, y: 0, width: 20, height: 600},
            
            // Office cubicles
            {x: 200, y: 150, width: 150, height: 20},
            {x: 450, y: 150, width: 150, height: 20},
            {x: 200, y: 300, width: 150, height: 20},
            {x: 450, y: 300, width: 150, height: 20},
            {x: 300, y: 450, width: 200, height: 20}
        ]);
          // 2 Enemies - simple patrol
        this.enemies.push(new Enemy(400, 200, 'patrol', [{x: 350, y: 200}, {x: 450, y: 200}]));
        this.enemies.push(new Enemy(300, 400, 'patrol', [{x: 250, y: 400}, {x: 350, y: 400}]));
        
        // Place keys randomly but safely
        this.placeRandomKeys(3);
        
        // Exit
        this.exit = new Exit(700, 500);
    }

    generateLevel2() {
        // Hospital Theme - Maze-like structure
        this.createWalls([
            // Outer walls
            {x: 0, y: 0, width: 800, height: 20},
            {x: 0, y: 580, width: 800, height: 20},
            {x: 0, y: 0, width: 20, height: 600},
            {x: 780, y: 0, width: 20, height: 600},
            
            // Hospital corridors and rooms
            {x: 150, y: 100, width: 20, height: 200},
            {x: 300, y: 80, width: 20, height: 150},
            {x: 450, y: 120, width: 20, height: 180},
            {x: 600, y: 100, width: 20, height: 200},
            {x: 100, y: 350, width: 200, height: 20},
            {x: 400, y: 380, width: 200, height: 20},
            {x: 250, y: 480, width: 300, height: 20}
        ]);
          // 4 Enemies - more complex AI
        this.enemies.push(new Enemy(200, 150, 'chase'));
        this.enemies.push(new Enemy(350, 250, 'patrol', [{x: 320, y: 250}, {x: 380, y: 250}]));
        this.enemies.push(new Enemy(500, 180, 'guard'));
        this.enemies.push(new Enemy(400, 450, 'chase'));
        
        // Place keys randomly but safely
        this.placeRandomKeys(3);
        
        // Exit
        this.exit = new Exit(700, 50);
    }    generateLevel3() {
        // Underground Theme - Better spaced layout to prevent getting stuck
        this.createWalls([
            // Outer walls
            {x: 0, y: 0, width: 800, height: 20},
            {x: 0, y: 580, width: 800, height: 20},
            {x: 0, y: 0, width: 20, height: 600},
            {x: 780, y: 0, width: 20, height: 600},
            
            // Underground tunnel system - Improved spacing
            {x: 140, y: 140, width: 60, height: 20},   // Moved away from corners
            {x: 300, y: 200, width: 20, height: 60},   // Shorter walls
            {x: 400, y: 120, width: 60, height: 20},   // Better spacing
            {x: 540, y: 160, width: 20, height: 100},  // Away from edges
            {x: 640, y: 240, width: 60, height: 20},   
            {x: 200, y: 340, width: 100, height: 20},  
            {x: 440, y: 400, width: 20, height: 60},   
            {x: 600, y: 440, width: 100, height: 20},  
            {x: 240, y: 520, width: 140, height: 20}   // Moved from bottom edge
        ]);
          // 6 Enemies - positioned strategically but not near spawn
        this.enemies.push(new Enemy(180, 180, 'chase'));
        this.enemies.push(new Enemy(460, 240, 'chase'));
        this.enemies.push(new Enemy(340, 400, 'patrol', [{x: 320, y: 400}, {x: 360, y: 400}]));
        this.enemies.push(new Enemy(670, 340, 'guard'));
        this.enemies.push(new Enemy(300, 540, 'chase'));
        this.enemies.push(new Enemy(700, 540, 'chase'));
        
        // Place keys randomly but safely
        this.placeRandomKeys(3);
        
        // Exit in top corner but accessible
        this.exit = new Exit(60, 60);
    }    createWalls(wallData) {
        wallData.forEach(data => {
            this.walls.push(new Wall(data.x, data.y, data.width, data.height));
        });
    }

    // Smart key placement system
    findValidKeyPosition(keySize = 16, minDistanceFromPlayer = 80, minDistanceFromEnemies = 60, minDistanceFromOtherKeys = 50, maxAttempts = 100) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Generate random position within safe bounds
            const x = 30 + Math.random() * (800 - 60 - keySize);
            const y = 30 + Math.random() * (600 - 60 - keySize);
            
            // Check if position is valid
            if (this.isValidKeyPosition(x, y, keySize, minDistanceFromPlayer, minDistanceFromEnemies, minDistanceFromOtherKeys)) {
                return {x, y};
            }
        }
        
        // Fallback: return a safe default position if random placement fails
        return this.getFallbackKeyPosition();
    }
    
    isValidKeyPosition(x, y, keySize, minDistanceFromPlayer, minDistanceFromEnemies, minDistanceFromOtherKeys) {
        // Check wall collisions
        const keyRect = {x, y, width: keySize, height: keySize};
        for (let wall of this.walls) {
            if (this.checkObjectCollision(keyRect, wall)) {
                return false;
            }
        }
        
        // Check distance from player
        const playerDistance = Math.sqrt((x - this.player.x) ** 2 + (y - this.player.y) ** 2);
        if (playerDistance < minDistanceFromPlayer) {
            return false;
        }
        
        // Check distance from enemies
        for (let enemy of this.enemies) {
            const enemyDistance = Math.sqrt((x - enemy.x) ** 2 + (y - enemy.y) ** 2);
            if (enemyDistance < minDistanceFromEnemies) {
                return false;
            }
        }
        
        // Check distance from other keys
        for (let key of this.keys) {
            const keyDistance = Math.sqrt((x - key.x) ** 2 + (y - key.y) ** 2);
            if (keyDistance < minDistanceFromOtherKeys) {
                return false;
            }
        }
        
        // Check if player can potentially reach this position (basic pathfinding check)
        return this.isReachableFromPlayer(x, y);
    }
    
    isReachableFromPlayer(targetX, targetY) {
        // Simple line-of-sight check from player to target
        const startX = this.player.x + this.player.width / 2;
        const startY = this.player.y + this.player.height / 2;
        const endX = targetX + 8; // Key center
        const endY = targetY + 8;
        
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance / 10); // Check every 10 pixels
        
        for (let i = 0; i <= steps; i++) {
            const checkX = startX + (dx / steps) * i;
            const checkY = startY + (dy / steps) * i;
            
            // Check if this point intersects with any wall
            for (let wall of this.walls) {
                if (checkX >= wall.x && checkX <= wall.x + wall.width &&
                    checkY >= wall.y && checkY <= wall.y + wall.height) {
                    return false; // Path blocked
                }
            }
        }
        
        return true; // Path seems clear
    }
    
    getFallbackKeyPosition() {
        // Return safe positions based on current level
        const fallbackPositions = [
            {x: 50, y: 50},
            {x: 700, y: 50},
            {x: 50, y: 500},
            {x: 700, y: 500},
            {x: 400, y: 300}
        ];
        
        for (let pos of fallbackPositions) {
            if (this.isValidKeyPosition(pos.x, pos.y, 16, 60, 40, 30)) {
                return pos;
            }
        }
        
        // Ultimate fallback
        return {x: 50, y: 50};
    }
    
    checkObjectCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    placeRandomKeys(count = 3) {
        for (let i = 0; i < count; i++) {
            const position = this.findValidKeyPosition();
            this.keys.push(new Key(position.x, position.y));
        }
    }

    nextLevel() {
        if (this.currentLevel < this.maxLevels) {
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
            this.updateTheme();
            
            // Add some particles for level transition
            for (let i = 0; i < 20; i++) {
                this.particles.push(new Particle(
                    Math.random() * 800,
                    Math.random() * 600,
                    'level-transition'
                ));
            }
        } else {
            this.victory();
        }
    }

    victory() {
        this.gameState = 'victory';
        this.showScreen('victory-screen');
    }

    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('final-level').textContent = this.currentLevel;
        this.showScreen('game-over-screen');
    }    takeDamage(amount) {
        this.playerHealth -= amount;
        this.screenShake = 15; // Increased screen shake
        this.flashEffect = 30; // Increased flash duration
        
        // Create dramatic hit particles
        this.createHitEffect(this.player.x, this.player.y);
        
        if (this.playerHealth <= 0) {
            this.playerHealth = 0;
            this.gameOver();
        }
        
        this.updateHealthBar();
    }

    createHitEffect(x, y) {
        // Create dramatic hit particles
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(
                x + Math.random() * 20,
                y + Math.random() * 20,
                'hit-effect'
            ));
        }
    }

    collectKey() {
        this.keysCollected++;
        document.getElementById('keys-count').textContent = `${this.keysCollected}/${this.totalKeys}`;
        
        // Add collection particles
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(
                this.player.x + Math.random() * 40 - 20,
                this.player.y + Math.random() * 40 - 20,
                'key-collect'
            ));
        }
    }

    updateHealthBar() {
        const healthFill = document.getElementById('health-fill');
        const healthPercent = (this.playerHealth / this.maxHealth) * 100;
        healthFill.style.width = `${healthPercent}%`;
        
        if (healthPercent > 60) {
            healthFill.style.background = 'linear-gradient(90deg, var(--health-good), var(--health-good))';
        } else if (healthPercent > 30) {
            healthFill.style.background = 'linear-gradient(90deg, var(--health-warning), var(--health-warning))';
        } else {
            healthFill.style.background = 'linear-gradient(90deg, var(--health-danger), var(--health-danger))';
        }
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.update(deltaTime, this);
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime, this));
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Update effects
        if (this.screenShake > 0) this.screenShake--;
        if (this.flashEffect > 0) this.flashEffect--;
    }

    checkCollisions() {
        // Player-Key collisions
        for (let i = this.keys.length - 1; i >= 0; i--) {
            if (this.checkCollision(this.player, this.keys[i])) {
                this.keys.splice(i, 1);
                this.collectKey();
            }
        }
        
        // Player-Exit collision
        if (this.keysCollected >= this.totalKeys && this.checkCollision(this.player, this.exit)) {
            this.nextLevel();
        }
        
        // Player-Enemy collisions
        this.enemies.forEach(enemy => {
            if (this.checkCollision(this.player, enemy) && enemy.damageTimer <= 0) {
                this.takeDamage(10);
                enemy.damageTimer = 60; // 1 second cooldown at 60fps
            }
        });
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, 800, 600);
        
        // Apply screen shake
        if (this.screenShake > 0) {
            this.ctx.save();
            this.ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }
        
        // Draw background based on level
        this.drawBackground();
        
        // Draw walls
        this.walls.forEach(wall => wall.draw(this.ctx, this.currentLevel));
        
        // Draw keys
        this.keys.forEach(key => key.draw(this.ctx));
        
        // Draw exit
        if (this.keysCollected >= this.totalKeys) {
            this.exit.draw(this.ctx, true);
        } else {
            this.exit.draw(this.ctx, false);
        }
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx, this.currentLevel));
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));
          // Draw lighting effect
        this.drawLighting();
        
        // Draw compass indicators
        this.drawCompass();
        
        // Flash effect
        if (this.flashEffect > 0) {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${this.flashEffect / 50})`;
            this.ctx.fillRect(0, 0, 800, 600);
        }
        
        if (this.screenShake > 0) {
            this.ctx.restore();
        }
    }    drawBackground() {
        // Proper level themes with atmospheric floor colors
        const colors = {
            1: ['#1a1a2e', '#2c2c54'], // Level 1: Office building - dark blues/grays
            2: ['#0d2818', '#1e3d2f'], // Level 2: Hospital - sickly greens  
            3: ['#2c0e0e', '#4a1c1c']  // Level 3: Underground - deep reds/blacks
        };
        
        const [color1, color2] = colors[this.currentLevel];
        const gradient = this.ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 800, 600);
        
        // Add level-specific floor textures
        this.drawFloorTexture();
    }

    drawFloorTexture() {
        this.ctx.save();
        
        const tileSize = 40;
        let strokeColor;
        
        // Different subtle floor patterns for each level
        switch(this.currentLevel) {
            case 1: // Office building - carpet tile pattern
                strokeColor = 'rgba(70, 130, 180, 0.1)'; // Subtle blue lines
                break;
            case 2: // Hospital - sterile tile pattern  
                strokeColor = 'rgba(144, 238, 144, 0.1)'; // Subtle green lines
                break;
            case 3: // Underground - rough stone pattern
                strokeColor = 'rgba(139, 69, 19, 0.15)'; // Subtle brown/red lines
                break;
        }
        
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 1;
        
        // Draw grid pattern
        for (let x = 0; x < 800; x += tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, 600);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < 600; y += tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(800, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }drawLighting() {
        // Save the current canvas state
        this.ctx.save();
        
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const lightRadius = 80;
        
        // Create a simple radial gradient overlay with no harsh boundaries
        const darknessGradient = this.ctx.createRadialGradient(
            playerCenterX, playerCenterY, 0,
            playerCenterX, playerCenterY, lightRadius
        );
        
        // Simple gradient with smooth transitions
        darknessGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');      // Full light at center
        darknessGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');  // Gradual darkening
        darknessGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.8)');  // Darker
        darknessGradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');   // Almost black at edges
        
        // Apply darkness overlay
        this.ctx.fillStyle = darknessGradient;
        this.ctx.fillRect(0, 0, 800, 600);
        
        // Restore the canvas state
        this.ctx.restore();
    }drawCompass() {
        if (!this.player) return;
        
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const compassRadius = 50; // Larger radius for better visibility
        
        // Draw compass indicators without visible circles
        this.ctx.save();
        
        // Show indicators for all remaining keys
        if (this.keys.length > 0) {
            this.keys.forEach((key, index) => {
                const targetX = key.x + key.width / 2;
                const targetY = key.y + key.height / 2;
                const distance = this.getDistance(playerCenterX, playerCenterY, targetX, targetY);
                
                // Show indicator if key is far enough
                if (distance > 30) {
                    this.drawCompassIndicator(
                        playerCenterX, playerCenterY, 
                        targetX, targetY, 
                        compassRadius - 5, 
                        '#ffff00', // Bright yellow
                        `KEY ${index + 1}`,
                        Math.round(distance / 10) + 'm'
                    );
                }
            });
        }
        
        // Show exit indicator when all keys are collected
        if (this.keysCollected >= this.totalKeys && this.exit) {
            const targetX = this.exit.x + this.exit.width / 2;
            const targetY = this.exit.y + this.exit.height / 2;
            const distance = this.getDistance(playerCenterX, playerCenterY, targetX, targetY);
            
            if (distance > 30) {
                this.drawCompassIndicator(
                    playerCenterX, playerCenterY, 
                    targetX, targetY, 
                    compassRadius - 5, 
                    '#00ff00', // Bright green
                    'EXIT',
                    Math.round(distance / 10) + 'm'
                );
            }
        }
        
        this.ctx.restore();
    }

    drawCompassIndicator(fromX, fromY, toX, toY, radius, color, label, distance) {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        // Calculate arrow position on compass circle
        const arrowX = fromX + Math.cos(angle) * radius;
        const arrowY = fromY + Math.sin(angle) * radius;
        
        // Draw a glowing arrow
        this.ctx.save();
        
        // Add glow effect
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 8;
        
        // Draw arrow background (larger)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(
            arrowX - Math.cos(angle - 0.4) * 15,
            arrowY - Math.sin(angle - 0.4) * 15
        );
        this.ctx.lineTo(
            arrowX - Math.cos(angle) * 8,
            arrowY - Math.sin(angle) * 8
        );
        this.ctx.lineTo(
            arrowX - Math.cos(angle + 0.4) * 15,
            arrowY - Math.sin(angle + 0.4) * 15
        );
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw bright arrow
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(
            arrowX - Math.cos(angle - 0.4) * 12,
            arrowY - Math.sin(angle - 0.4) * 12
        );
        this.ctx.lineTo(
            arrowX - Math.cos(angle) * 6,
            arrowY - Math.sin(angle) * 6
        );
        this.ctx.lineTo(
            arrowX - Math.cos(angle + 0.4) * 12,
            arrowY - Math.sin(angle + 0.4) * 12
        );
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Draw label background
        const labelX = arrowX + Math.cos(angle) * 20;
        const labelY = arrowY + Math.sin(angle) * 20;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(labelX - 25, labelY - 15, 50, 25);
        
        // Draw label border
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(labelX - 25, labelY - 15, 50, 25);
        
        // Draw label text
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, labelX, labelY - 2);
        
        // Draw distance
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '8px Arial';
        this.ctx.fillText(distance, labelX, labelY + 8);
        
        this.ctx.restore();
    }

    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(this.deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 150; // pixels per second
        this.lastX = x;
        this.lastY = y;
    }    update(deltaTime, game) {
        this.lastX = this.x;
        this.lastY = this.y;
        
        const moveSpeed = (this.speed * deltaTime) / 1000;
        let newX = this.x;
        let newY = this.y;
        
        // Handle input and calculate new position
        if (game.keys_pressed['KeyW'] || game.keys_pressed['ArrowUp']) {
            newY -= moveSpeed;
        }
        if (game.keys_pressed['KeyS'] || game.keys_pressed['ArrowDown']) {
            newY += moveSpeed;
        }
        if (game.keys_pressed['KeyA'] || game.keys_pressed['ArrowLeft']) {
            newX -= moveSpeed;
        }
        if (game.keys_pressed['KeyD'] || game.keys_pressed['ArrowRight']) {
            newX += moveSpeed;
        }
        
        // Try moving X first
        let canMoveX = true;
        this.x = newX;
        for (let wall of game.walls) {
            if (this.checkCollision(wall)) {
                canMoveX = false;
                break;
            }
        }
        if (!canMoveX) {
            this.x = this.lastX; // Revert X movement
        }
        
        // Try moving Y
        let canMoveY = true;
        this.y = newY;
        for (let wall of game.walls) {
            if (this.checkCollision(wall)) {
                canMoveY = false;
                break;
            }
        }
        if (!canMoveY) {
            this.y = this.lastY; // Revert Y movement
        }
        
        // If both movements failed, try each direction individually (slide along walls)
        if (!canMoveX && !canMoveY) {
            // Try just X movement
            this.x = newX;
            this.y = this.lastY;
            for (let wall of game.walls) {
                if (this.checkCollision(wall)) {
                    this.x = this.lastX;
                    break;
                }
            }
            
            // Try just Y movement if X failed
            if (this.x === this.lastX) {
                this.x = this.lastX;
                this.y = newY;
                for (let wall of game.walls) {
                    if (this.checkCollision(wall)) {
                        this.y = this.lastY;
                        break;
                    }
                }
            }
        }
        
        // Keep player in bounds with padding
        const padding = 2;
        this.x = Math.max(padding, Math.min(this.x, 800 - this.width - padding));        this.y = Math.max(padding, Math.min(this.y, 600 - this.height - padding));
    }

    checkCollision(wall) {
        const buffer = 0.5; // Small buffer to prevent exact edge collisions
        return this.x < wall.x + wall.width + buffer &&
               this.x + this.width > wall.x - buffer &&
               this.y < wall.y + wall.height + buffer &&
               this.y + this.height > wall.y - buffer;
    }    draw(ctx) {
        ctx.save();
        
        // Security guard uniform - navy blue base
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(this.x, this.y, this.width, this.height);
          // Guard shirt/vest
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(this.x + 2, this.y + 3, this.width - 4, this.height - 6);
        
        // Security badge on chest
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(this.x + 6, this.y + 6, 4, 3);
        
        // Utility belt
        ctx.fillStyle = '#374151';
        ctx.fillRect(this.x + 1, this.y + 12, this.width - 2, 3);
        
        // Flashlight on belt
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(this.x + 14, this.y + 13, 3, 1);
        
        // Security guard head/cap
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(this.x + 4, this.y + 1, this.width - 8, 4);
        
        // Cap visor
        ctx.fillStyle = '#111827';
        ctx.fillRect(this.x + 3, this.y + 3, this.width - 6, 1);
        
        // Subtle guard glow (flashlight effect)
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 6;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.fillRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
          ctx.shadowBlur = 0;
        ctx.restore();
    }
}

// Enemy Class
class Enemy {    constructor(x, y, aiType, patrolPoints = []) {
        this.x = x;
        this.y = y;
        this.width = 18;
        this.height = 18;
        this.speed = 50;        this.aiType = aiType; // 'patrol', 'chase', 'guard'
        this.patrolPoints = patrolPoints;
        this.currentPatrolTarget = 0;
        this.damageTimer = 0;
        this.detectionRange = 100;
        this.lastPlayerPos = {x: 0, y: 0};
        this.huntTimer = 0;
        this.returnTimer = 0; // Timer for returning to original position
        this.stuckTimer = 0; // Timer for detecting if enemy is stuck
        this.lastPosition = {x: x, y: y}; // For stuck detection
        
        // Store original position for all enemy types
        this.originalPos = {x: x, y: y};
    }update(deltaTime, game) {
        if (this.damageTimer > 0) this.damageTimer--;
        
        const moveSpeed = (this.speed * deltaTime) / 1000;
        
        // Calculate intended movement but don't apply it yet
        let intendedX = 0;
        let intendedY = 0;
        
        switch(this.aiType) {
            case 'patrol':
                [intendedX, intendedY] = this.patrolBehavior(moveSpeed, game);
                break;
            case 'chase':
                [intendedX, intendedY] = this.chaseBehavior(moveSpeed, game);
                break;
            case 'guard':
                [intendedX, intendedY] = this.guardBehavior(moveSpeed, game);
                break;
        }
        
        // Apply movement with collision detection
        this.moveWithCollision(intendedX, intendedY, game.walls);
    }    moveWithCollision(deltaX, deltaY, walls) {
        // Store original position
        const originalX = this.x;
        const originalY = this.y;
          // First, check if we're currently clipped into a wall and need to escape
        // Only check every few frames to avoid constant micro-adjustments
        if (!this.wallCheckCooldown) this.wallCheckCooldown = 0;
        this.wallCheckCooldown--;
        
        if (this.wallCheckCooldown <= 0 && this.isInsideWall(walls)) {
            this.escapeFromWall(walls, originalX, originalY);
            this.wallCheckCooldown = 5; // Wait 5 frames before next check
            return; // Exit early after wall escape
        }
        
        // For chase enemies, add some corner navigation intelligence
        const isChaseEnemy = this.aiType === 'chase';
        
        // Try full movement first
        this.x += deltaX;
        this.y += deltaY;
        
        let hasCollision = false;
        for (let wall of walls) {
            if (this.checkCollision(wall)) {
                hasCollision = true;
                break;
            }
        }
        
        if (!hasCollision) {
            // Movement successful
            return;
        }
        
        // Revert to original position
        this.x = originalX;
        this.y = originalY;
        
        // Try X movement only
        this.x += deltaX;
        let canMoveX = true;
        for (let wall of walls) {
            if (this.checkCollision(wall)) {
                this.x = originalX;
                canMoveX = false;
                break;
            }
        }
        
        // Try Y movement only
        this.y += deltaY;
        let canMoveY = true;
        for (let wall of walls) {
            if (this.checkCollision(wall)) {
                this.y = originalY;
                canMoveY = false;
                break;
            }
        }
        
        // If neither axis works, try corner navigation for chase enemies
        if (!canMoveX && !canMoveY && isChaseEnemy) {
            this.handleCornerNavigation(deltaX, deltaY, walls, originalX, originalY);
        }
    }
    
    isInsideWall(walls) {
        for (let wall of walls) {
            if (this.checkCollision(wall)) {
                return true;
            }
        }
        return false;
    }
      escapeFromWall(walls, originalX, originalY) {
        // Try to push the enemy out of the wall gradually
        const pushDirections = [
            {x: 1, y: 0},   // Right (small step)
            {x: -1, y: 0},  // Left (small step)
            {x: 0, y: 1},   // Down (small step)
            {x: 0, y: -1},  // Up (small step)
            {x: 1, y: 1},   // Diagonal down-right (small step)
            {x: -1, y: 1},  // Diagonal down-left (small step)
            {x: 1, y: -1},  // Diagonal up-right (small step)
            {x: -1, y: -1}, // Diagonal up-left (small step)
            {x: 2, y: 0},   // Slightly bigger pushes
            {x: -2, y: 0},
            {x: 0, y: 2},
            {x: 0, y: -2}
        ];
        
        // Try small, gradual movements first
        for (let direction of pushDirections) {
            this.x = originalX + direction.x;
            this.y = originalY + direction.y;
            
            if (!this.isInsideWall(walls)) {
                // Successfully escaped from wall with minimal movement
                return;
            }
        }
        
        // If small movements don't work, try slightly larger ones
        for (let direction of pushDirections) {
            this.x = originalX + direction.x * 3;
            this.y = originalY + direction.y * 3;
            
            if (!this.isInsideWall(walls)) {
                return;
            }
        }
        
        // Only as last resort, use larger movements
        for (let direction of pushDirections) {
            this.x = originalX + direction.x * 5;
            this.y = originalY + direction.y * 5;
            
            if (!this.isInsideWall(walls)) {
                return;
            }
        }
        
        // If we still can't escape, gradually move toward original position
        if (this.originalPos) {
            const toOriginX = this.originalPos.x - originalX;
            const toOriginY = this.originalPos.y - originalY;
            const distance = Math.sqrt(toOriginX * toOriginX + toOriginY * toOriginY);
            
            if (distance > 0) {
                // Move just 3 pixels toward origin per frame
                const moveX = (toOriginX / distance) * 3;
                const moveY = (toOriginY / distance) * 3;
                
                this.x = originalX + moveX;
                this.y = originalY + moveY;
                
                if (!this.isInsideWall(walls)) {
                    return;
                }
            }
            
            // Only teleport as absolute last resort and still close to origin
            const distanceToOrigin = Math.sqrt(
                (originalX - this.originalPos.x) ** 2 + 
                (originalY - this.originalPos.y) ** 2
            );
            
            if (distanceToOrigin < 30) {
                this.x = this.originalPos.x;
                this.y = this.originalPos.y;
            } else {
                // Just revert to original position for this frame
                this.x = originalX;
                this.y = originalY;
            }
        }
    }
      handleCornerNavigation(deltaX, deltaY, walls, originalX, originalY) {
        // Try moving at angles to get around corners
        const angles = [
            {x: deltaX * 0.7, y: deltaY * 1.4},  // Favor Y movement
            {x: deltaX * 1.4, y: deltaY * 0.7},  // Favor X movement
            {x: deltaX * 0.5, y: deltaY * 0.5},  // Reduce both
            {x: deltaX * -0.3, y: deltaY * 1.2}, // Slight backtrack on X
            {x: deltaX * 1.2, y: deltaY * -0.3}, // Slight backtrack on Y
            {x: deltaY * 0.8, y: deltaX * 0.8},  // Perpendicular movement
            {x: -deltaY * 0.8, y: -deltaX * 0.8}, // Opposite perpendicular
            {x: deltaX * -0.5, y: deltaY * -0.5}  // Small retreat
        ];
        
        for (let angle of angles) {
            this.x = originalX + angle.x;
            this.y = originalY + angle.y;
            
            let hasCollision = false;
            for (let wall of walls) {
                if (this.checkCollision(wall)) {
                    hasCollision = true;
                    break;
                }
            }
            
            if (!hasCollision) {
                // Found a path around the corner
                return;
            }
        }
        
        // If all angles failed and we're stuck during return, try a larger jump toward origin
        if (this.aiType === 'chase' && this.huntTimer <= 0 && this.returnTimer <= 0) {
            const toOriginX = this.originalPos.x - originalX;
            const toOriginY = this.originalPos.y - originalY;
            const originDistance = Math.sqrt(toOriginX * toOriginX + toOriginY * toOriginY);
            
            if (originDistance > 30) {
                // Try a bigger jump toward origin
                const jumpX = (toOriginX / originDistance) * 25;
                const jumpY = (toOriginY / originDistance) * 25;
                
                this.x = originalX + jumpX;
                this.y = originalY + jumpY;
                
                let hasCollision = false;
                for (let wall of walls) {
                    if (this.checkCollision(wall)) {
                        hasCollision = true;
                        break;
                    }
                }
                
                if (!hasCollision) {
                    return; // Jump successful
                }
            }
        }
        
        // If all attempts failed, revert to original position
        this.x = originalX;
        this.y = originalY;
    }patrolBehavior(moveSpeed, game) {
        if (this.patrolPoints.length === 0) return [0, 0];
        
        const target = this.patrolPoints[this.currentPatrolTarget];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
            this.currentPatrolTarget = (this.currentPatrolTarget + 1) % this.patrolPoints.length;
            return [0, 0];
        } else {
            const moveX = (dx / distance) * moveSpeed;
            const moveY = (dy / distance) * moveSpeed;
            return [moveX, moveY];
        }
    }    chaseBehavior(moveSpeed, game) {
        const playerDistance = this.getDistanceToPlayer(game.player);
        const canSeePlayer = this.hasLineOfSight(game.player, game.walls);
        
        // Store original position if not already stored
        if (!this.originalPos) {
            this.originalPos = {x: this.x, y: this.y};
        }
        
        // Initialize stuck detection
        if (!this.lastPosition) {
            this.lastPosition = {x: this.x, y: this.y};
            this.stuckTimer = 0;
        }        // Check if enemy is stuck (hasn't moved much) or is clipped into a wall
        const distanceMoved = Math.sqrt(
            (this.x - this.lastPosition.x) ** 2 + 
            (this.y - this.lastPosition.y) ** 2
        );
        
        // Check for wall clipping every frame, but be less aggressive
        if (this.isInsideWall(game.walls)) {
            this.stuckTimer += 2; // Increase stuck timer moderately when clipped into wall
        } else if (distanceMoved < 2) {
            this.stuckTimer++;
        } else {
            this.stuckTimer = 0;
        }
        
        if (this.stuckTimer > 90) { // Stuck for 1.5 seconds (give more time for gradual escape)
            if (this.huntTimer > 0) {
                // Force end hunt and start return
                this.huntTimer = 0;
                this.stuckTimer = 0;
            } else if (this.returnTimer <= 0) {
                // Stuck during return phase, try gradual movement toward origin
                const distanceToOrigin = Math.sqrt(
                    (this.x - this.originalPos.x) ** 2 + 
                    (this.y - this.originalPos.y) ** 2
                );
                
                if (distanceToOrigin > 50) {
                    // Move gradually closer to origin (small steps)
                    const angleToOrigin = Math.atan2(
                        this.originalPos.y - this.y,
                        this.originalPos.x - this.x
                    );
                    this.x += Math.cos(angleToOrigin) * 8; // Reduced from 20 to 8
                    this.y += Math.sin(angleToOrigin) * 8;
                    this.stuckTimer = 60; // Reset to lower value to allow gradual movement
                } else {
                    // Close to origin but still stuck, teleport directly (only very close)
                    this.x = this.originalPos.x;
                    this.y = this.originalPos.y;
                    this.stuckTimer = 0;
                }
            }
        }
        
        // Update last position for stuck detection
        this.lastPosition = {x: this.x, y: this.y};
        
        // If player is in range AND visible, update last known position
        if (playerDistance < this.detectionRange && canSeePlayer) {
            this.lastPlayerPos = {x: game.player.x, y: game.player.y};
            this.huntTimer = 300; // 5 seconds at 60fps
            this.returnTimer = 0; // Reset return timer
            this.stuckTimer = 0; // Reset stuck timer
        }
        
        if (this.huntTimer > 0) {
            this.huntTimer--;
            
            // Move towards last known position
            const dx = this.lastPlayerPos.x - this.x;
            const dy = this.lastPlayerPos.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                // Calculate intended movement with slight randomization to help escape corners
                let moveX = (dx / distance) * moveSpeed * 1.5;
                let moveY = (dy / distance) * moveSpeed * 1.5;
                
                // Add slight randomization when stuck to help escape corners
                if (this.stuckTimer > 30) {
                    const randomAngle = Math.random() * Math.PI * 2;
                    const randomStrength = 0.3;
                    moveX += Math.cos(randomAngle) * moveSpeed * randomStrength;
                    moveY += Math.sin(randomAngle) * moveSpeed * randomStrength;
                }
                
                return [moveX, moveY];
            } else {
                // Reached last known position, reduce hunt timer faster
                this.huntTimer = Math.max(0, this.huntTimer - 3);
                return [0, 0];
            }
        } else {
            // Return to original position after losing player
            if (!this.returnTimer) this.returnTimer = 120; // 2 second delay before returning
            
            if (this.returnTimer > 0) {
                this.returnTimer--;
                return [0, 0];            } else {
                // Start returning to original position
                const dx = this.originalPos.x - this.x;
                const dy = this.originalPos.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 3) { // Smaller threshold for more precise return
                    // Calculate return movement with enhanced pathfinding
                    let moveX = (dx / distance) * moveSpeed * 0.8;
                    let moveY = (dy / distance) * moveSpeed * 0.8;
                    
                    // Add slight randomization during return to help escape corners
                    if (this.stuckTimer > 20) {
                        const randomAngle = Math.random() * Math.PI * 2;
                        const randomStrength = 0.4;
                        moveX += Math.cos(randomAngle) * moveSpeed * randomStrength;
                        moveY += Math.sin(randomAngle) * moveSpeed * randomStrength;
                    }
                    
                    // If far from origin, try a more direct approach
                    if (distance > 100) {
                        moveX *= 1.5; // Move faster when far away
                        moveY *= 1.5;
                    }
                    
                    return [moveX, moveY];
                } else {
                    // Reached original position, reset position exactly
                    this.x = this.originalPos.x;
                    this.y = this.originalPos.y;
                    this.stuckTimer = 0;
                    this.lastPosition = {x: this.x, y: this.y};
                    return [0, 0];
                }
            }
        }
    }guardBehavior(moveSpeed, game) {
        const playerDistance = this.getDistanceToPlayer(game.player);
        const canSeePlayer = this.hasLineOfSight(game.player, game.walls);
        
        // Enhanced guard behavior - more responsive
        if (playerDistance < this.detectionRange && canSeePlayer) {
            // Active pursuit when player is visible
            const dx = game.player.x - this.x;
            const dy = game.player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate and return movement
            const moveX = (dx / distance) * moveSpeed * 1.2; // Slightly faster when chasing
            const moveY = (dy / distance) * moveSpeed * 1.2;
            
            // Reset return timer when actively pursuing
            this.returnTimer = 0;
            return [moveX, moveY];
        } else if (this.originalPos) {
            // Return to original guard position with delay
            if (!this.returnTimer) this.returnTimer = 120; // 2 second delay
            
            if (this.returnTimer > 0) {
                this.returnTimer--;
                return [0, 0];
            } else {
                const dx = this.originalPos.x - this.x;
                const dy = this.originalPos.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 3) { // Smaller threshold for precision
                    const moveX = (dx / distance) * moveSpeed * 0.6;
                    const moveY = (dy / distance) * moveSpeed * 0.6;
                    return [moveX, moveY];
                } else {
                    return [0, 0];
                }
            }
        }
        
        return [0, 0];
    }getDistanceToPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    hasLineOfSight(target, walls) {
        const startX = this.x + this.width / 2;
        const startY = this.y + this.height / 2;
        const endX = target.x + target.width / 2;
        const endY = target.y + target.height / 2;
        
        // Use simple raycasting to check if there's a wall between enemy and player
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance / 5); // Check every 5 pixels
        
        for (let i = 0; i <= steps; i++) {
            const checkX = startX + (dx / steps) * i;
            const checkY = startY + (dy / steps) * i;
            
            // Check if this point intersects with any wall
            for (let wall of walls) {
                if (checkX >= wall.x && checkX <= wall.x + wall.width &&
                    checkY >= wall.y && checkY <= wall.y + wall.height) {
                    return false; // Line of sight blocked
                }
            }
        }
        
        return true; // Clear line of sight
    }

    checkCollision(wall) {
        return this.x < wall.x + wall.width &&
               this.x + this.width > wall.x &&
               this.y < wall.y + wall.height &&
               this.y + this.height > wall.y;
    }    draw(ctx, level) {
        ctx.save();
        
        // Different shadow monster types based on AI
        switch(this.aiType) {
            case 'patrol':
                this.drawShadowStalker(ctx);
                break;
            case 'chase':
                this.drawShadowHunter(ctx);
                break;
            case 'guard':
                this.drawShadowSentinel(ctx);
                break;
        }
        
        ctx.restore();
    }    drawShadowStalker(ctx) {
        // Patrol enemy - wispy, floating shadow with lighter purple
        const shadowColor = '#8b5cf6'; // Lighter purple for better visibility
        
        // Main shadow body (irregular shape)
        ctx.fillStyle = shadowColor;
        ctx.beginPath();
        ctx.moveTo(this.x + 3, this.y);
        ctx.lineTo(this.x + this.width - 3, this.y + 2);
        ctx.lineTo(this.x + this.width, this.y + 8);
        ctx.lineTo(this.x + this.width - 2, this.y + this.height);
        ctx.lineTo(this.x + 2, this.y + this.height - 1);
        ctx.lineTo(this.x, this.y + 6);
        ctx.closePath();
        ctx.fill();
        
        // Wispy tendrils - lighter purple
        ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
        for (let i = 0; i < 3; i++) {
            const offset = Math.sin(Date.now() * 0.01 + i) * 2;
            ctx.fillRect(this.x - 2 + i * 3, this.y + 8 + offset, 1, 4);
        }
        
        // Bright glowing eyes
        ctx.fillStyle = '#c4b5fd';
        ctx.shadowColor = '#c4b5fd';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(this.x + 5, this.y + 6, 1, 0, Math.PI * 2);
        ctx.arc(this.x + 10, this.y + 6, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Enhanced shadow aura for better visibility
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.fillRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
        ctx.shadowBlur = 0;
    }    drawShadowHunter(ctx) {
        // Chase enemy - aggressive, jagged shadow with enhanced visibility
        const shadowColor = '#b91c1c'; // Brighter red to stand out better
        
        // Main aggressive body
        ctx.fillStyle = shadowColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Jagged shadow spikes - more visible
        ctx.fillStyle = 'rgba(185, 28, 28, 0.9)';
        ctx.beginPath();
        // Top spikes
        for (let i = 0; i < 4; i++) {
            const spikeX = this.x + i * 4;
            ctx.moveTo(spikeX, this.y);
            ctx.lineTo(spikeX + 2, this.y - 4);
            ctx.lineTo(spikeX + 4, this.y);
        }
        // Side spikes
        ctx.moveTo(this.x + this.width, this.y + 4);
        ctx.lineTo(this.x + this.width + 3, this.y + 6);
        ctx.lineTo(this.x + this.width, this.y + 8);
        ctx.fill();
        
        // Brighter menacing red eyes
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.arc(this.x + 4, this.y + 6, 1.5, 0, Math.PI * 2);
        ctx.arc(this.x + 12, this.y + 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Enhanced hunting glow effect
        if (this.huntTimer > 0) {
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 15;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
            ctx.fillRect(this.x - 4, this.y - 4, this.width + 8, this.height + 8);
            ctx.shadowBlur = 0;
        } else {
            // Always have some glow for visibility
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 8;
            ctx.fillStyle = 'rgba(185, 28, 28, 0.3)';
            ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
            ctx.shadowBlur = 0;
        }
    }    drawShadowSentinel(ctx) {
        // Guard enemy - imposing, solid shadow with better visibility
        const shadowColor = '#7c3aed'; // Brighter purple for visibility
        
        // Solid rectangular body
        ctx.fillStyle = shadowColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Enhanced shadow crown/crest
        ctx.fillStyle = 'rgba(124, 58, 237, 0.95)';
        ctx.fillRect(this.x + 2, this.y - 2, this.width - 4, 3);
        ctx.fillRect(this.x + 6, this.y - 4, this.width - 12, 2);
        
        // Brighter guardian symbols on chest
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 2;
        ctx.fillRect(this.x + 6, this.y + 5, 6, 2);
        ctx.fillRect(this.x + 8, this.y + 3, 2, 6);
        ctx.shadowBlur = 0;
        
        // Enhanced vigilance glow for better visibility
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(124, 58, 237, 0.4)';
        ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        ctx.shadowBlur = 0;
        
        // Base spread (shows stability)
        ctx.fillStyle = shadowColor;
        ctx.fillRect(this.x - 1, this.y + this.height - 2, this.width + 2, 2);
    }
}

// Key Class
class Key {    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16; // Reduced width to match shorter key
        this.height = 8; // Keep height the same
        this.rotation = 0;
        this.bob = 0;
    }

    update(deltaTime) {
        this.rotation += (deltaTime / 1000) * 2;
        this.bob += (deltaTime / 1000) * 3;
    }    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2 + Math.sin(this.bob) * 2);        ctx.rotate(this.rotation);// Add compass-style glow effect (further reduced intensity)
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 3; // Further reduced from 5 to 3
        
        // Enhanced gradient glow effect - more subtle
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.25)');
        gradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.15)');
        gradient.addColorStop(0.6, 'rgba(255, 215, 0, 0.08)');
        gradient.addColorStop(0.8, 'rgba(255, 215, 0, 0.03)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
          // Key head (circular bow) - larger and more prominent
        ctx.fillStyle = '#ffd700'; // Golden color
        ctx.beginPath();
        ctx.arc(-this.width/2 + 3, 0, 4, 0, Math.PI * 2);
        ctx.fill();
          // Key shaft - shorter but still connects head to teeth
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-this.width/2 + 7, -1.5, this.width - 5, 3);        // Key head inner hole - darker gold instead of transparent
        ctx.fillStyle = '#b8860b'; // Dark goldenrod for inner hole
        ctx.beginPath();
        ctx.arc(-this.width/2 + 3, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Key teeth - positioned at the end of shorter shaft
        ctx.fillStyle = '#ffd700';
        // Main tooth - connects to shaft end
        ctx.fillRect(this.width/2 - 2, 1.5, 3, 3);
        // Secondary tooth - also connected
        ctx.fillRect(this.width/2, -1.5, 2, 4);
        
        // Add shine/highlight for better visibility
        ctx.fillStyle = '#ffff80'; // Light yellow highlight
        ctx.fillRect(-this.width/2 + 8, -0.5, this.width - 6, 1);        // Subtle outline for definition
        ctx.strokeStyle = '#cc9900'; // Darker gold
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(-this.width/2 + 3, 0, 4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Reset shadow after drawing (like compass indicators)
        ctx.shadowBlur = 0;
        
        ctx.restore();
    }
}

// Exit Class
class Exit {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.pulse = 0;
    }

    update(deltaTime) {
        this.pulse += (deltaTime / 1000) * 4;
    }    draw(ctx, unlocked) {
        const alpha = unlocked ? 1 : 0.3;
        const pulseSize = unlocked ? Math.sin(this.pulse) * 3 : 0;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Door frame
        ctx.fillStyle = unlocked ? '#27ae60' : '#7f8c8d';
        ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        
        // Door
        ctx.fillStyle = unlocked ? '#2ecc71' : '#95a5a6';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Door panels
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, (this.height - 12) / 2);
        ctx.fillRect(this.x + 4, this.y + 8 + (this.height - 12) / 2, this.width - 8, (this.height - 12) / 2);
        
        // Door handle
        ctx.fillStyle = unlocked ? '#f39c12' : '#bdc3c7';
        ctx.fillRect(this.x + this.width - 6, this.y + this.height/2 - 2, 2, 4);
        
        // Exit glow when unlocked
        if (unlocked) {
            ctx.shadowColor = '#2ecc71';
            ctx.shadowBlur = 20 + pulseSize;
            ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
            ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }
        
        ctx.restore();
        ctx.shadowBlur = 0;
    }
}

// Wall Class
class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }    draw(ctx, level) {
        const colors = {
            1: '#34495e', // Office walls - dark blue-gray
            2: '#2d5a3d', // Hospital walls - sickly green-gray  
            3: '#6b2c2c'  // Underground walls - much brighter red-brown for better contrast
        };
        
        const borderColors = {
            1: '#5d6d7e', // Lighter blue-gray border
            2: '#52b788', // Lighter green border
            3: '#cc0000'  // Bright red border for Level 3 - much more visible
        };
        
        ctx.fillStyle = colors[level];
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Wall border with level-appropriate color
        ctx.strokeStyle = borderColors[level];
        ctx.lineWidth = level === 3 ? 2 : 1; // Thicker border for Level 3
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Particle Class
class Particle {    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 60;
        this.maxLife = 60;
        
        switch(type) {
            case 'key-collect':
                this.velocityX = (Math.random() - 0.5) * 4;
                this.velocityY = (Math.random() - 0.5) * 4;
                this.color = '#f1c40f';
                break;
            case 'hit-effect':
                this.velocityX = (Math.random() - 0.5) * 8;
                this.velocityY = (Math.random() - 0.5) * 8;
                this.color = '#dc2626';
                this.life = 30;
                this.maxLife = 30;
                break;
            case 'level-transition':
                this.velocityX = (Math.random() - 0.5) * 6;
                this.velocityY = (Math.random() - 0.5) * 6;
                this.color = '#3498db';
                this.life = 120;
                this.maxLife = 120;
                break;
        }
    }

    update(deltaTime) {
        this.life--;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.1; // Gravity
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.restore();
    }
}

// Initialize the game
const game = new Game();
