# 🐱 Desktop Cat 桌面小猫

一只可以放在桌面上自由活动的小猫桌宠，基于 Electron 开发，跨平台支持 macOS 与 Windows。

当前为 **阶段一：快速 Demo**。小猫会在桌面上待机、随机走动、跟随你的鼠标，也可以用鼠标把它拖到任意位置。

## ✨ 当前功能

- 透明、无边框、始终置顶的桌面窗口，不遮挡你的正常操作（鼠标只在小猫身上时才会被它“接住”）
- 待机：原地停留，带轻微呼吸感动画
- 走动：随机在桌面上溜达
- 跟随鼠标：鼠标靠近时，小猫会朝你看过去并跟过来
- 拖动：用鼠标按住小猫可以把它拖到任意位置
- 形象：内置一只 SVG 橘猫占位；把写实猫咪照片放到 `src/assets/cat-idle.png` 即可自动替换

## 🚀 快速开始

需要本地已安装 [Node.js](https://nodejs.org/)（建议 18+）。

```bash
# 进入项目目录
cd desktop-cat

# 安装依赖
npm install

# 启动小猫
npm start
```

启动后小猫会出现在桌面右下方。把鼠标移到它附近试试，它会跟过来；按住它可以拖动。

## 🖼️ 更换小猫形象

把任意一张**透明背景**的猫咪 PNG 命名为 `cat-idle.png`，放到 `src/assets/` 目录下，重新启动即可。
也可以在 `config/cat.config.json` 中修改 `appearance.imagePath` 指向其它图片。

## ⚙️ 配置说明

所有可调参数都在 `config/cat.config.json`：

- `appearance.size`：小猫显示大小（像素）
- `behavior.walkSpeed`：走动速度（像素/秒）
- `behavior.followMouseRadius`：鼠标多近时开始跟随（像素）
- `behavior.idle*/walk*Seconds`：待机/走动的时长区间
- `personality`：性格、癖好（为后续定制化阶段预留）

## 🗂️ 项目结构

```
desktop-cat/
├── package.json
├── config/cat.config.json        # 配置驱动
├── src/
│   ├── main/                     # Electron 主进程（窗口、IPC）
│   │   ├── main.js
│   │   └── preload.js
│   ├── renderer/                 # 渲染进程（小猫展示与行为）
│   │   ├── index.html
│   │   ├── styles.css
│   │   ├── cat.js                # 小猫核心类（状态机）
│   │   ├── cat-fallback.js       # 内置 SVG 占位形象
│   │   ├── renderer.js           # 入口与动画循环
│   │   └── behaviors/            # 行为模块（idle/walk/follow）
│   └── assets/                   # 形象素材
└── CHANGELOG.md
```

## 🛣️ 路线图

- **阶段一（当前）**：快速 Demo —— 待机 / 走动 / 跟随鼠标 / 拖动 ✅
- **阶段二**：丰富鼠标键盘交互 —— 双击触发动作、右键菜单、键盘召唤/隐藏、对光标的更多反应
- **阶段三**：高度定制化 —— 自定义形象、行为偏好、性格癖好（贪睡 / 好动 / 黏人）、设置面板

## 📄 许可

MIT
