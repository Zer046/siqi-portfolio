import{translated as tr,text}from'./data.js';
export function el(tag,className,content){const node=document.createElement(tag);if(className)node.className=className;if(content!==undefined)node.textContent=content;return node}
export function link(label,href,className=''){const a=el('a',className,label);a.href=href;if(/^https?:/.test(href)){a.target='_blank';a.rel='noopener'}return a}
export function button(label,className,handler){const b=el('button',className,label);b.type='button';if(handler)b.addEventListener('click',handler);return b}
export function image(src,alt,eager=false){const img=el('img');img.src=src;img.alt=alt;img.loading=eager?'eager':'lazy';img.decoding='async';return img}
export function flowDiagram(labels,language){
 const figure=el('figure','flow-diagram'),list=el('ol');figure.setAttribute('aria-label',text(language,'Interaction sequence','交互流程'));
 for(const label of labels)list.append(el('li','',label));figure.append(list);return figure;
}
export function projectActions(project,language,{home=false}={}){
 const row=el('div','project-toolbar');
 if(home)row.append(link('More','#project/'+project.id,'action action-details'));
 if(project.portfolio)row.append(link('Portfolio','#portfolio/'+project.id,'action action-portfolio'));
 if(project.itch)row.append(link('itch.io ↗',project.itch,'action action-itch'));
 return row;
}
export function videoPlayer(project,id,label,language,{cover=false}={}){
 const frame=el('div','video-player');frame.dataset.video=id;
 const mountVideo=(autoplay=false)=>{
  const iframe=el('iframe');iframe.title=project.title+' — '+label;iframe.src='https://www.youtube.com/embed/'+encodeURIComponent(id)+'?playsinline=1&rel=0'+(autoplay?'&autoplay=1':'')+'&origin='+encodeURIComponent(location.origin);iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';frame.replaceChildren(iframe);
 };
 if(!cover){mountVideo();return frame}
 const play=button('', 'video-poster',()=>mountVideo(true));
 play.setAttribute('aria-label',text(language,'Play ','播放 ')+project.title+' — '+label);
 if(cover)play.append(image(project.cover,project.title,true));else play.append(el('span','video-title',project.title+' / '+label));
 play.append(el('span','play-label',text(language,'▶ Play video','▶ 播放视频')));frame.append(play);return frame;
}
export function safeHTML(html){
 const wrapper=el('div','section-evidence');wrapper.innerHTML=html||'';
 wrapper.querySelectorAll('script,style,iframe,button').forEach(node=>node.remove());
 for(const node of wrapper.querySelectorAll('*'))for(const attr of [...node.attributes])if(/^on/i.test(attr.name)||(/^(href|src)$/i.test(attr.name)&&/^javascript:/i.test(attr.value)))node.removeAttribute(attr.name);
 wrapper.querySelectorAll('img').forEach(img=>{img.loading='lazy';img.decoding='async'});
 return wrapper;
}
export function mediaGallery(media,language){const grid=el('div',media.length===2?'media-grid media-pair':'media-grid');for(const item of media){const figure=el('figure'),a=link('',item.src,'zoomable');a.dataset.zoom='true';const img=image(item.src,item.alt||text(language,'Project image','项目图片'));if(item.width&&item.height){img.width=item.width;img.height=item.height}a.append(img);figure.append(a);grid.append(figure)}return grid}

export function createImageDialog(){
 const dialog=el('dialog','image-dialog');dialog.setAttribute('aria-label','Image preview');const img=image('','');img.removeAttribute('src');img.loading='eager';const caption=el('p','image-caption');const close=button('×','dialog-close',()=>dialog.close());close.setAttribute('aria-label','Close image / 关闭图片');dialog.append(img,caption,close);document.body.append(dialog);
 document.addEventListener('click',event=>{const anchor=event.target.closest('a[data-zoom]');if(!anchor)return;event.preventDefault();const source=anchor.querySelector('img');img.src=source?.currentSrc||anchor.href;img.alt=source?.alt||'';caption.textContent=img.alt;dialog.showModal();close.focus()});
 dialog.addEventListener('click',event=>{if(event.target===dialog||event.target===img)dialog.close()});dialog.addEventListener('close',()=>img.removeAttribute('src'));
 return dialog;
}

export function siteHeader(projects,state,onLanguage,onAbout){
 const header=el('header','site-header');header.append(link('Siqi(Misty) Zhang','#home/'+state.homeId,'brand'));
 const nav=el('nav','site-nav');nav.setAttribute('aria-label',text(state.language,'Main navigation','主导航'));
 const home=link(text(state.language,'Home','首页'),'#home/'+state.homeId);if(state.route.view==='home')home.setAttribute('aria-current','page');nav.append(home);
 function menu(label,items,href){
  const wrapper=el('div','nav-menu'),trigger=href?link(label,href,'menu-trigger'):button(label,'menu-trigger');trigger.setAttribute('aria-expanded','false');const panel=el('div','menu-panel');panel.hidden=true;panel.id='menu-'+Math.random().toString(36).slice(2,8);trigger.setAttribute('aria-controls',panel.id);
  const show=open=>{panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open))};trigger.addEventListener('click',event=>show(event.pointerType==='mouse'?true:panel.hidden));wrapper.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')show(true)});wrapper.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')show(false)});wrapper.addEventListener('focusout',event=>{if(!wrapper.contains(event.relatedTarget))show(false)});wrapper.addEventListener('keydown',event=>{if(event.key==='Escape'){show(false);trigger.focus()}if(event.key==='ArrowDown'&&event.target===trigger){event.preventDefault();show(true);panel.querySelector('a,button')?.focus()}});document.addEventListener('pointerdown',event=>{if(!wrapper.contains(event.target))show(false)},{signal:state.headerSignal});
  for(const item of items){if(item.children){const group=el('div','submenu'),toggle=button(item.label+' ›','submenu-trigger'),child=el('div','submenu-panel');child.hidden=true;toggle.setAttribute('aria-expanded','false');const open=value=>{child.hidden=!value;toggle.setAttribute('aria-expanded',String(value))};toggle.addEventListener('click',()=>open(child.hidden));group.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')open(true)});group.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')open(false)});group.addEventListener('focusout',e=>{if(!group.contains(e.relatedTarget))open(false)});for(const entry of item.children){const a=link(entry.label,entry.href);if(entry.href===location.hash.split('?')[0])a.setAttribute('aria-current','page');a.addEventListener('click',()=>show(false));child.append(a)}group.append(toggle,child);panel.append(group);continue}if(item.heading){panel.append(el('p','menu-heading',item.heading));continue}const a=item.handler?button(item.label,'',item.handler):link(item.label,item.href);if(item.href&&item.href===location.hash.split('?')[0])a.setAttribute('aria-current','page');if(item.pressed!==undefined)a.setAttribute('aria-pressed',String(item.pressed));a.addEventListener('click',()=>show(false));panel.append(a)}wrapper.append(trigger,panel);return wrapper;
 }
 nav.append(menu(text(state.language,'Projects','项目'),['games','others'].map(category=>({label:text(state.language,category==='games'?'Games':'Others',category==='games'?'游戏':'其它项目'),children:projects.filter(p=>p.category===category).map(p=>({label:p.title,href:'#project/'+p.id}))}))));
 nav.append(menu('Portfolio',projects.filter(p=>p.portfolio).map(p=>({label:p.title,href:'#portfolio/'+p.id})),'#portfolio'));
 nav.append(button(text(state.language,'About me','关于我'),'about-link',onAbout));
 nav.append(menu('Language',[{label:'English',pressed:state.language===0,handler:()=>onLanguage(0)},{label:'中文',pressed:state.language===1,handler:()=>onLanguage(1)}]));const triggers=nav.querySelectorAll('.menu-trigger');if(['details','projects'].includes(state.route.view))triggers[0].dataset.active='true';if(['portfolio','portfolios'].includes(state.route.view))triggers[1].dataset.active='true';header.append(nav);return header;
}
