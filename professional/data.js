export const translated=(value,language)=>Array.isArray(value)?value[language]??value[0]:value||'';
export const text=(language,en,zh)=>language?zh:en;
export async function loadProjects(){const response=await fetch('professional/projects.json?v=20261110-refinement');if(!response.ok)throw new Error('Project data could not be loaded.');return(await response.json()).projects}
/** Keep the existing local content editor working; never write its user data. */
export function applyEditorData(source,overrides,language){
 const projects=structuredClone(source);const key=language?'zh':'en';
 for(const p of projects){const c=overrides?.[p.id];if(!c)continue;
  for(const field of['title','date'])if(c[field]?.[key]!==undefined)p[field]=c[field][key];
  for(const field of['sub','summary','role','points'])for(const [i,lang]of['en','zh'].entries())if(c[field]?.[lang]!==undefined&&JSON.stringify(c[field][lang])!==JSON.stringify(p.editorBaseline?.[field]?.[i])){
   p[field][i]=c[field][lang];
   if(field==='points'){const contribution=p.sections[i].find(s=>s.kind==='contribution');if(contribution){contribution.items=c[field][lang];contribution.html=''}}
  }
  if(Array.isArray(c.tags?.[key]))p.tags=c.tags[key];
  if(c.coverAsset?.en&&c.coverAsset.en!==p.editorBaselineCoverAsset)p.cover='/api/asset/'+encodeURIComponent(c.coverAsset.en);
  const aliases={'life-context':'caseContext','life-research':'caseResearch','life-experience':'caseExperience','life-ethics':'caseEthics','life-reflection':'caseReflection'};
  for(const section of p.sections[language]){const value=c[section.id]?.[key]??c[aliases[section.id]]?.[key],baseline=p.editorBaseline?.sectionOverrides?.[section.id]?.[key];if(typeof value==='string'&&value.trim()&&value!==baseline){section.paragraphs=value.split(/\n\n+/);section.notes=[]}}
 }
 return projects;
}
