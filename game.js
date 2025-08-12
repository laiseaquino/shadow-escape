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
        
        // Debug menu (Debug sequence)
        this.debugSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
        this.debugIndex = 0;
        this.debugMenuVisible = false;
        this.isDebugMode = false;
        
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
            
            // Debug sequence detection (only on menu screen)
            if (this.gameState === 'menu' && !this.debugMenuVisible) {
                console.log('Menu key pressed:', e.code, 'Expected:', this.debugSequence[this.debugIndex]);
                this.checkDebugSequence(e.code);
            }
            
            if (e.code === 'Escape' && this.gameState === 'playing') {
                this.pauseGame();
            }
            // Close instructions dialog with ESC key
            if (e.code === 'Escape' && !document.getElementById('instructions-dialog').classList.contains('hidden')) {
                this.hideInstructions();
            }
            // Close debug menu with ESC key
            if (e.code === 'Escape' && this.debugMenuVisible) {
                this.hideDebugMenu();
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
        this.isDebugMode = false; // Clear debug mode for normal gameplay
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
    findValidKeyPosition(keySize = 16, minDistanceFromPlayer = 80, minDistanceFromEnemies = 60, minDistanceFromOtherKeys = 80, maxAttempts = 100) {
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
            if (this.isValidKeyPosition(pos.x, pos.y, 16, 60, 40, 80)) {
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
        // If we're in debug mode, return to title screen instead of progressing
        if (this.isDebugMode) {
            this.isDebugMode = false; // Reset debug mode
            this.gameState = 'menu';
            this.showScreen('menu-screen');
            return;
        }
        
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

    checkDebugSequence(keyCode) {
        console.log('Debug sequence check - Key:', keyCode, 'Expected:', this.debugSequence[this.debugIndex], 'Index:', this.debugIndex);
        if (keyCode === this.debugSequence[this.debugIndex]) {
            this.debugIndex++;
            console.log('Correct key! Progress:', this.debugIndex, '/', this.debugSequence.length);
            if (this.debugIndex >= this.debugSequence.length) {
                console.log('Debug sequence completed! Showing debug menu...');
                this.showDebugMenu();
                this.debugIndex = 0; // Reset for next time
            }
        } else {
            console.log('Wrong key, resetting sequence');
            this.debugIndex = 0; // Reset if wrong key
        }
    }

    showDebugMenu() {
        this.debugMenuVisible = true;
        
        // Create debug menu HTML
        const debugMenu = document.createElement('div');
        debugMenu.id = 'debug-menu';
        debugMenu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border: 2px solid #e94560;
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
            font-family: 'Courier New', monospace;
        `;
        
        debugMenu.innerHTML = `
            <h2 style="margin-top: 0; margin-bottom: 30px; color: #e94560;">DEBUG MENU</h2>
            <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 30px;">
                <button id="debug-level-1" style="
                    padding: 10px 20px; 
                    background: #e94560; 
                    color: white; 
                    border: none; 
                    border-radius: 5px; 
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                ">Level 1</button>
                <button id="debug-level-2" style="
                    padding: 10px 20px; 
                    background: #e94560; 
                    color: white; 
                    border: none; 
                    border-radius: 5px; 
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                ">Level 2</button>
                <button id="debug-level-3" style="
                    padding: 10px 20px; 
                    background: #e94560; 
                    color: white; 
                    border: none; 
                    border-radius: 5px; 
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                ">Level 3</button>
            </div>
            <p style="font-size: 12px; color: #888; margin-bottom: 0;">
                Press ESC to close
            </p>
        `;
        
        document.body.appendChild(debugMenu);
        
        // Add event listeners for level buttons
        document.getElementById('debug-level-1').addEventListener('click', () => {
            this.startDebugLevel(1);
        });
        document.getElementById('debug-level-2').addEventListener('click', () => {
            this.startDebugLevel(2);
        });
        document.getElementById('debug-level-3').addEventListener('click', () => {
            this.startDebugLevel(3);
        });
    }

    hideDebugMenu() {
        const debugMenu = document.getElementById('debug-menu');
        if (debugMenu) {
            debugMenu.remove();
        }
        this.debugMenuVisible = false;
    }

    startDebugLevel(levelNumber) {
        this.hideDebugMenu();
        this.isDebugMode = true;
        this.currentLevel = levelNumber;
        this.gameState = 'playing';
        this.playerHealth = this.maxHealth;
        this.showScreen('game-screen');
        this.loadLevel(levelNumber);
        this.updateTheme();
        this.gameLoop();
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
        
        // Pathfinding variables
        this.currentPath = [];
        this.pathIndex = 0;
        this.lastPathUpdate = 0;
        this.pathUpdateInterval = 500; // Update path every 500ms
    }update(deltaTime, game) {
        if (this.damageTimer > 0) this.damageTimer--;
        
        const moveSpeed = (this.speed * deltaTime) / 1000;
        
        // Calculate intended movement
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
        
        // For chase enemies using pathfinding, apply movement directly if safe
        if (this.aiType === 'chase' && this.currentPath && this.currentPath.length > 0) {
            this.applyPathfindingMovement(intendedX, intendedY, game.walls);
        } else {
            // Use traditional collision detection for patrol and guard enemies
            this.moveWithCollision(intendedX, intendedY, game.walls);
        }
    }
    
    applyPathfindingMovement(deltaX, deltaY, walls) {
        // Store original position
        const originalX = this.x;
        const originalY = this.y;
        
        // Apply movement
        this.x += deltaX;
        this.y += deltaY;
        
        // Check if new position is valid
        let hasCollision = false;
        for (let wall of walls) {
            if (this.checkCollision(wall)) {
                hasCollision = true;
                break;
            }
        }
        
        if (hasCollision) {
            // If collision detected, revert and clear path to force recalculation
            this.x = originalX;
            this.y = originalY;
            this.currentPath = []; // Force pathfinding to recalculate
        }
        
        // Stuck detection for chase enemies
        if (!this.lastPos) {
            this.lastPos = {x: originalX, y: originalY};
            this.stuckCounter = 0;
        }
        
        const distanceMoved = Math.sqrt((this.x - this.lastPos.x) ** 2 + (this.y - this.lastPos.y) ** 2);
        
        if (distanceMoved < 1) { // Haven't moved much
            this.stuckCounter++;
            if (this.stuckCounter > 30) { // Stuck for 0.5 seconds
                // Force path recalculation by clearing current path
                this.currentPath = [];
                this.stuckCounter = 0;
            }
        } else {
            this.stuckCounter = 0;
            this.lastPos = {x: this.x, y: this.y};
        }
        
        // Keep enemy in bounds
        this.x = Math.max(5, Math.min(this.x, 795 - this.width));
        this.y = Math.max(5, Math.min(this.y, 595 - this.height));
    }    moveWithCollision(deltaX, deltaY, walls) {
        // Store original position
        const originalX = this.x;
        const originalY = this.y;
        
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
        
        // Try Y movement only (if X movement failed, reset position first)
        if (!canMoveX) {
            this.x = originalX;
        }
        this.y += deltaY;
        let canMoveY = true;
        for (let wall of walls) {
            if (this.checkCollision(wall)) {
                this.y = originalY;
                canMoveY = false;
                break;
            }
        }
        
        // If neither axis works, stay at original position
        // Pathfinding will handle complex navigation
        if (!canMoveX && !canMoveY) {
            this.x = originalX;
            this.y = originalY;
        }
    }

    patrolBehavior(moveSpeed, game) {
        if (this.patrolPoints.length === 0) return [0, 0];
        
        const target = this.patrolPoints[this.currentPatrolTarget];
        
        // Use pathfinding to move to patrol target
        const [moveX, moveY] = this.moveTowardsWithPathfinding(
            target.x, 
            target.y, 
            moveSpeed, 
            game.walls
        );
        
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {
            this.currentPatrolTarget = (this.currentPatrolTarget + 1) % this.patrolPoints.length;
            // Clear path when switching targets
            this.currentPath = [];
            return [0, 0];
        } else {
            return [moveX, moveY];
        }
    }    chaseBehavior(moveSpeed, game) {
        const playerDistance = this.getDistanceToPlayer(game.player);
        const canSeePlayer = this.hasLineOfSight(game.player, game.walls);
        
        // Store original position if not already stored
        if (!this.originalPos) {
            this.originalPos = {x: this.x, y: this.y};
        }
        
        // Initialize search pattern if not exists (only for chase enemies)
        if (!this.searchPattern) {
            this.searchPattern = [];
            this.searchIndex = 0;
            this.searchTimer = 0;
            this.isSearching = false;
        }
        
        // If player is in range AND visible, update last known position
        if (playerDistance < this.detectionRange && canSeePlayer) {
            this.lastPlayerPos = {x: game.player.x, y: game.player.y};
            this.huntTimer = 300; // 5 seconds at 60fps
            this.returnTimer = 0; // Reset return timer
            this.isSearching = false; // Stop searching when player is found
            // Clear path to get fresh route to player
            this.currentPath = [];
        }
        
        if (this.huntTimer > 0) {
            this.huntTimer--;
            
            // If we can still see the player, chase them directly
            if (canSeePlayer && playerDistance < this.detectionRange * 1.2) {
                // Update last known position and extend hunt timer
                this.lastPlayerPos = {x: game.player.x, y: game.player.y};
                this.huntTimer = Math.max(this.huntTimer, 150); // Extend hunt time
                this.isSearching = false;
                
                // Use pathfinding to chase current player position
                const [moveX, moveY] = this.moveTowardsWithPathfinding(
                    game.player.x, 
                    game.player.y, 
                    moveSpeed * 1.5, 
                    game.walls
                );
                return [moveX, moveY];
            } else {
                // Player not visible - check if we're being blocked by walls
                const directDistance = Math.sqrt(
                    (game.player.x - this.x) ** 2 + 
                    (game.player.y - this.y) ** 2
                );
                
                // If player is close but not visible, they're likely behind a wall
                if (directDistance < this.detectionRange && !canSeePlayer) {
                    // Try to find a path around the wall to get line of sight
                    const surroundPoints = [
                        {x: game.player.x + 50, y: game.player.y},     // Right of player
                        {x: game.player.x - 50, y: game.player.y},     // Left of player  
                        {x: game.player.x, y: game.player.y + 50},     // Below player
                        {x: game.player.x, y: game.player.y - 50},     // Above player
                        {x: game.player.x + 35, y: game.player.y + 35}, // Diagonal approaches
                        {x: game.player.x - 35, y: game.player.y - 35},
                        {x: game.player.x + 35, y: game.player.y - 35},
                        {x: game.player.x - 35, y: game.player.y + 35}
                    ];
                    
                    // Find the best flanking position that might give line of sight
                    let bestTarget = null;
                    let bestScore = -1;
                    
                    for (let point of surroundPoints) {
                        // Keep within bounds
                        point.x = Math.max(20, Math.min(780, point.x));
                        point.y = Math.max(20, Math.min(580, point.y));
                        
                        // Check if this position would give us line of sight to player
                        const hasLOS = this.hasLineOfSightBetweenPoints(
                            point.x, point.y, 
                            game.player.x, game.player.y, 
                            game.walls
                        );
                        
                        const distanceToPoint = Math.sqrt(
                            (point.x - this.x) ** 2 + 
                            (point.y - this.y) ** 2
                        );
                        
                        // Score based on line of sight and proximity
                        const score = (hasLOS ? 100 : 0) + (200 - distanceToPoint);
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestTarget = point;
                        }
                    }
                    
                    if (bestTarget) {
                        this.lastPlayerPos = {x: bestTarget.x, y: bestTarget.y};
                        const [moveX, moveY] = this.moveTowardsWithPathfinding(
                            bestTarget.x, 
                            bestTarget.y, 
                            moveSpeed * 1.3, 
                            game.walls
                        );
                        return [moveX, moveY];
                    }
                }
                
                // Fallback to original behavior - move to last known position or search
                const distanceToLastPos = Math.sqrt(
                    (this.lastPlayerPos.x - this.x) ** 2 + 
                    (this.lastPlayerPos.y - this.y) ** 2
                );
                
                if (distanceToLastPos > 25 && !this.isSearching) {
                    // Still moving to last known position
                    const [moveX, moveY] = this.moveTowardsWithPathfinding(
                        this.lastPlayerPos.x, 
                        this.lastPlayerPos.y, 
                        moveSpeed * 1.2, 
                        game.walls
                    );
                    return [moveX, moveY];
                } else {
                    // Reached last known position, start searching pattern
                    if (!this.isSearching) {
                        this.isSearching = true;
                        this.searchTimer = 0;
                        this.searchIndex = 0;
                        
                        // Create search pattern around last known position
                        this.searchPattern = [
                            {x: this.lastPlayerPos.x + 40, y: this.lastPlayerPos.y},
                            {x: this.lastPlayerPos.x - 40, y: this.lastPlayerPos.y},
                            {x: this.lastPlayerPos.x, y: this.lastPlayerPos.y + 40},
                            {x: this.lastPlayerPos.x, y: this.lastPlayerPos.y - 40},
                            {x: this.lastPlayerPos.x + 30, y: this.lastPlayerPos.y + 30},
                            {x: this.lastPlayerPos.x - 30, y: this.lastPlayerPos.y - 30},
                            {x: this.lastPlayerPos.x + 30, y: this.lastPlayerPos.y - 30},
                            {x: this.lastPlayerPos.x - 30, y: this.lastPlayerPos.y + 30}
                        ];
                    }
                    
                    // Execute search pattern
                    this.searchTimer++;
                    
                    // Change search target every 90 frames (1.5 seconds)
                    if (this.searchTimer > 90) {
                        this.searchIndex = (this.searchIndex + 1) % this.searchPattern.length;
                        this.searchTimer = 0;
                        this.currentPath = []; // Force new path calculation
                    }
                    
                    const searchTarget = this.searchPattern[this.searchIndex];
                    const [moveX, moveY] = this.moveTowardsWithPathfinding(
                        searchTarget.x,
                        searchTarget.y,
                        moveSpeed * 0.8,
                        game.walls
                    );
                    
                    return [moveX, moveY];
                }
            }
        } else {
            // Hunt timer expired, return to original position
            this.isSearching = false;
            
            if (!this.returnTimer) this.returnTimer = 120; // 2 second delay before returning
            
            if (this.returnTimer > 0) {
                this.returnTimer--;
                return [0, 0];
            } else {
                // Use pathfinding to return to original position
                const [moveX, moveY] = this.moveTowardsWithPathfinding(
                    this.originalPos.x, 
                    this.originalPos.y, 
                    moveSpeed * 0.8, 
                    game.walls
                );
                
                // Check if we've reached original position
                const dx = this.originalPos.x - this.x;
                const dy = this.originalPos.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= 10) {
                    // Reached original position, reset position exactly
                    this.x = this.originalPos.x;
                    this.y = this.originalPos.y;
                    this.currentPath = [];
                    return [0, 0];
                }
                
                return [moveX, moveY];
            }
        }
    }guardBehavior(moveSpeed, game) {
        const playerDistance = this.getDistanceToPlayer(game.player);
        const canSeePlayer = this.hasLineOfSight(game.player, game.walls);
        
        // Enhanced guard behavior - more responsive
        if (playerDistance < this.detectionRange && canSeePlayer) {
            // Active pursuit when player is visible using pathfinding
            const [moveX, moveY] = this.moveTowardsWithPathfinding(
                game.player.x, 
                game.player.y, 
                moveSpeed * 1.2, 
                game.walls
            );
            
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
                // Use pathfinding to return to guard position
                const [moveX, moveY] = this.moveTowardsWithPathfinding(
                    this.originalPos.x, 
                    this.originalPos.y, 
                    moveSpeed * 0.6, 
                    game.walls
                );
                
                const dx = this.originalPos.x - this.x;
                const dy = this.originalPos.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= 5) {
                    // Reached guard position
                    this.currentPath = [];
                    return [0, 0];
                } else {
                    return [moveX, moveY];
                }
            }
        }
        
        return [0, 0];
    }

    getDistanceToPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    hasLineOfSight(target, walls) {
        const startX = this.x + this.width / 2;
        const startY = this.y + this.height / 2;
        const endX = target.x + target.width / 2;
        const endY = target.y + target.height / 2;
        
        // Use more precise raycasting to check if there's a wall between enemy and player
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance / 3); // Check every 3 pixels for better accuracy
        
        if (steps === 0) return true; // Same position
        
        for (let i = 1; i <= steps; i++) { // Start from 1 to avoid checking enemy's own position
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

    hasLineOfSightBetweenPoints(x1, y1, x2, y2, walls) {
        // Check line of sight between two arbitrary points
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance / 3); // Check every 3 pixels for better accuracy
        
        if (steps === 0) return true; // Same position
        
        for (let i = 1; i <= steps; i++) {
            const checkX = x1 + (dx / steps) * i;
            const checkY = y1 + (dy / steps) * i;
            
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
    }

    // Simple A* pathfinding for enemy navigation
    findPath(targetX, targetY, walls) {
        const gridSize = 15; // Smaller grid for more precise pathfinding
        const startX = Math.floor(this.x / gridSize);
        const startY = Math.floor(this.y / gridSize);
        const endX = Math.floor(targetX / gridSize);
        const endY = Math.floor(targetY / gridSize);
        
        // Create a simple grid for pathfinding
        const maxX = Math.ceil(800 / gridSize); // Assuming canvas width 800
        const maxY = Math.ceil(600 / gridSize); // Assuming canvas height 600
        
        const openList = [];
        const closedList = [];
        const grid = [];
        
        // Initialize grid
        for (let x = 0; x < maxX; x++) {
            grid[x] = [];
            for (let y = 0; y < maxY; y++) {
                grid[x][y] = {
                    x: x,
                    y: y,
                    f: 0,
                    g: 0,
                    h: 0,
                    parent: null,
                    walkable: true
                };
            }
        }
        
        // Mark walls as unwalkable with a small buffer
        for (let wall of walls) {
            const buffer = 1; // 1 grid cell buffer around walls
            const wallStartX = Math.floor((wall.x - buffer * gridSize) / gridSize);
            const wallStartY = Math.floor((wall.y - buffer * gridSize) / gridSize);
            const wallEndX = Math.ceil((wall.x + wall.width + buffer * gridSize) / gridSize);
            const wallEndY = Math.ceil((wall.y + wall.height + buffer * gridSize) / gridSize);
            
            for (let x = wallStartX; x < wallEndX && x < maxX; x++) {
                for (let y = wallStartY; y < wallEndY && y < maxY; y++) {
                    if (x >= 0 && y >= 0) {
                        grid[x][y].walkable = false;
                    }
                }
            }
        }
        
        // Check bounds
        if (startX < 0 || startX >= maxX || startY < 0 || startY >= maxY ||
            endX < 0 || endX >= maxX || endY < 0 || endY >= maxY) {
            return [];
        }
        
        const startNode = grid[startX][startY];
        const endNode = grid[endX][endY];
        
        openList.push(startNode);
        
        while (openList.length > 0) {
            // Find node with lowest f score
            let currentNode = openList[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openList.length; i++) {
                if (openList[i].f < currentNode.f) {
                    currentNode = openList[i];
                    currentIndex = i;
                }
            }
            
            // Move current node from open to closed list
            openList.splice(currentIndex, 1);
            closedList.push(currentNode);
            
            // Check if we've reached the target
            if (currentNode === endNode) {
                const path = [];
                let current = currentNode;
                while (current !== null) {
                    path.unshift({
                        x: current.x * gridSize + gridSize / 2,
                        y: current.y * gridSize + gridSize / 2
                    });
                    current = current.parent;
                }
                return path;
            }
            
            // Check all neighbors
            const neighbors = [
                {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1},
                {x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}
            ];
            
            for (let neighbor of neighbors) {
                const newX = currentNode.x + neighbor.x;
                const newY = currentNode.y + neighbor.y;
                
                // Check bounds
                if (newX < 0 || newX >= maxX || newY < 0 || newY >= maxY) {
                    continue;
                }
                
                const neighborNode = grid[newX][newY];
                
                // Skip if not walkable or already in closed list
                if (!neighborNode.walkable || closedList.includes(neighborNode)) {
                    continue;
                }
                
                // Calculate scores
                const isDiagonal = Math.abs(neighbor.x) + Math.abs(neighbor.y) === 2;
                const tentativeG = currentNode.g + (isDiagonal ? 14 : 10);
                
                // Skip if this path to neighbor is worse than any previous one
                if (openList.includes(neighborNode) && tentativeG >= neighborNode.g) {
                    continue;
                }
                
                // This path is the best until now
                neighborNode.parent = currentNode;
                neighborNode.g = tentativeG;
                neighborNode.h = Math.abs(neighborNode.x - endNode.x) + Math.abs(neighborNode.y - endNode.y);
                neighborNode.f = neighborNode.g + neighborNode.h;
                
                if (!openList.includes(neighborNode)) {
                    openList.push(neighborNode);
                }
            }
            
            // Prevent infinite loops
            if (openList.length > 1000) {
                break;
            }
        }
        
        return []; // No path found
    }
    
    // Move towards a target using pathfinding
    moveTowardsWithPathfinding(targetX, targetY, moveSpeed, walls) {
        const currentTime = Date.now();
        const distanceToTarget = Math.sqrt((targetX - this.x) ** 2 + (targetY - this.y) ** 2);
        
        // For chase enemies, be more responsive to target changes
        const isChaseEnemy = this.aiType === 'chase';
        const pathUpdateFrequency = isChaseEnemy ? 300 : this.pathUpdateInterval; // 300ms for chase, 500ms for others
        
        // Check if target moved significantly (only for chase enemies)
        let targetMoved = false;
        if (isChaseEnemy && this.lastTargetPos) {
            const targetMovement = Math.sqrt(
                (targetX - this.lastTargetPos.x) ** 2 + 
                (targetY - this.lastTargetPos.y) ** 2
            );
            targetMoved = targetMovement > 30; // Target moved more than 30 pixels
        }
        
        // Update path if needed
        if (this.currentPath.length === 0 || 
            currentTime - this.lastPathUpdate > pathUpdateFrequency ||
            this.pathIndex >= this.currentPath.length ||
            targetMoved) {
            
            this.currentPath = this.findPath(targetX, targetY, walls);
            this.pathIndex = 0;
            this.lastPathUpdate = currentTime;
            this.lastTargetPos = {x: targetX, y: targetY};
        }
        
        // For very close targets, move directly to avoid jittery pathfinding
        if (distanceToTarget < 25) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            if (distanceToTarget > 0) {
                return [(dx / distanceToTarget) * moveSpeed, (dy / distanceToTarget) * moveSpeed];
            }
            return [0, 0];
        }
        
        // If we have a path, follow it
        if (this.currentPath.length > 0 && this.pathIndex < this.currentPath.length) {
            const currentTarget = this.currentPath[this.pathIndex];
            const dx = currentTarget.x - this.x;
            const dy = currentTarget.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If we're close to current waypoint, move to next one
            if (distance < 12) {
                this.pathIndex++;
                if (this.pathIndex < this.currentPath.length) {
                    const nextTarget = this.currentPath[this.pathIndex];
                    const nextDx = nextTarget.x - this.x;
                    const nextDy = nextTarget.y - this.y;
                    const nextDistance = Math.sqrt(nextDx * nextDx + nextDy * nextDy);
                    
                    if (nextDistance > 0) {
                        return [(nextDx / nextDistance) * moveSpeed, (nextDy / nextDistance) * moveSpeed];
                    }
                }
                return [0, 0];
            } else {
                // Move towards current waypoint
                return [(dx / distance) * moveSpeed, (dy / distance) * moveSpeed];
            }
        }
        
        // Fallback to direct movement if no path found
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        
        if (distanceToTarget > 0) {
            return [(dx / distanceToTarget) * moveSpeed, (dy / distanceToTarget) * moveSpeed];
        }
        
        return [0, 0];
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
