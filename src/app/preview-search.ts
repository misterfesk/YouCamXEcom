import type { Product } from "@/types/catalog";
import { CONCERN_LABEL } from "@/types/skin";
import { GOAL_DEFS } from "@/types/goal";
import { SUBTYPE_LABEL } from "@/types/catalog";
const aliases:Record<string,string>={pimples:"acne",spots:"acne",dry:"moisture",hydration:"moisture",oily:"oiliness","dark circles":"under-eyes",spf:"sunscreen",sun:"sunscreen"};
export function searchProducts(products:Product[],query:string):Product[]{
 const q=query.trim().toLowerCase();if(!q)return products.filter(p=>p.bestseller).slice(0,5);
 const words=(aliases[q]??q).split(/\s+/);
 return products.map(product=>{const text=[product.name,product.tagline,product.step,SUBTYPE_LABEL[product.subtype],...product.actives.map(a=>a.id),...product.targets.flatMap(t=>[t.concern,CONCERN_LABEL[t.concern],...Object.values(GOAL_DEFS).filter(g=>g.concerns.includes(t.concern)).map(g=>g.id)])].join(" ").toLowerCase();return {product,score:words.reduce((s,w)=>s+(text.includes(w)?2:0),0)};}).filter(p=>p.score>=words.length*2).sort((a,b)=>b.score-a.score).map(p=>p.product);
}
