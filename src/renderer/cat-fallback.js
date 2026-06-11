// 内置 SVG 橘猫占位形象（坐姿，正面），用于没有写实照片时。
// 返回可直接作为 background-image 的 data URI。
export function getFallbackCatDataURI() {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f5a945"/>
      <stop offset="1" stop-color="#e8902a"/>
    </linearGradient>
  </defs>
  <!-- 尾巴 -->
  <path d="M150 165 q40 -5 38 -45 q-2 -22 -20 -20 q-14 2 -10 18 q3 12 -10 20 q-12 7 12 27z" fill="url(#body)" stroke="#cf7a1c" stroke-width="2"/>
  <!-- 身体 -->
  <ellipse cx="100" cy="150" rx="46" ry="40" fill="url(#body)" stroke="#cf7a1c" stroke-width="2"/>
  <!-- 前爪 -->
  <ellipse cx="82" cy="182" rx="13" ry="9" fill="#f7b65e" stroke="#cf7a1c" stroke-width="1.5"/>
  <ellipse cx="118" cy="182" rx="13" ry="9" fill="#f7b65e" stroke="#cf7a1c" stroke-width="1.5"/>
  <!-- 头 -->
  <circle cx="100" cy="95" r="42" fill="url(#body)" stroke="#cf7a1c" stroke-width="2"/>
  <!-- 耳朵 -->
  <path d="M66 70 L58 36 L92 58 Z" fill="url(#body)" stroke="#cf7a1c" stroke-width="2"/>
  <path d="M134 70 L142 36 L108 58 Z" fill="url(#body)" stroke="#cf7a1c" stroke-width="2"/>
  <path d="M68 62 L64 46 L82 57 Z" fill="#ffd9a8"/>
  <path d="M132 62 L136 46 L118 57 Z" fill="#ffd9a8"/>
  <!-- 虎斑纹 -->
  <path d="M100 55 q-6 8 0 16" fill="none" stroke="#cf7a1c" stroke-width="3" stroke-linecap="round"/>
  <path d="M78 60 q-4 7 -2 14" fill="none" stroke="#cf7a1c" stroke-width="3" stroke-linecap="round"/>
  <path d="M122 60 q4 7 2 14" fill="none" stroke="#cf7a1c" stroke-width="3" stroke-linecap="round"/>
  <!-- 眼睛 -->
  <ellipse class="eye" cx="84" cy="96" rx="9" ry="11" fill="#fff"/>
  <ellipse class="eye" cx="116" cy="96" rx="9" ry="11" fill="#fff"/>
  <circle cx="84" cy="98" r="5.5" fill="#3a2a18"/>
  <circle cx="116" cy="98" r="5.5" fill="#3a2a18"/>
  <circle cx="86" cy="95" r="1.8" fill="#fff"/>
  <circle cx="118" cy="95" r="1.8" fill="#fff"/>
  <!-- 鼻子嘴巴 -->
  <path d="M100 108 l-5 -5 h10 z" fill="#e76f8f"/>
  <path d="M100 113 q-6 6 -12 3 M100 113 q6 6 12 3" fill="none" stroke="#cf7a1c" stroke-width="1.6" stroke-linecap="round"/>
  <!-- 胡须 -->
  <g stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.9">
    <line x1="78" y1="110" x2="48" y2="104"/>
    <line x1="78" y1="114" x2="50" y2="116"/>
    <line x1="122" y1="110" x2="152" y2="104"/>
    <line x1="122" y1="114" x2="150" y2="116"/>
  </g>
</svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}
