import{el,link,button,image,flowDiagram,projectActions,videoPlayer,safeHTML,mediaGallery}from'./components.js';
import{translated as tr,text}from'./data.js';import{gameIds}from'./router.js';
export function homeView(projects,project,language){
 const main=el('main','home-view');main.id='main';
 const selector=el('aside','game-selector');selector.setAttribute('aria-label',text(language,'Choose the game shown on Home','切换首页展示的游戏'));
 selector.append(el('p','eyebrow',text(language,'Games','游戏')),el('p','selector-help',text(language,'Select a game to preview','选择游戏，在首页预览')));
 const list=el('div','game-list');for(const id of gameIds){const p=projects.find(p=>p.id===id);const a=link(p.title,'#home/'+id,'game-option');a.setAttribute('aria-label',text(language,'Show ','在首页展示 ')+p.title);if(id===project.id)a.setAttribute('aria-current','true');list.append(a)}selector.append(list);
 const feature=el('section','home-feature');feature.setAttribute('aria-label',project.title);
 const heading=el('div','home-heading');heading.append(el('p','eyebrow',tr(project.sub,language)),el('h1','project-title','“'+project.title+'”'));
 heading.append(el('p','project-date',project.date));
 const toolbar=projectActions(project,language,{home:true});const stage=el('div','home-stage');
 const i=gameIds.indexOf(project.id),previous=gameIds[(i+gameIds.length-1)%gameIds.length],next=gameIds[(i+1)%gameIds.length];
 const prev=link('‹','#home/'+previous,'project-arrow previous'),nextLink=link('›','#home/'+next,'project-arrow next');prev.setAttribute('aria-label',text(language,'Previous game on Home','首页上一个游戏'));nextLink.setAttribute('aria-label',text(language,'Next game on Home','首页下一个游戏'));
 stage.append(videoPlayer(project,project.video,text(language,'Trailer','演示'),language,{cover:true}),prev,nextLink);
 feature.append(heading,toolbar,stage,el('p','home-summary',tr(project.summary,language)));main.append(selector,feature);return main;
}

function readerShell(project,language,{portfolio=false}={}){
 const main=el('main','reader-view');main.id='main';const sidebar=el('aside','reader-sidebar');
 const back=link('← '+text(language,'Back','返回'),project.category==='games'?'#home/'+project.id:'#home','reader-back');back.setAttribute('aria-label',project.category==='games'?text(language,'Back to ','返回首页：')+project.title:text(language,'Back to Home','返回主页'));sidebar.append(back);
 if(portfolio){sidebar.append(el('h1','reader-project-title','“'+project.title+'”'),el('p','reader-kind','Design Portfolio'))}
 const toggle=button('Contents','contents-toggle');toggle.setAttribute('aria-expanded','false');const navigation=el('nav','reader-contents');navigation.id='reader-contents';navigation.setAttribute('aria-label',text(language,'Page contents','页面目录'));toggle.setAttribute('aria-controls',navigation.id);toggle.addEventListener('click',()=>{const open=sidebar.classList.toggle('contents-open');toggle.setAttribute('aria-expanded',String(open))});sidebar.append(toggle,navigation);
 const article=el('article','reader-content');main.append(sidebar,article);return{main,sidebar,navigation,article};
}
function sectionNavigation(nav,sections,language){
 sections.forEach((section,i)=>{const a=link(String(i+1).padStart(2,'0')+' / '+section.label,'#'+section.element.id,'contents-link');a.dataset.section=section.element.id;if(i===0)a.setAttribute('aria-current','location');nav.append(a)});
}
function overviewHero(project,language){
 const hero=el('div','project-overview');hero.append(el('h1','project-title','“'+project.title+'”'),el('p','project-intro',tr(project.sub,language)+' · '+project.date));
 const links=el('div','context-links');if(project.itch)links.append(link('itch.io ↗',project.itch));hero.append(links);return hero;
}
function analysisSection(section,project,language){
 const node=el('section','case-section case-'+section.kind);node.id=section.id;node.setAttribute('aria-labelledby',section.id+'-title');const title=el('h2','',section.title);title.id=section.id+'-title';node.append(title);
 if(section.originalHTML&&section.kind!=='video'){const rich=safeHTML(section.originalHTML);rich.querySelectorAll('a:has(img)').forEach(a=>a.dataset.zoom='true');node.append(rich);return node}
 if(section.kind==='overview'){
  node.append(el('p','takeaway',text(language,'The experience at a glance.','快速了解核心体验。')),flowDiagram(tr(project.flow,language),language));return node;
 }
 if(section.kind==='video'){
  if(section.videos.length){for(const id of section.videos){node.append(videoPlayer(project,id,section.title,language));node.append(link('YouTube ↗','https://youtu.be/'+id,'video-external'))}}
  else if(project.bilibili)node.append(el('p','',text(language,'An interactive film with choices and branching outcomes.','包含选择与分支结果的互动影片。')),link('Bilibili ↗',project.bilibili,'external-pill'));
  return node;
 }
 if(section.lead)node.append(el('p','takeaway',section.lead));
 for(const paragraph of section.paragraphs)node.append(el('p','',paragraph));
 if(section.diagram?.length)node.append(flowDiagram(section.diagram,language));
 if(section.items?.length){const list=el('ul','contribution-list');for(const item of section.items)list.append(el('li','',item));node.append(list)}
 if(section.html){const rich=safeHTML(section.html);rich.querySelectorAll('a:has(img)').forEach(a=>a.dataset.zoom='true');node.append(rich)}
 if(section.media?.length)node.append(mediaGallery(section.media,language));
 for(const paragraph of section.notes||[])node.append(el('p','',paragraph));
 for(const item of section.downloads||[]){const download=link(item.label+' ↓',item.href,'video-external');download.setAttribute('download','');node.append(download)}
 const sources=el('div','context-links');for(const item of section.links||[])if(!/^(?:Watch|Play|More)\b/i.test(item.label))sources.append(link(item.label,item.href));if(sources.childElementCount)node.append(sources);
 return node;
}
export function detailView(project,language){
 const shell=readerShell(project,language);shell.article.append(overviewHero(project,language));const sections=[];
 for(const section of project.sections[language]){const node=analysisSection(section,project,language);shell.article.append(node);sections.push({element:node,label:section.title})}
 if(project.portfolio){const footer=el('div','reader-footer');footer.append(link('Portfolio →','#portfolio/'+project.id,'action action-portfolio'));shell.article.append(footer)}sectionNavigation(shell.navigation,sections,language);return shell.main;
}
export function portfolioView(project,language){
 const shell=readerShell(project,language,{portfolio:true});const intro=el('div','portfolio-intro');intro.append(el('p','eyebrow','Design Portfolio'),el('h2','',text(language,'Design, process & development','设计、过程与开发')),el('p','',project.portfolio.pages.length+text(language,' pages · Click a page to enlarge.',' 页 · 点击页面可放大查看。')));shell.article.append(intro);
 const pages=el('div','portfolio-pages'),sections=[];
 project.portfolio.pages.forEach((page,i)=>{const figure=el('figure','portfolio-page');figure.id='portfolio-page-'+(i+1);const label=project.portfolio.labels[language][i];const a=link('',page.src,'zoomable');a.dataset.zoom='true';a.setAttribute('aria-label',project.title+' — '+label);const img=image(page.src,project.title+' — '+String(i+1).padStart(2,'0')+' / '+label,!i);img.width=2200;img.height=1238;a.append(img);figure.append(a,el('figcaption','',String(i+1).padStart(2,'0')+' / '+project.portfolio.pages.length+' · '+label));pages.append(figure);sections.push({element:figure,label})});shell.article.append(pages);
 const footer=el('div','reader-footer');footer.append(link('More →','#project/'+project.id,'action action-details'));shell.article.append(footer);sectionNavigation(shell.navigation,sections,language);return shell.main;
}
export function portfolioIndex(projects,language){const main=el('main','portfolio-index');main.id='main';main.append(el('p','eyebrow','Design Portfolio'),el('h1','project-title',text(language,'Selected design portfolios','精选设计作品集')),el('p','index-intro',text(language,'Read the original design decks, with a page-by-page contents list.','通过逐页目录，阅读完整的原版设计作品集。')));const grid=el('div','portfolio-grid');for(const p of projects.filter(p=>p.portfolio)){const card=link('','#portfolio/'+p.id,'portfolio-card');card.append(image(p.portfolio.thumbnail,p.title),el('h2','','“'+p.title+'”'),el('p','',p.portfolio.pages.length+text(language,' pages · Design Portfolio →',' 页 · Design Portfolio →')));grid.append(card)}main.append(grid);return main}
export function projectIndex(projects,language,category){const main=el('main','portfolio-index');main.id='main';main.append(el('p','eyebrow','Project Details'),el('h1','project-title',category==='others'?text(language,'Other Projects','其它项目'):text(language,'Projects','项目')));const grid=el('div','portfolio-grid');for(const p of projects.filter(p=>category!=='others'||p.category==='others')){const card=link('','#project/'+p.id,'portfolio-card');card.append(image(p.cover,p.title),el('h2','','“'+p.title+'”'),el('p','',tr(p.sub,language)+' · '+p.date),el('p','',tr(p.role,language)));grid.append(card)}main.append(grid);return main}

export function aboutDialog(language){const dialog=el('dialog','about-dialog');dialog.setAttribute('aria-label','About Misty');const close=button('×','dialog-close',()=>dialog.close());close.setAttribute('aria-label','Close about / 关闭介绍');dialog.append(close,el('p','eyebrow',text(language,'About me','关于我')),el('h1','',text(language,"Hi! I’m Misty.",'你好呀！我是思齐。')),el('p','',text(language,"I'm Siqi(Misty) Zhang. I'm a game design student exploring how mechanics, narrative and physical interaction can create meaningful experiences. My work spans independent games, collaborative development, tabletop design and interactive media.",'我是思齐，英文名 Misty，一名游戏设计在读学生。我关注机制、叙事与实体交互如何共同创造有意义的体验，创作涵盖独立游戏、团队开发、桌游和互动媒体。')),el('p','',text(language,'Outside of making games, I love travelling solo, powerlifting, surfing, film photography, and… cats!','除了做游戏，我喜欢独自旅行、力量举、冲浪、胶片摄影，以及……小猫咪！')));const links=el('div','context-links');links.append(link('itch.io ↗','https://zer046.itch.io/','action action-details'),link('Development journal ↗','https://sites.wsagames.com/sz3c23/','action action-portfolio'));dialog.append(links);return dialog}
