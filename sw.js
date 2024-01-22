// noinspection JSIgnoredPromiseFromCall

(() => {
    /** 缓存库名称 */
    const CACHE_NAME = 'SolitudeCache'
    /** 控制信息存储地址（必须以`/`结尾） */
    const CTRL_PATH = 'https://id.v3/'

    const ejectDomain = 'blog.lisui.top'


    /**
     * 读取本地版本号
     * @return {Promise<BrowserVersion|undefined>}
     */
    const readVersion = () => caches.match(CTRL_PATH).then(response => response?.json())
    /**
     * 写入版本号
     * @param version {BrowserVersion}
     * @return {Promise<void>}
     */
    const writeVersion = version => caches.open(CACHE_NAME)
        .then(cache => cache.put(CTRL_PATH, new Response(JSON.stringify(version))))

    self.addEventListener('install', () => {
        self.skipWaiting()
        const escape = 0
        if (escape) {
            readVersion().then(async oldVersion => {
                // noinspection JSIncompatibleTypesComparison
                if (oldVersion && oldVersion.escape !== escape) {
                    const list = await caches.open(CACHE_NAME)
                        .then(cache => cache.keys())
                        .then(keys => keys?.map(it => it.url))
                    await caches.delete(CACHE_NAME)
                    const info = await updateJson()
                    info.type = 'escape'
                    info.list = list
                    // noinspection JSUnresolvedReference
                    const clientList = await clients.matchAll()
                    clientList.forEach(client => client.postMessage(info))
                }
            })
        }
    })

    // sw 激活后立即对所有页面生效，而非等待刷新
    // noinspection JSUnresolvedReference
    self.addEventListener('activate', event => event.waitUntil(clients.claim()))

    // noinspection JSFileReferences
    let cacheRules = {
simple: {
clean: true,
search: false,
match: url => url.host === ejectDomain && ["/404.html"].includes(url.pathname)}
,
cdn: {
clean: true,
match: url => [
   "cdn.cbd.int",
   "lf26-cdn-tos.bytecdntp.com",
   "lf6-cdn-tos.bytecdntp.com",
   "lf3-cdn-tos.bytecdntp.com",
   "lf9-cdn-tos.bytecdntp.com",
   "cdn.staticfile.org",
   "npm.elemecdn.com",
   ].includes(url.host) && url.pathname.match(/\.(js|css|woff2|woff|ttf|cur)$/)}
}

let getSpareUrls = srcUrl => {
   if (srcUrl.startsWith("https://npm.elemecdn.com")) {
   return {
   timeout: 3000,
   list: [srcUrl, `https://fastly.jsdelivr.net/${new URL(srcUrl).pathname}`],
   };
   }
   }
let isCors = () => false
let isMemoryQueue = () => false
const fetchFile = (request, banCache, urls = null) => {
        if (!urls) {
            urls = getSpareUrls(request.url)
            if (!urls) return fetchWithCors(request, banCache)
        }
        const list = urls.list
        const controllers = new Array(list.length)
        // noinspection JSCheckFunctionSignatures
        const startFetch = index => fetchWithCors(
                new Request(list[index], request),
                banCache,
                {signal: (controllers[index] = new AbortController()).signal}
            ).then(response => checkResponse(response) ? {r: response, i: index} : Promise.reject())
        return new Promise((resolve, reject) => {
            let flag = true
            const startAll = () => {
                flag = false
                Promise.any([
                    first,
                    ...Array.from({
                        length: list.length - 1
                    }, (_, index) => index + 1).map(index => startFetch(index))
                ]).then(res => {
                    for (let i = 0; i !== list.length; ++i) {
                        if (i !== res.i)
                            controllers[i].abort()
                    }
                    resolve(res.r)
                }).catch(() => reject(`请求 ${request.url} 失败`))
            }
            const id = setTimeout(startAll, urls.timeout)
            const first = startFetch(0)
                .then(res => {
                    if (flag) {
                        clearTimeout(id)
                        resolve(res.r)
                    }
                }).catch(() => {
                    if (flag) {
                        clearTimeout(id)
                        startAll()
                    }
                    return Promise.reject()
                })
        })
    }

    // 检查请求是否成功
    // noinspection JSUnusedLocalSymbols
    const checkResponse = response => response.ok || [301, 302, 307, 308].includes(response.status)

    /**
     * 删除指定缓存
     * @param list 要删除的缓存列表
     * @return {Promise<string[]>} 删除的缓存的URL列表
     */
    const deleteCache = list => caches.open(CACHE_NAME).then(cache => cache.keys()
        .then(keys => Promise.all(
            keys.map(async it => {
                const url = it.url
                if (url !== CTRL_PATH && list.match(url)) {
                    // [debug delete]
                    // noinspection ES6MissingAwait,JSCheckFunctionSignatures
                    cache.delete(it)
                    return url
                }
                return null
            })
        )).then(list => list.filter(it => it))
    )

    /**
     * 缓存列表
     * @type {Map<string, function(any)[]>}
     */
    const cacheMap = new Map()

    self.addEventListener('fetch', event => {
        let request = event.request
        let url = new URL(request.url)
        // [blockRequest call]
        if (request.method !== 'GET' || !request.url.startsWith('http')) return
        // [modifyRequest call]
        // [skipRequest call]
        let cacheKey = url.hostname + url.pathname + url.search
        let cache
        if (isMemoryQueue(request)) {
            cache = cacheMap.get(cacheKey)
            if (cache) {
                return event.respondWith(
                    new Promise((resolve, reject) => {
                        cacheMap.get(cacheKey).push(arg => arg.body ? resolve(arg) : reject(arg))
                    })
                )
            }
            cacheMap.set(cacheKey, cache = [])
        }
        /** 处理拉取 */
        const handleFetch = promise => {
            event.respondWith(
                cache ? promise.then(response => {
                    for (let item of cache) {
                        item(response.clone())
                    }
                }).catch(err => {
                    for (let item of cache) {
                        item(err)
                    }
                }).then(() => {
                    cacheMap.delete(cacheKey)
                    return promise
                }) : promise
            )
        }
        const cacheRule = findCache(url)
        if (cacheRule) {
            let key = `https://${url.host}${url.pathname}`
            if (key.endsWith('/index.html')) key = key.substring(0, key.length - 10)
            if (cacheRule.search) key += url.search
            handleFetch(
                caches.match(key).then(
                    cache => cache ?? fetchFile(request, true)
                        .then(response => {
                            if (checkResponse(response)) {
                                const clone = response.clone()
                                caches.open(CACHE_NAME).then(it => it.put(key, clone))
                                // [debug put]
                            }
                            return response
                        })
                )
            )
        } else {
            const urls = getSpareUrls(request.url)
            if (urls) handleFetch(fetchFile(request, false, urls))
            // [modifyRequest else-if]
            else handleFetch(fetchWithCache(request).catch(err => new Response(err, {status: 499})))
        }
    })

    self.addEventListener('message', event => {
        // [debug message]
        if (event.data === 'update')
            updateJson().then(info => {
                info.type = 'update'
                event.source.postMessage(info)
            })
    })

    /**
     * 基础 fetch
     * @param request {Request|string}
     * @param banCache {boolean} 是否禁用缓存
     * @param cors {boolean} 是否启用 cors
     * @param optional {RequestInit?} 额外的配置项
     * @return {Promise<Response>}
     */
    const baseFetcher = (request, banCache, cors, optional) => {
        if (!optional) optional = {}
        optional.cache = banCache ? 'no-store' : 'default'
        if (cors) {
            optional.mode = 'cors'
            optional.credentials = 'same-origin'
        }
        return fetch(request, optional)
    }

    /**
     * 添加 cors 配置请求指定资源
     * @param request {Request}
     * @param optional {RequestInit?} 额外的配置项
     * @return {Promise<Response>}
     */
    const fetchWithCache = (request, optional) =>
        baseFetcher(request, false, isCors(request), optional)

    // noinspection JSUnusedLocalSymbols
    /**
     * 添加 cors 配置请求指定资源
     * @param request {Request}
     * @param banCache {boolean} 是否禁用 HTTP 缓存
     * @param optional {RequestInit?} 额外的配置项
     * @return {Promise<Response>}
     */
    const fetchWithCors = (request, banCache, optional) =>
        baseFetcher(request, banCache, true, optional)

    /**
     * 判断指定 url 击中了哪一种缓存，都没有击中则返回 null
     * @param url {URL}
     */
    const findCache = url => {
        if (url.hostname === 'localhost') return
        for (let key in cacheRules) {
            const value = cacheRules[key]
            if (value.match(url)) return value
        }
    }

    /**
     * 根据JSON删除缓存
     * @returns {Promise<UpdateInfo>}
     */
    const updateJson = async () => {
        /**
         * 解析elements，并把结果输出到list中
         * @return boolean 是否刷新全站缓存
         */
        const parseChange = (list, elements, ver) => {
            for (let element of elements) {
                const {version, change} = element
                if (version === ver) return false
                if (change) {
                    for (let it of change)
                        list.push(new CacheChangeExpression(it))
                }
            }
            // 跨版本幅度过大，直接清理全站
            return true
        }
        /**
         * 解析字符串
         * @return {Promise<{
         *     list?: VersionList,
         *     new: BrowserVersion,
         *     old: BrowserVersion
         * }>}
         */
        const parseJson = json => readVersion().then(oldVersion => {
            const {info, global} = json
            /** @type {BrowserVersion} */
            const newVersion = {global, local: info[0].version, escape: oldVersion?.escape ?? 0}
            // 新用户和刚进行过逃逸操作的用户不进行更新操作
            if (!oldVersion) {
                // noinspection JSValidateTypes
                newVersion.escape = 0
                writeVersion(newVersion)
                return {new: newVersion, old: oldVersion}
            }
            let list = new VersionList()
            let refresh = parseChange(list, info, oldVersion.local)
            writeVersion(newVersion)
            // [debug escape]
            // 如果需要清理全站
            if (refresh) {
                if (global !== oldVersion.global) list.force = true
                else list.refresh = true
            }
            return {list, new: newVersion, old: oldVersion}
        })
        const response = await fetchFile(new Request('/update.json'), false)
        if (!checkResponse(response))
            throw `加载 update.json 时遇到异常，状态码：${response.status}`
        const json = await response.json()
        const result = await parseJson(json)
        if (result.list) {
            const list = await deleteCache(result.list)
            result.list = list?.length ? list : null
        }
        // noinspection JSValidateTypes
        return result
    }

    /**
     * 版本列表
     * @constructor
     */
    function VersionList() {

        const list = []

        /**
         * 推送一个表达式
         * @param element {CacheChangeExpression} 要推送的表达式
         */
        this.push = element => {
            list.push(element)
        }

        /**
         * 判断指定 URL 是否和某一条规则匹配
         * @param url {string} URL
         * @return {boolean}
         */
        this.match = url => {
            if (this.force) return true
            // noinspection JSValidateTypes
            url = new URL(url)
            if (this.refresh) {
                // noinspection JSCheckFunctionSignatures
                return findCache(url).clean
            }
            else {
                for (let it of list) {
                    if (it.match(url)) return true
                }
            }
            return false
        }

    }

    // noinspection SpellCheckingInspection
    /**
     * 缓存更新匹配规则表达式
     * @param json 格式{"flag": ..., "value": ...}
     * @see https://kmar.top/posts/bcfe8408/#23bb4130
     * @constructor
     */
    function CacheChangeExpression(json) {
        /**
         * 遍历所有value
         * @param action {function(string): boolean} 接受value并返回bool的函数
         * @return {boolean} 如果value只有一个则返回`action(value)`，否则返回所有运算的或运算（带短路）
         */
        const forEachValues = action => {
            const value = json.value
            if (Array.isArray(value)) {
                for (let it of value) {
                    if (action(it)) return true
                }
                return false
            } else return action(value)
        }
        const getMatch = () => {
            switch (json['flag']) {
                case 'html':
                    return url => url.pathname.match(/(\/|\.html)$/)
                case 'end':
                    return url => forEachValues(value => url.href.endsWith(value))
                case 'begin':
                    return url => forEachValues(value => url.pathname.startsWith(value))
                case 'str':
                    return url => forEachValues(value => url.href.includes(value))
                case 'reg':
                    // noinspection JSCheckFunctionSignatures
                    return url => forEachValues(value => url.href.match(new RegExp(value, 'i')))
                default: throw `未知表达式：${JSON.stringify(json)}`
            }
        }
        this.match = getMatch()
    }
})()