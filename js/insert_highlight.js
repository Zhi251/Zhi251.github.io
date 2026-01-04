(()=>{(()=>{let d=`
  <div class="code-figcaption">
    <div class="code-left-wrap">
      <div class="code-decoration"></div>
      <div class="code-lang"></div>
    </div>
    <div class="code-right-wrap">
      <div class="code-copy icon-copy"></div>
      <div class="icon-chevron-down code-expand"></div>
    </div>
  </div>
  <div class="code-figcaption-bottom">
    <span class="code-name"></span>
    <a class="code-link"></a>
  </div>`,n=(window.siteConfig?.code_block||{}).expand;if(_$$("div.highlight").forEach(e=>{e.querySelector(".code-figcaption")||e.insertAdjacentHTML("afterbegin",d),n!==void 0&&(n===!1||typeof n=="number"&&e.querySelectorAll("code[data-lang] .line").length>n)&&(e.classList.add("code-closed"),e.style.display="none",e.offsetWidth,e.style.display="");let o=e.querySelector(".code-figcaption-bottom"),t=e.getAttribute("name"),c=e.querySelector(".code-name");t?c.innerText=t:c.innerText="";let i=e.getAttribute("url"),s=e.getAttribute("link_text"),r=e.querySelector(".code-link");i?(r.setAttribute("href",i),r.innerText=s||i,o.classList.add("has-link")):(r.setAttribute("href",""),r.innerText="",o.classList.remove("has-link")),t||i?o.style.marginBottom="12px":o.style.marginBottom="0"}),_$$(".code-expand").forEach(e=>{e.off("click").on("click",()=>{e.closest("div.highlight").classList.toggle("code-closed")})}),_$$("div.highlight").forEach(e=>{let o;if(e.querySelector("table")?o=e.querySelector("tr td:last-of-type code"):o=e.querySelector("code"),!o)return;let t=o.dataset.lang;if(!t)return;let c=t.replace("line-numbers","").trim().replace("language-","").trim().toUpperCase(),i=o.closest(".highlight");if(i){let s=i.querySelector(".code-lang");s&&(s.innerText=c)}}),!window.ClipboardJS)return;let a=new ClipboardJS(".code-copy",{text:e=>{let o=e.parentNode.parentNode.parentNode.querySelector("tr td:last-of-type");o||(o=e.parentNode.parentNode.parentNode.querySelector("code"));let t=o?o.innerText:"";return window.siteConfig.clipboard.copyright?.enable&&t.length>=window.siteConfig.clipboard.copyright?.count&&(t=t+`

`+window.siteConfig.clipboard.copyright?.content||""),t}});a.on("success",e=>{e.trigger.classList.add("icon-check"),e.trigger.classList.remove("icon-copy");let o=window.siteConfig.clipboard.success,t="Copy successfully (*^\u25BD^*)";if(typeof o=="string")t=o;else if(typeof o=="object"){let c=document.documentElement.lang,i=Object.keys(o).find(s=>s.toLowerCase()===c.toLowerCase());i&&o[i]&&(t=o[i])}_$("#copy-tooltip").innerText=t,_$("#copy-tooltip").style.opacity="1",setTimeout(()=>{_$("#copy-tooltip").style.opacity="0",e.trigger.classList.add("icon-copy"),e.trigger.classList.remove("icon-check")},1e3),e.clearSelection()}),a.on("error",e=>{e.trigger.classList.add("icon-times"),e.trigger.classList.remove("icon-copy");let o=window.siteConfig.clipboard.fail,t="Copy failed (\uFF9F\u22BF\uFF9F)\uFF82";if(typeof o=="string")t=o;else if(typeof o=="object"){let c=document.documentElement.lang,i=Object.keys(o).find(s=>s.toLowerCase()===c.toLowerCase());i&&o[i]&&(t=o[i])}_$("#copy-tooltip").innerText=t,_$("#copy-tooltip").style.opacity="1",setTimeout(()=>{_$("#copy-tooltip").style.opacity="0",e.trigger.classList.add("icon-copy"),e.trigger.classList.remove("icon-times")},1e3)}),window.Pjax&&window.addEventListener("pjax:send",()=>{a.destroy()},{once:!0}),window.AOS&&AOS.refresh()})();})();
