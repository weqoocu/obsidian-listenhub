# 更新日志

## [1.0.15] - 2026-01-01

### 移除
- 🗑️ 移除克隆音色（voice-clone-* 开头的音色）
  - 移除「酷口家数字花园」
  - 移除「笑笑」
- 内置音色列表现在只包含公共音色（27个中文 + 4个英文）

## [1.0.14] - 2026-01-01

### 新增
- 🎤 **音色列表加载功能**：在设置页面新增「可用音色列表」区域
  - 支持按语言（中文/英文）加载可用音色
  - 显示音色名称、ID、性别、试听链接
  - 一键设置为音色1或音色2
  - 表格支持滚动，最多显示400px高度

### 改进
- 📋 音色列表表格样式优化
- 🔊 试听链接可直接点击播放

### 技术细节
- 新增 `Speaker` 接口定义
- 新增 `getSpeakers()` 方法调用 ListenHub API
- 新增 `renderSpeakerList()` 方法渲染音色表格
- 添加音色列表相关 CSS 样式

## [1.0.10] - 2025-12-02

### 改进
- 📋 **建立版本管理规范**：创建版本更新规则，确保每次代码修改后自动更新版本号
- 🔧 **规范化开发流程**：统一版本递增策略和变更日志记录

### 技术细节
- 创建项目级规则 `VersionUpdateRule.mdc`
- 定义语义化版本号管理策略（major.minor.patch）
- 规范 CHANGELOG.md 更新格式

## [1.0.9] - 2025-12-02

### 改进
- 🔗 **listenhub 属性改为完整 URL**：`https://listenhub.ai/zh/episode/{id}`，方便点击查看详情
- 🔕 **删除生成成功的 Notice 提醒**：减少干扰，直接显示结果弹窗
- 🔗 **更新结果弹窗链接**：从"打开资料库"改为直接链接到当前 Episode 详情页

### 用户体验提升
- 点击 frontmatter 中的 listenhub 属性可直接跳转到 Episode 详情
- 结果弹窗中的链接更精准，直达当前生成的 Episode
- 减少不必要的通知，流程更流畅

### 技术细节
- listenhub 属性值格式：`https://listenhub.ai/zh/episode/{episode_id}`
- 结果弹窗链接：`https://listenhub.ai/zh/episode/{episode_id}`
- 删除了生成成功后的 Notice 提醒

## [1.0.9] - 2025-12-02 (早期版本)

### 修复
- 🐛 **修复弹窗显示问题**：弹窗中的"文档"现在优先显示 frontmatter 中的 `title` 属性，而不是文件名
- 🐛 **修复 episode_id 为 undefined 的问题**：
  - 添加详细的调试日志（在开发者控制台输出完整的 API 响应）
  - 支持多种可能的字段名（`episode_id`, `episodeId`, `id`）
  - 在更新文档前验证 episodeId 是否有效
  - 如果无法获取有效 ID，显示错误提示并终止操作

### 改进
- 🔧 改进 view 引用传递：避免异步操作后重新获取可能已改变的 view
- 🔍 添加详细的调试日志：
  - `🔍 完整的 API 响应结果`
  - `🔍 result.data`
  - `🔍 result.data?.episode_id`
  - `✅ 提取的 Episode ID`
- 📝 创建详细的问题修复说明文档

### 技术细节
- 使用 `metadataCache.getFileCache()` 获取 frontmatter 数据
- 使用类型断言 `(result.data as any)` 支持多种字段名
- 在 `GenerateAudioModal` 中保存 view 引用

## [1.0.8] - 2025-12-02

### 新增
- ✨ **自动更新文档功能**：生成成功后自动更新原文档
  - 在 YAML frontmatter 中添加 `listenhub` 属性（值为 Episode ID）
  - 在正文顶部插入 iframe 播放器代码
  - iframe 格式：`<iframe src="https://listenhub.ai/embed/episode/[ID]" style="border-radius: 12px" width="100%" height="154px" frameborder="0" allowfullscreen></iframe>`
- 🎵 可以直接在 Obsidian 中播放生成的音频
- 🔄 支持重复生成：如果文档已有 listenhub 属性和 iframe，会自动替换为新的

### 改进
- 📝 更新了使用说明文档，添加文档自动更新功能的说明
- 📝 更新了 README，补充新功能介绍
- 📄 添加测试文档示例（带 YAML frontmatter 的版本）

### 技术细节
- 新增 `updateDocumentWithEpisode()` 方法：更新文档内容
- 新增 `addListenHubToDocument()` 方法：处理 YAML 和 iframe 插入逻辑
- 支持有/无 YAML frontmatter 的文档
- 智能替换已存在的 listenhub 属性和 iframe

## [1.0.3] - 2025-11-30

### 修复
- 🔧 修正 FlowSpeech 模式参数：使用 `sources` 而不是 `query`
- 🔧 FlowSpeech sources 格式：`[{type: "text", content: "..."}]`
- ✅ Podcast 模式：继续使用 `query` 参数
- ✅ 两种模式现在都已测试通过

### 测试结果
- ✅ Podcast API: 测试通过 (Episode ID: 692bb336cf55dcf30ea07201)
- ✅ FlowSpeech API: 测试通过 (Episode ID: 692bb493d0a72e235afea10f)

## [1.0.2] - 2025-11-30

### 修复
- 🔧 修正 API 域名：`api.marswave.ai`（之前错误使用了 listenhub.ai）
- 🔧 修正 API 路径：`/openapi/v1/podcast/episodes`
- 🔧 修正请求参数：使用 `query` 代替 `content` 和 `title`
- 🔧 修正 speakers 格式：`[{"speakerId": "xxx"}]`（对象数组格式）

### 技术细节
- API 端点现在与官方 curl 示例完全一致
- query 参数会自动组合文档标题和内容

## [1.0.1] - 2025-11-30

### 新增
- ✅ 添加语言选择功能（中文/英文）
- ✅ 支持双 Speaker 配置（Speaker 1 和 Speaker 2）
- ✅ 添加详细的 API 请求和响应日志（控制台输出）
- ✅ 预设默认 API Key 和配置

### 修改
- 🔧 默认语言改为中文 (zh)
- 🔧 默认模式改为 Podcast - Debate
- 🔧 默认 Speaker 1: CN-Man-Beijing-V2
- 🔧 默认 Speaker 2: chat-girl-105-cn
- 🔧 改进错误日志，显示完整的请求和响应信息

### 修复
- 🐛 修复 404 错误时缺少详细日志的问题

## [1.0.0] - 2025-11-30

### 初始版本
- 🎉 支持 Podcast 模式（Deep/Quick/Debate）
- 🎉 支持 FlowSpeech 模式（Smart/Direct）
- 🎉 API Key 配置和测试
- 🎉 完整的用户界面
