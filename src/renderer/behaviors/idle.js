// 待机行为：小猫停在原地，呼吸感动画，停留随机时长后自动切到走动。
export class IdleBehavior {
  constructor(cat) {
    this.cat = cat;
    this.name = 'idle';
  }

  enter() {
    const { idleMinSeconds = 3, idleMaxSeconds = 8 } = this.cat.config.behavior || {};
    const ms = (idleMinSeconds + Math.random() * (idleMaxSeconds - idleMinSeconds)) * 1000;
    this.cat.visual.classList.add('breathing');
    this.timer = setTimeout(() => this.cat.setState('walk'), ms);
  }

  update(/* dt */) {
    // 待机时检查是否需要跟随鼠标
    if (this.cat.shouldFollowMouse()) {
      this.cat.setState('follow');
    }
  }

  exit() {
    clearTimeout(this.timer);
    this.cat.visual.classList.remove('breathing');
  }
}
