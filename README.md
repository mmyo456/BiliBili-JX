# B站视频和直播解析脚本

## 简介

这是一个功能强大的B站视频和直播解析工具，可以一键获取哔哩哔哩(Bilibili)视频和直播的直链地址。支持视频页面、直播页面以及首页、搜索结果页等多种页面场景下的解析功能。

## 主要功能

- 视频解析：一键获取B站视频的直链地址
- 直播解析：一键获取B站直播流地址(支持M3U8和FLV格式)
- 封面按钮：为视频/直播封面添加快捷解析按钮
- 复制到剪贴板：自动将解析结果复制到剪贴板
- 干净链接：自动清理B站URL中的垃圾参数

## 安装方法

1. 首先安装油猴插件(Tampermonkey)：
   
   - [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Edge](https://microsoftedge.microsoft.com/addons/detail/%E7%AF%A1%E6%94%B9%E7%8C%B4/iikmkjmpaadaobahmlepeloendndfphd?hl=zh-CN)
   - [Firefox版](https://addons.mozilla.org/firefox/addon/tampermonkey/)

2. 安装脚本（以下任选一种方式）：
   
   - **直接安装**：点击 [安装脚本](https://raw.githubusercontent.com/gujimy/BiliBili-JX/main/bilijx.user.js)
   - **直接安装国内加速**：点击 [安装脚本](https://raw.gitmirror.com/gujimy/BiliBili-JX/main/bilijx.user.js)

   
   <div align="center">
     <a href="https://raw.githubusercontent.com/gujimy/BiliBili-JX/main/bilijx.user.js">
       <img src="https://img.shields.io/badge/点击安装哔哩视频解析脚本-FF6699.svg?style=for-the-badge&logo=tampermonkey&logoColor=white&labelColor=101F2E" alt="点击安装哔哩视频解析脚本">
     </a>
   </div>
   <div align="center">
     <a href="https://raw.gitmirror.com/gujimy/BiliBili-JX/main/bilijx.user.js">
       <img src="https://img.shields.io/badge/点击安装哔哩视频解析脚本（镜像加速）-FF6699.svg?style=for-the-badge&logo=tampermonkey&logoColor=white&labelColor=101F2E" alt="点击安装哔哩视频解析脚本（镜像加速）">
     </a>
   </div>
   
   - **手动安装**：
     - 打开油猴插件管理页面
     - 点击"添加新脚本"
     - 将[bilijx.js](https://github.com/gujimy/BiliBili-JX/blob/main/bilijx.js)中的代码复制粘贴到编辑器中
     - 点击"保存"即可

## 使用方法

### 视频解析

- 在视频页面，点击左上角或右下角的"视频解析"按钮
- 在任意页面，鼠标悬停在视频封面上，点击右下角出现的"解析"按钮

### 直播解析

- 在直播页面，点击左上角或右下角的"直播解析"按钮
- 在任意页面，鼠标悬停在直播封面上，点击右下角出现的"直播解析"按钮

解析成功后，视频/直播链接会自动复制到剪贴板，同时屏幕底部会弹出提示框显示解析结果。

## 兼容页面

- 视频播放页
- 直播页面
- 首页推荐
- 分区页面
- 搜索结果页
- 用户空间页
- 历史记录页
- 排行榜页面
- 动态页
- 番剧页面
- 频道页面

## 技术特性

- 自适应按钮：根据页面类型智能显示对应的解析按钮
- 智能回退：直播解析采用多级API回退机制，确保解析成功率
- 优先M3U8：直播解析优先获取更稳定的M3U8格式
- DOM监听：使用MutationObserver监听页面变化，实时添加解析按钮
- 防抖优化：滚动事件优化，提高性能
- 干净链接：自动清理URL中的跟踪参数，提高隐私保护

## 更新日志

- 添加干净链接功能，清理URL跟踪参数

## 注意事项

- 本脚本仅供学习交流使用
- 请尊重创作者的版权，不要滥用解析功能
- 部分高清视频需要登录B站账号才能解析
- 部分视频可能受地区限制

## 致谢

- 感谢 [SocialSisterYi/bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect) 提供的B站API参考
- 感谢 [mmyo456/BiliAnalysis](https://github.com/mmyo456/BiliAnalysis) 提供的代码参考
- 感谢 [Bilibili 干净链接](https://greasyfork.org/zh-CN/scripts/393995-bilibili-%E5%B9%B2%E5%87%80%E9%93%BE%E6%8E%A5) 提供的清理URL功能参考

## 免责声明

本脚本仅用于学习研究，请勿用于非法用途。使用本脚本产生的一切后果由使用者自行承担。 
