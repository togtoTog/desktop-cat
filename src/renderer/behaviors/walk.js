// 走动行为：随机选一个目标点，匀速走过去，到达或超时后回到待机。
export class WalkBehavior {
  constructor(cat) {
    this.cat = cat;
    this.name = 'walk';
  }

  enter() {
    const area = this.cat.workArea;
    const size = this.cat.size;
    // 随机目标点（保证猫完整在屏幕内）
    this.targetX = Math.random() * (area.width - size);
    this.targetY = Math.random() * (area.height - size);

    const { walkMinSeconds = 2, walkMaxSeconds = 5 } = this.cat.config.behavior || {};
    const maxMs = (walkMinSeconds + Math.random() * (walkMaxSeconds - walkMinSeconds)) * 1000;
    this.deadline = performance.now() + maxMs;

    // 根据移动方向决定朝向
    this.cat.setFacing(this.targetX < this.cat.x ? 'left' : 'right');
  }

  update(dt) {
    if (this.cat.shouldFollowMouse()) {
      this.cat.setState('follow');
      return;
    }

    const speed = (this.cat.config.behavior?.walkSpeed || 60); // px/秒
    const dx = this.targetX - this.cat.x;
    const dy = this.targetY - this.cat.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 2 || performance.now() > this.deadline) {
      this.cat.setState('idle');
      return;
    }

    const step = speed * dt;
    const nx = this.cat.x + (dx / dist) * step;
    const ny = this.cat.y + (dy / dist) * step;
    this.cat.setFacing(dx < 0 ? 'left' : 'right');
    this.cat.moveTo(nx, ny);
  }

  exit() {}
}
