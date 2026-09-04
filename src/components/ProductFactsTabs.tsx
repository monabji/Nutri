import { Box, FileText, ListTree, Sparkles } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { ProductFacts } from '../types/product'
import { MetricCard } from './MetricCard'
import { SourcePanel } from './SourcePanel'

type TabId = 'summary' | 'ingredients' | 'nutrition' | 'source'

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'summary', label: 'Summary' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'source', label: 'Source' },
]

type Props = {
  product: ProductFacts
  missingFields: string[]
  micronutrientStatus: 'idle' | 'loading' | 'ready' | 'unavailable'
}

export function ProductFactsTabs({ product, missingFields, micronutrientStatus }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('summary')
  const panelId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    if (nextIndex === undefined) return

    event.preventDefault()
    setActiveTab(tabs[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section className="product-facts-tabs" aria-labelledby="facts-tabs-title">
      <div className="product-facts-tabs__header">
        <div>
          <p className="section-kicker">Product record</p>
          <h2 id="facts-tabs-title">Source details</h2>
        </div>
        <p>Everything here is reported by Open Food Facts, unless clearly marked as an estimate.</p>
      </div>

      <div className="facts-tablist" role="tablist" aria-label="Product source details">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => { tabRefs.current[index] = element }}
            id={`${panelId}-${tab.id}-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${panelId}-${tab.id}-panel`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={activeTab === tab.id ? 'facts-tab facts-tab--active' : 'facts-tab'}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div id={`${panelId}-${activeTab}-panel`} role="tabpanel" aria-labelledby={`${panelId}-${activeTab}-tab`} className="facts-tab-panel">
        {activeTab === 'summary' ? (
          <div className="facts-summary-grid">
            <MetricCard label="NOVA group" value={product.novaGroup ? `Group ${product.novaGroup}` : undefined} detail="How processed the food is: 1 is least processed, 4 is most." />
            <MetricCard label="Eco-Score" value={product.ecoScore} detail="A simple A–E rating of the product's environmental impact." />
            <MetricCard label="Quantity" value={product.quantityGrams ? `${product.quantityGrams} g` : undefined} detail="The amount of food in the pack." />
            <MetricCard label="Additives" value={product.additives?.length} detail="Added substances used for colour, texture, taste, or shelf life." />
            <article className="facts-mini-card facts-mini-card--wide">
              <Box size={17} aria-hidden="true" />
              <div>
                <h3>Origins & packaging</h3><p className="facts-mini-card__description">Where the source says it comes from and what it is wrapped in.</p>
                <p>{product.manufacturingPlaces?.join(', ') || product.origins?.join(', ') || product.countries?.join(', ') || 'Not reported by Open Food Facts.'}</p>
                <span>{product.packaging?.map((item) => item.label).join(', ') || 'Packaging not reported'}</span>
              </div>
            </article>
          </div>
        ) : null}

        {activeTab === 'ingredients' ? (
          <div className="facts-reading-card">
            <div className="facts-reading-card__heading"><ListTree size={18} aria-hidden="true" /><div><h3>Ingredient list</h3><p>As supplied by the source record.</p></div></div>
            <p className="facts-reading-copy">{product.ingredientsText || 'Not reported by Open Food Facts.'}</p>
            <div className="additive-list"><span>Listed additives</span><p>{product.additives?.length ? product.additives.join(' · ') : 'Not reported by Open Food Facts.'}</p></div>
          </div>
        ) : null}

        {activeTab === 'nutrition' ? (
          <div className="facts-reading-card">
            <div className="facts-reading-card__heading"><Sparkles size={18} aria-hidden="true" /><div><h3>Nutrition per 100 g</h3><p>Reported values stay separate from estimates.</p></div></div>
            {Object.keys(product.nutrients).length ? <dl className="nutrient-list nutrient-list--compact">{Object.entries(product.nutrients).map(([name, nutrient]) => <div key={name}><dt>{name}</dt><dd>{nutrient.value} {nutrient.unit}</dd></div>)}{Object.entries(product.estimatedNutrients || {}).map(([name, nutrient]) => <div key={name} className="nutrient-estimate"><dt>{name} <small>Modeled baseline</small></dt><dd>{nutrient.value} {nutrient.unit}</dd></div>)}</dl> : <p className="facts-reading-copy">Not reported by Open Food Facts.</p>}
            {micronutrientStatus === 'loading' ? <p className="estimate-note">Calculating missing micronutrient baselines…</p> : micronutrientStatus === 'ready' ? <p className="estimate-note">Modeled baselines are separate from source facts and only inform the curve.</p> : micronutrientStatus === 'unavailable' && !Object.keys(product.estimatedNutrients || {}).length ? <p className="estimate-note estimate-note--unavailable">A modeled baseline was unavailable; missing source values remain unavailable.</p> : null}
          </div>
        ) : null}

        {activeTab === 'source' ? <div className="facts-source-wrap"><FileText size={18} aria-hidden="true" /><SourcePanel product={product} missingFields={missingFields} /></div> : null}
      </div>
    </section>
  )
}
