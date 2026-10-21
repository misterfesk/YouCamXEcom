"use client";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { SearchInput } from "@/components/ui/search-input";
import { Packshot } from "@/components/product/packshot";
import { FitBadge } from "@/components/ui/fit-badge";
import type { ProductListing } from "@/types/storefront";
export type SearchResultsProps={query:string;results:ProductListing[];loading?:boolean;error?:string;onNavigate:()=>void};
export function SearchResults({query,results,loading,error,onNavigate}:SearchResultsProps){
 return <div className="search-results"><p role="status" className="type-small text-text-muted">{loading ? "Looking through the collection…" : error ? error : query ? `${results.length} ${results.length===1?"match":"matches"} for “${query}”` : "A few good starting points"}</p>{!loading&&!error&&(results.length ? <ul>{results.map(({product,fit})=><li key={product.id}><Link className="search-result" href={`/products/${product.slug}`} onClick={onNavigate}><div className="search-art"><Packshot {...product.image}/></div><span><strong>{product.name}</strong><span className="type-small text-text-muted">{product.size} · ${product.price.toFixed(2)}</span>{fit&&<FitBadge fit={fit}/>}</span></Link></li>)}</ul>:<div className="empty-panel"><h2 className="type-h3">A different word might help.</h2><p>Try “hydration”, “serum” or an ingredient such as “niacinamide”.</p><Link className="control button-secondary type-button" href="/shop" onClick={onNavigate}>Browse all products</Link></div>)}</div>;
}
export function SearchOverlay({open,onOpenChange,query,onQueryChange,...results}:SearchResultsProps & {open:boolean;onOpenChange:(open:boolean)=>void;onQueryChange:(query:string)=>void}) {
 return <Modal initialFocus="search" open={open} onOpenChange={onOpenChange} title="Find your next step" description="Search by product, ingredient, routine step or concern."><SearchInput label="Search the collection" value={query} onValueChange={onQueryChange} placeholder="Try hydration or niacinamide"/><SearchResults query={query} {...results}/></Modal>;
}
