import { ArrowDownRight, ArrowLeft, ArrowUpRight, Leaf, Menu, ScanLine, Search, X } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { fetchProduct, ProductNotFoundError } from './api/openFoodFacts'
import { findMissingFields } from './api/normalizeProduct'
import { DataState } from './components/DataState'
import { MetricCard } from './components/MetricCard'
import { SourcePanel } from './components/SourcePanel'
import { presets } from './config/presets'
import { validateBarcode } from './lib/barcode'
import type { LookupState } from './types/product'

const journey = [
  { index: '01', title: 'Scan the surface', copy: 'Start with the barcode already printed on the pack.' },
  { index: '02', title: 'Reveal the record', copy: 'Bring together the product facts that are publicly available.' },
  { index: '03', title: 'Make the journey visible', copy: 'Explore transport conditions as transparent, clearly labeled scenarios.' },
]

function BrandMark() { return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span> }

function Footer() { return <footer className="site-footer"><div className="brand brand--static"><BrandMark /><span>sork.</span></div><p>Food, made more legible.</p><span>© {new Date().getFullYear()}</span></footer> }

function Landing({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }
  return <main>
    <header className="site-header">
      <button className="brand" onClick={() => scrollTo('top')} aria-label="Back to top"><BrandMark /><span>sork.</span></button>
      <nav className={menuOpen ? 'nav nav--open' : 'nav'} aria-label="Main navigation">
        <button onClick={() => scrollTo('how-it-works')}>How it works</button><button onClick={() => scrollTo('principles')}>Why it matters</button>
        <button className="nav-cta" onClick={onOpenDashboard}>Explore a product <ArrowUpRight size={15} /></button>
      </nav>
      <button className="menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
    </header>
    <section className="hero" id="top" aria-labelledby="hero-title"><div className="hero-copy"><p className="hero-index">Food, made more legible.</p><h1 id="hero-title">There is more to a meal than its label.</h1><p className="hero-intro">sork. traces the signals behind a product—what it contains, how it is packaged, and the journey it may have taken to reach you.</p><button className="primary-button" onClick={onOpenDashboard}>Explore a product <ArrowDownRight size={18} /></button></div><div className="signal-frame" aria-label="An abstract trace from field to fork"><div className="signal-frame__topline"><span>Trace / 01</span><span>Food system signal</span></div><div className="signal-core"><div className="scan-orbit"><ScanLine size={27} strokeWidth={1.35} /></div><svg className="trace-line" viewBox="0 0 430 230" role="img" aria-label="A route becoming clearer"><path d="M25 182C85 182 98 71 166 71c69 0 70 104 136 104 54 0 62-65 102-65" /><circle cx="25" cy="182" r="4" /><circle cx="166" cy="71" r="4" /><circle cx="302" cy="175" r="4" /><circle cx="404" cy="110" r="5" /></svg><div className="trace-copy trace-copy--left"><Leaf size={14} /> origin</div><div className="trace-copy trace-copy--right">your shelf</div></div><p className="signal-caption">A barcode is not the full story. It is a place to begin.</p></div></section>
    <section className="journey-section" id="how-it-works" aria-labelledby="journey-title"><div className="section-heading"><p>How it works</p><h2 id="journey-title">A calmer way to ask better questions about food.</h2></div><div className="journey-list">{journey.map((item) => <article className="journey-row" key={item.index}><span className="journey-index">{item.index}</span><h3>{item.title}</h3><p>{item.copy}</p><ArrowUpRight className="journey-arrow" size={19} /></article>)}</div></section>
    <section className="principles-section" id="principles" aria-labelledby="principles-title"><div className="principles-quote"><p className="section-label">Built around uncertainty</p><h2 id="principles-title">Clarity does not mean pretending to know everything.</h2></div><div className="principles-panel"><div><span className="panel-number">01</span><h3>Facts stay factual.</h3><p>Source data is shown as source data, with gaps made visible instead of silently filled.</p></div><div><span className="panel-number">02</span><h3>Scenarios stay honest.</h3><p>Any estimate is framed as a model, shaped by clear assumptions you can inspect.</p></div></div></section>
    <section className="next-section" id="next" aria-labelledby="next-title"><div><p className="section-label">The first chapter</p><h2 id="next-title">The product journey is coming into view.</h2></div><div className="next-action"><p>The product explorer is now ready for its first live barcode lookups.</p><button className="outline-button" onClick={onOpenDashboard}>Open explorer <ArrowUpRight size={17} /></button></div></section><Footer />
  </main>
}

function Dashboard({ onBack }: { onBack: () => void }) {
  const [barcodeInput, setBarcodeInput] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' })
  const controllerRef = useRef<AbortController | null>(null)
  useEffect(() => () => controllerRef.current?.abort(), [])

  const lookupBarcode = async (value: string) => {
    const validation = validateBarcode(value)
    setBarcodeInput(validation.barcode)
    if (!validation.valid) { setValidationMessage(validation.message); return }
    setValidationMessage(''); controllerRef.current?.abort()
    const controller = new AbortController(); controllerRef.current = controller
    setLookup({ status: 'loading', barcode: validation.barcode })
    try {
      const product = await fetchProduct(validation.barcode, controller.signal)
      setLookup({ status: 'success', product, missingFields: findMissingFields(product) })
    } catch (error) {
      if (controller.signal.aborted) return
      if (error instanceof ProductNotFoundError) setLookup({ status: 'not-found', barcode: validation.barcode })
      else setLookup({ status: 'error', message: error instanceof Error ? error.message : 'The lookup failed. Please try again.', retryable: true })
    }
  }
  const submit = (event: FormEvent) => { event.preventDefault(); void lookupBarcode(barcodeInput) }
  const choosePreset = (barcode: string) => { setBarcodeInput(barcode); void lookupBarcode(barcode) }
  return <main className="dashboard-shell">
    <header className="site-header dashboard-header"><button className="brand" onClick={onBack} aria-label="Return to landing page"><BrandMark /><span>sork.</span></button><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to landing</button></header>
    <section className="dashboard-hero" aria-labelledby="dashboard-title"><p className="hero-index">Product explorer / Phase 2</p><h1 id="dashboard-title">Start with what the product record can tell us.</h1><p>Look up a packaged food by its EAN-13 barcode. The dashboard displays live, source-attributed facts without filling in gaps.</p></section>
    <section className="lookup-panel" aria-labelledby="lookup-title"><div><p className="eyebrow">Live barcode lookup</p><h2 id="lookup-title">Reveal the record.</h2></div><form onSubmit={submit} noValidate><label htmlFor="barcode">EAN-13 barcode</label><div className="lookup-control"><input id="barcode" inputMode="numeric" autoComplete="off" value={barcodeInput} onChange={(event) => { setBarcodeInput(event.target.value); setValidationMessage('') }} placeholder="e.g. 8906009532363" aria-describedby="barcode-help barcode-error" /><button className="primary-button" type="submit" disabled={lookup.status === 'loading'}>{lookup.status === 'loading' ? 'Looking up…' : <>Look up <Search size={16} /></>}</button></div><p id="barcode-help" className="field-help">Numbers only; spaces and hyphens are accepted.</p>{validationMessage ? <p id="barcode-error" className="field-error" role="alert">{validationMessage}</p> : null}</form><div className="preset-row"><span>Try a documented barcode</span>{presets.map((preset) => <button type="button" key={preset.barcode} onClick={() => choosePreset(preset.barcode)}>{preset.label}</button>)}</div></section>
    {lookup.status === 'success' ? <ProductDashboard lookup={lookup} /> : <section className="dashboard-empty"><DataState type={lookup.status} message={lookup.status === 'error' ? lookup.message : undefined} onRetry={() => void lookupBarcode(barcodeInput)} /></section>}
    <section className="scenario-lock" aria-labelledby="scenario-title"><div><p className="eyebrow">Next phase</p><h2 id="scenario-title">Journey scenarios are not calculated yet.</h2></div><p>Phase 2 only presents source facts. Transport, comparison, and impact estimates stay unavailable until their assumptions and model are implemented in Phase 3.</p></section><Footer />
  </main>
}

function ProductDashboard({ lookup }: { lookup: Extract<LookupState, { status: 'success' }> }) {
  const { product, missingFields } = lookup
  const partial = missingFields.length > 0
  return <section className="product-dashboard" aria-labelledby="product-title"><div className="product-summary"><div><p className="eyebrow">Live product record</p><h2 id="product-title">{product.name || 'Unnamed product'}</h2><p className="product-brand">{product.brands?.join(' · ') || 'Brand not reported by Open Food Facts.'}</p></div><span className={partial ? 'live-badge live-badge--partial' : 'live-badge'}>{partial ? 'Partial source record' : 'Source-reported facts'}</span></div><div className="metric-grid"><MetricCard label="NOVA group" value={product.novaGroup ? `Group ${product.novaGroup}` : undefined} /><MetricCard label="Eco-Score" value={product.ecoScore} /><MetricCard label="Quantity" value={product.quantityGrams ? `${product.quantityGrams} g` : undefined} /><MetricCard label="Additives" value={product.additives?.length} /></div><div className="facts-layout"><div className="fact-stack"><article className="fact-card"><p className="eyebrow">Ingredients</p><h3>What is listed</h3><p>{product.ingredientsText || 'Not reported by Open Food Facts.'}</p></article><article className="fact-card"><p className="eyebrow">Origins & packaging</p><div className="fact-pairs"><div><h3>Origins</h3><p>{product.origins?.join(', ') || 'Not reported by Open Food Facts.'}</p></div><div><h3>Countries</h3><p>{product.countries?.join(', ') || 'Not reported by Open Food Facts.'}</p></div><div><h3>Packaging</h3><p>{product.packaging?.map((item) => item.label).join(', ') || 'Not reported by Open Food Facts.'}</p></div></div></article><article className="fact-card"><p className="eyebrow">Nutrition per 100 g</p><h3>Reported nutrients</h3>{Object.keys(product.nutrients).length ? <dl className="nutrient-list">{Object.entries(product.nutrients).map(([name, nutrient]) => <div key={name}><dt>{name}</dt><dd>{nutrient.value} {nutrient.unit}</dd></div>)}</dl> : <p>Not reported by Open Food Facts.</p>}</article></div><SourcePanel product={product} missingFields={missingFields} /></div></section>
}

function App() {
  const [route, setRoute] = useState(() => window.location.pathname === '/dashboard' ? 'dashboard' : 'landing')
  useEffect(() => { const handlePopState = () => setRoute(window.location.pathname === '/dashboard' ? 'dashboard' : 'landing'); window.addEventListener('popstate', handlePopState); return () => window.removeEventListener('popstate', handlePopState) }, [])
  const openDashboard = () => { window.history.pushState({}, '', '/dashboard'); setRoute('dashboard') }
  const openLanding = () => { window.history.pushState({}, '', '/'); setRoute('landing') }
  return route === 'dashboard' ? <Dashboard onBack={openLanding} /> : <Landing onOpenDashboard={openDashboard} />
}

export default App
