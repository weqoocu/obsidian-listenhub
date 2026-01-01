# ListenHub Audio Generator for Obsidian

一个 Obsidian 插件，可以使用 ListenHub AI 将你的文章转换成高质量的播客或语音内容。

## 功能特性

- 🎙️ **两种生成模式**
  - Podcast（播客）：专业的播客内容生成
  - FlowSpeech（流式语音）：智能语音转换

- 🎯 **多种子模式**
  - Podcast 模式：
    - Deep - 深度分析，内容质量高
    - Quick - 快速生成，效率优先
    - Debate - 双主持人辩论形式
  - FlowSpeech 模式：
    - Smart - AI智能优化内容
    - Direct - 文本直接转换语音

- 🎨 **自定义音色**
  - 支持设置自定义音色ID
  - 可使用默认音色

- ✅ **便捷测试**
  - API Key 连接测试功能
  - 实时反馈生成状态

- 📝 **自动更新文档**
  - 生成成功后自动在 frontmatter 添加 `listenhub` 属性
  - 自动在正文顶部插入 iframe 播放器
  - 可直接在 Obsidian 中播放音频

## 安装方法

### 方法一：手动安装

1. 下载最新版本的 `main.js`、`manifest.json` 和 `styles.css`
2. 在你的 Obsidian vault 中创建文件夹：`.obsidian/plugins/obsidian-listenhub/`
3. 将下载的文件复制到该文件夹
4. 重启 Obsidian
5. 在设置中启用 "ListenHub Audio Generator" 插件

### 方法二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/weqoocu/obsidian-listenhub.git
cd obsidian-listenhub

# 安装依赖
npm install

# 构建插件
npm run build

# 将生成的文件复制到你的 vault
cp main.js manifest.json styles.css /path/to/your/vault/.obsidian/plugins/obsidian-listenhub/
```

## 使用说明

### 1. 配置 API Key

1. 打开 Obsidian 设置
2. 找到 "ListenHub Audio Generator" 插件设置
3. 输入你的 ListenHub API Key
4. 点击 "测试连接" 验证 API Key 是否有效

### 2. 选择生成模式

在插件设置中选择：
- **主模式**：Podcast 或 FlowSpeech
- **子模式**：根据主模式选择对应的子模式

### 3. 生成音频

有两种方式启动生成：

**方式一：使用功能区图标**
- 点击左侧功能区的音频图标 🎵

**方式二：使用命令面板**
- 按 `Ctrl/Cmd + P` 打开命令面板
- 搜索 "ListenHub: 生成音频内容"
- 按回车执行

### 4. 查看结果

生成完成后，会显示：
- Episode ID
- 生成状态
- 音频链接（如果已完成）

**文档会自动更新**：
- 在 YAML frontmatter 中添加 `listenhub` 属性（值为 Episode ID）
- 在正文顶部插入 iframe 播放器
- 可以直接在 Obsidian 中播放音频

## 模式说明

### Podcast 模式

| 子模式 | 特点 | 适用场景 | 生成时间 |
|--------|------|----------|----------|
| Deep | 深度分析，内容质量高 | 专业知识分享、深度解读 | 2-4 分钟 |
| Quick | 快速生成，效率优先 | 新闻快报、时效性内容 | 1-2 分钟 |
| Debate | 双主持人辩论形式 | 观点讨论、多角度分析 | 2-4 分钟 |

**API 端点**: `/v1/podcast/episodes`

### FlowSpeech 模式

| 子模式 | 特点 | 适用场景 | 生成时间 |
|--------|------|----------|----------|
| Smart | AI 智能优化内容 | 修复语句不通顺、错别字 | 1-2 分钟 |
| Direct | 文本直接转换语音（类TTS） | 已完善的文本、播报 | 1-2 分钟 |

**API 端点**: `/v1/flow-speech/episodes`

## API 文档

详细的 API 文档请访问：https://blog.listenhub.ai/openapi-docs

## 开发

```bash
# 开发模式（自动重新构建）
npm run dev

# 生产构建
npm run build

# 更新版本
npm version patch
npm run version
```

## 问题反馈

如果遇到问题或有建议，请在 GitHub 上提交 Issue。

## 许可证

MIT License

## 致谢

- [Obsidian](https://obsidian.md/) - 强大的知识管理工具
- [ListenHub AI](https://listenhub.ai/) - 提供音频生成服务

---

Made with ❤️ by 酷口家数字花园
