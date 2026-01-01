import { App, Plugin, PluginSettingTab, Setting, Notice, MarkdownView, Modal, requestUrl } from 'obsidian';

interface ListenHubSettings {
	apiKey: string;
	mode: 'podcast' | 'flow-speech';
	podcastSubMode: 'deep' | 'quick' | 'debate';
	flowSpeechSubMode: 'smart' | 'direct';
	language: 'zh' | 'en';
	speaker1: string;
	speaker2: string;
}

const DEFAULT_SETTINGS: ListenHubSettings = {
	apiKey: '',
	mode: 'podcast',
	podcastSubMode: 'debate',
	flowSpeechSubMode: 'smart',
	language: 'zh',
	speaker1: 'CN-Man-Beijing-V2',
	speaker2: 'chat-girl-105-cn'
}

interface EpisodeResponse {
	success: boolean;
	data?: {
		episode_id: string;
		status: string;
		audio_url?: string;
		message?: string;
	};
	error?: string;
	message?: string;
}

interface Speaker {
	id: string;
	name: string;
	language: string;
	gender: string;
	audioPreviewUrl?: string;
}

// 内置音色列表（从 ListenHub API 获取的数据）
const BUILTIN_SPEAKERS: { zh: Speaker[], en: Speaker[] } = {
	zh: [
		{ id: 'chat-girl-105-cn', name: '晓曼', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/chat-girl-105-cn_pending_1761140378494.mp3' },
		{ id: 'suzhe-45bbbe54', name: '苏哲', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/suzhe-45bbbe54_pending_1761140378388.mp3' },
		{ id: 'gaoqing3-bfb5c88a', name: '高晴', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/gaoqing3-bfb5c88a_pending_1761140378495.mp3' },
		{ id: 'CN-Man-Beijing-V2', name: '原野', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/CN-Man-Beijing-V2_pending_1761140378252.mp3' },
		{ id: 'liyan2-ef9401ec', name: '国栋', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/liyan2-ef9401ec_pending_1761140378388.mp3' },
		{ id: 'liyan3-f74976d9', name: '子墨', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/liyan3-f74976d9_pending_1761140378112.mp3' },
		{ id: 'zhibonusheng-7b0dbae2', name: '直播雪姐', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/zhibonusheng-7b0dbae2_pending_1761204468716.mp3' },
		{ id: 'shuoshurennan-fdfa85f9', name: '常四爷', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/shuoshurennan-fdfa85f9_pending_1761140378113.mp3' },
		{ id: 'pingshu-c7c18f5a', name: '古今先生', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/pingshu-c7c18f5a_pending_1761140378252.mp3' },
		{ id: 'midnightaxing-0bf9d7a5', name: '冥想阿星', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/midnightaxing-0bf9d7a5_pending_1761140378712.mp3' },
		{ id: 'midnightalan-cb312cb6', name: '冥想阿岚', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/midnightalan-cb312cb6_pending_1761140378713.mp3' },
		{ id: 'zhibonansheng-80bf8621', name: '直播浩哥', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/zhibonansheng-80bf8621_pending_1761140378253.mp3' },
		{ id: 'huibennulaoshi-bf2bbe1f', name: '故事云舒', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/huibennulaoshi-bf2bbe1f_pending_1761140377976.mp3' },
		{ id: 'gushijingling-720c0ae5', name: '故事精灵', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/gushijingling-720c0ae5_pending_1761205947072.mp3' },
		{ id: 'dp-6cc9831f', name: '约翰大叔', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/dp-6cc9831f_demo_audio.mp3' },
		{ id: 'sam-34cf3074', name: '山姆大叔', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/sam-34cf3074_demo_audio.mp3' },
		{ id: 'bajie-4f6ab1a8', name: '八戒', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/bajie-4f6ab1a8_pending_1761140377975.mp3' },
		{ id: 'houge-ce107859', name: '猴哥', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/houge-ce107859_pending_1761140377976.mp3' },
		{ id: 'xinyi6', name: '诗涵', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/xinyi6_pending_1761140378113.mp3' },
		{ id: 'nanzhongyin-4897116a', name: '振松', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/nanzhongyin-4897116a_pending_1761140378495.mp3' },
		{ id: 'xiaoyun', name: '若云', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/xiaoyun_pending_1761140378113.mp3' },
		{ id: 'nvdiyin-7b293152', name: '暮歌', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/nvdiyin-7b293152_pending_1761140378253.mp3' },
		{ id: 'shuoshurennan-b09f844f', name: '柳飞霜', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/shuoshurennan-b09f844f_pending_1761140378253.mp3' },
		{ id: 'ASMR-Male-CN', name: '远舟 (ASMR)', language: 'zh', gender: 'male', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/ASMR-Male-CN_pending_1761140378494.mp3' },
		{ id: 'ASMR-Female-CN', name: '宛星 (ASMR)', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/ASMR-Female-CN_pending_1761140378494.mp3' },
		{ id: '1luoxiaohei1vocals-88bfc421', name: '小花妖', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/1luoxiaohei1vocals-88bfc421_demo_audio.mp3' },
		{ id: 'hajimi-427f918d', name: '哈基米', language: 'zh', gender: 'female', audioPreviewUrl: 'https://assets.listenhub.ai/listenhub-public-prod/audios/hajimi-427f918d_demo_audio.mp3' },
	],
	en: [
		{ id: 'EN-US-News-Male', name: 'News Anchor (Male)', language: 'en', gender: 'male', audioPreviewUrl: '' },
		{ id: 'EN-US-News-Female', name: 'News Anchor (Female)', language: 'en', gender: 'female', audioPreviewUrl: '' },
		{ id: 'EN-US-Casual-Male', name: 'Casual (Male)', language: 'en', gender: 'male', audioPreviewUrl: '' },
		{ id: 'EN-US-Casual-Female', name: 'Casual (Female)', language: 'en', gender: 'female', audioPreviewUrl: '' },
	]
};

export default class ListenHubPlugin extends Plugin {
	settings: ListenHubSettings;

	async onload() {
		await this.loadSettings();

		// 添加命令：生成音频
		this.addCommand({
			id: 'generate-audio',
			name: '生成音频内容',
			checkCallback: (checking) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					if (!checking) {
						this.generateAudio(view.editor, view);
					}
					return true;
				}
				return false;
			}
		});

		// 添加设置页面
		this.addSettingTab(new ListenHubSettingTab(this.app, this));

		// 添加功能区图标
		this.addRibbonIcon('audio-lines', 'ListenHub: 生成音频', () => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				this.generateAudio(view.editor, view);
			} else {
				new Notice('请先打开一个文档');
			}
		});
	}

	onunload() {
		console.log('Unloading ListenHub plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async generateAudio(editor: any, view: MarkdownView) {
		if (!this.settings.apiKey) {
			new Notice('请先在设置中配置 API Key');
			return;
		}

		let content = editor.getValue();
		if (!content || content.trim().length === 0) {
			new Notice('当前文档内容为空');
			return;
		}

		// 获取文档标题：优先使用 frontmatter 中的 title，否则使用文件名
		let docTitle = view.file?.name || '未命名文档';
		if (view.file) {
			const cache = this.app.metadataCache.getFileCache(view.file);
			if (cache?.frontmatter?.title) {
				docTitle = cache.frontmatter.title;
			}
		}

		// 处理内容：移除 YAML frontmatter 并从第一个 ### 标题开始提取
		content = this.extractContentFromMarkdown(content);
		
		if (!content || content.trim().length === 0) {
			new Notice('未找到有效内容（需要至少一个 ### 三级标题）');
			return;
		}
		
		// 显示生成确认对话框
		new GenerateAudioModal(this.app, this, content, docTitle, view).open();
	}

	/**
	 * 提取 Markdown 内容：
	 * 1. 移除 YAML frontmatter
	 * 2. 从第一个 ### 三级标题开始提取内容
	 * 3. 移除 <svg> 标签及其内容
	 * 4. 移除 Markdown 图片语法
	 */
	extractContentFromMarkdown(content: string): string {
		// 移除 YAML frontmatter (--- 开头到 --- 结束的部分)
		content = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/m, '');
		
		// 查找第一个 ### 标题的位置
		const h3Match = content.match(/^###\s+.+$/m);
		
		let processedContent = content;
		if (h3Match && h3Match.index !== undefined) {
			// 从第一个 ### 标题开始截取
			processedContent = content.substring(h3Match.index);
		} else {
			// 如果没有找到 ### 标题，返回移除 YAML 后的全部内容
			console.warn('未找到 ### 三级标题，将使用完整内容（已移除 YAML）');
		}

		// 移除 svg 标签及其内容
		processedContent = processedContent.replace(/<svg[\s\S]*?<\/svg>/gi, '');
		
		// 移除 Markdown 图片语法 (包括 Obsidian 的图片语法)
		// 格式：![alt text](url) 或 ![[image.png]] 或 ![|600](url)
		processedContent = processedContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');
		processedContent = processedContent.replace(/!\[\[([^\]]+)\]\]/g, '');
		
		return processedContent.trim();
	}

	async callListenHubAPI(content: string, title: string): Promise<EpisodeResponse> {
		const baseUrl = 'https://api.marswave.ai';
		let endpoint = '';
		let mode = '';

		if (this.settings.mode === 'podcast') {
			endpoint = `${baseUrl}/openapi/v1/podcast/episodes`;
			mode = this.settings.podcastSubMode;
		} else {
			endpoint = `${baseUrl}/openapi/v1/flow-speech/episodes`;
			mode = this.settings.flowSpeechSubMode;
		}

		const requestBody: any = {
			mode: mode,
			language: this.settings.language
		};

		// Podcast 模式使用 query 参数
		if (this.settings.mode === 'podcast') {
			const queryText = title ? `${title}\n\n${content}` : content;
			requestBody.query = queryText;
		} 
		// FlowSpeech 模式使用 sources 参数
		else {
			const textContent = title ? `${title}\n\n${content}` : content;
			requestBody.sources = [
				{
					type: "text",
					content: textContent
				}
			];
		}

		// 添加speaker配置 - 根据模式决定单/双speaker
		const speakers = [];
		if (this.settings.speaker1) {
			speakers.push({ speakerId: this.settings.speaker1 });
		}
		
		// FlowSpeech 模式只支持单个speaker (使用第一个speaker)
		// Podcast 模式支持双speaker
		if (this.settings.mode === 'podcast' && this.settings.speaker2) {
			speakers.push({ speakerId: this.settings.speaker2 });
		}
		
		if (speakers.length > 0) {
			requestBody.speakers = speakers;
		}

		console.log('ListenHub API 请求:');
		console.log('- Endpoint:', endpoint);
		console.log('- Request Body:', JSON.stringify(requestBody, null, 2));

		try {
			const response = await requestUrl({
				url: endpoint,
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.settings.apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody),
				throw: false
			});

			console.log('ListenHub API 响应:');
			console.log('- Status:', response.status);
			console.log('- Headers:', response.headers);
			console.log('- Body:', response.text);

			if (response.status === 200 || response.status === 201) {
				return response.json;
			} else {
				const errorMsg = `API 请求失败 (${response.status}): ${response.text}`;
				console.error('ListenHub API 错误:', errorMsg);
				return {
					success: false,
					error: errorMsg,
					message: response.text
				};
			}
		} catch (error) {
			console.error('ListenHub API 异常:', error);
			return {
				success: false,
				error: '网络请求失败',
				message: error.message
			};
		}
	}

	async testAPIConnection(): Promise<{ success: boolean; message: string }> {
		if (!this.settings.apiKey) {
			return { success: false, message: '请先输入 API Key' };
		}

		const testContent = '这是一个测试内容，用于验证 API 连接。';
		const testTitle = 'API 连接测试';

		try {
			const result = await this.callListenHubAPI(testContent, testTitle);
			
			if (result.success !== false && result.data) {
				return { 
					success: true, 
					message: `连接成功！Episode ID: ${result.data.episode_id}` 
				};
			} else {
				return { 
					success: false, 
					message: result.error || result.message || '连接失败' 
				};
			}
		} catch (error) {
			return { 
				success: false, 
				message: `连接失败: ${error.message}` 
			};
		}
	}

	/**
	 * 获取可用音色列表（使用内置数据）
	 */
	async getSpeakers(language: string = 'zh'): Promise<{ success: boolean; speakers?: Speaker[]; message?: string }> {
		const lang = language === 'en' ? 'en' : 'zh';
		const speakers = BUILTIN_SPEAKERS[lang];
		
		if (speakers && speakers.length > 0) {
			return { success: true, speakers };
		}
		
		return { success: false, message: '暂无可用音色' };
	}

	/**
	 * 更新文档：添加 listenhub 属性和 iframe 播放器
	 */
	async updateDocumentWithEpisode(file: any, episodeId: string) {
		try {
			const content = await this.app.vault.read(file);
			const updatedContent = this.addListenHubToDocument(content, episodeId);
			await this.app.vault.modify(file, updatedContent);
			new Notice('✅ 文档已更新：添加了 ListenHub 属性和播放器');
		} catch (error) {
			console.error('更新文档失败:', error);
			new Notice(`❌ 更新文档失败: ${error.message}`);
		}
	}

	/**
	 * 在文档中添加 listenhub 属性和 iframe
	 */
	addListenHubToDocument(content: string, episodeId: string): string {
		// listenhub 属性值为完整 URL
		const listenHubUrl = `https://listenhub.ai/zh/episode/${episodeId}`;
		const iframeCode = `<iframe src="https://listenhub.ai/embed/episode/${episodeId}" style="border-radius: 12px" width="100%" height="154px" frameborder="0" allowfullscreen></iframe>\n\n`;
		
		// 检查是否有 YAML frontmatter
		const yamlRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
		const yamlMatch = content.match(yamlRegex);
		
		if (yamlMatch) {
			// 有 YAML frontmatter
			const yamlContent = yamlMatch[1];
			const afterYaml = content.substring(yamlMatch[0].length);
			
			// 检查是否已有 listenhub 属性
			let updatedYaml = yamlContent;
			if (/^listenhub:\s*.+$/m.test(yamlContent)) {
				// 替换现有的 listenhub 属性
				updatedYaml = yamlContent.replace(/^listenhub:\s*.+$/m, `listenhub: ${listenHubUrl}`);
			} else {
				// 添加新的 listenhub 属性
				updatedYaml = yamlContent + `\nlistenhub: ${listenHubUrl}`;
			}
			
			// 检查正文顶部是否已有 iframe
			const iframeRegex = /<iframe src="https:\/\/listenhub\.ai\/embed\/episode\/[^"]+"/;
			let updatedAfterYaml = afterYaml;
			if (iframeRegex.test(afterYaml)) {
				// 替换现有的 iframe
				updatedAfterYaml = afterYaml.replace(
					/<iframe src="https:\/\/listenhub\.ai\/embed\/episode\/[^"]+"\s+style="[^"]*"\s+width="[^"]*"\s+height="[^"]*"\s+frameborder="[^"]*"\s+allowfullscreen><\/iframe>\s*\n*/,
					iframeCode
				);
			} else {
				// 在正文顶部添加 iframe
				updatedAfterYaml = iframeCode + afterYaml.trimStart();
			}
			
			return `---\n${updatedYaml}\n---\n${updatedAfterYaml}`;
		} else {
			// 没有 YAML frontmatter，创建一个
			const newYaml = `---\nlistenhub: ${listenHubUrl}\n---\n`;
			
			// 检查正文顶部是否已有 iframe
			const iframeRegex = /<iframe src="https:\/\/listenhub\.ai\/embed\/episode\/[^"]+"/;
			let updatedContent = content;
			if (iframeRegex.test(content)) {
				// 替换现有的 iframe
				updatedContent = content.replace(
					/<iframe src="https:\/\/listenhub\.ai\/embed\/episode\/[^"]+"\s+style="[^"]*"\s+width="[^"]*"\s+height="[^"]*"\s+frameborder="[^"]*"\s+allowfullscreen><\/iframe>\s*\n*/,
					iframeCode
				);
			} else {
				// 在正文顶部添加 iframe
				updatedContent = iframeCode + content.trimStart();
			}
			
			return newYaml + updatedContent;
		}
	}
}

class GenerateAudioModal extends Modal {
	plugin: ListenHubPlugin;
	content: string;
	fileName: string;
	view: MarkdownView;

	constructor(app: App, plugin: ListenHubPlugin, content: string, fileName: string, view: MarkdownView) {
		super(app);
		this.plugin = plugin;
		this.content = content;
		this.fileName = fileName;
		this.view = view;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: '生成音频内容' });

		const infoDiv = contentEl.createDiv({ cls: 'listenhub-modal-info' });
		
		infoDiv.createEl('p', { 
			text: `文档: ${this.fileName}` 
		});
		
		const modeText = this.plugin.settings.mode === 'podcast' ? 'Podcast' : 'FlowSpeech';
		const subModeText = this.plugin.settings.mode === 'podcast' 
			? this.plugin.settings.podcastSubMode 
			: this.plugin.settings.flowSpeechSubMode;
		
		infoDiv.createEl('p', { 
			text: `模式: ${modeText} - ${subModeText}` 
		});
		
		infoDiv.createEl('p', { 
			text: `内容长度: ${this.content.length} 字符` 
		});

		const modeDescriptions: { [key: string]: string } = {
			'deep': '深度分析，内容质量高 (2-4分钟)',
			'quick': '快速生成，效率优先 (1-2分钟)',
			'debate': '双主持人辩论形式 (2-4分钟)',
			'smart': 'AI智能优化内容 (1-2分钟)',
			'direct': '文本直接转换语音 (1-2分钟)'
		};

		const currentMode = this.plugin.settings.mode === 'podcast' 
			? this.plugin.settings.podcastSubMode 
			: this.plugin.settings.flowSpeechSubMode;

		infoDiv.createEl('p', { 
			text: `说明: ${modeDescriptions[currentMode]}`,
			cls: 'listenhub-mode-description'
		});

		const buttonDiv = contentEl.createDiv({ cls: 'listenhub-modal-buttons' });

		const generateBtn = buttonDiv.createEl('button', { 
			text: '开始生成',
			cls: 'mod-cta'
		});
		
		generateBtn.addEventListener('click', async () => {
			generateBtn.disabled = true;
			generateBtn.setText('生成中...');

			const result = await this.plugin.callListenHubAPI(this.content, this.fileName);

			console.log('🔍 完整的 API 响应结果:', result);
			console.log('🔍 result.data:', result.data);
			console.log('🔍 result.data?.episode_id:', result.data?.episode_id);

			if (result.success !== false && result.data) {
				// 获取 episode_id
				const episodeId = result.data.episode_id || (result.data as any).episodeId || (result.data as any).id;
				
				console.log('✅ 提取的 Episode ID:', episodeId);
				
				if (!episodeId) {
					console.error('❌ 无法从响应中获取 Episode ID，完整响应:', JSON.stringify(result, null, 2));
					new Notice('❌ 生成失败: 无法获取 Episode ID');
					this.close();
					return;
				}

				// 删除了 Notice 提醒
				
				// 更新文档内容：添加属性和iframe
				if (this.view && this.view.file) {
					await this.plugin.updateDocumentWithEpisode(this.view.file, episodeId);
				}
				
				// 显示结果详情（传入 episodeId）
				new ResultModal(this.app, result.data, episodeId).open();
			} else {
				new Notice(`❌ 生成失败: ${result.error || result.message || '未知错误'}`);
			}

			this.close();
		});

		const cancelBtn = buttonDiv.createEl('button', { text: '取消' });
		cancelBtn.addEventListener('click', () => {
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class ResultModal extends Modal {
	data: {
		episode_id: string;
		status: string;
		audio_url?: string;
		message?: string;
	};
	episodeId: string;

	constructor(app: App, data: any, episodeId: string) {
		super(app);
		this.data = data;
		this.episodeId = episodeId;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: '生成结果' });

		const resultDiv = contentEl.createDiv({ cls: 'listenhub-result' });

		resultDiv.createEl('p', { 
			text: `Episode ID: ${this.episodeId || '生成中...'}` 
		});

		resultDiv.createEl('p', { 
			text: `状态: ${this.data.status || '处理中'}` 
		});

		if (this.data.audio_url) {
			const audioLink = resultDiv.createEl('a', { 
				text: '🎧 播放音频',
				href: this.data.audio_url 
			});
			audioLink.setAttr('target', '_blank');
		} else {
			resultDiv.createEl('p', { 
				text: '音频正在处理中，请稍后在 ListenHub 平台查看',
				cls: 'listenhub-processing'
			});
		}

		if (this.data.message) {
			resultDiv.createEl('p', { 
				text: `消息: ${this.data.message}`,
				cls: 'listenhub-message'
			});
		}

		// 添加跳转到 ListenHub Episode 详情的链接
		const linkDiv = contentEl.createDiv({ cls: 'listenhub-link-section' });
		linkDiv.style.marginTop = '16px';
		linkDiv.style.marginBottom = '16px';
		
		const episodeUrl = `https://listenhub.ai/zh/episode/${this.episodeId}`;
		const listenHubLink = linkDiv.createEl('a', { 
			text: '📚 在 ListenHub 查看详情',
			href: episodeUrl
		});
		listenHubLink.setAttr('target', '_blank');
		listenHubLink.style.display = 'block';
		listenHubLink.style.textAlign = 'center';
		listenHubLink.style.padding = '8px';
		listenHubLink.style.textDecoration = 'none';
		listenHubLink.style.color = 'var(--interactive-accent)';

		const buttonDiv = contentEl.createDiv({ cls: 'listenhub-button-group' });
		buttonDiv.style.marginTop = '16px';
		
		const closeBtn = buttonDiv.createEl('button', { 
			text: '关闭',
			cls: 'mod-cta'
		});
		closeBtn.addEventListener('click', () => {
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class ListenHubSettingTab extends PluginSettingTab {
	plugin: ListenHubPlugin;
	speakerListContainer: HTMLElement | null = null;

	constructor(app: App, plugin: ListenHubPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'ListenHub 设置' });

		// API Key 设置
		new Setting(containerEl)
			.setName('API Key')
			.setDesc('输入你的 ListenHub API Key')
			.addText(text => text
				.setPlaceholder('请输入 API Key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		// 测试连接按钮
		new Setting(containerEl)
			.setName('测试连接')
			.setDesc('测试 API Key 是否有效')
			.addButton(button => button
				.setButtonText('测试连接')
				.setCta()
				.onClick(async () => {
					button.setButtonText('测试中...');
					button.setDisabled(true);

					const result = await this.plugin.testAPIConnection();

					if (result.success) {
						new Notice(`✅ ${result.message}`);
					} else {
						new Notice(`❌ ${result.message}`);
					}

					button.setButtonText('测试连接');
					button.setDisabled(false);
				}));

		containerEl.createEl('h3', { text: '生成模式' });

		// 主模式选择
		new Setting(containerEl)
			.setName('主模式')
			.setDesc('选择生成类型')
			.addDropdown(dropdown => dropdown
				.addOption('podcast', 'Podcast (播客)')
				.addOption('flow-speech', 'FlowSpeech (流式语音)')
				.setValue(this.plugin.settings.mode)
				.onChange(async (value: 'podcast' | 'flow-speech') => {
					this.plugin.settings.mode = value;
					await this.plugin.saveSettings();
					this.display(); // 重新渲染以显示对应的子模式
				}));

		// Podcast 子模式
		if (this.plugin.settings.mode === 'podcast') {
			new Setting(containerEl)
				.setName('Podcast 子模式')
				.setDesc('选择播客生成模式')
				.addDropdown(dropdown => dropdown
					.addOption('deep', 'Deep - 深度分析')
					.addOption('quick', 'Quick - 快速生成')
					.addOption('debate', 'Debate - 辩论形式')
					.setValue(this.plugin.settings.podcastSubMode)
					.onChange(async (value: 'deep' | 'quick' | 'debate') => {
						this.plugin.settings.podcastSubMode = value;
						await this.plugin.saveSettings();
					}));

			// 模式说明
			const descDiv = containerEl.createDiv({ cls: 'listenhub-mode-descriptions' });
			descDiv.createEl('p', { text: '• Deep: 深度分析，内容质量高，适合专业知识分享 (2-4分钟)' });
			descDiv.createEl('p', { text: '• Quick: 快速生成，效率优先，适合新闻快报 (1-2分钟)' });
			descDiv.createEl('p', { text: '• Debate: 双主持人辩论形式，适合观点讨论 (2-4分钟)' });
		}

		// FlowSpeech 子模式
		if (this.plugin.settings.mode === 'flow-speech') {
			new Setting(containerEl)
				.setName('FlowSpeech 子模式')
				.setDesc('选择流式语音生成模式')
				.addDropdown(dropdown => dropdown
					.addOption('smart', 'Smart - 智能优化')
					.addOption('direct', 'Direct - 直接转换')
					.setValue(this.plugin.settings.flowSpeechSubMode)
					.onChange(async (value: 'smart' | 'direct') => {
						this.plugin.settings.flowSpeechSubMode = value;
						await this.plugin.saveSettings();
					}));

			// 模式说明
			const descDiv = containerEl.createDiv({ cls: 'listenhub-mode-descriptions' });
			descDiv.createEl('p', { text: '• Smart: AI智能优化内容，修复语句不通顺、错别字 (1-2分钟，单音色)' });
			descDiv.createEl('p', { text: '• Direct: 文本直接转换语音，类似TTS (1-2分钟，单音色)' });
		}

		containerEl.createEl('h3', { text: '语言和音色设置' });

		// 语言选择
		new Setting(containerEl)
			.setName('语言')
			.setDesc('选择生成内容的语言')
			.addDropdown(dropdown => dropdown
				.addOption('zh', '中文 (Chinese)')
				.addOption('en', '英文 (English)')
				.setValue(this.plugin.settings.language)
				.onChange(async (value: 'zh' | 'en') => {
					this.plugin.settings.language = value;
					await this.plugin.saveSettings();
				}));

		// Speaker 1
		new Setting(containerEl)
			.setName('音色 1 (Speaker 1)')
			.setDesc('第一个说话人的音色ID')
			.addText(text => text
				.setPlaceholder('例如: CN-Man-Beijing-V2')
				.setValue(this.plugin.settings.speaker1)
				.onChange(async (value) => {
					this.plugin.settings.speaker1 = value;
					await this.plugin.saveSettings();
				}));

		// Speaker 2
		new Setting(containerEl)
			.setName('音色 2 (Speaker 2)')
			.setDesc('第二个说话人的音色ID（注意：仅 Podcast 模式支持双音色，FlowSpeech 模式只使用第一个音色）')
			.addText(text => text
				.setPlaceholder('例如: chat-girl-105-cn')
				.setValue(this.plugin.settings.speaker2)
				.onChange(async (value) => {
					this.plugin.settings.speaker2 = value;
					await this.plugin.saveSettings();
				}));

		// 音色列表区域
		containerEl.createEl('h3', { text: '可用音色列表' });
		
		// 加载音色按钮
		new Setting(containerEl)
			.setName('加载音色')
			.setDesc('从 ListenHub API 获取可用音色列表')
			.addDropdown(dropdown => dropdown
				.addOption('zh', '中文')
				.addOption('en', '英文')
				.setValue(this.plugin.settings.language))
			.addButton(button => button
				.setButtonText('加载音色列表')
				.setCta()
				.onClick(async () => {
					const langDropdown = containerEl.querySelector('.setting-item:has(button) select') as HTMLSelectElement;
					const lang = langDropdown?.value || this.plugin.settings.language;
					
					button.setButtonText('加载中...');
					button.setDisabled(true);

					const result = await this.plugin.getSpeakers(lang);

					if (result.success && result.speakers) {
						this.renderSpeakerList(result.speakers);
						new Notice(`✅ 已加载 ${result.speakers.length} 个音色`);
					} else {
						new Notice(`❌ ${result.message || '加载失败'}`);
					}

					button.setButtonText('加载音色列表');
					button.setDisabled(false);
				}));

		// 音色列表容器
		this.speakerListContainer = containerEl.createDiv({ cls: 'listenhub-speaker-list-container' });

		// 使用说明
		containerEl.createEl('h3', { text: '使用说明' });
		const usageDiv = containerEl.createDiv({ cls: 'listenhub-usage' });
		usageDiv.createEl('p', { text: '1. 在设置中配置 API Key 并测试连接' });
		usageDiv.createEl('p', { text: '2. 选择生成模式和子模式' });
		usageDiv.createEl('p', { text: '3. 打开要转换的文档' });
		usageDiv.createEl('p', { text: '4. 点击左侧功能区的音频图标或使用命令面板' });
		usageDiv.createEl('p', { text: '5. 等待生成完成，查看结果' });
	}

	/**
	 * 渲染音色列表
	 */
	renderSpeakerList(speakers: Speaker[]) {
		if (!this.speakerListContainer) return;
		
		this.speakerListContainer.empty();
		
		if (speakers.length === 0) {
			this.speakerListContainer.createEl('p', { text: '暂无可用音色', cls: 'listenhub-no-speakers' });
			return;
		}

		// 创建表格
		const table = this.speakerListContainer.createEl('table', { cls: 'listenhub-speaker-table' });
		
		// 表头
		const thead = table.createEl('thead');
		const headerRow = thead.createEl('tr');
		headerRow.createEl('th', { text: '音色名称' });
		headerRow.createEl('th', { text: 'ID' });
		headerRow.createEl('th', { text: '性别' });
		headerRow.createEl('th', { text: '试听' });
		headerRow.createEl('th', { text: '操作' });

		// 表体
		const tbody = table.createEl('tbody');
		
		for (const speaker of speakers) {
			const row = tbody.createEl('tr');
			
			// 名称
			row.createEl('td', { text: speaker.name });
			
			// ID
			const idCell = row.createEl('td');
			const idCode = idCell.createEl('code', { text: speaker.id, cls: 'listenhub-speaker-id' });
			idCode.style.fontSize = '0.85em';
			idCode.style.backgroundColor = 'var(--background-secondary)';
			idCode.style.padding = '2px 6px';
			idCode.style.borderRadius = '3px';
			
			// 性别
			const genderText = speaker.gender === 'male' ? '男' : speaker.gender === 'female' ? '女' : '未知';
			row.createEl('td', { text: genderText });
			
			// 试听
			const audioCell = row.createEl('td');
			if (speaker.audioPreviewUrl) {
				const audioLink = audioCell.createEl('a', { 
					text: '🎧 试听',
					href: speaker.audioPreviewUrl,
					cls: 'listenhub-audio-link'
				});
				audioLink.setAttr('target', '_blank');
			} else {
				audioCell.createEl('span', { text: '-', cls: 'listenhub-no-audio' });
			}
			
			// 操作按钮
			const actionCell = row.createEl('td');
			const useBtn1 = actionCell.createEl('button', { text: '用作音色1', cls: 'listenhub-use-btn' });
			useBtn1.addEventListener('click', async () => {
				this.plugin.settings.speaker1 = speaker.id;
				await this.plugin.saveSettings();
				new Notice(`✅ 已将 "${speaker.name}" 设为音色1`);
				this.display(); // 刷新显示
			});
			
			const useBtn2 = actionCell.createEl('button', { text: '用作音色2', cls: 'listenhub-use-btn' });
			useBtn2.style.marginLeft = '4px';
			useBtn2.addEventListener('click', async () => {
				this.plugin.settings.speaker2 = speaker.id;
				await this.plugin.saveSettings();
				new Notice(`✅ 已将 "${speaker.name}" 设为音色2`);
				this.display(); // 刷新显示
			});
		}
	}
}
