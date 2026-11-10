/** Shared contents and progress behavior for details and portfolio readers. */
export function connectReader(main,{language,onAddressChange}={}){
 const sidebar=main.querySelector('.reader-sidebar');if(!sidebar)return()=>{};
 const contents=sidebar.querySelector('.reader-contents'),toggle=sidebar.querySelector('.contents-toggle'),links=[...contents.querySelectorAll('[data-section]')],sections=links.map(a=>main.querySelector('#'+CSS.escape(a.dataset.section)));let frame=0;
 function headerBottom(){return document.querySelector('.site-header').getBoundingClientRect().bottom}
 function readingTop(){return headerBottom()+(innerWidth<=760?sidebar.offsetHeight+16:45)}
 function progress(){frame=0;if(sidebar.classList.contains('contents-open'))return;let current=0;sections.forEach((section,i)=>{if(section.getBoundingClientRect().top<=readingTop()+30)current=i});if(scrollY+innerHeight>=document.documentElement.scrollHeight-4)current=links.length-1;
  links.forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
  const active=links[current];if(active&&contents.clientHeight){const r=active.getBoundingClientRect(),b=contents.getBoundingClientRect();if(r.top<b.top+4)contents.scrollTop+=r.top-b.top-4;else if(r.bottom>b.bottom-4)contents.scrollTop+=r.bottom-b.bottom+4}
  toggle.textContent='Contents · '+String(current+1).padStart(2,'0')+' / '+String(links.length).padStart(2,'0');
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(progress)}
 function jump(id,{behavior='smooth',address=true}={}){const target=main.querySelector('#'+CSS.escape(id));if(!target)return;sidebar.classList.remove('contents-open');toggle.setAttribute('aria-expanded','false');const top=scrollY+target.getBoundingClientRect().top-readingTop();scrollTo({top,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':behavior});if(address)onAddressChange?.(id);schedule()}
 contents.addEventListener('click',event=>{const a=event.target.closest('[data-section]');if(!a)return;event.preventDefault();jump(a.dataset.section)});
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);const observer=new ResizeObserver(schedule);observer.observe(main);schedule();
 main.readerJump=jump;
 return()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);observer.disconnect();if(frame)cancelAnimationFrame(frame)};
}
