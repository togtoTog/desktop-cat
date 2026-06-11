// 3D 小猫场景控制器：基于 Three.js，渲染到透明画布，并驱动骨骼部件做动作。
import * as THREE from '../../../node_modules/three/build/three.module.js';
import { buildCat } from './buildCat.js';

export class CatScene3D {
  /**
   * @param {HTMLCanvasElement} canvas 透明画布
   * @param {object} config 小猫配置
   */
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.size = config.appearance?.size || 120;

    // 渲染器（透明背景）
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setClearColor(0x000000, 0); // 完全透明
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.size, this.size, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 场景
    this.scene = new THREE.Scene();

    // 相机：略微俯视，正对小猫
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0.2, 1.2, 5.2);
    this.camera.lookAt(0, 0.9, 0);

    // 光照
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff0e0, 0.4);
    fill.position.set(-3, 2, 2);
    this.scene.add(fill);

    // 小猫模型
    const { root, parts } = buildCat({
      bodyColor: this.parseColor(config.appearance?.bodyColor, 0xf0992e),
      eyeColor: this.parseColor(config.appearance?.eyeColor, 0x6db84c)
    });
    this.cat = root;
    this.parts = parts;
    this.scene.add(root);

    // 朝向：默认面向右（+x）；通过整体绕 y 旋转切换左右
    this.baseRotationY = -Math.PI / 2 + 0.35; // 让猫稍微偏向镜头一点更可爱
    this.cat.rotation.y = this.baseRotationY;

    // 动画状态
    this.clock = new THREE.Clock();
    this.t = 0;
    this.walking = false;
    this.facing = 'right';
    this.lookTarget = { x: 0, y: 0 }; // -1~1，转头看的方向
    this.blinkTimer = this.randomBlinkDelay();
    this.blinkPhase = -1; // -1 表示不在眨眼

    this.render();
  }

  parseColor(v, fallback) {
    if (typeof v === 'string') {
      try { return new THREE.Color(v).getHex(); } catch (e) { return fallback; }
    }
    if (typeof v === 'number') return v;
    return fallback;
  }

  setFacing(dir) {
    this.facing = dir;
  }

  setWalking(walking) {
    this.walking = walking;
  }

  /** 让小猫的头看向某个方向，dx/dy 为 -1~1 */
  setLook(dx, dy) {
    this.lookTarget.x = Math.max(-1, Math.min(1, dx));
    this.lookTarget.y = Math.max(-1, Math.min(1, dy));
  }

  randomBlinkDelay() {
    return 1.5 + Math.random() * 3.5;
  }

  update(dt) {
    this.t += dt;
    const p = this.parts;

    // --- 朝向插值（左右转身）---
    const targetY = this.baseRotationY + (this.facing === 'left' ? Math.PI : 0);
    this.cat.rotation.y += (this.angleLerp(this.cat.rotation.y, targetY) - this.cat.rotation.y) * Math.min(1, dt * 8);

    // --- 呼吸：身体轻微起伏 ---
    const breath = Math.sin(this.t * 2.2) * 0.02;
    if (p.body) p.body.scale.set(1 + breath, 1 - breath, 1 + breath);

    // --- 转头看鼠标 ---
    if (p.head) {
      const targetYaw = this.lookTarget.x * 0.5 * (this.facing === 'left' ? -1 : 1);
      const targetPitch = -this.lookTarget.y * 0.35;
      p.head.rotation.y += (targetYaw - p.head.rotation.y) * Math.min(1, dt * 6);
      p.head.rotation.z += (targetPitch - p.head.rotation.z) * Math.min(1, dt * 6);
    }

    // --- 眨眼：压扁眼睛 ---
    this.blinkTimer -= dt;
    if (this.blinkPhase < 0 && this.blinkTimer <= 0) {
      this.blinkPhase = 0;
    }
    if (this.blinkPhase >= 0) {
      this.blinkPhase += dt * 8; // 眨眼速度
      const s = this.blinkPhase < 1
        ? 1 - this.blinkPhase            // 闭
        : Math.min(1, this.blinkPhase - 1); // 睁
      const sy = Math.max(0.05, s);
      if (p.eyeL) p.eyeL.scale.y = sy;
      if (p.eyeR) p.eyeR.scale.y = sy;
      if (this.blinkPhase >= 2) {
        this.blinkPhase = -1;
        this.blinkTimer = this.randomBlinkDelay();
        if (p.eyeL) p.eyeL.scale.y = 1;
        if (p.eyeR) p.eyeR.scale.y = 1;
      }
    }

    // --- 尾巴摆动 ---
    if (p.tail) p.tail.rotation.x = Math.sin(this.t * 2) * 0.25;
    if (p.tailSeg2) p.tailSeg2.rotation.x = Math.sin(this.t * 2 + 0.6) * 0.3;

    // --- 腿部动作 ---
    if (this.walking) {
      const sp = this.t * 9;
      const amp = 0.5;
      if (p.legFL) p.legFL.rotation.z = Math.sin(sp) * amp;
      if (p.legBR) p.legBR.rotation.z = Math.sin(sp) * amp;
      if (p.legFR) p.legFR.rotation.z = Math.sin(sp + Math.PI) * amp;
      if (p.legBL) p.legBL.rotation.z = Math.sin(sp + Math.PI) * amp;
      // 走路时身体上下颠一点
      if (p.body) p.body.position.y = 0.9 + Math.abs(Math.sin(sp)) * 0.04;
    } else {
      // 回正
      for (const leg of ['legFL', 'legFR', 'legBL', 'legBR']) {
        if (p[leg]) p[leg].rotation.z += (0 - p[leg].rotation.z) * Math.min(1, dt * 8);
      }
      if (p.body) p.body.position.y += (0.9 - p.body.position.y) * Math.min(1, dt * 8);
    }

    this.render();
  }

  angleLerp(a, b) {
    // 返回从 a 朝 b 的最短角度目标（避免转一大圈）
    let diff = (b - a) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return a + diff;
  }

  setSize(size) {
    this.size = size;
    this.renderer.setSize(size, size, false);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }
}
