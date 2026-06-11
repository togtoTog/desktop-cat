// 行为模块统一导出。
// 新增行为只需在此处注册，核心状态机即可调度，便于后续阶段扩展。
import { IdleBehavior } from './idle.js';
import { WalkBehavior } from './walk.js';
import { FollowBehavior } from './follow.js';

export const Behaviors = {
  idle: IdleBehavior,
  walk: WalkBehavior,
  follow: FollowBehavior
};
