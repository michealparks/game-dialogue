function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function s(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function a(e){return e&&r(e.destroy)?e.destroy:t}function i(t,e){t.appendChild(e)}function l(t,e,n){t.insertBefore(e,n||null)}function u(t){t.parentNode.removeChild(t)}function c(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(){return d(" ")}function p(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function g(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function m(t,e){(null!=e||t.value)&&(t.value=e)}function h(t,e,n){t.classList[n?"add":"remove"](e)}let b;function x(t){b=t}const y=[],w=[],$=[],k=[],v=Promise.resolve();let M=!1;function E(t){$.push(t)}let S=!1;const _=new Set;function L(){if(!S){S=!0;do{for(let t=0;t<y.length;t+=1){const e=y[t];x(e),T(e.$$)}for(y.length=0;w.length;)w.pop()();for(let t=0;t<$.length;t+=1){const e=$[t];_.has(e)||(_.add(e),e())}$.length=0}while(y.length);for(;k.length;)k.pop()();M=!1,S=!1,_.clear()}}function T(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(E)}}const A=new Set;function C(t,e){t&&t.i&&(A.delete(t),t.i(e))}function H(t,e){t.d(1),e.delete(t.key)}function I(t,e){-1===t.$$.dirty[0]&&(y.push(t),M||(M=!0,v.then(L)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function j(s,a,i,l,c,d,f=[-1]){const p=b;x(s);const g=a.props||{},m=s.$$={fragment:null,ctx:null,props:d,update:t,not_equal:c,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(p?p.$$.context:[]),callbacks:n(),dirty:f};let h=!1;if(m.ctx=i?i(s,g,(t,e,...n)=>{const o=n.length?n[0]:e;return m.ctx&&c(m.ctx[t],m.ctx[t]=o)&&(m.bound[t]&&m.bound[t](o),h&&I(s,t)),e}):[],m.update(),h=!0,o(m.before_update),m.fragment=!!l&&l(m.ctx),a.target){if(a.hydrate){const t=function(t){return Array.from(t.childNodes)}(a.target);m.fragment&&m.fragment.l(t),t.forEach(u)}else m.fragment&&m.fragment.c();a.intro&&C(s.$$.fragment),function(t,n,s){const{fragment:a,on_mount:i,on_destroy:l,after_update:u}=t.$$;a&&a.m(n,s),E(()=>{const n=i.map(e).filter(r);l?l.push(...n):o(n),t.$$.on_mount=[]}),u.forEach(E)}(s,a.target,a.anchor),L()}x(p)}let U;function z(t,e,n){const o=t.slice();return o[17]=e[n],o[19]=n,o}function B(t,e){let n,o,r,s,p,g,m,b=e[17].value+"",x=e[5].format(e[17].datetime)+"";return{key:t,first:null,c(){n=c("message-bubble"),o=c("message-text"),r=f(),s=c("datetime-stamp"),p=d(x),h(o,"info",e[17].info),h(o,"user",e[17].user),h(s,"info",e[17].info),h(n,"user",e[17].user),this.first=n},m(t,u,c){l(t,n,u),i(n,o),o.innerHTML=b,i(n,r),i(n,s),i(s,p),c&&m(),m=a(g=e[7].call(null,n))},p(t,e){8&e&&b!==(b=t[17].value+"")&&(o.innerHTML=b),8&e&&h(o,"info",t[17].info),8&e&&h(o,"user",t[17].user),8&e&&x!==(x=t[5].format(t[17].datetime)+"")&&function(t,e){e=""+e,t.data!==e&&(t.data=e)}(p,x),8&e&&h(s,"info",t[17].info),8&e&&h(n,"user",t[17].user)},d(t){t&&u(n),m()}}}function N(t){let e,n,o;return{c(){e=c("message-bubble"),e.innerHTML="<message-text><message-dot></message-dot> \n          <message-dot></message-dot> \n          <message-dot></message-dot></message-text>"},m(r,s,i){l(r,e,s),i&&o(),o=a(n=t[7].call(null,e))},d(t){t&&u(e),o()}}}function R(e){let n,s,a,d,h,b,x,y,w,$=[],k=new Map,v=e[3];const M=t=>t[19];for(let t=0;t<v.length;t+=1){let n=z(e,v,t),o=M(n);k.set(o,$[t]=B(o,n))}let E=e[4]&&N(e);return{c(){n=c("chat-widget-root"),s=c("chat-messages");for(let t=0;t<$.length;t+=1)$[t].c();a=f(),E&&E.c(),d=f(),h=c("input-box"),b=c("input"),x=f(),y=c("button"),y.innerHTML='<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',this.c=t,g(b,"type","text"),g(b,"placeholder","Send a message")},m(t,u,c){l(t,n,u),i(n,s);for(let t=0;t<$.length;t+=1)$[t].m(s,null);i(s,a),E&&E.m(s,null),i(n,d),i(n,h),i(h,b),e[14](b),m(b,e[0]),i(h,x),i(h,y),e[16](n),c&&o(w),w=[p(b,"input",e[15]),p(b,"keyup",e[8]),p(y,"click",e[6]),p(n,"mousedown",(function(){r(e[2].blur)&&e[2].blur.apply(this,arguments)})),p(n,"touchstart",(function(){r(e[2].blur)&&e[2].blur.apply(this,arguments)}))]},p(t,[n]){if(e=t,40&n){const t=e[3];$=function(t,e,n,o,r,s,a,i,l,u,c,d){let f=t.length,p=s.length,g=f;const m={};for(;g--;)m[t[g].key]=g;const h=[],b=new Map,x=new Map;for(g=p;g--;){const t=d(r,s,g),i=n(t);let l=a.get(i);l?o&&l.p(t,e):(l=u(i,t),l.c()),b.set(i,h[g]=l),i in m&&x.set(i,Math.abs(g-m[i]))}const y=new Set,w=new Set;function $(t){C(t,1),t.m(i,c,a.has(t.key)),a.set(t.key,t),c=t.first,p--}for(;f&&p;){const e=h[p-1],n=t[f-1],o=e.key,r=n.key;e===n?(c=e.first,f--,p--):b.has(r)?!a.has(o)||y.has(o)?$(e):w.has(r)?f--:x.get(o)>x.get(r)?(w.add(o),$(e)):(y.add(r),f--):(l(n,a),f--)}for(;f--;){const e=t[f];b.has(e.key)||l(e,a)}for(;p;)$(h[p-1]);return h}($,n,M,1,e,t,k,s,H,B,a,z)}e[4]?E||(E=N(e),E.c(),E.m(s,null)):E&&(E.d(1),E=null),1&n&&b.value!==e[0]&&m(b,e[0])},i:t,o:t,d(t){t&&u(n);for(let t=0;t<$.length;t+=1)$[t].d();E&&E.d(),e[14](null),e[16](null),o(w)}}}function D(t,e,n){let o,r,s,a=[],i=!1,l=!1;const u=new Intl.DateTimeFormat("en-US",{year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",dateStyle:"short",timeStyle:"short"}),c=(t={})=>{if(l)throw new Error("message already pending");n(4,i=!t.user&&!t.info),a.push({value:"",datetime:Date.now(),...t}),l=!0},d=t=>{n(3,a[a.length-1].value=t,a),n(4,i=!1),l=!1,n(3,a)},f=()=>{""!==o&&(c({user:!0}),d(o),r.dispatchEvent(new CustomEvent("userinput",{bubbles:!0,cancelable:!0,composed:!0,target:s,detail:o})),n(0,o=""))};return[o,r,s,a,i,u,f,t=>{t.scrollIntoView()},t=>{"Enter"===t.key&&f()},c,()=>{a.pop()},d,t=>{n(3,a[a.length-1].value=`<img src="${t}" />`,a),n(4,i=!1),n(3,a),l=!1},l,function(t){w[t?"unshift":"push"](()=>{n(2,s=t)})},function(){o=this.value,n(0,o)},function(t){w[t?"unshift":"push"](()=>{n(1,r=t)})}]}"function"==typeof HTMLElement&&(U=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(t,e,n){this[t]=n}$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}});class F extends U{constructor(t){super(),this.shadowRoot.innerHTML='<style>*{--light-gray:#eee;--light-blue:rgba(79, 195, 247, 0.5);box-sizing:border-box;font-size:16px;font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"}:global(a){color:#00785A}chat-widget-root{overflow:hidden;position:absolute;display:block;height:100%;width:100%;background-color:var(--light-gray);margin:0}chat-messages{overflow-y:auto;position:absolute;width:100%;bottom:50px;max-height:calc(100vh - 50px);padding:15px}message-bubble{width:100%;transition:transform 0.3s, opacity 0.3s;transform-origin:0% 100%;animation:0.25s ease-out 0s 1 normal forwards running enter}@keyframes enter{from{opacity:0;transform:translate(0px, 8px) }to{opacity:1;transform:translate(0px, 0px) }}message-bubble{display:flex;flex-direction:column}message-bubble.user{align-items:flex-end;transform-origin:100% 100%}message-text{display:block;position:relative;width:fit-content;max-width:75%;padding:10px 15px;border-radius:4px;box-shadow:-9px 9px 30px 1px rgba(0,0,0,0.2)}message-text.info{padding-bottom:20px;box-shadow:none;color:#666}message-text.user{background-color:var(--light-blue);border-bottom-right-radius:0px}message-text:not(.user){background-color:var(--light-gray);border-bottom-left-radius:0px}message-bubble :global(img){width:100%;max-width:100%;border-radius:4px}message-text::after{position:absolute;bottom:0;content:\'\';width:0;height:0;border-style:solid}message-text.user::after{right:-8px;border-width:8px 0 0 8px;border-color:transparent transparent transparent var(--light-blue)}message-text:not(.user)::after{left:-8px;border-width:0 0 8px 8px;border-color:transparent transparent var(--light-gray) transparent}message-dot{display:inline-block;width:10px;height:10px;margin:2px 0;border-radius:100%;background-color:#aaa;animation:1s linear 0s infinite normal none running pulse}message-dot:nth-child(2){animation-delay:200ms}message-dot:nth-child(3){animation-delay:400ms}@keyframes pulse{0%{opacity:0.5}50%{opacity:1.0}100%{opacity:0.5}}datetime-stamp{display:block;padding:5px 15px 15px;font-size:12px}datetime-stamp.info{display:none}input-box{display:flex;position:absolute;bottom:0;left:0;width:100%;background-color:#fff}input{height:50px;width:calc(100% - 50px);padding:15px;margin:0;border:0;background-color:transparent;outline:none}button{display:flex;justify-content:center;width:50px;padding:0;border:0;background:transparent;outline:0}svg{width:24px;height:24px;stroke:#555;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none}</style>',j(this,{target:this.shadowRoot},D,R,s,{startMessage:9,cancelMessage:10,commitMessage:11,commitImage:12}),t&&(t.target&&l(t.target,this,t.anchor),t.props&&(this.$set(t.props),L()))}static get observedAttributes(){return["startMessage","cancelMessage","commitMessage","commitImage"]}get startMessage(){return this.$$.ctx[9]}get cancelMessage(){return this.$$.ctx[10]}get commitMessage(){return this.$$.ctx[11]}get commitImage(){return this.$$.ctx[12]}}customElements.define("chat-widget",F);export default F;
