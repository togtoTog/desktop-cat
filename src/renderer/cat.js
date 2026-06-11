import { Behaviors } from './behaviors/index.js';
import { getFallbackCatDataURI } from './cat-fallback.js';

export class Cat {
  constructor(el, visual, config, workArea) {
    this.el = el;
    this.visual = visual;
    this.config = config;
    this.workArea = workArea;

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

    this.behaviors = {};
    this.state = null;

    this.loadAppearance();
    this.bindDrag();
    this.moveTo(this.x, this.y);
  }

  /** 加载形象：优先写实照片，没有则用内置 SVG 占位 */
  loadAppearance() {
    const ap = this.config.appearance || {};
    const tryImage = ap.useImageIfPresent !== false && ap.imagePath;

    const useFallback = () => {
      this.visual.style.backgroundImage = `url("${getFallbackCatDataURI()}")`;
    };

    if (tryImage) {
      // imagePath 相对项目根；渲染进程位于 src/renderer，需回退两级
      const img = new Image();
      const url = '../../' + ap.imagePath;
      img.onload = () => {
        this.visual.style.backgroundImage = `url("${url}")`;
      };
      img.onerror = () => useFallback();
      img.src = url;
      // 先放占位，加载成功再覆盖，避免空白
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
    if (this.dragging) return; // 拖动时锁定状态
    if (this.state && this.state.name === name) return;
    if (this.state && this.state.exit) this.state.exit();
    this.state = this.behaviors[name];
    if (this.state && this.state.enter) this.state.enter();
  }

  setFacing(dir) {
    if (this.facing === dir) return;
    this.facing = dir;
    this.el.classList.toggle('face-left', dir === 'left');
  }

  moveTo(x, y) {
    // 限制在工作区内
    this.x = Math.max(0, Math.min(x, this.workArea.width - this.size));
    this.y = Math.max(0, Math.min(y, this.workArea.height - this.size));
    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  /** 是否应进入跟随鼠标状态 */
  shouldFollowMouse() {
    if (this.dragging || !this.mouse) return false;
    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;
    const dist = Math.hypot(this.mouse.x - cx, this.mouse.y - cy);
    return dist < (this.config.behavior?.followMouseRadius || 180);
  }

  update(dt) {
    if (this.dragging) return;
    if (this.state && this.state.update) this.state.update(dt);
  }
}
