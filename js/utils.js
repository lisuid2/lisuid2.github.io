(() => {
    const utilsFn = {
        throttle: (func, wait, {leading = true, trailing = true} = {}) => {
            let timeout, previous = 0;
            const later = (context, args) => {
                timeout = previous = leading === false ? 0 : Date.now();
                func.apply(context, args);
            };
            return function () {
                const now = Date.now();
                if (!previous && leading === false) previous = now;
                const remaining = wait - (now - previous);
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    later(this, arguments);
                } else if (!timeout && trailing !== false) {
                    timeout = setTimeout(() => later(this, arguments), remaining);
                }
            };
        },
        fadeIn: (ele, time) => ele.style.cssText = `display:block;animation: to_show ${time}s`,
        fadeOut: (ele, time) => {
            const resetStyles = () => {
                ele.style.cssText = "display: none; animation: '' ";
                ele.removeEventListener('animationend', resetStyles);
            };
            ele.addEventListener('animationend', resetStyles);
            ele.style.animation = `to_hide ${time}s`;
        },
        sidebarPaddingR: () => {
            const paddingRight = window.innerWidth - document.body.clientWidth;
            if (paddingRight > 0) {
                document.body.style.paddingRight = `${paddingRight}px`;
            }
        },
        snackbarShow: (text, showAction = false, duration = 5000) => {
            document.styleSheets[0].addRule(':root', `--efu-snackbar-time:${duration}ms!important`);
            Snackbar.show({
                text,
                showAction,
                duration,
                pos: 'top-center'
            });
        },
        copy: async (text) => {
            const message = await navigator.clipboard.writeText(text)
                .then(() => GLOBAL_CONFIG.lang.copy.success)
                .catch(() => GLOBAL_CONFIG.lang.copy.error);
            utils.snackbarShow(message, false, 2000);
        },
        getEleTop: ele => {
            let actualTop = ele.offsetTop;
            while (ele.offsetParent) {
                ele = ele.offsetParent;
                actualTop += ele.offsetTop;
            }
            return actualTop;
        },
        siblings: (ele, selector) => {
            return [...ele.parentNode.children].filter((child) => {
                if (selector) {
                    return child !== ele && child.matches(selector)
                }
                return child !== ele
            })
        },
        randomNum: (length) => {
            return Math.floor(Math.random() * length)
        },
        timeDiff: (timeObj, today) => {
            const timeDiff = today.getTime() - timeObj.getTime();
            return Math.floor(timeDiff / (1000 * 3600 * 24));
        },
        scrollToDest: (pos, time = 500) => {
            const currentPos = window.pageYOffset;
            const isNavFixed = document.getElementById('page-header').classList.contains('nav-fixed');
            pos = currentPos > pos || isNavFixed ? pos - 70 : pos;

            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({top: pos, behavior: 'smooth'});
                return;
            }

            const distance = pos - currentPos;
            const step = currentTime => {
                const start = start || currentTime;
                const progress = currentTime - start;

                if (progress < time) {
                    window.scrollTo(0, currentPos + distance * progress / time);
                    window.requestAnimationFrame(step);
                } else {
                    window.scrollTo(0, pos);
                }
            };

            window.requestAnimationFrame(step);
        },
        isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isHidden: e => 0 === e.offsetHeight && 0 === e.offsetWidth,
        addEventListenerPjax: (ele, event, fn, option = false) => {
            ele.addEventListener(event, fn, option)
            utils.addGlobalFn('pjax', () => {
                ele.removeEventListener(event, fn, option)
            })
        },
        animateIn: (ele, text) => {
            Object.assign(ele.style, {display: 'block', animation: text});
        },
        animateOut: (ele, text) => {
            const resetAnimation = () => {
                ele.style.display = '';
                ele.style.animation = '';
                ele.removeEventListener('animationend', resetAnimation);
            };
            ele.addEventListener('animationend', resetAnimation);
            ele.style.animation = text;
        },
        wrap: (selector, eleType, options) => {
            const createEle = document.createElement(eleType)
            for (const [key, value] of Object.entries(options)) {
                createEle.setAttribute(key, value)
            }
            selector.parentNode.insertBefore(createEle, selector)
            createEle.appendChild(selector)
        },
        lazyloadImg: () => {
            window.lazyLoadInstance = new LazyLoad({
                elements_selector: 'img',
                threshold: 0,
                data_src: 'lazy-src',
                callback_error: img => img.src = GLOBAL_CONFIG.lazyload.error
            });
        },
        lightbox: function (selector) {
            const lightboxType = GLOBAL_CONFIG.lightbox;
            const options = {
                class: 'fancybox',
                'data-fancybox': 'gallery',
            };

            if (lightboxType === 'mediumZoom') {
                mediumZoom && mediumZoom(selector, {background: "var(--efu-card-bg)"});
            } else if (lightboxType === 'fancybox') {
                selector.forEach(i => {
                    if (i.parentNode.tagName !== 'A') {
                        options.href = options['data-thumb'] = i.dataset.lazySrc || i.src;
                        options['data-caption'] = i.title || i.alt || '';
                        utils.wrap(i, 'a', options);
                    }
                });

                if (!window.fancyboxRun) {
                    Fancybox.bind('[data-fancybox]', {
                        Hash: false,
                        animated: true,
                        Thumbs: {showOnStart: false},
                        Images: {Panzoom: {maxScale: 4}},
                        Carousel: {transition: 'slide'},
                        Toolbar: {
                            display: {
                                left: ['infobar'],
                                middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW', 'flipX', 'flipY'],
                                right: ['slideshow', 'thumbs', 'close']
                            }
                        },
                    });
                    window.fancyboxRun = true;
                }
            }
        },
        diffDate: (d, more = false) => {
            const dateNow = new Date();
            const datePost = new Date(d);
            const dateDiff = dateNow - datePost;
            const minute = 60000;
            const hour = 3600000;
            const day = 86400000;
            const month = 2592000000;
            const {time} = GLOBAL_CONFIG.lang;
            const dayCount = Math.floor(dateDiff / day)
            if (!more) return dayCount
            const minuteCount = Math.floor(dateDiff / minute)
            const hourCount = Math.floor(dateDiff / hour)
            const monthCount = Math.floor(dateDiff / month)
            if (monthCount > 12) return datePost.toISOString().slice(0, 10)
            if (monthCount >= 1) return `${monthCount} ${time.month}`
            if (dayCount >= 1) return `${dayCount} ${time.day}`
            if (hourCount >= 1) return `${hourCount} ${time.hour}`
            if (minuteCount >= 1) return `${minuteCount} ${time.min}`
            return time.just
        },
        loadComment: (dom, callback) => {
            const observerItem = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    callback();
                    observerItem.disconnect();
                }
            }, {threshold: [0]}) : null;

            observerItem ? observerItem.observe(dom) : callback();
        },
    }
    window.utils = {...window.utils, ...utilsFn};
})()