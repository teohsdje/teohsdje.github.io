// Główny plik aplikacji - tutaj wszystko się inicjalizuje

console.log('🎮 Clash Royale Game - Loaded!');

// Loading Screen
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.init();
    }

    init() {
        // Ustaw rozmiar canvas
        this.canvas.width = 400;
        this.canvas.height = 400;

        // Stwórz particles
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: Math.random() > 0.5 ? '#FFD700' : '#87CEEB'
            });
        }

        // Animuj particles
        this.animate();

        // Ukryj loading screen po 2 sekundach
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 500);
        }, 2000);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            // Rysuj particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();

            // Aktualizuj pozycję
            p.x += p.vx;
            p.y += p.vy;

            // Odbicie od krawędzi
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
        });

        if (!this.loadingScreen.classList.contains('hidden')) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// Inicjalizuj loading screen
const loadingScreen = new LoadingScreen();

// Dodaj style dla animacji shake
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);