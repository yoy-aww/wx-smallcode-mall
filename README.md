# 微信小程序商城项目

基于 TypeScript 和 SASS 的微信小程序电商平台。

## 项目结构

```
mall/
├── .gitignore              # Git 忽略文件
├── package.json            # 项目依赖和脚本
├── package-lock.json       # 依赖锁定文件
├── node_modules/           # 依赖包目录
├── tsconfig.json           # TypeScript 配置
├── project.config.json     # 微信小程序配置
├── miniprogram/            # 小程序源码目录
│   ├── app.json           # 应用配置
│   ├── app.ts             # 应用入口
│   ├── app.scss           # 全局样式
│   ├── components/        # 组件目录
│   │   ├── user-header/   # 用户头部组件
│   │   ├── navigation-bar/# 导航栏组件
│   │   └── ...
│   ├── pages/             # 页面目录
│   │   ├── index/         # 首页
│   │   ├── profile/       # 个人中心
│   │   └── ...
│   ├── models/            # 数据模型
│   ├── services/          # 服务层
│   ├── utils/             # 工具函数
│   ├── constants/         # 常量定义
│   ├── styles/            # 样式文件
│   └── images/            # 图片资源
└── typings/               # TypeScript 类型定义
```

## 技术栈

- **TypeScript**: 主要开发语言，启用严格类型检查
- **SASS**: CSS 预处理器
- **WeChat Mini Program**: 目标平台和运行环境
- **Glass-easel**: 组件框架
- **Jest**: 测试框架

## 开发环境

- 微信开发者工具
- Node.js 16+
- npm 7+

## 快速开始

1. 安装依赖
```bash
npm install
```

2. 在微信开发者工具中打开项目

3. 运行测试
```bash
npm test
```

## 可用脚本

- `npm test` - 运行所有测试
- `npm run test:user-header` - 运行用户头部组件测试

## 组件开发

### UserHeader 组件

用户头部组件，显示用户头像、昵称和会员等级。

**功能特性:**
- 登录/未登录状态处理
- 头像显示和回退支持
- 会员等级徽章
- 登录提示和操作按钮

**使用方法:**
```xml
<user-header 
  isLoggedIn="{{isLoggedIn}}"
  userInfo="{{userInfo}}"
  bind:login="onLogin"
  bind:avatarTap="onAvatarTap"
/>
```

详细文档请参考: [UserHeader README](./miniprogram/components/user-header/README.md)

## 代码规范

- 使用 TypeScript 严格模式
- 遵循 WeChat Mini Program 最佳实践
- 组件采用 PascalCase 命名
- 文件采用 kebab-case 命名
- 样式使用 BEM 命名规范

## Git 工作流

- 主分支: `main`
- 功能分支: `feature/功能名称`
- 修复分支: `fix/问题描述`

## 部署

通过微信开发者工具进行部署:
1. 点击"上传"按钮
2. 填写版本号和项目备注
3. 提交审核

## 许可证

[MIT License](LICENSE)