# 🌑 Shadow Escape

A thrilling 2D horror arcade game where you must navigate through dark environments while escaping intelligent AI enemies. Built with HTML5 Canvas and featuring advanced pathfinding AI, atmospheric effects, and multiple challenging levels.

![Shadow Escape](https://img.shields.io/badge/Game-HTML5-orange) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![CSS3](https://img.shields.io/badge/CSS3-Animations-blue)

## 🎮 Game Features

### Core Gameplay
- **3 Unique Levels**: Office Building, Hospital, and Underground facility
- **Smart AI Enemies**: Advanced A* pathfinding with flanking behavior
- **Multiple Enemy Types**: 
  - Chase enemies with aggressive pursuit
  - Patrol enemies with predictable patterns
  - Guard enemies protecting specific areas
- **Atmospheric Horror**: Dark environments with limited visibility
- **Key Collection**: Find keys to unlock the exit in each level

### Technical Features
- **Advanced AI Pathfinding**: A* algorithm with 15px grid-based navigation
- **Dual Movement Systems**: Pure pathfinding for intelligent enemies, collision-based for patrols
- **Debug System**: Built-in level selection for testing (↑↑↓↓←→←→)
- **Responsive Design**: Adapts to different screen sizes
- **Atmospheric Effects**: Organic floating particles and smooth background animations

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/laiseaquino/shadow-escape.git
   cd shadow-escape
   ```

2. **Open the game**:
   - Open `index.html` in your web browser
   - Or use a local server for best performance:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     ```

3. **Play**:
   - Navigate to `http://localhost:8000` (if using a server)
   - Click "Start Game" to begin your escape!

## 🎯 How to Play

### Controls
- **Arrow Keys** or **WASD**: Move your character
- **ESC**: Pause/Resume game
- **Mouse**: Navigate menus

### Objective
1. **Survive**: Avoid contact with enemies at all costs
2. **Collect Keys**: Find the key in each level to unlock the exit
3. **Escape**: Reach the exit door to progress to the next level
4. **Complete All Levels**: Survive all three environments to win

### Enemy Behavior
- **Red Enemies (Chase)**: Actively hunt you using intelligent pathfinding
- **Blue Enemies (Patrol)**: Follow set patrol routes
- **Purple Enemies (Guard)**: Protect specific areas and chase when alerted

## 🏗️ Project Structure

```
shadow-escape/
├── index.html          # Main game file
├── game.js             # Core game logic and AI systems
├── style.css           # Visual styling and atmospheric effects
├── playbook.md         # Developer documentation and guidelines
├── instructions.txt    # Game instructions and story
├── favicon.svg         # Game icon
├── favicon-16.svg      # Small icon variant
├── favicon-fallback.txt # Icon fallback
└── README.md           # This file
```

## 🛠️ Development

### Architecture
- **HTML5 Canvas**: Rendering engine for smooth 60fps gameplay
- **ES6 Classes**: Object-oriented design for game entities
- **CSS3 Animations**: Atmospheric effects and UI transitions
- **Responsive Design**: Mobile-friendly interface

### Key Components
- **Game Class**: Main game loop and state management
- **Player Class**: Player movement and collision detection
- **Enemy Classes**: AI behavior and pathfinding systems
- **Level System**: Dynamic level loading and theming

### Debug Features
Enter the Konami-style sequence (↑↑↓↓←→←→) on the main menu to access:
- Level selection menu
- Direct level testing
- Quick gameplay iteration

## 🎨 Visual Design

### Atmospheric Effects
- **Dynamic Background**: Rotating conic gradients with organic movement
- **Floating Particles**: Multi-layered particle system with staggered animations
- **Breathing Pulse**: Smooth transitions with blur and scale effects
- **Level Themes**: Each level has unique color schemes and atmospheres

### Color Schemes
- **Level 1 (Office)**: Dark blues and grays with red accents
- **Level 2 (Hospital)**: Sickly greens and whites
- **Level 3 (Underground)**: Deep reds and blacks

## 🧠 AI System

### Pathfinding Algorithm
- **A* Implementation**: Optimal pathfinding with heuristic optimization
- **15px Grid System**: Precise navigation grid for smooth movement
- **Wall Buffer System**: Prevents corner-sticking issues
- **Stuck Detection**: Automatic recovery from navigation problems

### Enemy Intelligence
- **Flanking Behavior**: Smart enemies try to surround the player
- **Dynamic Targeting**: Real-time path recalculation
- **Collision Avoidance**: Enemies avoid walls and obstacles
- **Behavioral Diversity**: Different AI patterns for gameplay variety

## 📖 Documentation

For detailed development guidelines, AI behavior patterns, and technical specifications, see [`playbook.md`](playbook.md).

## 🎵 Credits

### Fonts
- **Creepster**: Google Fonts (Horror title font)
- **Orbitron**: Google Fonts (UI and body text)

### Technologies
- HTML5 Canvas API
- CSS3 Animations & Transforms
- JavaScript ES6+
- A* Pathfinding Algorithm

## 🐛 Known Issues

- None currently reported! The AI pathfinding and atmospheric effects are working smoothly.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎮 Gameplay Tips

- **Study Enemy Patterns**: Each enemy type behaves differently
- **Use Walls Strategically**: Enemies can't pass through walls
- **Plan Your Route**: Think ahead before moving toward the key
- **Stay Alert**: Enemies are smart and will try to trap you
- **Practice Makes Perfect**: Use the debug menu to practice difficult levels

---

**Ready to escape the shadows?** 🌑

*Built with ❤️ and JavaScript*
