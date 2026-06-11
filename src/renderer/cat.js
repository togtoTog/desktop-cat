import { Behaviors } from './behaviors/index.js';
import { getFallbackCatDataURI } from './cat-fallback.js';

export class Cat {
  constructor(el, visual, config, workArea, canvas) {
    this.el = el;
    this.visual = visual;
    this.canvas = canvas;
    this.config = config;
    this.workArea = workArea;

    this.renderMode = config.appearance?.renderMode === '3d' ? '3d' : '2d';
    this.size = config.appearance?.size || 120;
    this.el.style.width = this.size + 'px';
    this.el.style.height = this.size + 'px';

    // 初始位置：屏幕底部偏右
    this.x = workArea.width * 0.7;
    this.y = workArea.height - this.size - 10;

    this.facing = 'right';
    this.mouse = null;       // 鼠标在窗口内的相对坐标，null 表示不在范围
    this.dragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.scene3d = null;     // 3D 场景控制器（懒加载）

    this.behaviors = {};
    this.state = null;

    this.bindDrag();
    this.moveTo(this.x, this.y);
    this.initVisual();
  }

  /** 根据渲染模式初始化视觉层 */
  async initVisual() {
    if (this.renderMode === '3d') {
      this.el.classList.add('mode-3d');
      try {
        const { CatScene3D } = await import('./three/CatScene3D.js');
        this.scene3d = new CatScene3D(this.canvas, this.config);
      } catch (e) {
        console.error('[desktop-cat] 3D 初始化失败，回退到 2D：', e);
        this.renderMode = '2d';
        this.el.classList.remove('mode-3d');
        this.loadAppearance();
      }
    } else {
      this.loadAppearance();
    }
  }

  /** 2D 形象：优先写实照片，没有则用内置 SVG 占位 */
  loadAppearance() {
    const ap = this.config.appearance || {};
    const tryImage = ap.useImageIfPresent !== false && ap.imagePath;

    const useFallback = () => {
      this.visual.style.backgroundImage = `url("${getFallbackCatDataURI()}")`;
    };

    if (tryImage) {
      const img = new Image();
      const url = '../../' + ap.imagePath;
      img.onload = () => { this.visual.style.backgroundImage = `url("${url}")`; };
      img.onerror = () => useFallback();
      img.src = url;
      useFallback();
    } else {
      useFallback();
    }
  }

  bindDrag() {
    this.el.addEventListener('mousedown', (e) => {
      this.dragging = true;
      this.el.classList.add('grabbed');
      this.dragOffset.x = e.clientX - this.x;
      this.dragOffset.y = e.clientY - this.y;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.dragging) return;
      this.moveTo(e.clientX - this.dragOffset.x, e.clientY - this.dragOffset.y);
    });

    window.addEventListener('mouseup', () => {
      if (!this.dragging) return;
      this.dragging = false;
      this.el.classList.remove('grabbed');
      this.setState('idle');
    });
  }

  registerBehaviors() {
    for (const [key, Cls] of Object.entries(Behaviors)) {
      this.behaviors[key] = new Cls(this);
    }
  }

  setState(name) {
    if (this.dragging) return;
    if (this.state && this.state.name === name) return;
    if (this.state && this.state.exit) this.state.exit();
    this.state = this.behaviors[name];
    if (this.state && this.state.enter) this.state.enter();

    // 同步 3D 行走状态
    if (this.scene3d) {
      this.scene3d.setWalking(name === 'walk' || name === 'follow');
    }
  }

  setFacing(dir) {
    if (this.facing === dir) return;
    this.facing = dir;
    this.el.classList.toggle('face-left', dir === 'left');
    if (this.scene3d) this.scene3d.setFacing(dir);
  }

  moveTo(x, y) {
    this.x = Math.max(0, Math.min(x, this.workArea.width - this.size));
    this.y = Math.max(0, Math.min(y, this.workArea.height - this.size));
    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  shouldFollowMouse() {
    if (this.dragging || !this.mouse) return false;
    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;
    const dist = Math.hypot(this.mouse.x - cx, this.mouse.y - cy);
    return dist < (this.config.behavior?.followMouseRadius || 180);
  }

  /** 把鼠标相对小猫的方向传给 3D，让它转头看 */
  updateLook() {
    if (!this.scene3d || !this.mouse) return;
    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;
    const dx = (this.mouse.x - cx) / (this.size);
    const dy = (this.mouse.y - cy) / (this.size);
    this.scene3d.setLook(dx, dy);
  }

  update(dt) {
    if (!this.dragging && this.state && this.state.update) {
      this.state.update(dt);
    }
    // 3D 动画始终更新（即使拖动也保持眨眼呼吸）
    if (this.scene3d) {
      this.updateLook();
      this.scene3d.update(dt);
    }
  }
}
