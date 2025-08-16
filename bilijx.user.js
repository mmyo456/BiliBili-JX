// ==UserScript==
// @name         BiliBili 视频解析脚本(增强型)
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      2.5
// @description  只因你实在是太美 Baby!
// @author       laomo
// @match        https://www.bilibili.com/video*
// @match        https://www.bilibili.com/*bvid*
// @match        https://www.bilibili.com/
// @match        https://www.bilibili.com/v/popular*
// @match        https://search.bilibili.com/*
// @match        https://space.bilibili.com/*
// @match        https://www.bilibili.com/v/*/ranked*
// @match        https://www.bilibili.com/channel/*
// @match        https://www.bilibili.com/read/home*
// @match        https://t.bilibili.com/*
// @match        https://www.bilibili.com/history*
// @match        https://live.bilibili.com/*
// @match        https://www.bilibili.com/bangumi/*
// @downloadURL  https://raw.githubusercontent.com/mmyo456/BiliBili-JX/main/bilijx.user.js
// @updateURL    https://raw.githubusercontent.com/mmyo456/BiliBili-JX/main/bilijx.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @require      https://i.ouo.chat/api/jquery-3.7.1.slim.min.js
// ==/UserScript==

(function () {
    'use strict';
    
    // ------------------------------ 干净链接功能 ------------------------------
    // 清理B站URL中的垃圾参数
    function cleanBilibiliUrls() {
        function isURL(url, base) {
            try {
                if (typeof url === "string" && /^[\W\w]+\.[\W\w]+/.test(url) && !/^[a-z]+:/.test(url)) {
                    // 处理省略协议头情况
                    const str = url.startsWith("//") ? "" : "//";
                    url = location.protocol + str + url;
                }
                return new URL(url, base);
            } catch (e) {
                return false;
            }
        }
        
        /** 垃圾参数 */
        const paramsSet = new Set([
            'spm_id_from',
            'from_source',
            'msource',
            'bsource',
            'seid',
            'source',
            'session_id',
            'visit_id',
            'sourceFrom',
            'from_spmid',
            'share_source',
            'share_medium',
            'share_plat',
            'share_session_id',
            'share_tag',
            'unique_k',
            "csource",
            "vd_source",
            "tab",
            "is_story_h5",
            "share_from",
            "plat_id",
            "-Arouter",
            "spmid",
        ]);
        
        /** 节点监听暂存 */
        const nodelist = [];
        
        /**
         * 清理url
         * @param str 原url
         * @returns 新url
         */
        function clean(str) {
            if (/.*:\/\/.*.bilibili.com\/.*/.test(str) && !str.includes('passport.bilibili.com')) {
                const url = isURL(str);
                if (url) {
                    paramsSet.forEach(d => {
                        url.searchParams.delete(d);
                    });
                    return url.toJSON();
                }
            }
            return str;
        }
        
        /** 地址备份 */
        let locationBackup;
        
        /** 处理地址栏 */
        function cleanLocation() {
            const { href } = location;
            if (href === locationBackup) return;
            replaceUrl(locationBackup = clean(href));
        }
        
        /** 处理href属性 */
        function anchor(list) {
            list.forEach(d => {
                if (!d.href) return;
                d.href.includes("bilibili.tv") && (d.href = d.href.replace("bilibili.tv", "bilibili.com")); // tv域名失效
                d.href = clean(d.href);
            });
        }
        
        /** 检查a标签 */
        function click(e) { // 代码copy自B站spm.js
            var f = e.target;
            for (; f && "A" !== f.tagName;) {
                f = f.parentNode
            }
            if ("A" !== (null == f ? void 0 : f.tagName)) {
                return
            }
            anchor([f]);
        }
        
        /**
         * 修改当前URL而不触发重定向
         * **无法跨域操作！**
         * @param url 新URL
         */
        function replaceUrl(url) {
            window.history.replaceState(window.history.state, "", url);
        }
        
        cleanLocation(); // 及时处理地址栏
        
        // 处理注入的节点
        let timer = 0;
        observerAddedNodes((node) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                cleanLocation();
                anchor(document.querySelectorAll("a"));
            }, 100);
        });
        
        // 处理点击事件
        window.addEventListener("click", click, !1);
        
        // 处理右键菜单
        window.addEventListener("contextmenu", click, !1);
        
        // 页面载入完成
        document.addEventListener("load", () => anchor(document.querySelectorAll("a")), !1);
        
        /**
         * 注册节点添加监听
         * **监听节点变动开销极大，如非必要请改用其他方法并且用后立即销毁！**
         * @param callback 添加节点后执行的回调函数
         * @returns 注册编号
         */
        function observerAddedNodes(callback) {
            try {
                if (typeof callback === "function") nodelist.push(callback);
                return nodelist.length - 1;
            } catch (e) { console.error(e) }
        }
        
        const observe = new MutationObserver(d => d.forEach(d => {
            d.addedNodes[0] && nodelist.forEach(async f => {
                try {
                    f(d.addedNodes[0])
                } catch (e) { console.error(e) }
            })
        }));
        
        observe.observe(document, { childList: true, subtree: true });
        
        // 重写window.open
        window.open = ((__open__) => {
            return (url, name, params) => {
                return __open__(clean(url), name, params)
            }
        })(window.open);
        
        // 处理navigation API (如果支持)
        if(window.navigation) {
            window.navigation.addEventListener('navigate', e => {
                const newURL = clean(e.destination.url)
                if(e.destination.url != newURL) {
                    e.preventDefault(); // 返回前先阻止原事件
                    if(newURL == window.location.href) return // 如果清理后和原来一样就直接返回
                    // 否则处理清理后的链接
                    window.history.replaceState(window.history.state, "", newURL)
                }
            });
        }
    }
    
    // 初始化干净链接功能
    cleanBilibiliUrls();
    
    // ------------------------------ 主脚本功能 ------------------------------
  
    // 定义一些常量
    const NOTIFICATION_TIMEOUT = 5000; // 5秒 (原来是10秒，已缩减一半)
    const ERROR_TIMEOUT = 5000; // 5秒
    const NOTIFICATION_IMAGE = 'https://i.ouo.chat/api/img/DLC3.gif';
    const TYPE_VIDEO = 'video';
    const TYPE_LIVE = 'live';
    const DEBOUNCE_DELAY = 300; // 防抖延迟时间
  
    // 添加提示框的样式
    GM_addStyle(`
        :root {
            --video-color: rgb(0, 174, 236);
            --video-color-transparent: rgba(0, 174, 236, 0.8);
            --live-color: rgb(242, 82, 154);
            --live-color-transparent: rgba(242, 82, 154, 0.8);
            --white: rgb(255, 255, 255);
            --border-color: rgb(241, 242, 243);
            --default-notification-bg: rgba(80, 80, 80, 0.85);
            --video-notification-bg: rgba(0, 174, 236, 0.25);
            --live-notification-bg: rgba(242, 82, 154, 0.25);
            --error-notification-bg: rgba(231, 76, 60, 0.25);
        }
        
        #notificationBox {
            position: fixed;
            bottom: -100px; /* 初始位置在视口之外 */
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            padding: 20px;
            background-color: var(--default-notification-bg);
            color: var(--white);
            text-align: center;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
            opacity: 0;
            transition: all 0.5s ease;
            z-index: 9999;
            backdrop-filter: blur(3px);
        }
        
        #notificationBox.show {
            bottom: 20px; /* 提示框弹出位置 */
            opacity: 1;
        }
        
        #notificationBox.video-type {
            background-color: var(--video-notification-bg);
            border-left: 4px solid var(--video-color);
        }
        
        #notificationBox.live-type {
            background-color: var(--live-notification-bg);
            border-left: 4px solid var(--live-color);
        }
        
        #notificationBox.error-type {
            background-color: var(--error-notification-bg);
            border-left: 4px solid rgb(231, 76, 60);
        }
        
        /* 通用封面按钮样式 */
        .cover-analysis-btn {
            position: absolute;
            bottom: 10px;
            right: 10px;
            color: var(--white);
            border: none;
            border-radius: 8px;
            padding: 4px 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            z-index: 100;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        *:hover > .cover-analysis-btn {
            opacity: 1;
        }
        
        /* 视频封面按钮特定样式 */
        .video-cover-analysis-btn {
            background: var(--video-color-transparent);
        }
        
        .video-cover-analysis-btn:hover {
            background: var(--video-color);
        }
        
        /* 直播封面按钮特定样式 */
        .live-cover-analysis-btn {
            background: var(--live-color-transparent);
        }
        
        .live-cover-analysis-btn:hover {
            background: var(--live-color);
        }
        
        /* 通用固定解析按钮样式 */
        .analysis-btn {
            z-index: 999;
            width: 45px;
            height: 45px;
            color: var(--white);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 14px;
            position: fixed;
            cursor: pointer;
        }
        
        /* 视频解析按钮特定样式 */
        .video-analysis-btn {
            background: var(--video-color);
        }
        
        /* 直播解析按钮特定样式 */
        .live-analysis-btn {
            background: var(--live-color);
        }
    `);
  
    // 创建提示框元素
    const notificationBox = document.createElement('div');
    notificationBox.id = 'notificationBox';
    document.body.appendChild(notificationBox);
  
    // 通知框自动隐藏的定时器ID
    let notificationTimer = null;
    
    // 通用显示通知函数
    function showNotification(title, message, isError = false, type = null) {
        // 如果已经有通知显示中，先清除它的定时器
        if (notificationTimer) {
            clearTimeout(notificationTimer);
            notificationTimer = null;
            
            // 如果当前通知已经显示，则先将其隐藏，添加短暂延迟后再显示新通知
            if (notificationBox.classList.contains('show')) {
                notificationBox.classList.remove('show');
                
                // 使用setTimeout延迟一小段时间再显示新通知，制造动画效果
                setTimeout(() => showNewNotification(), 300);
                return;
            }
        }
        
        // 直接显示新通知
        showNewNotification();
        
        // 显示新通知的内部函数
        function showNewNotification() {
            // 移除所有可能的类型类
            notificationBox.classList.remove('video-type', 'live-type', 'error-type');
            
            // 设置通知内容
            notificationBox.innerHTML = `
                <img src="${NOTIFICATION_IMAGE}" alt="通知图标" style="width: 100px; height: 100px;">
                <h3>${title}</h3>
                <p>${message}</p>
            `;
            
            // 根据类型添加对应的样式类
            if (isError) {
                notificationBox.classList.add('error-type');
            } else if (type === TYPE_VIDEO) {
                notificationBox.classList.add('video-type');
            } else if (type === TYPE_LIVE) {
                notificationBox.classList.add('live-type');
            }
            
            // 显示通知
            notificationBox.classList.add('show');
            
            // 设置定时器，自动隐藏提示框
            notificationTimer = setTimeout(() => {
                notificationBox.classList.remove('show');
                notificationTimer = null;
            }, isError ? ERROR_TIMEOUT : NOTIFICATION_TIMEOUT);
        }
    }
    
    // 防抖函数
    function debounce(func, delay) {
        let timer = null;
        return function(...args) {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                func.apply(this, args);
                timer = null;
            }, delay);
        };
    }
    
    // 删除可能存在的所有旧按钮
    function removeOldButtons() {
        // 旧按钮ID列表
        const oldButtonIds = ['BiliAnalysis', 'BiliAnalysis1'];
        
        // 移除旧按钮
        oldButtonIds.forEach(id => {
            const oldButton = document.getElementById(id);
            if (oldButton) {
                oldButton.remove();
            }
        });
    }
  
    // 检测页面类型
    const isLivePage = window.location.hostname === 'live.bilibili.com' || 
                        window.location.href.includes('live.bilibili.com');
    const isVideoPage = !isLivePage && 
                        (window.location.href.includes('/video/') || 
                        window.location.href.includes('bvid='));
    
    // 移除旧按钮
    removeOldButtons();
    
    // 创建固定解析按钮
    function createAnalysisButton(id, isRightCorner, isLive) {
        const button = document.createElement('button');
        button.id = id;
        button.className = `analysis-btn ${isLive ? 'live-analysis-btn' : 'video-analysis-btn'}`;
        button.innerHTML = isLive ? '直播<br>解析' : '视频<br>解析';
        
        // 设置位置
        if (isRightCorner) {
            button.style.top = '800px';
            button.style.right = '0px';
        } else {
            button.style.top = '100px';
            button.style.left = '0px';
        }
        
        // 添加点击事件
        button.addEventListener('click', isLive ? clickLiveAnalysis : clickVideoAnalysis);
        
        // 添加到页面
        document.body.appendChild(button);
        
        return button;
    }
    
    // 根据页面类型创建相应的解析按钮
    if (isVideoPage) {
        console.log('创建视频解析按钮');
        // 创建右下角和左上角视频解析按钮
        createAnalysisButton('videoAnalysis1', true, false);
        createAnalysisButton('videoAnalysis2', false, false);
    } else if (isLivePage) {
        console.log('创建直播解析按钮');
        // 创建右下角和左上角直播解析按钮
        createAnalysisButton('liveAnalysis1', true, true);
        createAnalysisButton('liveAnalysis2', false, true);
    }

    // 添加视频封面解析按钮的函数
    function addCoverAnalysisButtons() {
        // 视频封面
        addVideoCoverButtons();
        // 直播封面
        addLiveCoverButtons();
    }
    
    // 视频封面选择器缓存
    const videoCoverSelectors = [
        // 首页、分区推荐
        '.video-card a.video-card__content',
        '.bili-video-card__wrap a.bili-video-card__image--link',
        '.bili-video-card .bili-video-card__image > a',
        '.bili-video-card__wrap > a', 
        // 视频卡片
        '.video-item .bili-video-card__wrap a',
        // 搜索结果页
        '.search-card .video-card__content',
        '.search-card .bili-video-card__image--link',
        '.search-card__content .bili-video-card__image--link',
        '.search-card__info .bili-video-card__image--link',
        // 旧版卡片
        'a.cover',
        '.cover-normal',
        '.cover > a',
        // 用户空间页视频
        '.upuser-video-card__content',
        '.small-item .cover-container',
        '.small-cover__content',
        '.video-content .cover-container',
        // 视频详情页下方和右侧推荐
        '.video-page-card-small',
        '.video-page-card',
        '.rec-list .video-card-reco',
        '.card-box .video-card-common',
        '.aside-panel-main a.pic-box',
        '.video-list-item .video-cover',
        '.card-box .pic',
        // 频道页、排行榜
        '.rank-item .content-wrap',
        '.rank-wrap .info-box',
        '.storey-box .spread-module',
        '.spread-item a.pic',
        '.channel-list .channel-item',
        // 动态页视频
        '.video-container .bili-video-card',
        '.bili-dyn-item a.bili-video-card__cover',
        '.bili-dyn-card-video__wrap',
        '.bili-dyn-content .bili-dyn-card-video',
        // 播放历史页面
        '.history-wrap .cover-contain',
        '.history-wrap .video-card__content',
        '.history-wrap .history-card',
        '.history-wrap .card-box .pic',
        '.history-wrap .bili-video-card__image--link',
        '.history-list .history-card .pic-box',
        '.history-list .cover a',
        // 番剧、影视
        '.bangumi-card .cover-box',
        '.bangumi-card-media .media-cover',
        '.bangumi-list .cover',
        '.season-wrap .cover',
        '.media-card .cover-container'
    ];
    
    // 直播封面选择器缓存
    const liveCoverSelectors = [
        // 首页推荐直播
        '.live-card .live-card-wrapper',
        '.live-card .cover-ctnr',
        '.live-card .cover',
        // 直播页面卡片
        '.room-card .cover-ctnr',
        '.room-card-wrapper .room-cover',
        '.bili-live-card__cover',
        '.bili-live-card__wrap',
        // 动态页直播
        '.bili-dyn-live-card',
        '.bili-video-card__wrap .bili-live-card',
        // 通用选择器
        'a[href*="live.bilibili.com"]',
        '.live-box .cover',
        '.room-list .room-card'
    ];
    
    // 添加视频封面按钮
    function addVideoCoverButtons() {
        // 使用选择器查找所有可能的视频封面
        processElementsWithSelectors(videoCoverSelectors, processVideoElement);
        
        // 尝试查找所有a标签，但必须包含图片元素才添加按钮
        try {
            document.querySelectorAll('a').forEach(linkElement => {
                const href = linkElement.href || '';
                // 确保链接包含视频ID、包含图片元素、没有已经添加的按钮、不是标题元素
                if ((href.includes('/video/BV') || href.includes('bvid=')) && 
                    linkElement.querySelector('img') && // 必须有图片才算封面
                    !linkElement.querySelector('.video-cover-analysis-btn') &&
                    !isLikelyTitleElement(linkElement)) {
                    processVideoElement(linkElement);
                }
            });
        } catch (e) {
            console.error('Error processing link elements:', e);
        }
        
        // 专门处理历史记录页面
        if (window.location.href.includes('/history')) {
            try {
                // 处理历史记录页特殊结构
                document.querySelectorAll('.history-list .history-card').forEach(card => {
                    const coverLink = card.querySelector('.cover a') || card.querySelector('.pic-box');
                    if (coverLink) {
                        processVideoElement(coverLink);
                    }
                });
            } catch (e) {
                console.error('Error processing history page:', e);
            }
        }
    }
    
    // 添加直播封面按钮
    function addLiveCoverButtons() {
        // 使用选择器查找所有可能的直播封面
        processElementsWithSelectors(liveCoverSelectors, processLiveElement);
        
        // 尝试查找所有包含直播链接的a标签
        try {
            document.querySelectorAll('a').forEach(linkElement => {
                const href = linkElement.href || '';
                if (href.includes('live.bilibili.com') && 
                    linkElement.querySelector('img') && 
                    !linkElement.querySelector('.live-cover-analysis-btn')) {
                    processLiveElement(linkElement);
                }
            });
        } catch (e) {
            console.error('Error processing live link elements:', e);
        }
    }
    
    // 处理多个选择器的元素
    function processElementsWithSelectors(selectors, processor) {
        selectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(element => {
                    processor(element);
                });
            } catch (e) {
                console.error('Error processing selector:', selector, e);
            }
        });
    }
    
    // 判断元素是否可能是标题元素
    function isLikelyTitleElement(element) {
        // 判断元素类名是否包含"title"
        if (element.className.toLowerCase().includes('title')) return true;
        
        // 判断父元素或祖先元素是否包含"title"类
        let parent = element.parentElement;
        for (let i = 0; i < 3 && parent; i++) { // 只检查3层父元素
            if (parent.className.toLowerCase().includes('title')) return true;
            parent = parent.parentElement;
        }
        
        // 检查元素内部文本长度，标题通常较长
        const textContent = element.textContent.trim();
        if (textContent.length > 10 && !element.querySelector('img')) return true;
        
        // 检查标签结构，通常标题不会是图片的容器
        if (element.querySelector('img') && element.children.length === 1) return false;
        
        // 检查是否为h1-h6标签
        const tagName = element.tagName.toLowerCase();
        if (tagName.match(/h[1-6]/)) return true;
        
        return false;
    }
    
    // 从链接中提取ID的通用函数
    function extractIdFromLink(link, isLive) {
        if (!link) return null;
        
        if (isLive) {
            // 提取直播房间ID
            if (link.includes('live.bilibili.com')) {
                const match = link.match(/live\.bilibili\.com\/(\d+)/);
                return match ? match[1] : null;
            }
        } else {
            // 提取视频BV号
            if (link.includes('/video/')) {
                const match = link.match(/\/video\/(BV[a-zA-Z0-9]+)/);
                return match ? match[1] : null;
            } else if (link.includes('bvid=')) {
                const match = link.match(/bvid=(BV[a-zA-Z0-9]+)/);
                return match ? match[1] : null;
            }
        }
        
        return null;
    }
    
    // 创建封面解析按钮的通用函数
    function createCoverButton(element, id, isLive, clickHandler) {
        // 设置封面元素为相对定位，以便放置解析按钮
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        
        // 创建解析按钮
        const analysisBtn = document.createElement('button');
        analysisBtn.className = `cover-analysis-btn ${isLive ? 'live-cover-analysis-btn' : 'video-cover-analysis-btn'}`;
        analysisBtn.innerText = isLive ? '直播解析' : '解析';
        analysisBtn.dataset.id = id;
        
        // 添加点击事件
        analysisBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            clickHandler(this.dataset.id);
        });
        
        // 添加按钮到封面
        element.appendChild(analysisBtn);
        
        return analysisBtn;
    }
    
    // 处理单个视频元素
    function processVideoElement(coverElement) {
        // 检查是否已经添加过按钮
        if (coverElement.querySelector('.video-cover-analysis-btn')) return;
        
        // 忽略明显是标题的元素
        if (isLikelyTitleElement(coverElement)) return;
        
        // 获取视频链接
        const videoLink = coverElement.href || coverElement.getAttribute('href');
        if (!videoLink || (!videoLink.includes('bilibili.com/video') && !videoLink.includes('bvid='))) return;
        
        // 从链接中提取BV号
        const bvid = extractIdFromLink(videoLink, false);
        if (!bvid) return;
        
        // 确认元素包含图片才是封面
        if (!coverElement.querySelector('img')) return;
        
        // 创建解析按钮
        createCoverButton(coverElement, bvid, false, analysisVideo);
    }
    
    // 处理直播封面元素
    function processLiveElement(coverElement) {
        // 检查是否已经添加过按钮
        if (coverElement.querySelector('.live-cover-analysis-btn')) return;
        
        // 获取直播链接
        const liveLink = coverElement.href || coverElement.getAttribute('href') || 
                        (coverElement.querySelector('a') ? coverElement.querySelector('a').href : '');
        
        if (!liveLink || !liveLink.includes('live.bilibili.com')) return;
        
        // 从链接中提取房间号
        const roomId = extractIdFromLink(liveLink, true);
        if (!roomId) return;
        
        // 创建直播解析按钮
        createCoverButton(coverElement, roomId, true, analysisLive);
    }
    
    // 通用视频解析函数
    function getVideoUrl(bvid, p = 1, customCallback = null) {
        if (!bvid) return;
        const videoUrl = "https://bil.ouo.chat/player/?url=https://www.bilibili.com/video/"+bvid+"?p="+p;
        navigator.clipboard.writeText(videoUrl).catch(e => console.error(e));
        showNotification('视频解析成功', '链接已复制到剪贴板', false, TYPE_VIDEO);
    }
    
    // 封面按钮点击解析视频
    function analysisVideo(bvid) {
        // 调用通用视频解析函数，默认P1
        getVideoUrl(bvid, 1, function(videoUrl) {
            showNotification('解析成功', '链接已复制到剪贴板', false, TYPE_VIDEO);
        });
    }
    
    // 视频页面的解析按钮点击事件
    function clickVideoAnalysis() {
      var url = window.location.href;
      var BV = /(?=BV).*?(?=\?|\/)/;
      var P = /(?<=p=).*?(?=&vd)/;
      var BV1 = url.match(BV);
      var P1 = url.match(P);
  
      if (BV1 == null) {
        BV1 = url.match(/(?<=bvid=).*?(?=&)/);
      }
  
      if (P1 == null) {
        P1 = 1;
        } else {
            P1 = parseInt(P1[0], 10); // 确保P1是数字
        }
    
        // 调用通用视频解析函数
        getVideoUrl(BV1, P1, function(videoUrl) {
            showNotification('视频解析成功', '链接已复制到剪贴板', false, TYPE_VIDEO);
        });
    }
    
    // 直播页面的解析按钮点击事件
    function clickLiveAnalysis() {
        var url = window.location.href;
        const roomIdMatch = url.match(/live\.bilibili\.com\/(\d+)/);
        if (roomIdMatch && roomIdMatch[1]) {
            analysisLive(roomIdMatch[1]);
        } else {
            // 如果在直播主页，尝试获取当前页面的第一个直播间
            const liveLinks = document.querySelectorAll('a[href*="live.bilibili.com/"]');
            let foundRoomId = null;
            
            // 遍历所有直播链接，寻找房间号
            for (let i = 0; i < liveLinks.length; i++) {
                const link = liveLinks[i].href;
                const match = link.match(/live\.bilibili\.com\/(\d+)/);
                if (match && match[1]) {
                    foundRoomId = match[1];
                    break;
                }
            }
            
            if (foundRoomId) {
                analysisLive(foundRoomId);
            } else {
                showNotification('解析失败', '无法获取直播间ID，请进入具体直播间再试', true);
            }
        }
    }
    
    // 直播解析函数 - 使用新的API
    function analysisLive(roomId) {
        if (!roomId) return;
        const streamUrl = "https://bil.ouo.chat/player/?url=https://live.bilibili.com/"+roomId;
        navigator.clipboard.writeText(streamUrl).catch(e => console.error(e));
        // 显示成功提示
        showNotification('直播解析成功', '链接已复制到剪贴板', false, TYPE_LIVE);
    }

    
    // 初始执行一次
    addCoverAnalysisButtons();
    
    // 使用MutationObserver监听DOM变化，为新加载的封面添加按钮
    const observer = new MutationObserver(debounce(function(mutations) {
        // 移除可能重新出现的旧按钮
        removeOldButtons();
        // 添加封面解析按钮
        addCoverAnalysisButtons();
    }, DEBOUNCE_DELAY));
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 在页面滚动时也检查新加载的视频
    window.addEventListener('scroll', debounce(function() {
        // 移除可能重新出现的旧按钮
        removeOldButtons();
        // 添加封面解析按钮
        addCoverAnalysisButtons();
    }, DEBOUNCE_DELAY));
  })();
  
