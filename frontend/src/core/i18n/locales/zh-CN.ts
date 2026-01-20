import type { Translations } from "./types";

export const zhCN: Translations = {
  // Common
  common: {
    home: "首页",
    settings: "设置",
    delete: "删除",
    openInNewWindow: "在新窗口打开",
    close: "关闭",
    more: "更多",
    search: "搜索",
    download: "下载",
    thinking: "思考",
    artifacts: "文件",
  },

  // Welcome
  welcome: {
    greeting: "👋 你好，欢迎回来！",
    description:
      "欢迎使用 🦌 DeerFlow，一个完全开源的超级智能体。通过内置和\n自定义的 Skills，DeerFlow 可以帮你搜索网络、分析数据，\n还能为你生成幻灯片、网页等作品，几乎可以做任何事情。",
  },

  // Clipboard
  clipboard: {
    copyToClipboard: "复制到剪贴板",
    copiedToClipboard: "已复制到剪贴板",
    failedToCopyToClipboard: "复制到剪贴板失败",
  },

  // Input Box
  inputBox: {
    placeholder: "今天我能为你做些什么？",
    thinkingEnabled: "思考功能已启用",
    thinkingDisabled: "思考功能已禁用",
    clickToDisableThinking: "点击禁用思考功能",
    clickToEnableThinking: "点击启用思考功能",
    searchModels: "搜索模型...",
  },

  // Sidebar
  sidebar: {
    newChat: "新对话",
    chats: "对话",
    recentChats: "最近的聊天",
  },

  // Breadcrumb
  breadcrumb: {
    workspace: "工作区",
    chats: "对话",
  },

  // Workspace
  workspace: {
    githubTooltip: "DeerFlow 在 Github",
  },

  // Conversation
  conversation: {
    noMessages: "还没有消息",
    startConversation: "开始新的对话以查看消息",
  },

  // Chats
  chats: {
    searchChats: "搜索对话",
  },

  // Tool calls
  toolCalls: {
    moreSteps: (count: number) => `查看其他 ${count} 个步骤`,
    lessSteps: "隐藏步骤",
    executeCommand: "执行命令",
    presentFiles: "展示文件",
    needYourHelp: "需要你的协助",
    useTool: (toolName: string) => `使用 “${toolName}” 工具`,
    searchForRelatedInfo: "搜索相关信息",
    searchOnWebFor: (query: string) => `在网络上搜索 “${query}”`,
    viewWebPage: "查看网页",
    listFolder: "列出文件夹",
    readFile: "读取文件",
    writeFile: "写入文件",
  },
};
