export class ParticleBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
    }

    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.animate();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        document.body.insertBefore(this.canvas, document.body.firstChild);
    }

    setupEventListeners() {
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        this.particles.push({
            x: Math.random() * this.canvas.width,
            y: 0,
            radius: Math.random() * 3 + 1,
            color: `rgba(255, 255, 255, ${Math.random() * 0.5})`,
            speed: Math.random() * 2 + 1,
            opacity: Math.random()
        });
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.y += particle.speed;
            particle.opacity -= 0.01;
            return particle.y < this.canvas.height && particle.opacity > 0;
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
        });
    }

    animate() {
        this.createParticle();
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(this.animate.bind(this));
    }
}