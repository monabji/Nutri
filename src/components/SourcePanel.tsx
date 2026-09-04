import { ArrowUpRight } from 'lucide-react'
import type { ProductFacts } from '../types/product'

export function SourcePanel({ product, missingFields }: { product: ProductFacts; missingFields: string[] }) {
  return (
    <aside className="source-panel" aria-label="Data source">
      <p className="eyebrow">Source record</p>
      <p className="source-title">Open Food Facts</p>
      <dl>
        <div><dt>Barcode</dt><dd>{product.barcode}</dd></div>
        <div><dt>Retrieved</dt><dd>{new Date(product.fetchedAt).toLocaleString()}</dd></div>
      </dl>
      <a href={product.sourceUrl} target="_blank" rel="noreferrer">View source record <ArrowUpRight size={14} /></a>
      {missingFields.length ? <p className="source-note">Not reported: {missingFields.join(', ')}.</p> : <p className="source-note">All Phase 2 core fields were reported.</p>}
    </aside>
  )
}
