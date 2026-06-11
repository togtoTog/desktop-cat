// 跟随鼠标：当鼠标靠近时，小猫朝鼠标方向移动并“看向”光标；鼠标远离则回到待机。
export class FollowBehavior {
  constructor(cat) {
    this.cat = cat;
    this.name = 'follow';
  }

  enter() {
    this.cat.visual.classList.add('breathing');
  }

  update(dt) {
    const mouse = this.cat.mouse; // 相对窗口坐标
    if (!mouse) {
      this.cat.setState('idle');
      return;
    }

    const catCenterX = this.cat.x + this.cat.size / 2;
    const catCenterY = this.cat.y + this.cat.size / 2;
    const dx = mouse.x - catCenterX;
    const dy = mouse.y - catCenterY;
    const dist = Math.hypot(dx, dy);

    const radius = this.cat.config.behavior?.followMouseRadius || 180;
    // 鼠标离开感应范围 -> 回到待机
    if (dist > radius * 1.4) {
      this.cat.setState('idle');
      return;
    }

    this.cat.setFacing(dx < 0 ? 'left' : 'right');

    // 与鼠标保持一点距离，不要贴脸；过近就停下只“看”
    const keepDistance = 50;
    if (dist > keepDistance) {
      const speed = (this.cat.config.behavior?.walkSpeed || 60) * 1.3;
      const step = speed * dt;
      const nx = this.cat.x + (dx / dist) * step;
      const ny = this.cat.y + (dy / dist) * step;
      this.cat.moveTo(nx, ny);
    }
  }

  exit() {
    this.cat.visual.classList.remove('breathing');
  }
}
