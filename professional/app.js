import{loadProjects,applyEditorData,text}from'./data.js';import{readRoute,routeHash,gameIds}from'./router.js';import{siteHeader,createImageDialog,el,link}from'./components.js';import{homeView,detailView,portfolioView,portfolioIndex,projectIndex,aboutDialog}from'./views.js';import{connectReader}from'./reader.js';
import '../interaction-sounds.js';
const storage={get(key,fallback){try{return localStorage.getItem(key)||fallback}catch{return fallback}},set(key,value){try{localStorage.setItem(key,value)}catch{}}};
const state={language:Number(storage.get('portfolio-language','0'))||0,homeId:storage.get('portfolio-home','clock-out'),route:null,currentHash:'',headerSignal:null};
let source=[],projects=[],editor={},readerCleanup=()=>{},headerController;const scrollPositions=new Map(),mount=document.getElementById('app');const zoom=createImageDialog();history.scrollRestoration='manual';
function ordered(data){const ids=[...gameIds,'life-path','interactive-video','xiaomi-internship'];return ids.map(id=>data.find(p=>p.id===id)).filter(Boolean)}

function stabilizeHome(main){
 if(state.route.view!=='home')return;
 const feature=main.querySelector('.home-feature');
 const heading=main.querySelector('.home-heading'),summary=main.querySelector('.home-summary');
 const measure=()=>{
  if(!main.isConnected)return;
  const games=projects.filter(p=>gameIds.includes(p.id));
  for(const [target,fill] of [
   [heading,(clone,p)=>{clone.querySelector('.eyebrow').textContent=p.sub[state.language];clone.querySelector('.project-title').textContent='“'+p.title+'”';clone.querySelector('.project-date').textContent=p.date}],
   [summary,(clone,p)=>{clone.textContent=p.summary[state.language]}]
  ]){
   const width=target.getBoundingClientRect().width;
   let maximum=0;
   for(const p of games){
    const clone=target.cloneNode(true);
    clone.setAttribute('aria-hidden','true');
    Object.assign(clone.style,{position:'fixed',left:'-10000px',top:'0',width:width+'px',height:'auto',minHeight:'0',maxHeight:'none',visibility:'hidden',pointerEvents:'none'});
    fill(clone,p);feature.append(clone);
    maximum=Math.max(maximum,clone.getBoundingClientRect().height);clone.remove();
   }
   target.style.minHeight=Math.ceil(maximum)+'px';
  }
 };
 measure();
 window.addEventListener('resize',measure,{signal:state.headerSignal});
 document.fonts?.ready.then(measure);
}

function saveScroll(){if(state.currentHash)scrollPositions.set(state.currentHash,scrollY)}
function showAbout(){const dialog=aboutDialog(state.language);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});dialog.showModal()}
function setLanguage(language){saveScroll();state.language=language;storage.set('portfolio-language',String(language));render({restore:true})}
function render({restore=false}={}){
 readerCleanup();headerController?.abort();headerController=new AbortController();state.headerSignal=headerController.signal;if(zoom.open)zoom.close();
 projects=ordered(applyEditorData(source,editor,state.language));state.route=readRoute(location.hash,projects,state.homeId);
 const raw=location.hash.split('?')[0],canonical=routeHash(state.route);if(raw!==canonical)history.replaceState(history.state,'',canonical);state.currentHash=location.hash;
 const route=state.route,project=projects.find(p=>p.id===route.id);if(project?.category==='games'){state.homeId=project.id;storage.set('portfolio-home',project.id)}
 document.documentElement.lang=state.language?'zh-CN':'en';document.body.dataset.view=route.view;
 const header=siteHeader(projects,state,setLanguage,showAbout);let main;
 if(route.view==='home')main=homeView(projects,project,state.language);else if(route.view==='details')main=detailView(project,state.language);else if(route.view==='portfolio')main=portfolioView(project,state.language);else if(route.view==='projects')main=projectIndex(projects,state.language,route.id);else main=portfolioIndex(projects,state.language);
 main.tabIndex=-1;mount.replaceChildren(header,main);stabilizeHome(main);document.title=(project?project.title+' · '+(route.view==='details'?'Project Details':route.view==='portfolio'?'Design Portfolio':'Home'):route.view==='projects'?'Projects':'Design Portfolios')+' | Siqi (Misty) Zhang';
 readerCleanup=connectReader(main,{language:state.language,onAddressChange:id=>{
  const base=routeHash(route),params=new URLSearchParams();params.set(route.view==='portfolio'?'page':'section',route.view==='portfolio'?id.replace('portfolio-page-',''):id);history.replaceState(history.state,'',base+'?'+params);state.currentHash=location.hash;
 }});
 requestAnimationFrame(()=>{
  const params=new URLSearchParams(location.hash.split('?')[1]||''),target=params.get('section')||(params.get('page')?'portfolio-page-'+params.get('page'):null);
  if(restore&&scrollPositions.has(state.currentHash))scrollTo({top:scrollPositions.get(state.currentHash),behavior:'instant'});else if(target&&main.readerJump)main.readerJump(target,{behavior:'instant',address:false});else scrollTo({top:0,behavior:'instant'});
 });
}
function navigate(hash,{replace=false}={}){saveScroll();if(location.hash===hash)return;history[replace?'replaceState':'pushState']({professional:true},'',hash);render();document.querySelector('main')?.focus({preventScroll:true})}
document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"]');if(!a||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;if(a.classList.contains('skip-link')){event.preventDefault();document.querySelector('main')?.focus({preventScroll:true});return}const hash=a.getAttribute('href');if(!/^#(?:home|project|projects|portfolio)(?:\/|$)/.test(hash))return;event.preventDefault();navigate(hash)});
const historyChange=()=>{if(state.currentHash===location.hash)return;saveScroll();render({restore:true})};window.addEventListener('popstate',historyChange);window.addEventListener('hashchange',historyChange);
document.addEventListener('keydown',event=>{if(state.route?.view!=='home'||document.querySelector('dialog[open]')||event.target.closest('a,button,input,textarea,select'))return;if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const i=gameIds.indexOf(state.route.id);navigate('#home/'+gameIds[(i+(event.key==='ArrowRight'?1:-1)+gameIds.length)%gameIds.length])}});
function editorRefresh(){if(!['localhost','127.0.0.1'].includes(location.hostname))return;let version='';const refresh=async()=>{try{const r=await fetch('/api/site-content');if(!r.ok)return;const value=await r.text();if(value===version||document.querySelector('dialog[open]'))return;version=value;const next=JSON.parse(value),changed=JSON.stringify(ordered(applyEditorData(source,next,state.language)))!==JSON.stringify(projects);editor=next;if(changed){saveScroll();render({restore:true})}}catch{}};refresh();setInterval(()=>{if(document.visibilityState==='visible')refresh()},5000)}
try{source=await loadProjects();render()}catch(error){const main=el('main','load-error');main.append(el('h1','',text(state.language,'The portfolio could not be loaded.','作品集暂时无法加载。')),el('p','',text(state.language,'Refresh this page to try again.','请刷新页面后重试。')),link('Reload',location.href));mount.replaceChildren(main);console.error(error)}
