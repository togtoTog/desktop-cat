// 程序化生成一只带“骨骼/部件”层级的低多边形 3D 小猫。
// 采用 Group 层级结构模拟骨骼：身体为根，头/四肢/尾巴挂在身体下，
// 眼睛/耳朵挂在头下。每个部件都保存引用，可独立旋转，便于自由做动作。
import * as THREE from '../../../node_modules/three/build/three.module.js';

/**
 * @param {object} opts
 * @param {number} opts.bodyColor 主体颜色
 * @param {number} opts.bellyColor 肚子/内侧浅色
 * @param {number} opts.eyeColor 眼睛颜色
 * @returns {{ root: THREE.Group, parts: object }}
 */
export function buildCat(opts = {}) {
  const bodyColor = opts.bodyColor ?? 0xf0992e;   // 橘色
  const bellyColor = opts.bellyColor ?? 0xfff1dd; // 奶白
  const stripeColor = opts.stripeColor ?? 0xcf7a1c;
  const eyeColor = opts.eyeColor ?? 0x6db84c;     // 绿眼
  const noseColor = opts.noseColor ?? 0xe76f8f;

  const matBody = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8, metalness: 0.0, flatShading: true });
  const matBelly = new THREE.MeshStandardMaterial({ color: bellyColor, roughness: 0.9, flatShading: true });
  const matStripe = new THREE.MeshStandardMaterial({ color: stripeColor, roughness: 0.8, flatShading: true });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.6 });
  const matEye = new THREE.MeshStandardMaterial({ color: eyeColor, roughness: 0.3 });
  const matNose = new THREE.MeshStandardMaterial({ color: noseColor, roughness: 0.5 });
  const matInnerEar = new THREE.MeshStandardMaterial({ color: 0xffc6b0, roughness: 0.8, flatShading: true });

  const parts = {};

  // ===== 根：整只猫 =====
  const root = new THREE.Group();
  root.name = 'cat';

  // ===== 身体 =====
  const body = new THREE.Group();
  body.name = 'body';
  body.position.y = 0.9;

  const bodyMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 0.55, 6, 12), matBody);
  bodyMesh.rotation.z = Math.PI / 2; // 横躺成猫身
  bodyMesh.scale.set(1, 1, 0.85);
  bodyMesh.castShadow = true;
  body.add(bodyMesh);

  // 肚子浅色
  const belly = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 0.5, 4, 10), matBelly);
  belly.rotation.z = Math.PI / 2;
  belly.scale.set(0.7, 1, 0.6);
  belly.position.y = -0.22;
  body.add(belly);

  root.add(body);

  // ===== 头（挂在身体前端，可独立转动）=====
  const head = new THREE.Group();
  head.name = 'head';
  head.position.set(0.72, 0.32, 0); // 身体前上方
  parts.head = head;

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 14), matBody);
  headMesh.scale.set(1, 0.95, 1);
  headMesh.castShadow = true;
  head.add(headMesh);

  // 脸颊浅色
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), matBelly);
  muzzle.scale.set(0.9, 0.7, 0.9);
  muzzle.position.set(0.32, -0.12, 0);
  head.add(muzzle);

  // 耳朵
  function makeEar(side) {
    const ear = new THREE.Group();
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.38, 4), matBody);
    outer.castShadow = true;
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 4), matInnerEar);
    inner.position.set(0, -0.02, 0.04);
    ear.add(outer, inner);
    ear.position.set(-0.05, 0.42, side * 0.26);
    ear.rotation.x = side * 0.25;
    ear.rotation.z = -0.1;
    return ear;
  }
  parts.earL = makeEar(-1);
  parts.earR = makeEar(1);
  head.add(parts.earL, parts.earR);

  // 眼睛（可独立缩放做眨眼）
  function makeEye(side) {
    const eye = new THREE.Group();
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), matEye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), matDark);
    pupil.position.set(0.07, 0, 0);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    shine.position.set(0.1, 0.03, 0.02);
    eye.add(ball, pupil, shine);
    eye.position.set(0.4, 0.08, side * 0.2);
    return eye;
  }
  parts.eyeL = makeEye(-1);
  parts.eyeR = makeEye(1);
  head.add(parts.eyeL, parts.eyeR);

  // 鼻子
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), matNose);
  nose.position.set(0.6, -0.06, 0);
  nose.scale.set(0.8, 0.6, 1);
  head.add(nose);

  // 胡须
  const whiskerMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
  for (const side of [-1, 1]) {
    for (const dy of [-0.04, 0.04]) {
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.55, -0.05 + dy, side * 0.12),
        new THREE.Vector3(0.85, -0.02 + dy, side * 0.4)
      ]);
      head.add(new THREE.Line(g, whiskerMat));
    }
  }

  body.add(head);

  // ===== 四肢（每条腿可独立摆动）=====
  function makeLeg(x, z, isFront) {
    const leg = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.4, 4, 8), matBody);
    upper.position.y = -0.3;
    upper.castShadow = true;
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), matBelly);
    paw.position.y = -0.55;
    paw.scale.set(1, 0.7, 1.1);
    leg.add(upper, paw);
    leg.position.set(x, -0.35, z);
    leg.userData.isFront = isFront;
    return leg;
  }
  parts.legFL = makeLeg(0.42, -0.32, true);
  parts.legFR = makeLeg(0.42, 0.32, true);
  parts.legBL = makeLeg(-0.42, -0.34, false);
  parts.legBR = makeLeg(-0.42, 0.34, false);
  body.add(parts.legFL, parts.legFR, parts.legBL, parts.legBR);

  // ===== 尾巴（多段，可摆动）=====
  const tail = new THREE.Group();
  tail.name = 'tail';
  const tailSegMat = matBody;
  const seg1 = new THREE.Group();
  const seg1Mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.35, 4, 8), tailSegMat);
  seg1Mesh.position.y = 0.2;
  seg1.add(seg1Mesh);
  const seg2 = new THREE.Group();
  seg2.position.y = 0.4;
  const seg2Mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.3, 4, 8), tailSegMat);
  seg2Mesh.position.y = 0.18;
  seg2.add(seg2Mesh);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), matBelly);
  tip.position.y = 0.36;
  seg2.add(tip);
  seg1.add(seg2);
  tail.add(seg1);
  tail.position.set(-0.7, 0.1, 0);
  tail.rotation.z = 0.6; // 默认上翘
  parts.tail = tail;
  parts.tailSeg2 = seg2;
  body.add(tail);

  parts.body = body;
  parts.root = root;

  // 让猫整体落在地面 y=0 附近
  root.position.y = 0;

  return { root, parts };
}
