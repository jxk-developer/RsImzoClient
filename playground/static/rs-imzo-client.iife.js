var RsImzo=function(l){"use strict";var u=Object.defineProperty;var v=(l,d,f)=>d in l?u(l,d,{enumerable:!0,configurable:!0,writable:!0,value:f}):l[d]=f;var h=(l,d,f)=>(v(l,typeof d!="symbol"?d+"":d,f),f);class d{constructor(){h(this,"_events",{})}get events(){return this._events}on(o,e,t){const r={listener:e,once:!!(t!=null&&t.once)};this._events[o]||(this._events[o]=[]),this._events[o].push(r)}async emit(o,e){const t=this._events[o];if(!t)return;const r=[...t];for(const{listener:i,once:s}of r)try{await Promise.resolve(i(e))}catch(n){console.error(`Error in listener for event '${String(o)}':`,n)}finally{s&&this.off(o,i)}}off(o,e){const t=this._events[o];if(!t)return;const r=t.findIndex(i=>i.listener===e);r!==-1&&t.splice(r,1)}}class f extends d{constructor(e){super();h(this,"providerIframe",null);h(this,"iframeProviderId","rs-imzo-provider-iframe");h(this,"targetOrigin","http://localhost:3030");h(this,"providerPath","/provider");h(this,"signPath",`${this.providerPath}/sign`);h(this,"locale","en");this.locale=(e==null?void 0:e.locale)||this.locale,typeof window<"u"&&this.init()}init(){if(!window)return console.error("RsImzoClient: window is not available");document.readyState==="complete"?this.appendProviderIframe():window.addEventListener("load",this.appendProviderIframe.bind(this),{once:!0})}async appendProviderIframe(){const e=document.getElementById(this.iframeProviderId);e?this.providerIframe=e:(this.providerIframe=document.createElement("iframe"),this.providerIframe.id=this.iframeProviderId,this.providerIframe.src=this.buildUrl(this.providerPath),this.providerIframe.style.display="none",document.body.appendChild(this.providerIframe)),await this.checkWindowLoadedViaHandshake(this.providerIframe.contentWindow)&&await this.emit("ready")}async callMethod({method:e,data:t,targetWindow:r}){return typeof window>"u"||!r?(console.error("callMethod: Environment or target window not available."),{data:null,error:null}):new Promise((i,s)=>{try{const n=new MessageChannel;n.port1.onmessage=c=>{c.data||(console.log("callMethod: event.data is not available"),s({data:null,error:null})),i(c.data)},r.postMessage({method:e,data:t},this.targetOrigin,[n.port2])}catch(n){console.error("callMethod error: ",n),s({data:null,error:null})}})}async getSignatures(){var e;return this.callMethod({method:"signature_list",targetWindow:(e=this.providerIframe)==null?void 0:e.contentWindow})}async parsePkcs7(e){var t;return this.callMethod({method:"parse_pkcs7",data:{pkcs12:e},targetWindow:(t=this.providerIframe)==null?void 0:t.contentWindow})}async sign(e,t,r){const i=await this.openWindow(this.buildUrl(this.signPath,r==null?void 0:r.locale),"RsSign",280,320),s=new Promise(w=>{const a=setInterval(()=>{i.closed&&(this.emit("sign_window_close"),clearInterval(a),w({data:null,error:null}))},500)}),n=this.callMethod({method:"sign",targetWindow:i,data:{serialNumber:e,content:t,attached:r==null?void 0:r.attached}}),c=await Promise.race([s,n]);return i.closed||i.close(),c}openWindow(e,t,r,i){const s=screen.width/2-r/2+window.screenLeft,n=screen.height*.2+window.screenTop;return new Promise(async(c,w)=>{try{const a=window.open(e,t,`
          width=${r},
          height=${i},
          top=${n},
          left=${s},
          scrollbars=no,
          resizable=no`);if(!a)return console.error("newWindow is not initialized"),w(new Error("newWindow is not initialized"));await this.checkWindowLoadedViaHandshake(a)&&(a.focus(),c(a))}catch(a){w(new Error(`openWindow err ${a}`))}})}checkWindowLoadedViaHandshake(e,t={}){const{retryDelay:r=200,timeout:i=1e4}=t,s=Math.floor(i/r);let n=0;return new Promise(c=>{const w=setInterval(async()=>{const{data:a}=await this.callMethod({method:"ready",targetWindow:e});a&&(clearInterval(w),c(a)),n>=s&&(clearInterval(w),c(!1)),n++},r)})}buildUrl(e,t){const r=t||this.locale;return`${this.targetOrigin}${r==="uz"?"":`/${r}`}${e}`}cleanup(){this.providerIframe&&this.providerIframe.parentElement&&(this.providerIframe.parentElement.removeChild(this.providerIframe),this.providerIframe=null)}}return l.Client=f,Object.defineProperty(l,Symbol.toStringTag,{value:"Module"}),l}({});
//# sourceMappingURL=rs-imzo-client.iife.js.map
