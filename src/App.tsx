import { ArrowDownRight, ArrowLeft, ArrowUpRight, Camera, Leaf, Menu, ScanLine, Search, ScanLine as ScanIcon, X } from 'lucide-react'
import { FormEvent, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { fetchProduct, ProductNotFoundError } from './api/openFoodFacts'
import { findMissingFields } from './api/normalizeProduct'
import { estimateMissingMicronutrients } from './api/geminiEstimate'
import { BarcodeCameraScanner } from './components/BarcodeCameraScanner'
import { DataState } from './components/DataState'
import { ProductFactsTabs } from './components/ProductFactsTabs'
import { ScenarioControls } from './components/ScenarioControls'
import { presets } from './config/presets'
import { validateBarcode } from './lib/barcode'
import { resolveAutomaticRoute, resolveRoute, type AutomaticOrigin } from './model/route'
import type { LookupState, ProductFacts } from './types/product'
import type { Availability, ResolvedRoute, ScenarioInput } from './types/scenario'

const ScenarioVisuals = lazy(() => import('./components/ScenarioVisuals').then((module) => ({ default: module.ScenarioVisuals })))

const journey = [
  { index: '01', title: 'Scan the surface', copy: 'Start with the barcode already printed on the pack.' },
  { index: '02', title: 'Reveal the record', copy: 'Bring together the product facts that are publicly available.' },
  { index: '03', title: 'Make the journey visible', copy: 'Explore transport conditions as transparent, clearly labeled scenarios.' },
]

const defaultScenario: ScenarioInput = { temperatureC: 28, transitHours: 24, transportMode: 'ambient-truck' }
const initialRoute: Availability<ResolvedRoute> = { status: 'unavailable', reason: 'Add both an origin and destination to display a route scenario.' }

function BrandMark() { return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span> }
function Footer() { return <footer className="site-footer"><div className="brand brand--static"><BrandMark /><span>sork.</span></div><p>Food, made more legible.</p><span>© {new Date().getFullYear()}</span></footer> }

function Landing({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }
  return <main>
    <header className="site-header"><button className="brand" onClick={() => scrollTo('top')} aria-label="Back to top"><BrandMark /><span>sork.</span></button><nav className={menuOpen ? 'nav nav--open' : 'nav'} aria-label="Main navigation"><button onClick={() => scrollTo('how-it-works')}>How it works</button><button onClick={() => scrollTo('principles')}>Why it matters</button><button className="nav-cta" onClick={onOpenDashboard}>Explore a product <ArrowUpRight size={15} /></button></nav><button className="menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></header>
    <section className="hero" id="top" aria-labelledby="hero-title"><div className="hero-copy"><p className="hero-index">Food, made more legible.</p><h1 id="hero-title">There is more to a meal than its label.</h1><p className="hero-intro">sork. traces the signals behind a product—what it contains, how it is packaged, and the journey it may have taken to reach you.</p><button className="primary-button" onClick={onOpenDashboard}>Explore a product <ArrowDownRight size={18} /></button></div><div className="signal-frame" aria-label="An abstract trace from field to fork"><div className="signal-frame__topline"><span>Trace / 01</span><span>Food system signal</span></div><div className="signal-core"><div className="scan-orbit"><ScanLine size={27} strokeWidth={1.35} /></div><svg className="trace-line" viewBox="0 0 430 230" role="img" aria-label="A route becoming clearer"><path d="M25 182C85 182 98 71 166 71c69 0 70 104 136 104 54 0 62-65 102-65" /><circle cx="25" cy="182" r="4" /><circle cx="166" cy="71" r="4" /><circle cx="302" cy="175" r="4" /><circle cx="404" cy="110" r="5" /></svg><div className="trace-copy trace-copy--left"><Leaf size={14} /> origin</div><div className="trace-copy trace-copy--right">your shelf</div></div><p className="signal-caption">A barcode is not the full story. It is a place to begin.</p></div></section>
    <section className="journey-section" id="how-it-works" aria-labelledby="journey-title"><div className="section-heading"><p>How it works</p><h2 id="journey-title">A calmer way to ask better questions about food.</h2></div><div className="journey-list">{journey.map((item) => <article className="journey-row" key={item.index}><span className="journey-index">{item.index}</span><h3>{item.title}</h3><p>{item.copy}</p><ArrowUpRight className="journey-arrow" size={19} /></article>)}</div></section>
    <section className="principles-section" id="principles" aria-labelledby="principles-title"><div className="principles-quote"><p className="section-label">Built around uncertainty</p><h2 id="principles-title">Clarity does not mean pretending to know everything.</h2></div><div className="principles-panel"><div><span className="panel-number">01</span><h3>Facts stay factual.</h3><p>Source data is shown as source data, with gaps made visible instead of silently filled.</p></div><div><span className="panel-number">02</span><h3>Scenarios stay honest.</h3><p>Any estimate is framed as a model, shaped by clear assumptions you can inspect.</p></div></div></section>
    <section className="next-section" id="next" aria-labelledby="next-title"><div><p className="section-label">The first chapter</p><h2 id="next-title">The product journey is coming into view.</h2></div><div className="next-action"><p>The product explorer is now ready for live barcode lookups and scenario exploration.</p><button className="outline-button" onClick={onOpenDashboard}>Open explorer <ArrowUpRight size={17} /></button></div></section><Footer />
  </main>
}

function Dashboard({ onBack }: { onBack: () => void }) {
  const [barcodeInput, setBarcodeInput] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' })
  const [scenario, setScenario] = useState<ScenarioInput>(defaultScenario)
  const [route, setRoute] = useState<Availability<ResolvedRoute>>(initialRoute)
  const [routeLoading, setRouteLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [micronutrientStatus, setMicronutrientStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle')
  const controllerRef = useRef<AbortController | null>(null)
  const routeControllerRef = useRef<AbortController | null>(null)
  const automaticRouteControllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => { controllerRef.current?.abort(); routeControllerRef.current?.abort(); automaticRouteControllerRef.current?.abort() }, [])
  const getAutomaticOrigin = (product: ProductFacts): AutomaticOrigin | undefined => {
    if (product.manufacturingPlaces?.[0]) return { query: product.manufacturingPlaces[0], kind: 'manufacturing-place' }
    if (product.countries?.[0]) return { query: product.countries[0], kind: 'country-proxy' }
    return undefined
  }
  const applyAutomaticRoute = useCallback(async (product: ProductFacts) => {
    automaticRouteControllerRef.current?.abort()
    const controller = new AbortController()
    automaticRouteControllerRef.current = controller
    setRouteLoading(true)
    setRoute({ status: 'unavailable', reason: 'Resolving a source-reported origin, your device location, and live route conditions…' })
    try {
      const resolvedRoute = await resolveAutomaticRoute(getAutomaticOrigin(product), controller.signal)
      if (controller.signal.aborted) return
      setRoute(resolvedRoute)
      if (resolvedRoute.status === 'available') {
        setScenario((current) => ({
          ...current,
          origin: resolvedRoute.value.origin.label,
          destination: resolvedRoute.value.destination.label,
          distanceKm: resolvedRoute.value.distanceKm === undefined ? current.distanceKm : Number(resolvedRoute.value.distanceKm.toFixed(1)),
          transitHours: resolvedRoute.value.durationHours === undefined ? current.transitHours : Math.min(48, Math.max(1, Math.round(resolvedRoute.value.durationHours))),
          temperatureC: resolvedRoute.value.weather ? Math.round(resolvedRoute.value.weather.averageTemperatureC) : current.temperatureC,
        }))
      }
    } catch {
      if (!controller.signal.aborted) setRoute(initialRoute)
    } finally {
      if (!controller.signal.aborted) setRouteLoading(false)
    }
  }, [])
  const lookupBarcode = useCallback(async (value: string) => {
    const validation = validateBarcode(value)
    setBarcodeInput(validation.barcode)
    if (!validation.valid) { setValidationMessage(validation.message); return }
    setValidationMessage(''); controllerRef.current?.abort()
    const controller = new AbortController(); controllerRef.current = controller
    setLookup({ status: 'loading', barcode: validation.barcode })
    try {
      const product = await fetchProduct(validation.barcode, controller.signal)
      setLookup({ status: 'success', product, missingFields: findMissingFields(product) })
      setMicronutrientStatus('loading')
      void estimateMissingMicronutrients(product, controller.signal).then((estimatedNutrients) => {
        if (controller.signal.aborted) return
        setLookup({ status: 'success', product: { ...product, estimatedNutrients }, missingFields: findMissingFields(product) })
        setMicronutrientStatus(Object.keys(estimatedNutrients).length ? 'ready' : 'unavailable')
      }).catch(() => { if (!controller.signal.aborted) setMicronutrientStatus('unavailable') })
      setScenario((current) => current.massKg ? current : { ...current, massKg: product.quantityGrams ? product.quantityGrams / 1000 : undefined })
      void applyAutomaticRoute(product)
    } catch (error) {
      if (controller.signal.aborted) return
      if (error instanceof ProductNotFoundError) setLookup({ status: 'not-found', barcode: validation.barcode })
      else setLookup({ status: 'error', message: error instanceof Error ? error.message : 'The lookup failed. Please try again.', retryable: true })
    }
  }, [applyAutomaticRoute])
  const submit = (event: FormEvent) => { event.preventDefault(); void lookupBarcode(barcodeInput) }
  const choosePreset = (barcode: string) => { setBarcodeInput(barcode); void lookupBarcode(barcode) }
  const handleScenarioChange = (patch: Partial<ScenarioInput>) => { setScenario((current) => ({ ...current, ...patch })); if ('origin' in patch || 'destination' in patch) setRoute(initialRoute) }
  const handleResolveRoute = async () => {
    routeControllerRef.current?.abort(); const controller = new AbortController(); routeControllerRef.current = controller; setRouteLoading(true)
    const nextRoute = await resolveRoute(scenario.origin, scenario.destination, controller.signal)
    if (!controller.signal.aborted) { setRoute(nextRoute); setRouteLoading(false) }
  }
  const handleDetected = (barcode: string) => { setScannerOpen(false); void lookupBarcode(barcode) }
  return <main className="dashboard-shell">
    <header className="site-header dashboard-header"><button className="brand" onClick={onBack} aria-label="Return to landing page"><BrandMark /><span>sork.</span></button><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to landing</button></header>
    <section className="scan-stage" aria-labelledby="dashboard-title">
      <div className="scan-stage__copy"><h1 id="dashboard-title">Live barcode lookup</h1><p>Scan a pack or enter its barcode to explore the journey behind it.</p></div>
      <div className="scan-stage__grid">
        <button className="camera-frame" type="button" onClick={() => setScannerOpen(true)} aria-label="Scan barcode with camera">
          <span className="camera-frame__corner camera-frame__corner--top-left" /><span className="camera-frame__corner camera-frame__corner--top-right" /><span className="camera-frame__corner camera-frame__corner--bottom-left" /><span className="camera-frame__corner camera-frame__corner--bottom-right" />
          <span className="camera-frame__icon"><Camera size={30} strokeWidth={1.4} /></span><strong>Scan barcode</strong><small>Point your camera at the pack</small>
        </button>
        <form className="barcode-entry" onSubmit={submit} noValidate><label htmlFor="barcode">Or enter product barcode</label><div className="lookup-control"><input id="barcode" inputMode="numeric" autoComplete="off" value={barcodeInput} onChange={(event) => { setBarcodeInput(event.target.value); setValidationMessage('') }} placeholder="8906009532363" aria-describedby="barcode-help barcode-error" /><button className="primary-button" type="submit" disabled={lookup.status === 'loading'}>{lookup.status === 'loading' ? 'Looking up…' : <>Look up <Search size={16} /></>}</button></div><p id="barcode-help" className="field-help">Spaces and hyphens are accepted.</p>{validationMessage ? <p id="barcode-error" className="field-error" role="alert">{validationMessage}</p> : null}<div className="preset-row"><span>Try a demo pack</span>{presets.map((preset) => <button type="button" key={preset.barcode} onClick={() => choosePreset(preset.barcode)}>{preset.label}</button>)}</div></form>
      </div>
    </section>
    {lookup.status === 'success' ? <ProductDashboard product={lookup.product} micronutrientStatus={micronutrientStatus} missingFields={lookup.missingFields} scenario={scenario} route={route} routeLoading={routeLoading} onScenarioChange={handleScenarioChange} onResolveRoute={handleResolveRoute} onRetryAutomaticRoute={() => void applyAutomaticRoute(lookup.product)} /> : <section className="dashboard-empty"><DataState type={lookup.status} message={lookup.status === 'error' ? lookup.message : undefined} onRetry={() => void lookupBarcode(barcodeInput)} /></section>}
    {scannerOpen ? <BarcodeCameraScanner onDetected={handleDetected} onClose={() => setScannerOpen(false)} /> : null}<Footer />
  </main>
}

type ProductDashboardProps = { product: ProductFacts; micronutrientStatus: 'idle' | 'loading' | 'ready' | 'unavailable'; missingFields: string[]; scenario: ScenarioInput; route: Availability<ResolvedRoute>; routeLoading: boolean; onScenarioChange: (patch: Partial<ScenarioInput>) => void; onResolveRoute: () => void; onRetryAutomaticRoute: () => void }
function ProductDashboard({ product, micronutrientStatus, missingFields, scenario, route, routeLoading, onScenarioChange, onResolveRoute, onRetryAutomaticRoute }: ProductDashboardProps) {
  const partial = missingFields.length > 0
  return <section className="product-dashboard" aria-labelledby="product-title">
    <div className="journey-context"><span className="journey-context__icon"><ScanIcon size={16} /></span><div><h2 id="product-title">{product.name || 'Unnamed product'}</h2><p>{product.brands?.join(' · ') || 'Brand not reported by Open Food Facts.'}</p></div><span className={partial ? 'live-badge live-badge--partial' : 'live-badge'}>{partial ? 'Partial source record' : 'Source-reported facts'}</span></div>
    <ScenarioControls scenario={scenario} onChange={onScenarioChange} onResolveRoute={onResolveRoute} routeLoading={routeLoading} automaticRoute={route} onRetryAutomaticRoute={onRetryAutomaticRoute} />
    <Suspense fallback={<div className="scenario-loading" role="status">Preparing scenario workspace…</div>}><ScenarioVisuals product={product} scenario={scenario} route={route} /></Suspense>
    <ProductFactsTabs product={product} missingFields={missingFields} micronutrientStatus={micronutrientStatus} />
  </section>
}

function App() {
  const [route, setRoute] = useState(() => window.location.pathname === '/dashboard' ? 'dashboard' : 'landing')
  useEffect(() => { const handlePopState = () => setRoute(window.location.pathname === '/dashboard' ? 'dashboard' : 'landing'); window.addEventListener('popstate', handlePopState); return () => window.removeEventListener('popstate', handlePopState) }, [])
  const openDashboard = () => { window.history.pushState({}, '', '/dashboard'); setRoute('dashboard') }
  const openLanding = () => { window.history.pushState({}, '', '/'); setRoute('landing') }
  return route === 'dashboard' ? <Dashboard onBack={openLanding} /> : <Landing onOpenDashboard={openDashboard} />
}

export default App
