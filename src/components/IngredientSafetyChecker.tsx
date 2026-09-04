import { AlertTriangle, CheckCircle2, FlaskConical, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { checkIngredientSafety, type IngredientSafetyFinding } from '../api/ingredientSafety'

type Props = { initialIngredients?: string }
const splitIngredients = (value: string) => value.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean)
const statusLabel = (status: string) => status === 'banned' ? 'Banned' : status === 'restricted' ? 'Restricted' : status === 'unclear' ? 'Unclear' : 'Allowed'

function StatusBadge({ status }: { status: string }) { return <span className={`safety-badge safety-badge--${status}`}>{statusLabel(status)}</span> }

export function IngredientSafetyChecker({ initialIngredients = '' }: Props) {
  const [input, setInput] = useState(initialIngredients)
  const [findings, setFindings] = useState<IngredientSafetyFinding[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => { if (initialIngredients && !input) setInput(initialIngredients) }, [initialIngredients, input])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const ingredients = splitIngredients(input)
    if (!ingredients.length) { setError('Add an ingredient list first.'); return }
    setError(''); setStatus('loading')
    try { setFindings(await checkIngredientSafety(ingredients)); setStatus('ready') }
    catch (reason) { setStatus('error'); setError(reason instanceof Error ? reason.message : 'The ingredient check failed.') }
  }

  const risky = findings.filter((item) => item.europeStatus === 'banned' || item.europeStatus === 'restricted' || item.indiaStatus === 'restricted' || item.europeStatus === 'unclear' || item.indiaStatus === 'unclear')
  return <section className="ingredient-safety" aria-labelledby="ingredient-safety-title">
    <div className="ingredient-safety__heading"><div><p className="section-kicker">Food safety comparison</p><h2 id="ingredient-safety-title">Check ingredients across Europe and India.</h2><p>Paste a label ingredient list. Each item is checked against current public regulatory information and explained in plain English.</p></div><FlaskConical size={24} aria-hidden="true" /></div>
    <form className="ingredient-safety__form" onSubmit={handleSubmit}><label htmlFor="ingredient-list">Ingredients</label><textarea id="ingredient-list" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Example: tartrazine, sugar, citric acid" rows={4} /><div className="ingredient-safety__form-footer"><span>Separate ingredients with commas, semicolons, or new lines.</span><button className="primary-button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Checking…' : <>Check ingredients <Search size={16} /></>}</button></div>{error ? <p className="field-error" role="alert">{error}</p> : null}</form>
    {status === 'ready' ? risky.length ? <div className="safety-results" aria-live="polite"><div className="safety-results__intro"><div><p className="section-kicker">Results</p><h3>{risky.length} item{risky.length === 1 ? '' : 's'} need attention</h3></div><AlertTriangle size={20} /></div>{findings.map((item) => <article className={`safety-result safety-result--${item.europeStatus === 'banned' ? 'banned' : item.europeStatus === 'restricted' || item.indiaStatus === 'restricted' ? 'restricted' : 'clear'}`} key={`${item.ingredient}-${item.europeStatus}`}><div className="safety-result__top"><h4>{item.ingredient}</h4>{item.ruleDifference === 'yes' ? <span className="difference-badge">Different rules</span> : null}</div><div className="safety-result__statuses"><div><span>Status in Europe</span><StatusBadge status={item.europeStatus} /></div><div><span>Status in India</span><StatusBadge status={item.indiaStatus} /></div></div><p><strong>Rule difference:</strong> {item.ruleDifference === 'yes' ? 'Yes — banned in Europe but allowed in India.' : 'No'}</p><p><strong>Health concern:</strong> {item.healthConcern}</p>{item.note ? <small>{item.note}</small> : null}</article>)}</div> : <div className="safety-clear" aria-live="polite"><CheckCircle2 size={21} /><p>All listed ingredients are widely approved in the reviewed rules. Always check the product category and serving limits.</p></div> : null}
    <p className="ingredient-safety__disclaimer">Informational screening only. Rules can vary by food category, concentration, labeling, and date; verify important decisions with the relevant EU and FSSAI regulations.</p>
  </section>
}
