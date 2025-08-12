# Shadow Escape - Developer Playbook

## Overview
Shadow Escape is a 2D horror arcade game built with HTML5 Canvas and vanilla JavaScript. This playbook serves as a comprehensive guide for developers working on the game, covering physics systems, styling guidelines, AI behaviors, and development patterns.

## Table of Contents
1. [Game Architecture](#game-architecture)
2. [Physics & Movement](#physics--movement)
3. [AI & Pathfinding](#ai--pathfinding)
4. [Styling & Theming](#styling--theming)
5. [Level Design](#level-design)
6. [Debug Systems](#debug-systems)
7. [Performance Guidelines](#performance-guidelines)
8. [Code Patterns](#code-patterns)

---

## Game Architecture

### Core Classes
- **Game**: Main game controller, handles state management, rendering, and game loop
- **Player**: Player character with collision-based movement
- **Enemy**: AI-controlled entities with different behavior types
- **Wall**: Static collision objects that define level geometry
- **Key**: Collectible items required to unlock the exit
- **Exit**: Level completion trigger
- **Particle**: Visual effects system

### Game States
- `menu`: Main menu screen
- `playing`: Active gameplay
- `paused`: Game paused
- `gameOver`: Player death screen
- `victory`: Game completion screen

### Core Game Loop
```javascript
gameLoop(currentTime) {
    this.deltaTime = currentTime - this.lastTime;
    this.update(this.deltaTime);
    this.render();
    requestAnimationFrame(this.gameLoop);
}
```

---

## Physics & Movement

### Player Movement System
**Type**: Collision-based sliding movement
**Speed**: 150 pixels/second

#### Key Principles:
1. **Separate Axis Movement**: Try X and Y movement independently
2. **Wall Sliding**: If diagonal movement fails, allow sliding along walls
3. **Buffer Zones**: 0.5px buffer prevents exact edge collision issues
4. **Boundary Enforcement**: 2px padding from screen edges

```javascript
// Movement priority order:
1. Try full diagonal movement
2. If blocked, try X-only movement
3. If X blocked, try Y-only movement
4. If both blocked, stay in place
```

#### Implementation Guardrails:
- Always store `lastX` and `lastY` before movement attempts
- Use `checkCollision()` with buffer zones
- Revert to last valid position on collision
- Apply boundary clamping as final step

### Enemy Movement Systems

#### Dual Movement System:
- **Chase Enemies**: Pure pathfinding movement (no collision sliding)
- **Patrol/Guard Enemies**: Traditional collision-based movement

#### Chase Enemy Movement:
```javascript
// Use applyPathfindingMovement() for chase enemies
// Direct position updates with collision validation
// Automatic path recalculation on collision
```

#### Patrol/Guard Enemy Movement:
```javascript
// Use moveWithCollision() for patrol/guard enemies
// Same sliding mechanics as player
// Allows natural wall navigation
```

---

## AI & Pathfinding

### Enemy AI Types

#### 1. Patrol Enemies
- Follow predefined patrol points in sequence
- Use pathfinding between patrol points
- Non-aggressive, predictable movement
- Return to patrol route after player contact

#### 2. Chase Enemies
- Detect player within 100px range
- Hunt for 5 seconds after losing sight
- Smart flanking behavior when player hides behind walls
- Return to original position after hunt timeout
- **Advanced Flanking System**: Calculate 8 surrounding positions when player is hidden

#### 3. Guard Enemies
- Stay at original position
- Pursue player when in range and visible
- Return to guard post after losing player

### Pathfinding System (A* Algorithm)

#### Grid Configuration:
- **Grid Size**: 15px for precise navigation
- **Update Interval**: 500ms to balance performance
- **Wall Buffer**: Built into grid calculations

#### Pathfinding Rules:
1. Recalculate path every 500ms or on collision
2. Clear path when switching targets
3. Use heuristic distance for A* scoring
4. Validate each grid cell for wall collisions

#### Stuck Detection:
- Monitor movement distance over 30 frames
- Force path recalculation if movement < 1px
- Reset stuck counter on successful movement

---

## Styling & Theming

### Theme System
Each level has a distinct visual theme controlled by CSS classes and canvas rendering.

#### Level Themes:
1. **Level 1 - Office Building**
   - Colors: Dark blues/grays (#1a1a2e, #2c2c54)
   - Accent: Red (#e94560)
   - Atmosphere: Corporate horror

2. **Level 2 - Hospital**
   - Colors: Sickly greens (#0d2818, #1e3d2f)
   - Accent: Green (#7dd87d)
   - Atmosphere: Medical horror

3. **Level 3 - Underground**
   - Colors: Deep reds/blacks (#2c0e0e, #4a1c1c)
   - Accent: Red (#ff4757)
   - Atmosphere: Underground tunnels

### CSS Theme Classes:
```css
.theme-level1 { /* Office theme */ }
.theme-level2 { /* Hospital theme */ }
.theme-level3 { /* Underground theme */ }
```

### Visual Systems

#### Lighting System:
- **Type**: Radial gradient centered on player
- **Radius**: 80px light circle
- **Falloff**: Smooth gradient from transparent to 95% opacity
- **Performance**: Single radial gradient overlay

#### Particle System:
- **Hit Effects**: Red particles on damage
- **Key Collection**: Yellow sparkle effects
- **Level Transition**: Blue transition particles

#### UI Color Scheme:
- **Primary**: #e94560 (red)
- **Secondary**: Level-specific accents
- **Text**: White on dark backgrounds
- **Health Bar**: Dynamic color based on health percentage

---

## Level Design

### Layout Principles
1. **Player Spawn**: Safe area (100, 100) away from enemies
2. **Wall Spacing**: Minimum 40px gaps to prevent pathfinding issues
3. **Key Placement**: 80px minimum distance between keys and from enemies
4. **Exit Position**: Accessible but challenging to reach

### Wall Placement Guidelines:
- Avoid corners and edges (20px+ padding)
- Create interesting but navigable paths
- Test with pathfinding grid (15px consideration)
- Ensure multiple routes to objectives

### Enemy Placement Rules:
- No enemies within 80px of player spawn
- Strategic positions for interesting gameplay
- Consider patrol routes and guard positions
- Test AI behavior in confined spaces

### Key Generation System:
```javascript
// Smart placement with validation:
1. Check wall collisions
2. Verify distance from player (80px min)
3. Verify distance from enemies (60px min)
4. Verify distance from other keys (80px min)
5. Test basic reachability from player
```

---

## Debug Systems

### Debug Menu Access:
**Trigger**: Arrow key sequence ↑↑↓↓←→←→ on main menu
**Features**:
- Direct level access
- Skip progression
- Return to menu after completion
- Independent of normal gameplay

### Debug Mode Flags:
- `isDebugMode`: Tracks debug session state
- `debugMenuVisible`: Controls menu display
- `debugIndex`: Tracks input sequence progress

### Console Logging:
Enable comprehensive logging for:
- Debug sequence detection
- Pathfinding decisions
- AI state changes
- Collision detection issues

---

## Performance Guidelines

### Optimization Strategies

#### Pathfinding:
- Limit grid resolution (15px)
- Update paths at intervals, not every frame
- Cache paths when possible
- Clear paths on target changes

#### Collision Detection:
- Use bounding box collision only
- Implement early exit strategies
- Minimize collision checks per frame

#### Rendering:
- Use canvas save/restore sparingly
- Batch similar draw operations
- Limit particle counts
- Optimize gradient calculations

#### Memory Management:
- Remove expired particles promptly
- Clear unused paths
- Reset enemy states properly

---

## Code Patterns

### Error Handling
```javascript
// Always validate objects before use
if (!this.player || !this.walls) return;

// Use safe property access
const target = this.patrolPoints[this.currentTarget];
if (!target) return [0, 0];
```

### State Management
```javascript
// Clear state when transitioning
this.enemies = [];
this.particles = [];
this.currentPath = [];

// Reset timers and flags
this.huntTimer = 0;
this.isSearching = false;
```

### Canvas Best Practices
```javascript
// Save/restore for transformations
ctx.save();
// Apply transformations
ctx.restore();

// Clear shadow effects
ctx.shadowBlur = 0;

// Use appropriate line widths
ctx.lineWidth = 1;
```

### Event Handling
```javascript
// Check game state before processing
if (this.gameState !== 'menu') return;

// Validate DOM elements exist
const element = document.getElementById('target');
if (!element) return;
```

---

## Testing Guidelines

### Manual Testing Checklist
- [ ] Player movement in all directions
- [ ] Wall collision behavior
- [ ] Enemy pathfinding around obstacles
- [ ] Key collection and placement
- [ ] Level progression
- [ ] Debug menu accessibility
- [ ] Theme transitions
- [ ] Performance with multiple enemies

### Known Issues to Monitor
1. **Enemy Corner Sticking**: Watch for chase enemies getting stuck
2. **Pathfinding Loops**: Monitor for infinite path recalculation
3. **Memory Leaks**: Check particle cleanup
4. **Input Lag**: Verify responsive controls

### Performance Benchmarks
- **Target FPS**: 60fps
- **Max Enemies**: 6 per level
- **Max Particles**: 50 concurrent
- **Pathfinding Budget**: <5ms per enemy per update

---

## Future Development Notes

### Extensibility Points
- **New Enemy Types**: Extend AI behavior patterns
- **Additional Levels**: Follow layout and theming guidelines
- **Power-ups**: Integrate with existing collision system
- **Sound**: Hook into existing event system

### Architecture Considerations
- Keep physics deterministic
- Maintain separation between rendering and logic
- Use consistent coordinate systems
- Document any new state variables

### Version Control Best Practices
- Test pathfinding changes thoroughly
- Validate theme consistency
- Ensure debug systems remain functional
- Document performance impact of changes

---

*This playbook should be updated as the game evolves. Always test changes against the core systems documented here.*
