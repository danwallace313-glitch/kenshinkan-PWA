const SOURCE='https://kenshinkan-dojo-member-links.bmaba.app/';

function decode(s=''){return s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[^>]*>/g,'').trim();}

export default async function handler(req,res){
  try{
    const response=await fetch(SOURCE,{headers:{'User-Agent':'Mozilla/5.0 Kenshinkan-PWA'}});
    if(!response.ok) throw new Error(`Flo returned ${response.status}`);
    const html=await response.text();
    const links=[];
    const re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while((m=re.exec(html))!==null){
      const url=decode(m[1]); const label=decode(m[2]).replace(/\s+/g,' ');
      if(!label||!/^https?:\/\//i.test(url)) continue;
      if(/powered by flo/i.test(label)||/bmaba\.app\/?$/i.test(url)||/mybmaba\.org\.uk/i.test(url)) continue;
      links.push({label,url});
    }
    const seen=new Set();
    const clean=links.filter(x=>{const k=x.label+'|'+x.url;if(seen.has(k))return false;seen.add(k);return true;});
    res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=300');
    res.status(200).json({links:clean});
  }catch(error){res.status(502).json({links:[],error:'Unable to read Flo links'});}
}
