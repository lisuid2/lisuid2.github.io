// 移动端侧栏
const sidebarFn = () => {
    const $toggleMenu = document.getElementById('toggle-menu');
    const $mobileSidebarMenus = document.getElementById('sidebar-menus');
    const $menuMask = document.getElementById('menu-mask');
    const $body = document.body;
    const toggleMobileSidebar = (isOpen) => {
        utils.sidebarPaddingR();
        $body.style.overflow = isOpen ? 'hidden' : '';
        $body.style.paddingRight = isOpen ? '' : '';
        utils[isOpen ? 'fadeIn' : 'fadeOut']($menuMask, 0.5);
        $mobileSidebarMenus.classList[isOpen ? 'add' : 'remove']('open');
    }
    $toggleMenu.addEventListener('click', () => toggleMobileSidebar(true));
    $menuMask.addEventListener('click', () => {
        if ($mobileSidebarMenus.classList.contains('open')) {
            toggleMobileSidebar(false);
        }
    });
    window.addEventListener('resize', () => {
        if (utils.isHidden($toggleMenu) && $mobileSidebarMenus.classList.contains('open')) {
            toggleMobileSidebar(false);
        }
        sco.refreshWaterFall();
    });
}

// 滚动事件监听
const scrollFn = function () {
    const innerHeight = window.innerHeight;
    if (document.body.scrollHeight <= innerHeight) return;
    let initTop = 0;
    const $header = document.getElementById('page-header');
    const throttledScroll = utils.throttle(function (e) {
        initThemeColor();
        const currentTop = window.scrollY || document.documentElement.scrollTop;
        const isDown = scrollDirection(currentTop);
        if (currentTop > 0) {
            if (isDown) {
                if ($header.classList.contains('nav-visible')) $header.classList.remove('nav-visible');
            } else {
                if (!$header.classList.contains('nav-visible')) $header.classList.add('nav-visible');
            }
            $header.classList.add('nav-fixed');
        } else {
            $header.classList.remove('nav-fixed', 'nav-visible');
        }
    }, 200);
    window.addEventListener('scroll', function (e) {
        throttledScroll(e);
        if (window.scrollY === 0) {
            $header.classList.remove('nav-fixed', 'nav-visible');
        }
    });

    function scrollDirection(currentTop) {
        const result = currentTop > initTop;
        initTop = currentTop;
        return result;
    }
}

// 进度球
const percent = () => {
    const docEl = document.documentElement;
    const body = document.body;
    const scrollPos = window.pageYOffset || docEl.scrollTop;
    const totalScrollableHeight = Math.max(body.scrollHeight, docEl.scrollHeight, body.offsetHeight, docEl.offsetHeight, body.clientHeight, docEl.clientHeight) - docEl.clientHeight;
    const scrolledPercent = Math.round((scrollPos / totalScrollableHeight) * 100);
    const navToTop = document.querySelector("#nav-totop");
    const percentDisplay = document.querySelector("#percent");
    const isNearEnd = (window.scrollY + docEl.clientHeight) >= (document.getElementById("post-comment") || document.getElementById("footer")).offsetTop;
    navToTop.classList.toggle("long", isNearEnd || scrolledPercent > 90);
    percentDisplay.textContent = isNearEnd || scrolledPercent > 90 ? GLOBAL_CONFIG.lang.backtop : scrolledPercent;
    document.querySelectorAll(".needEndHide").forEach(item => item.classList.toggle("hide", totalScrollableHeight - scrollPos < 100));
}

// 展示今日卡片
const showTodayCard = () => {
    const el = document.getElementById('todayCard');
    const topGroup = document.querySelector('.topGroup');
    topGroup?.addEventListener('mouseleave', () => el?.classList.remove('hide'));
}

// 初始化 IntersectionObserver
const initObserver = () => {
    const commentElement = document.getElementById("post-comment");
    const paginationElement = document.getElementById("pagination");
    const commentBarrageElement = document.querySelector(".comment-barrage");
    if (commentElement && paginationElement) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const action = entry.isIntersecting ? 'add' : 'remove';
                paginationElement.classList[action]("show-window");
                if (GLOBAL_CONFIG.comment.commentBarrage) {
                    commentBarrageElement.style.bottom = entry.isIntersecting ? "-200px" : "0px";
                }
            });
        });
        observer.observe(commentElement);
    }
};

// 复制版权信息
const addCopyright = () => {
    if (!GLOBAL_CONFIG.copyright) return;
    const {limit, author, link, source, info} = GLOBAL_CONFIG.copyright;
    document.body.addEventListener('copy', (e) => {
        e.preventDefault();
        const copyText = window.getSelection().toString();
        const text = copyText.length > limit ? `${copyText}\n\n${author}\n${link}${window.location.href}\n${source}\n${info}` : copyText;
        e.clipboardData.setData('text', text);
    });
};

// 侧边栏状态
const asideStatus = () => {
    const status = utils.saveToLocal.get('aside-status');
    document.documentElement.classList.toggle('hide-aside', status === 'hide');
}

// 初始化主题色
function initThemeColor() {
    const currentTop = window.scrollY || document.documentElement.scrollTop;
    const themeColor = currentTop > 0 ? '--efu-card-bg' : PAGE_CONFIG.is_post ? '--efu-main' : '--efu-background';
    applyThemeColor(getComputedStyle(document.documentElement).getPropertyValue(themeColor));
}

/**
 * applyThemeColor
 * @description 应用主题色
 * @param color
 */
function applyThemeColor(color) {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const appleMobileWebAppMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    themeColorMeta?.setAttribute("content", color);
    appleMobileWebAppMeta?.setAttribute("content", color);
    if (window.matchMedia("(display-mode: standalone)").matches) {
        document.body.style.backgroundColor = color;
    }
}

/**
 * handleThemeChange
 * @description 切换主题色
 * @param mode
 */
const handleThemeChange = mode => {
    const themeChange = window.globalFn?.themeChange || {}
    for (let key in themeChange) {
        themeChange[key](mode)
    }
}

// lastSayHello 上次打招呼的内容
let lastSayHello = "";
// 用于记录标签页是否被隐藏，从而改变下次执行打招呼的内容
let wasPageHidden = false;
// musicPlaying 是否正在播放音乐
let musicPlaying = false
// is_rm 是否启用右键菜单
let is_rm = typeof rm !== 'undefined'

/**
 * sco
 * @description solitude 主题的一些方法
 * @type {{showConsole: (function(): boolean), setTimeState: sco.setTimeState, toTop: (function(): void), changeTimeFormat(*): void, hideCookie: sco.hideCookie, owoBig(*): void, switchDarkMode: sco.switchDarkMode, openAllTags: sco.openAllTags, switchHideAside: sco.switchHideAside, addRuntime: sco.addRuntime, refreshWaterFall: sco.refreshWaterFall, categoriesBarActive: sco.categoriesBarActive, addNavBackgroundInit: sco.addNavBackgroundInit, toPage: sco.toPage, changeSayHelloText: sco.changeSayHelloText, initConsoleState: (function(): void), switchComments(): void, switchKeyboard: sco.switchKeyboard, listenToPageInputPress: sco.listenToPageInputPress, scrollTo: sco.scrollTo, musicToggle: sco.musicToggle, toTalk: sco.toTalk, switchCommentBarrage: sco.switchCommentBarrage, hideTodayCard: (function(): void), scrollCategoryBarToRight: sco.scrollCategoryBarToRight, scrollToComment: sco.scrollToComment, initbbtalk: sco.initbbtalk, tagPageActive: sco.tagPageActive, hideConsole: (function(): void), addPhotoFigcaption: sco.addPhotoFigcaption}}
 */
let sco = {
    /**
     * hideCookie
     * @description 隐藏 cookie 通知
     */
    hideCookie: function () {
        const cookiesWindow = document.getElementById("cookies-window");
        if (cookiesWindow) {
            setTimeout(() => {
                cookiesWindow.classList.add("cw-hide");
                setTimeout(() => cookiesWindow.style.display = "none", 1000);
            }, 3000);
        }
    },
    /**
     * scrollTo
     * @description 滚动到指定元素
     * @param elementId
     */
    scrollTo: function (elementId) {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scroll({
                top: targetPosition,
                behavior: "smooth"
            });
        }
    },
    /**
     * musicToggle
     * @description 音乐播放开关
     */
    musicToggle: function () {
        const $music = document.querySelector('#nav-music');
        const $meting = document.querySelector('meting-js');
        const $console = document.getElementById('consoleMusic');
        const $rm_text = document.querySelector('#menu-music-toggle span');
        const $rm_icon = document.querySelector('#menu-music-toggle i');
        musicPlaying = !musicPlaying;
        $music.classList.toggle("playing", musicPlaying);
        $console.classList.toggle("on", musicPlaying);
        if (musicPlaying) {
            $meting.aplayer.play();
            rm?.menuItems.music[0] && ($rm_text.textContent = GLOBAL_CONFIG.right_menu.music.stop) && ($rm_icon.className = 'solitude st-pause-fill')
        } else {
            $meting.aplayer.pause();
            rm?.menuItems.music[0] && ($rm_text.textContent = GLOBAL_CONFIG.right_menu.music.start) && ($rm_icon.className = 'solitude st-play-fill')
        }
    },
    /**
     * switchCommentBarrage
     * @description 切换评论弹幕
     */
    switchCommentBarrage: function () {
        let commentBarrageElement = document.querySelector(".comment-barrage");
        if (!commentBarrageElement) return;
        const isDisplayed = window.getComputedStyle(commentBarrageElement).display === "flex";
        commentBarrageElement.style.display = isDisplayed ? "none" : "flex";
        document.querySelector("#consoleCommentBarrage").classList.toggle("on", !isDisplayed);
        utils.saveToLocal.set("commentBarrageSwitch", !isDisplayed, .2);
        rm?.menuItems.barrage && rm.barrage(isDisplayed)
    },
    /**
     * switchHideAside
     * @description 切换侧边栏
     */
    switchHideAside: function () {
        const htmlClassList = document.documentElement.classList;
        const consoleHideAside = document.querySelector("#consoleHideAside");
        const isHideAside = htmlClassList.contains("hide-aside");
        utils.saveToLocal.set("aside-status", isHideAside ? "show" : "hide", 1);
        htmlClassList.toggle("hide-aside");
        consoleHideAside.classList.toggle("on", !isHideAside);
    },
    /**
     * switchKeyboard
     * @description 切换快捷键
     */
    switchKeyboard: function () {
        sco_keyboards = !sco_keyboards;
        const consoleKeyboard = document.querySelector("#consoleKeyboard");
        const keyboardFunction = sco_keyboards ? openKeyboard : closeKeyboard;
        consoleKeyboard.classList.toggle("on", sco_keyboards);
        keyboardFunction();
        localStorage.setItem("keyboard", sco_keyboards);
        document.getElementById('keyboard-tips')?.classList.remove('show');
    },
    /**
     * initConsoleState
     * @description 初始化控制台状态
     */
    initConsoleState: () => document.documentElement.classList.contains("hide-aside") ? document.querySelector("#consoleHideAside").classList.add("on") : document.querySelector("#consoleHideAside").classList.remove("on"),
    /**
     * changeSayHelloText
     * @description 更改打招呼文本
     */
    changeSayHelloText: function () {
        const greetings = GLOBAL_CONFIG.aside.sayhello2;
        const greetingElement = document.getElementById("author-info__sayhi");
        let randomGreeting;
        do {
            randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        } while (randomGreeting === lastSayHello);
        greetingElement.textContent = randomGreeting;
        lastSayHello = randomGreeting;
    },
    /**
     * switchDarkMode
     * @description 切换显示模式
     */
    switchDarkMode: function () {
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const newMode = isDarkMode ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newMode);
        utils.saveToLocal.set('theme', newMode, 0.02);
        utils.snackbarShow(GLOBAL_CONFIG.lang.theme[newMode], false, 2000);
        if (is_rm) rm.mode(!isDarkMode);
        handleThemeChange(newMode);
    },
    /**
     * hideTodayCard
     * @description 隐藏今日卡片
     */
    hideTodayCard: () => document.getElementById('todayCard').classList.add('hide'),
    /**
     * toTop
     * @description 返回顶部
     */
    toTop: () => utils.scrollToDest(0),
    /**
     * showConsole
     * @description 显示控制台
     */
    showConsole: () => document.getElementById('console')?.classList.toggle('show', true),
    /**
     * hideConsole
     * @description 隐藏控制台
     */
    hideConsole: () => document.getElementById('console')?.classList.remove('show'),
    /**
     * refreshWaterFall
     * @description 刷新瀑布流
     */
    refreshWaterFall: function () {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        waterfall(entry.target) || entry.target.classList.add('show');
                    }, 300);
                }
            });
        });
        document.querySelectorAll('.waterfall').forEach(el => observer.observe(el));
    },
    /**
     * addRuntime
     * @description 添加运行时间
     */
    addRuntime: function () {
        let el = document.getElementById('runtimeshow')
        el && GLOBAL_CONFIG.runtime && (el.innerText = utils.timeDiff(new Date(GLOBAL_CONFIG.runtime), new Date()) + GLOBAL_CONFIG.lang.day)
    },
    /**
     * toTalk
     * @description 回复评论
     * @param txt
     */
    toTalk: function (txt) {
        const inputs = ["#wl-edit", ".el-textarea__inner", "#veditor", ".atk-textarea"];
        inputs.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.dispatchEvent(new Event('input', {bubble: true, cancelable: true}));
                el.value = '> ' + txt.replace(/\n/g, '\n> ') + '\n\n';
                utils.scrollToDest(utils.getEleTop(document.getElementById('post-comment')), 300);
                el.focus();
                el.setSelectionRange(-1, -1);
            }
        });
        utils.snackbarShow(GLOBAL_CONFIG.lang.totalk, false, 2000);
    },
    /**
     * initbbtalk
     * @description 初始化 bbtalk
     */
    initbbtalk: function () {
        const bberTalkElement = document.querySelector('#bber-talk');
        if (bberTalkElement) {
            new Swiper('.swiper-container', {
                direction: 'vertical',
                loop: true,
                autoplay: {
                    delay: 3000,
                    pauseOnMouseEnter: true
                },
            });
        }
    },
    /**
     * addPhotoFigcaption
     * @description 添加图片标题
     */
    addPhotoFigcaption: function () {
        document.querySelectorAll('#article-container img:not(.gallery-item img)').forEach(image => {
            const captionText = image.getAttribute('alt');
            captionText && image.insertAdjacentHTML('afterend', `<div class="img-alt is-center">${captionText}</div>`);
        });
    },
    /**
     * scrollToComment
     * @description 滚动到评论
     */
    scrollToComment: function () {
        utils.scrollToDest(utils.getEleTop(document.getElementById('post-comment')), 300)
    },
    /**
     * setTimeState
     * @description 设置时间状态
     */
    setTimeState: function () {
        const el = document.getElementById('author-info__sayhi');
        if (el) {
            const hours = new Date().getHours();
            const lang = GLOBAL_CONFIG.aside.sayhello;

            const localData = getLocalData(['twikoo', 'WALINE_USER_META', 'WALINE_USER', '_v_Cache_Meta', 'ArtalkUser']);

            function getLocalData(keys) {
                for (let key of keys) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        return JSON.parse(data);
                    }
                }
                return null;
            };
            const nick = localData ? (localData.nick ? localData.nick : localData.display_name) : null;

            let prefix;
            if (wasPageHidden) {
                prefix = GLOBAL_CONFIG.aside.sayhello3.back + nick;
                wasPageHidden = false;
            } else {
                prefix = GLOBAL_CONFIG.aside.sayhello3.prefix + nick;
            }

            const greetings = [
                {start: 0, end: 5, text: nick ? prefix : lang.goodnight},
                {start: 6, end: 10, text: nick ? prefix : lang.morning},
                {start: 11, end: 14, text: nick ? prefix : lang.noon},
                {start: 15, end: 18, text: nick ? prefix : lang.afternoon},
                {start: 19, end: 24, text: nick ? prefix : lang.night},
            ];
            const greeting = greetings.find(g => hours >= g.start && hours <= g.end);
            el.innerText = greeting.text;
        }
    },
    /**
     * tagPageActive
     * @description 标签页当前标签高亮
     */
    tagPageActive: function () {
        const decodedPath = decodeURIComponent(window.location.pathname);
        const isTagPage = /\/tags\/.*?\//.test(decodedPath);
        if (isTagPage) {
            const tag = decodedPath.split("/").slice(-2, -1)[0];
            const tagElement = document.getElementById(tag);
            if (tagElement) {
                document.querySelectorAll("a.select").forEach(link => {
                    link.classList.remove("select");
                });
                tagElement.classList.add("select");
            }
        }
    },
    /**
     * categoriesBarActive
     * @description 分类栏当前分类高亮
     */
    categoriesBarActive: function () {
        const categoryBar = document.querySelector("#category-bar");
        const currentPath = decodeURIComponent(window.location.pathname);
        const isHomePage = currentPath === "/";
        if (categoryBar) {
            const categoryItems = categoryBar.querySelectorAll(".category-bar-item");
            categoryItems.forEach(item => item.classList.remove("select"));
            const activeItemId = isHomePage ? "category-bar-home" : currentPath.split("/").slice(-2, -1)[0];
            const activeItem = document.getElementById(activeItemId);
            if (activeItem) {
                activeItem.classList.add("select");
            }
        }
    },
    /**
     * scrollCategoryBarToRight
     * @description 滚动分类栏到右侧
     */
    scrollCategoryBarToRight: function () {
        const scrollBar = document.getElementById("category-bar-items");
        const nextElement = document.getElementById("category-bar-next");
        if (scrollBar) {
            const isScrollBarAtEnd = () => scrollBar.scrollLeft + scrollBar.clientWidth >= scrollBar.scrollWidth - 8;
            const scroll = () => {
                if (isScrollBarAtEnd()) {
                    scrollBar.scroll({left: 0, behavior: "smooth"});
                } else {
                    scrollBar.scrollBy({left: scrollBar.clientWidth, behavior: "smooth"});
                }
            };
            scrollBar.addEventListener("scroll", () => {
                clearTimeout(this.timeoutId);
                this.timeoutId = setTimeout(() => {
                    nextElement.style.transform = isScrollBarAtEnd() ? "rotate(180deg)" : "";
                }, 150);
            });
            scroll();
        }
    },
    /**
     * openAllTags
     * @description 展开所有标签
     */
    openAllTags: () => {
        document.querySelectorAll(".card-allinfo .card-tag-cloud").forEach(tagCloudElement => tagCloudElement.classList.add("all-tags"));
        document.getElementById("more-tags-btn")?.remove();
    },
    /**
     * listenToPageInputPress
     * @description 监听页码输入
     */
    listenToPageInputPress: function () {
        const toGroup = document.querySelector(".toPageGroup")
        const pageText = document.getElementById("toPageText");
        if (!pageText) return;
        const pageButton = document.getElementById("toPageButton");
        const pageNumbers = document.querySelectorAll(".page-number");
        const lastPageNumber = +pageNumbers[pageNumbers.length - 1].textContent;
        if (!pageText || lastPageNumber === 1) {
            toGroup.style.display = "none";
            return
        }
        pageText.addEventListener("keydown", (event) => {
            if (event.keyCode === 13) {
                sco.toPage();
                pjax.loadUrl(pageButton.href);
            }
        });
        pageText.addEventListener("input", () => {
            pageButton.classList.toggle("haveValue", pageText.value !== "" && pageText.value !== "0");
            if (+pageText.value > lastPageNumber) {
                pageText.value = lastPageNumber;
            }
        });
    },
    /**
     * addNavBackgroundInit
     * @description 添加导航背景初始化
     */
    addNavBackgroundInit: function () {
        const scrollTop = document.documentElement.scrollTop;
        (scrollTop !== 0) && document.getElementById("page-header").classList.add("nav-fixed", "nav-visible");
    },
    /**
     * toPage
     * @description 跳转到指定页
     */
    toPage: function () {
        const pageNumbers = document.querySelectorAll(".page-number");
        const maxPageNumber = parseInt(pageNumbers[pageNumbers.length - 1].innerHTML);
        const inputElement = document.getElementById("toPageText");
        const inputPageNumber = parseInt(inputElement.value);
        document.getElementById("toPageButton").href = (!isNaN(inputPageNumber) && inputPageNumber <= maxPageNumber && inputPageNumber > 1)
            ? window.location.href.replace(/\/page\/\d+\/$/, "/") + "page/" + inputPageNumber + "/"
            : '/';
    },
    /**
     * owobig
     * @description owo 大图
     * @param owoSelector
     */
    owoBig(owoSelector) {
        let owoBig = document.getElementById('owo-big');
        if (!owoBig) {
            owoBig = document.createElement('div');
            owoBig.id = 'owo-big';
            document.body.appendChild(owoBig);
        }
        const showOwoBig = event => {
            const target = event.target;
            const owoItem = target.closest(owoSelector.item);
            if (owoItem && target.closest(owoSelector.body)) {
                const imgSrc = owoItem.querySelector('img')?.src;
                if (imgSrc) {
                    owoBig.innerHTML = `<img src="${imgSrc}" style="max-width: 100%; height: auto;">`;
                    owoBig.style.display = 'block';
                    positionOwoBig(owoItem);
                }
            }
        };
        const hideOwoBig = event => {
            if (event.target.closest(owoSelector.item) && event.target.closest(owoSelector.body)) {
                owoBig.style.display = 'none';
            }
        };
        const positionOwoBig = owoItem => {
            const itemRect = owoItem.getBoundingClientRect();
            owoBig.style.left = `${itemRect.left - (owoBig.offsetWidth / 4)}px`;
            owoBig.style.top = `${itemRect.top}px`;
        }
        document.addEventListener('mouseover', showOwoBig);
        document.addEventListener('mouseout', hideOwoBig);
    },
    /**
     * changeTimeFormat
     * @description 更改时间格式
     * @param selector
     */
    changeTimeFormat(selector) {
        selector.forEach(item => {
            const timeVal = item.getAttribute('datetime')
            item.textContent = utils.diffDate(timeVal, true)
            item.style.display = 'inline'
        })
    },
    /**
     * switchComments
     * @description 切换评论
     */
    switchComments() {
        const switchBtn = document.getElementById('switch-btn')
        if (!switchBtn) return
        let switchDone = false
        const commentContainer = document.getElementById('post-comment')
        const handleSwitchBtn = () => {
            commentContainer.classList.toggle('move')
            if (!switchDone && typeof loadTwoComment === 'function') {
                switchDone = true
                loadTwoComment()
            }
        }
        utils.addEventListenerPjax(switchBtn, 'click', handleSwitchBtn)
    }
}

/**
 * addHighlight
 * @description 添加代码高亮
 */
const addHighlight = () => {
    const highlight = GLOBAL_CONFIG.highlight;
    if (!highlight) return;
    const {copy, expand, limit, syntax} = highlight;
    const $isPrismjs = syntax === 'prismjs';
    const $isShowTool = highlight.enable || copy || expand || limit;
    const expandClass = !expand === true ? 'closed' : ''
    const $syntaxHighlight = syntax === 'highlight.js' ? document.querySelectorAll('figure.highlight') : document.querySelectorAll('pre[class*="language-"]')
    if (!(($isShowTool || limit) && $syntaxHighlight.length)) return
    const copyEle = copy ? `<i class="solitude st-copy-fill copy-button"></i>` : '<i></i>';
    const expandEle = `<i class="solitude st-arrow-down expand"></i>`;
    const limitEle = limit ? `<i class="solitude st-show-line"></i>` : '<i></i>';
    const alertInfo = (ele, text) => utils.snackbarShow(text, false, 2000)
    const copyFn = (e) => {
        const $buttonParent = e.parentNode
        $buttonParent.classList.add('copy-true')
        const selection = window.getSelection()
        const range = document.createRange()
        const preCodeSelector = $isPrismjs ? 'pre code' : 'table .code pre'
        range.selectNodeContents($buttonParent.querySelectorAll(`${preCodeSelector}`)[0])
        selection.removeAllRanges()
        selection.addRange(range)
        document.execCommand('copy')
        alertInfo(e.lastChild, GLOBAL_CONFIG.lang.copy.success)
        selection.removeAllRanges()
        $buttonParent.classList.remove('copy-true')
    }
    const expandClose = (e) => e.classList.toggle('closed')
    const shrinkEle = function () {
        this.classList.toggle('expand-done')
    }
    const ToolsFn = function (e) {
        const $target = e.target.classList
        if ($target.contains('expand')) expandClose(this)
        else if ($target.contains('copy-button')) copyFn(this)
    }
    const createEle = (lang, item, service) => {
        const fragment = document.createDocumentFragment()
        if ($isShowTool) {
            const hlTools = document.createElement('div')
            hlTools.className = `highlight-tools ${expandClass}`
            hlTools.innerHTML = expandEle + lang + copyEle
            utils.addEventListenerPjax(hlTools, 'click', ToolsFn)
            fragment.appendChild(hlTools)
        }
        if (limit && item.offsetHeight > limit + 30) {
            const ele = document.createElement('div')
            ele.className = 'code-expand-btn'
            ele.innerHTML = limitEle
            utils.addEventListenerPjax(ele, 'click', shrinkEle)
            fragment.appendChild(ele)
        }
        if (service === 'hl') {
            item.insertBefore(fragment, item.firstChild)
        } else {
            item.parentNode.insertBefore(fragment, item)
        }
    }
    if ($isPrismjs) {
        $syntaxHighlight.forEach(item => {
            const langName = item.getAttribute('data-language') || 'Code'
            const highlightLangEle = `<div class="code-lang">${langName}</div>`
            utils.wrap(item, 'figure', {
                class: 'highlight'
            })
            createEle(highlightLangEle, item)
        })
    } else {
        $syntaxHighlight.forEach(item => {
            let langName = item.getAttribute('class').split(' ')[1]
            if (langName === 'plain' || langName === undefined) langName = 'Code'
            const highlightLangEle = `<div class="code-lang">${langName}</div>`
            createEle(highlightLangEle, item, 'hl')
        })
    }
}

/**
 * toc
 * @description 目录
 */
class toc {
    static init() {
        const tocContainer = document.getElementById('card-toc')
        if (!tocContainer || !tocContainer.querySelector('.toc a')) {
            tocContainer.style.display = 'none'
            return
        }
        const el = document.querySelectorAll('.toc a')
        el.forEach((e) => {
            e.addEventListener('click', (event) => {
                event.preventDefault()
                utils.scrollToDest(utils.getEleTop(document.getElementById(decodeURI((event.target.className === 'toc-text' ? event.target.parentNode.hash : event.target.hash).replace('#', '')))), 300)
            })
        })
        this.active(el)
    }

    static active(toc) {
        const $article = document.getElementById('article-container')
        const $tocContent = document.getElementById('toc-content')
        const list = $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
        let detectItem = ''

        function autoScroll(el) {
            const activePosition = el.getBoundingClientRect().top
            const sidebarScrollTop = $tocContent.scrollTop
            if (activePosition > (document.documentElement.clientHeight - 100)) {
                $tocContent.scrollTop = sidebarScrollTop + 150
            }
            if (activePosition < 100) {
                $tocContent.scrollTop = sidebarScrollTop - 150
            }
        }

        function findHeadPosition(top) {
            if (top === 0) return false
            let currentIndex = ''
            list.forEach(function (ele, index) {
                if (top > utils.getEleTop(ele) - 80) {
                    currentIndex = index
                }
            })
            if (detectItem === currentIndex) return
            detectItem = currentIndex
            document.querySelectorAll('.toc .active').forEach((i) => {
                i.classList.remove('active')
            })
            const activeitem = toc[detectItem]
            if (activeitem) {
                let parent = toc[detectItem].parentNode
                activeitem.classList.add('active')
                autoScroll(activeitem)
                for (; !parent.matches('.toc'); parent = parent.parentNode) {
                    if (parent.matches('li')) parent.classList.add('active')
                }
            }
        }

        window.tocScrollFn = utils.throttle(function () {
            const currentTop = window.scrollY || document.documentElement.scrollTop
            findHeadPosition(currentTop)
        }, 100)
        window.addEventListener('scroll', tocScrollFn)
    }
}

/**
 * tabs
 * @description 外挂标签tabs
 */
class tabs {
    static init() {
        this.clickFnOfTabs()
        this.backToTop()
    }

    static clickFnOfTabs() {
        document.querySelectorAll('#article-container .tab > button').forEach(function (item) {
            item.addEventListener('click', function (e) {
                const that = this
                const $tabItem = that.parentNode
                if (!$tabItem.classList.contains('active')) {
                    const $tabContent = $tabItem.parentNode.nextElementSibling
                    const $siblings = utils.siblings($tabItem, '.active')[0]
                    $siblings && $siblings.classList.remove('active')
                    $tabItem.classList.add('active')
                    const tabId = that.getAttribute('data-href').replace('#', '')
                    const childList = [...$tabContent.children]
                    childList.forEach(item => {
                        if (item.id === tabId) item.classList.add('active')
                        else item.classList.remove('active')
                    })
                }
            })
        })
    }

    static backToTop() {
        document.querySelectorAll('#article-container .tabs .tab-to-top').forEach(function (item) {
            item.addEventListener('click', function () {
                utils.scrollToDest(utils.getEleTop(item.parentElement.parentElement.parentNode), 300)

            })
        })
    }
}
// 页面刷新
window.refreshFn = () => {
    const {is_home, is_page, page, is_post} = PAGE_CONFIG;
    const {runtime, lazyload, lightbox, randomlink, covercolor, post_ai} = GLOBAL_CONFIG;
    const timeSelector = (is_home ? '.post-meta-date time' : is_post ? '.post-meta-date time' : '.datatime') + ', .webinfo-item time';
    document.body.setAttribute('data-type', page);
    sco.changeTimeFormat(document.querySelectorAll(timeSelector));
    runtime && sco.addRuntime();
    [scrollFn, sidebarFn, sco.hideCookie, sco.addPhotoFigcaption, sco.setTimeState, sco.tagPageActive, sco.categoriesBarActive, sco.listenToPageInputPress, sco.addNavBackgroundInit, sco.refreshWaterFall].forEach(fn => fn());
    lazyload.enable && utils.lazyloadImg();
    lightbox && utils.lightbox(document.querySelectorAll("#article-container img:not(.flink-avatar,.gallery-group img)"));
    randomlink && randomLinksList();
    post_ai && is_post && efu_ai.init();
    sco.switchComments();
    initObserver();
    if (is_home) showTodayCard();
    if (is_post || is_page) {
        addHighlight();
        tabs.init();
    }
    if (covercolor.enable) coverColor();
    if (PAGE_CONFIG.toc) toc.init();
}
// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    [addCopyright, sco.initConsoleState, window.refreshFn, asideStatus, () => window.onscroll = percent].forEach(fn => fn());
});
// 监听切换标签页
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        wasPageHidden = true;
    }
});
// 一些快捷键绑定
window.onkeydown = e => {
    const {keyCode, ctrlKey, shiftKey} = e;
    if (keyCode === 123 || (ctrlKey && shiftKey && keyCode === 67)) utils.snackbarShow(GLOBAL_CONFIG.lang.f12, false, 3000);
    if (keyCode === 27) sco.hideConsole();
};
// 复制成功提示
document.addEventListener('copy', () => utils.snackbarShow(GLOBAL_CONFIG.lang.copy.success, false, 3000));