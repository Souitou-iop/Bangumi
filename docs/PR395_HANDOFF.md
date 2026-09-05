# PR 395 交接文档

更新时间：2026-07-24

## 1. 当前状态

- 工作分支：`agent/ios-native-tabs-minimal`
- 当前 HEAD：`d4d822ca0`（PR 395 线上 HEAD）
- 验证时的 `origin/master`：`86f9cf420`
- 本地 `master`：`ae7087077`，与 `origin/master` 不同；后续对照应明确使用哪个基线。
- 原生底栏开关相关代码尚未提交，工作区有 6 个已修改文件和 1 个新增组件目录。
- 未发布 GitHub 评论，未推送本轮修改。
- 不操作实机是本任务边界；此前只在两个专用 Simulator 中覆盖安装和运行。

当前工作区改动：

```text
M  src/navigations/bottom-tab-navigator/__tests__/should-use-native-tabs.test.ts
M  src/navigations/bottom-tab-navigator/index.ios.tsx
M  src/navigations/bottom-tab-navigator/should-use-native-tabs.ts
M  src/screens/user/setting/component/route/ds.ts
M  src/screens/user/setting/component/route/index.tsx
M  src/stores/system/init.ts
?? src/screens/user/setting/component/route/native-bottom-tabs/
```

## 2. 已确定的产品方案

根据维护者第三点意见，iOS Native Bottom Tabs 改为实验性设置：

- 设置键为 `nativeBottomTabs`，默认值严格为 `false`。
- 老设置缺少该字段时按关闭处理。
- 仅 iOS 独立安装包显示开关；Expo Go、Android、Web 不显示。
- 开启条件同时要求：iOS 独立安装包、开关为 `true`、可见 Tab 不超过 5 个。
- Navigator 首次挂载时锁定本次进程使用的底栏类型；切换设置后必须冷启动。
- 关闭时继续使用原自绘底栏，不改变其交互逻辑。

## 3. 已实现代码

### 设置与 UI

- `src/stores/system/init.ts`
  - 新增 `nativeBottomTabs: false`。
  - `Setting` 由 `INIT_SETTING` 自动推导，因此类型同步增加。
- `src/screens/user/setting/component/route/ds.ts`
  - 新增“iOS 原生底栏”及重启生效说明。
- `src/screens/user/setting/component/route/index.tsx`
  - 使用 `IOS_IPA` 限制开关可见范围。
- `src/screens/user/setting/component/route/native-bottom-tabs/index.tsx`
  - 复用 `SwitchPro`、`useAsyncSwitchSetting`、`ItemSetting`、Heatmap 和现有埋点模式。

### Navigator 策略

- `src/navigations/bottom-tab-navigator/should-use-native-tabs.ts`
  - 策略函数增加显式 `enabled` 参数。
- `src/navigations/bottom-tab-navigator/index.ios.tsx`
  - 用 `React.useRef(nativeBottomTabs === true).current` 固定本次运行的选择。
  - 不满足条件时返回 `LegacyBottomTabNavigator`。
- `src/navigations/bottom-tab-navigator/__tests__/should-use-native-tabs.test.ts`
  - 覆盖显式开启、关闭、缺失字段、非独立包和超过 5 个 Tab。

## 4. 已完成验证

### 聚焦检查

- Native Tabs 策略 Jest：通过。
- 变更范围 ESLint：通过。
- `git diff --check`：通过。
- 最新一次聚焦 Jest 有 `bangumi-pro` package naming collision 警告，但测试本身通过。

### 全量静态检查

- 全量 Jest：16/21 suites、565/579 tests 通过。
- 14 个失败位于未修改的工具测试：图片 URL、crypto、HTML、match 等。
- `tsc --noEmit` 被现有 `src/components/@/react-native-render-html/src/HTML.jsx:564` 的 TS8010 阻断。
- PR 环境 `expo install --check` 报告 5 项既有版本偏差：
  - `@types/react 18.3.31`，期望 `~19.1.10`
  - `expo 54.0.22`，期望 `~54.0.36`
  - `react-native 0.81.4`，期望 `0.81.5`
  - `@types/jest 30.0.0`，期望 `29.5.14`
  - `jest-expo 55.0.20`，期望 `~54.0.17`
- 实际 `react-native-screens` 为 `4.24.0`，低于 Native Bottom Tabs 文档要求的 `4.25.0+`；未临时改版本掩盖。

### iOS 构建与运行

工具链：

```text
Node       v26.5.0
Yarn       1.22.22（通过 npx）
CocoaPods  1.17.0
Xcode      27.0 (27A5228h)
iOS 18.6   22G86
iOS 27     24A5390f
```

专用模拟器当前均为 Shutdown：

```text
Bangumi-PR395-iOS18  B9431F2E-438F-4890-9BA5-8719CC1DD88E
Bangumi-PR395-iOS27  DDCEDC31-E0CF-422D-BEB0-5310E8F3A543
```

已验证：

- PR Simulator Release 构建成功。
- PR Debug development build 构建成功并连接 Metro。
- 首次 bundle、只改 TS 的开发探针、Metro 中断后重启和重新连接完成。
- generic iOS device unsigned Release 构建成功，生成 ARM64 未签名 `.app`。
- 覆盖安装后主题、收藏等可观察本地数据仍在；Debug 日志继续执行原有 cookie 检查。
- 默认关闭时 iOS 18.6 和 iOS 27 都显示旧底栏。
- 运行中把持久化字段改为 `true` 不会热切换。
- 冷启动后：iOS 18.6 显示传统系统底栏，iOS 27 显示 Liquid Glass。
- 再写回 `false` 并冷启动后，两者恢复旧底栏。

说明：由于 Simulator 前端当时为 headless，开关切换是备份后直接修改专用模拟器的 `System|setting|state` 完成的。它证明了 Navigator 的进程锁定和冷启动选择，但没有证明用户从设置页面点击开关的完整 UI 路径。

### master 对照与跨平台

- `origin/master` 的 Simulator Release 在 Xcode 27 下被旧 Pods deployment target 阻断：
  - ReachabilitySwift 使用 iOS 12.0
  - RNCAsyncStorage resources 使用 iOS 9.0
- master 的旧 IPA patch 流程还会因已不存在的 `react-native-realtimeblurview` 包而报错。
- Android Release 实际执行，但在业务代码编译前被 `android/app/build.gradle:219` 的 `hermesEnabled` 未定义阻断。
- Web Storybook 实际执行，但旧 `node-sass` 不支持 Node 26 ARM64。
- 因上述阻断，不能声称 Android APK 和 Web 构建已通过。

## 5. unsigned IPA 状态

此前从验证快照 `69f12d481` 生成并校验过：

```text
文件名：Bangumi-8.37.3-pr395-69f12d481-unsigned.ipa
大小：24,010,916 bytes
SHA-256：72a49bf89194b5b8e3972942300a5dd55fa2f9b01411b2f91ed9fb00c96bc1a9
Bundle ID：tv.bangumi.czy0729
版本：8.37.3
架构：arm64
签名：未签名
Provisioning profile：无
```

但该 IPA 当前已不在 `web/` 中，不能作为现有交付物引用。需要从最新工作区重新创建隔离验证快照、执行 unsigned device Release 冷构建并重新打包；不得覆盖仓库中其他 IPA。

## 6. 原自绘底栏缺陷排查

用户在 iPhone 17 实机截图中观察到旧自绘底栏没有抬高，“时光机”文字与 Home Indicator 接近或重叠。目前只做了只读调查，尚未修改。

### 已确认

- 与 PR 中“修复发现 - 自定义底部按钮被原生底栏遮挡”没有直接因果关系。
- 该修复位于提交 `02bc24a41`，只修改 Discovery 页面内的取消/保存按钮：
  - 读取 `useInsets().tabBarHeight`
  - 给按钮容器增加 bottom 偏移
- `02bc24a41` 前后的 `src/navigations/tab-bar/index.tsx` 和 `styles.ts` 文件哈希完全一致。
- PR 对旧 `TabBar` 的唯一修改是增加重复点击事件辅助函数，没有改变渲染和布局样式。
- `SafeAreaBottom`、固定 `tabBarHeight` 和旧底栏样式在该 PR 中未修改。
- `react-native-safe-area-context` 声明前后均为 `~5.6.0`。Pod 从 5.5.2 到 5.6.2 的 iOS 变更不涉及 inset 计算。

### 高概率缺陷点，但尚未取得运行时定论

旧底栏结构为：

```tsx
<SafeAreaBottom style={styles.tabBar} type='height'>
  <Flex style={styles.tabBar}>...</Flex>
</SafeAreaBottom>
```

而 `styles.tabBar` 同时包含：

```ts
position: 'absolute'
bottom: 0
height: 70 // iOS 为 50 + 固定 20
```

外层 `SafeAreaBottom` 会把高度计算为 `bottomInset + style.height`，但内层同样使用绝对定位并锚定到底部。代码上存在真实安全区没有把交互内容稳定上移的风险；固定 20pt 也小于 Face ID iPhone 常见的约 34pt bottom inset。

这可以解释实机截图，但当前证据仍不足以断言它就是唯一根因，因为：

- 尚未从该 iPhone 17 实机记录 `useSafeAreaInsets().bottom` 和实际 view frame。
- 尚未在同一 IPA、同一设置状态下，对 iPhone 17 Pro Simulator 和实机进行逐像素对照。
- Simulator 可能安装了不同构建，或 `nativeBottomTabs` 持久化状态不同。

因此当前结论应写为：**旧底栏安全区实现存在高度可疑的预存缺陷；“发现 - 自定义”按钮修复未造成该问题；仍需运行时数据完成确认。**

## 7. 下一步建议

按以下顺序继续，不要先改布局：

1. 确认实机与 Simulator 使用同一个最新 IPA，并记录版本、commit、iOS build 和 `nativeBottomTabs` 值。
2. 在旧底栏路径临时加入仅 Debug 生效的日志，记录：
   - `useSafeAreaInsets()` 的 top/bottom/left/right
   - 外层 `SafeAreaBottom` 实际 frame
   - 内层 `Flex` 实际 frame
   - `_.tabBarHeight` 和屏幕尺寸
3. 在 iPhone 17 Pro Simulator 重现并保存同样日志与截图。
4. 用户明确允许后，再在实机运行同一 Debug/测试包收集日志；不要安装或覆盖前再次确认。
5. 如果证明确为旧底栏缺陷，单独制定最小修复：内容区固定约 50pt，真实 `bottomInset` 只作为底部留白，不再让内外层同时绝对定位到底部。
6. 修复后同时回归旧底栏、原生底栏、“发现 - 自定义”按钮、横屏、iPad、旋转和前后台切换。
7. 从最新代码重新执行 unsigned device Release 冷构建并生成新的 IPA，再更新维护者回复中的验证结果。

## 8. 约束与注意事项

- 保留当前未提交改动，不要 reset、checkout 或覆盖。
- 不发布 GitHub 评论，除非用户明确授权。
- 不操作真机，除非用户在操作前明确授权。
- 不通过临时升级或降级依赖消除检查失败。
- 构建成功不等于运行时或实机验证成功；交接报告中继续区分这些结论。
- Android/Web 当前是构建基线阻断，不应描述成 PR 已完整跨平台通过。
