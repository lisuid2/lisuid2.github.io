if(!self.define){let e,i={};const a=(a,r)=>(a=new URL(a+".js",r).href,i[a]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=i,document.head.appendChild(e)}else e=a,importScripts(a),i()})).then((()=>{let e=i[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(r,s)=>{const d=e||("document"in self?document.currentScript.src:"")||location.href;if(i[d])return;let c={};const f=e=>a(e,d),l={module:{uri:d},exports:c,require:f};i[d]=Promise.all(r.map((e=>l[e]||f(e)))).then((e=>(s(...e),c)))}}define(["./workbox-b41f8fb8"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"404.html",revision:"92699da3466c1b59fd617696426f5e16"},{url:"about/index.html",revision:"92a731019fef7c78af41c19c076cebec"},{url:"archives/2023/11/index.html",revision:"e663431f879f19e54678d588f7b38e4b"},{url:"archives/2023/index.html",revision:"badd97416789e0808f010546f5873a0e"},{url:"archives/2024/01/index.html",revision:"bd1fdce5ac1f9f188fd2e10afd3e3fd1"},{url:"archives/2024/03/index.html",revision:"67325f079a70ede2a6a858c88dfab893"},{url:"archives/2024/index.html",revision:"d6dffd17a7ca7066294c7e561c2e01c5"},{url:"archives/index.html",revision:"06a379ed1df0e829b5a0b74d21e0a930"},{url:"archives/page/2/index.html",revision:"7606ca03f2a7b77069609d88d9653674"},{url:"categories/AI/index.html",revision:"8209506806e8e9fac3664f199c7e2ab9"},{url:"categories/chatgpt/index.html",revision:"f3de7dc594fa6b709b65518028edf1ca"},{url:"categories/Hexo/index.html",revision:"79cf2779667eb27db026461e6ddd16e3"},{url:"categories/index.html",revision:"d2028f3cb35a6daea2c679a29a4fc4d5"},{url:"categories/Solitude/index.html",revision:"92445e69a1351712d3983df751869048"},{url:"categories/教程/Butterfly/index.html",revision:"abf0807b14835ef3fd7d32ccbf1b0741"},{url:"categories/教程/CDN/index.html",revision:"5cb74fc798178d3604c4d9d8f70fc293"},{url:"categories/教程/index.html",revision:"0763940a6ca60b124aaf6bfb14effca2"},{url:"categories/教程/雷池/index.html",revision:"d01a858bc0066d49bee2613b88005642"},{url:"categories/知识/index.html",revision:"3efae7434a4e6489533cf70daf4a418c"},{url:"css/icat.css",revision:"fc4312322ec61b2aa45f4ce5adeea5c4"},{url:"css/index.css",revision:"821d3b196f6354d6aa7a88a88a2464ac"},{url:"css/third_party/snackbar.min.css",revision:"756090fef6b7c4101a701fd715f1ab6c"},{url:"css/third_party/tianli_talk.css",revision:"fcd9ea759a516f5f61f9a2b68ecc6941"},{url:"css/var.css",revision:"d41d8cd98f00b204e9800998ecf8427e"},{url:"equipment/index.html",revision:"653dfaea03682a94da4052d287bdb651"},{url:"essay/index.html",revision:"97ea96233d905fc792759086a7cf5407"},{url:"img/flower.gif",revision:"ebb0a5f1ab03a91eeed6ef49a4f9e453"},{url:"index.html",revision:"a77169e7786d19dffa956a236e13e6ae"},{url:"js/covercolor/api.js",revision:"28801170f62f53630cc1cf4a6ac8d032"},{url:"js/covercolor/local.js",revision:"31efebe9625e31c99ed531da08a45e15"},{url:"js/main.js",revision:"f4841b20a22812977c273dd258dfb052"},{url:"js/music.js",revision:"58dd183c0190e278aa69d8af26f37ae9"},{url:"js/right_menu.js",revision:"d1a559420a40643350819991e6906636"},{url:"js/search/algolia.js",revision:"3610c7d06243fc2fcc87d4703caf4ae3"},{url:"js/search/local.js",revision:"8ff6bd663eb297f0abc6d1998c99a728"},{url:"js/third_party/barrage.min.js",revision:"7410c2ac3b56c71658fb91bb0e9a937f"},{url:"js/third_party/efu_ai.min.js",revision:"5dbcc0ccdf5d5a4a92085833942952d8"},{url:"js/third_party/envelope.min.js",revision:"7b7383571864e68026fea62696885c9d"},{url:"js/third_party/universe.min.js",revision:"cf70b00dcbc9a07efe1aee979119df15"},{url:"js/third_party/waterfall.min.js",revision:"aeba43213701fb1a09e15eb4ae8bce03"},{url:"js/tw_cn.js",revision:"ece43815eda19248781bb4211a9de232"},{url:"js/utils.js",revision:"22d64d62238de7f2d59be01dc185ead4"},{url:"links/index.html",revision:"d66c70e61976b30cac156481cab373e4"},{url:"music/index.html",revision:"6d90b50dddec4ae7265fb3e360108bc2"},{url:"page/2/index.html",revision:"c213e60604bf66751f195cb44c62f882"},{url:"posts/286470e0.html",revision:"22258e7d73e190ba05084fd1f16ce3e9"},{url:"posts/348c00e5.html",revision:"e5fe337f0aba329823ea58633a6e136c"},{url:"posts/381da2ef.html",revision:"30c4977aa22e127217c98004b28e81e1"},{url:"posts/5abaf631.html",revision:"e2c8bd61d0bb97d682334746245731f1"},{url:"posts/67e36e3e.html",revision:"55bc09e86a4a47f85ec12cb76dc39e60"},{url:"posts/83fe067a.html",revision:"2584548192cd8a6d3dc250ba7d17d69d"},{url:"posts/870b86a3.html",revision:"298f560153bf992940286af0822f6f15"},{url:"posts/aa9c54d4.html",revision:"8556bf11f8afb8d263257bf69001aac4"},{url:"posts/af19e490.html",revision:"2cc30692b526323facab7f0e181b7c11"},{url:"posts/e29ba27e.html",revision:"d4e9a1becc775e7266ac07e5b58daebe"},{url:"posts/efe4d5b4.html",revision:"1df62534711db0629fe73a8b7913405c"},{url:"tags/Apple/index.html",revision:"5a8d1c935ba84fa60f9548360fe016fe"},{url:"tags/Butterfly/index.html",revision:"49015cc3e86c3f7b811707720a7eef80"},{url:"tags/CDN/index.html",revision:"b8403b96f6414f5ffad0380571e122c7"},{url:"tags/chatgpt/index.html",revision:"1c0d813b015905706c71625a3bb1c750"},{url:"tags/Hexo/index.html",revision:"8f4efddb47bf10daa64da71660d9ba9b"},{url:"tags/index.html",revision:"a829d5cddd3b11307ff61711741b04ee"},{url:"tags/教程/index.html",revision:"f83a75b2d6faa8785526f9d19b217e28"},{url:"tags/知识/index.html",revision:"878ddc05652960523bb5f7de1400b2fa"},{url:"tags/苹果/index.html",revision:"a46bd1b3ab84565e351f06138ba02e35"},{url:"tags/雷池/index.html",revision:"13cee2bab5f5a4422453be038ffc3250"},{url:"tlink/index.html",revision:"d4db8731c404fdae3316182ae702dcae"}],{})}));