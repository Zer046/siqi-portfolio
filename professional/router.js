/** One route model for direct links, selections, reloads and history. */
export const gameIds=['clock-out','backstage','soul-mate','soul-keeper','road-riot'];
export function readRoute(hash,projects,lastProject='clock-out'){
 const raw=(hash||'').replace(/^#/,'').split('?')[0];const [type,id]=raw.split('/');
 let decoded;try{decoded=decodeURIComponent(id||'')}catch{decoded=''}
 const project=projects.find(p=>p.id===decoded);
 if(type==='projects'&&decoded!=='others')return{view:'projects',id:'all'};
 if(type==='project'&&project)return{view:'details',id:project.id};
 if(type==='portfolio'&&project?.portfolio)return{view:'portfolio',id:project.id};
 if(type==='portfolio'&&project)return{view:'details',id:project.id};
 if(type==='portfolio'&&!id)return{view:'portfolios',id:null};
 if(type==='home'&&project&&gameIds.includes(project.id))return{view:'home',id:project.id};
 
 return{view:'home',id:gameIds.includes(lastProject)?lastProject:gameIds[0]};
}
export function routeHash(route){return route.view==='home'?'#home/'+route.id:route.view==='details'?'#project/'+route.id:route.view==='portfolio'?'#portfolio/'+route.id:route.view==='projects'?'#projects/'+route.id:'#portfolio'}
export function sameRoute(a,b){return a?.view===b?.view&&a?.id===b?.id}
