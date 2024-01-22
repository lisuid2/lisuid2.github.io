document.addEventListener('DOMContentLoaded', () => {
    if (!navigator.serviceWorker?.controller) return
    /** 发送信息到 sw */
    const postMessage2SW = type => navigator.serviceWorker.controller.postMessage(type)
    const pjaxUpdate = url => {
        const type = url.endsWith('js') ? 'script' : 'link'
        const name = type === 'link' ? 'href' : 'src'
        for (let item of document.getElementsByTagName(type)) {
            const itUrl = item[name]
            if (url.length > itUrl ? url.endsWith(itUrl) : itUrl.endsWith(url)) {
                const newEle = document.createElement(type)
                const content = item.text || item.textContent || item.innerHTML || ''
                // noinspection JSUnresolvedReference
                Array.from(item.attributes).forEach(attr => newEle.setAttribute(attr.name, attr.value))
                newEle.appendChild(document.createTextNode(content))
                item.parentNode.replaceChildren(newEle, item)
                return true
            }
        }
    }
    const SESSION_KEY = 'updated'
    // noinspection JSFileReferences
    const onSuccess = () => {
            caches.match(location.href).then(res => {
                if (res)
                    res.json().then(json => {
                        utils && utils.snackbarShow(`已刷新缓存，更新为${json.global + '.' + json.local}版本最新内容`, false, 2000)
                    })
                else
                    console.info('未找到缓存')
            }).catch((error) => console.error("缓存匹配出错", error))
        };
    if (sessionStorage.getItem(SESSION_KEY)) {
        onSuccess()
        sessionStorage.removeItem(SESSION_KEY)
    } else postMessage2SW('update')
    navigator.serviceWorker.addEventListener('message', event => {
        const data = event.data
        sessionStorage.setItem(SESSION_KEY, data.type)
        const list = data.list?.filter(url => /\.(js|css)$/.test(url))
        if (list) {
            // noinspection JSUnresolvedReference
            if (window.Pjax?.isSupported?.())
                list.forEach(pjaxUpdate)
            location.reload()
        } else {
            const newVersion = data.new, oldVersion = data.old
            if (oldVersion && (newVersion.global !== oldVersion.global || newVersion.local !== oldVersion.local)) {
                onSuccess()
            }
            sessionStorage.removeItem(SESSION_KEY)
        }
    })
})