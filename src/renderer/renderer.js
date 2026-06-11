import { Cat } from './cat.js';

async function main() {
  const config = await window.catAPI.getConfig();
  const workArea = await window.catAPI.getWorkArea();

  const el = document.getElementById('cat');
  const visual = document.getElementById('cat-visual');

  if (config.appearance?.breathing !== false && config.behavior?.breathing !== false) {
    visual.classList.add('breathing');
  }

  const cat = new Cat(el, visual, config, workArea);
  cat.registerBehaviors();
  cat.setState('idle');

  // 由于窗口默认点击穿透，渲染进程收不到全局 mousemove。
  // 因此用主进程轮询全局鼠标坐标，转换为窗口相对坐标后驱动跟随/穿透切换。
  let lastIgnore = true;
  async function pollCursor() {
    try {
      const pos = await window.catAPI.getCursorPos(); // 屏幕绝对坐标
      // 窗口铺满主屏工作区且 x=0,y=0，相对坐标≈绝对坐标
      cat.mouse = { x: pos.x, y: pos.y };

      // 判断鼠标是否落在猫的包围盒内 -> 决定是否关闭穿透以便拖动
      const overCat =
        pos.x >= cat.x &&
        pos.x <= cat.x + cat.size &&
        pos.y >= cat.y &&
        pos.y <= cat.y + cat.size;

      const shouldIgnore = !overCat && !cat.dragging;
      if (shouldIgnore !== lastIgnore) {
        window.catAPI.setIgnoreMouse(shouldIgnore);
        lastIgnore = shouldIgnore;
      }
    } catch (e) {
      // 忽略偶发错误
    }
  }
  setInterval(pollCursor, 60);

  // 主动画循环
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05); // 秒，限制最大步长防跳变
    last = now;
    cat.update(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

main();
