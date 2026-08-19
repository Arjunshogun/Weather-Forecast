/**
 * Dynamic Atmospheric Background Particle & Canvas Engine
 * Simulates real-time Rain, Snow, Clouds, Stars, Sunbeams, and Lightning flashes.
 */
class WeatherEffectsEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationFrameId = null;
    this.mode = 'clear-day'; // 'clear-day', 'clear-night', 'rain', 'snow', 'thunder', 'cloudy'
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.lightningCounter = 0;
    this.lightningAlpha = 0;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
    this.initParticles();
    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.initParticles();
  }

  setMode(weatherCode, isDay) {
    let newMode = 'clear-day';

    // WMO Weather codes:
    // 0: Clear sky
    // 1, 2, 3: Mainly clear, partly cloudy, overcast
    // 45, 48: Fog
    // 51, 53, 55, 56, 57: Drizzle
    // 61, 63, 65, 66, 67, 80, 81, 82: Rain & Showers
    // 71, 73, 75, 77, 85, 86: Snow
    // 95, 96, 99: Thunderstorm

    if ([95, 96, 99].includes(weatherCode)) {
      newMode = 'thunder';
    } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      newMode = 'snow';
    } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
      newMode = 'rain';
    } else if ([2, 3, 45, 48].includes(weatherCode)) {
      newMode = 'cloudy';
    } else {
      newMode = isDay ? 'clear-day' : 'clear-night';
    }

    if (this.mode !== newMode) {
      this.mode = newMode;
      this.initParticles();
      this.updateBodyTheme(newMode);
    }
  }

  updateBodyTheme(mode) {
    document.body.className = '';
    switch (mode) {
      case 'rain':
        document.body.classList.add('weather-theme-rainy');
        break;
      case 'snow':
        document.body.classList.add('weather-theme-snowy');
        break;
      case 'thunder':
        document.body.classList.add('weather-theme-thunder');
        break;
      case 'cloudy':
        document.body.classList.add('weather-theme-cloudy');
        break;
      case 'clear-night':
        document.body.classList.add('weather-theme-night');
        break;
      default:
        document.body.classList.add('weather-theme-sunny');
        break;
    }
  }

  initParticles() {
    this.particles = [];
    const count = this.getParticleCount();

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  getParticleCount() {
    switch (this.mode) {
      case 'rain': return 120;
      case 'thunder': return 150;
      case 'snow': return 80;
      case 'clear-night': return 70;
      case 'cloudy': return 25;
      case 'clear-day': return 35;
      default: return 30;
    }
  }

  createParticle() {
    const x = Math.random() * this.width;
    const y = Math.random() * this.height;

    switch (this.mode) {
      case 'rain':
      case 'thunder':
        return {
          x,
          y,
          length: 15 + Math.random() * 20,
          speed: 12 + Math.random() * 10,
          opacity: 0.15 + Math.random() * 0.35,
          slant: -1.5
        };
      case 'snow':
        return {
          x,
          y,
          radius: 1.5 + Math.random() * 3,
          speed: 0.8 + Math.random() * 1.5,
          sway: Math.random() * 2,
          swaySpeed: 0.02 + Math.random() * 0.02,
          opacity: 0.2 + Math.random() * 0.6
        };
      case 'clear-night':
        return {
          x,
          y,
          radius: 0.8 + Math.random() * 1.6,
          twinkleSpeed: 0.015 + Math.random() * 0.03,
          twinkleOffset: Math.random() * Math.PI * 2,
          baseAlpha: 0.2 + Math.random() * 0.6
        };
      case 'cloudy':
        return {
          x,
          y: y * 0.6,
          radius: 80 + Math.random() * 120,
          speed: 0.15 + Math.random() * 0.3,
          opacity: 0.03 + Math.random() * 0.05
        };
      case 'clear-day':
      default:
        return {
          x,
          y,
          radius: 1 + Math.random() * 2,
          speedY: -0.2 - Math.random() * 0.4,
          speedX: (Math.random() - 0.5) * 0.3,
          opacity: 0.1 + Math.random() * 0.25
        };
    }
  }

  start() {
    if (!this.animationFrameId) {
      this.animate();
    }
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Lightning Flash for Thunder
    if (this.mode === 'thunder') {
      this.lightningCounter++;
      if (this.lightningCounter > 200 && Math.random() < 0.02) {
        this.lightningAlpha = 0.35 + Math.random() * 0.25;
        this.lightningCounter = 0;
      }
      if (this.lightningAlpha > 0) {
        this.ctx.fillStyle = `rgba(224, 231, 255, ${this.lightningAlpha})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.lightningAlpha *= 0.82;
        if (this.lightningAlpha < 0.01) this.lightningAlpha = 0;
      }
    }

    // Render Particles
    for (let p of this.particles) {
      switch (this.mode) {
        case 'rain':
        case 'thunder':
          this.ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
          this.ctx.lineWidth = 1.2;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p.x + p.slant * (p.length / 5), p.y + p.length);
          this.ctx.stroke();

          p.y += p.speed;
          p.x += p.slant;
          if (p.y > this.height) {
            p.y = -p.length;
            p.x = Math.random() * this.width;
          }
          break;

        case 'snow':
          this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          this.ctx.beginPath();
          this.ctx.arc(p.x + Math.sin(p.sway) * 8, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();

          p.sway += p.swaySpeed;
          p.y += p.speed;
          if (p.y > this.height) {
            p.y = -p.radius * 2;
            p.x = Math.random() * this.width;
          }
          break;

        case 'clear-night':
          p.twinkleOffset += p.twinkleSpeed;
          const currentAlpha = Math.max(0.1, p.baseAlpha + Math.sin(p.twinkleOffset) * 0.3);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();
          break;

        case 'cloudy':
          const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          gradient.addColorStop(0, `rgba(148, 163, 184, ${p.opacity})`);
          gradient.addColorStop(1, 'rgba(148, 163, 184, 0)');
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();

          p.x += p.speed;
          if (p.x - p.radius > this.width) {
            p.x = -p.radius;
          }
          break;

        case 'clear-day':
        default:
          this.ctx.fillStyle = `rgba(253, 224, 71, ${p.opacity})`;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();

          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y < 0) {
            p.y = this.height;
            p.x = Math.random() * this.width;
          }
          break;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}
