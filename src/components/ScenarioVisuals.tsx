import { AlertTriangle, BarChart3, Leaf, Map, ThermometerSun, Truck } from 'lucide-react'
import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { modelConfig, transportModeLabels } from '../config/modelConfig'
import { analyzeIngredients } from '../model/ingredients'
import { calculateDecay } from '../model/decay'
import { calculateEmissions } from '../model/emissions'
import type { ProductFacts } from '../types/product'
import type { Availability, ResolvedRoute, ScenarioInput } from '../types/scenario'
import { RouteMap } from './RouteMap'

type Props = {
  product: ProductFacts
  scenario: ScenarioInput
  route: Availability<ResolvedRoute>
}

function ScenarioCard({ icon, label, value, detail, unavailable }: { icon: React.ReactNode; label: string; value?: string; detail: string; unavailable?: boolean }) {
  return (
    <article className={unavailable ? 'scenario-card scenario-card--unavailable' : 'scenario-card'}>
      <div className="scenario-card__label">{icon}<span>{label}</span></div>
      <strong>{value || 'Unavailable'}</strong>
      <p>{detail}</p>
    </article>
  )
}

const formatDate = (date?: string) => date ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date)) : undefined

export function ScenarioVisuals({ product, scenario, route }: Props) {
  const vitamin = useMemo(() => Object.keys(product.nutrients).find((nutrient) => nutrient.startsWith('Vitamin')), [product.nutrients])
  const decay = useMemo(() => calculateDecay(vitamin, scenario), [vitamin, scenario])
  const emissions = useMemo(() => calculateEmissions(scenario), [scenario])
  const ingredients = useMemo(() => analyzeIngredients(product.ingredientsText, product.additives), [product.ingredientsText, product.additives])
  const packaging = product.packaging?.map((item) => item.label).join(', ')
  const threshold = decay.status === 'available' ? formatDate(decay.value.thresholdDate) : undefined

  return (
    <section className="scenario-dashboard" aria-labelledby="scenario-results-title">
      <div className="scenario-dashboard__heading">
        <div>
          <p className="eyebrow">Modeled scenario</p>
          <h2 id="scenario-results-title">What changes under these conditions.</h2>
        </div>
        <p>These are transparent estimates, never lab measurements or product facts.</p>
      </div>

      <div className="scenario-grid">
        <ScenarioCard
          icon={<ThermometerSun size={16} />}
          label="Nutrient availability"
          value={decay.status === 'available' ? `${decay.value.remainingPercent}% remaining` : undefined}
          detail={decay.status === 'available'
            ? `${decay.value.lostPercent}% modeled ${decay.value.nutrient} loss in ${scenario.transitHours} hours.${threshold ? ` Threshold date: ${threshold}.` : ' Add printed expiry to compare a threshold date.'}`
            : decay.reason}
          unavailable={decay.status === 'unavailable'}
        />
        <ScenarioCard
          icon={<Truck size={16} />}
          label="Freight emissions"
          value={emissions.status === 'available' ? `${emissions.value.kgCo2e} kg CO₂e` : undefined}
          detail={emissions.status === 'available'
            ? `${emissions.value.modeLabel}; freight only, using ${emissions.value.factorKgCo2ePerTonneKm} kg CO₂e / tonne-km.`
            : emissions.reason}
          unavailable={emissions.status === 'unavailable'}
        />
        <ScenarioCard
          icon={<BarChart3 size={16} />}
          label="Processing & additives"
          value={product.novaGroup ? `NOVA ${product.novaGroup}` : undefined}
          detail={ingredients.additiveCodes.length
            ? `Listed additive codes: ${ingredients.additiveCodes.join(', ')}.${ingredients.sugarAliases.length ? ` Sugar terms listed: ${ingredients.sugarAliases.join(', ')}.` : ''}`
            : ingredients.sugarAliases.length ? `Sugar terms listed: ${ingredients.sugarAliases.join(', ')}.` : 'No source-listed additive codes or sugar aliases were detected.'}
          unavailable={!product.novaGroup && !ingredients.additiveCodes.length && !ingredients.sugarAliases.length}
        />
      </div>

      <div className="scenario-visual-grid">
        <article className="scenario-visual-card decay-chart-card">
          <div className="visual-card-heading"><div><p className="eyebrow">0–48 hour curve</p><h3>Modeled availability curve</h3></div><span>{transportModeLabels[scenario.transportMode]}</span></div>
          {decay.status === 'available' ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={decay.value.series} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#263029" strokeDasharray="2 6" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: '#8e988f', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} interval={11} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#8e988f', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} width={38} />
                  <Tooltip cursor={{ stroke: '#566057', strokeDasharray: '4 4' }} contentStyle={{ background: '#151b16', border: '1px solid #39433a', borderRadius: '10px', color: '#f4f5ef' }} labelFormatter={(value) => `${value} hours`} formatter={(value) => [`${value}%`, 'Remaining']} />
                  <Line type="monotone" dataKey="remainingPercent" stroke={scenario.transportMode === 'cold-chain-reefer' ? '#79c7ff' : '#c9ff5b'} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="visual-unavailable"><AlertTriangle size={18} /><p>{decay.reason}</p></div>}
          <p className="visual-note">Q10 = {modelConfig.q10}; reference temperature = {modelConfig.referenceTemperatureC}°C; baseline rate = {modelConfig.baselineLossPerHour}/hour.</p>
        </article>

        <article className="scenario-visual-card route-card">
          <div className="visual-card-heading"><div><p className="eyebrow">Route scenario</p><h3>Origin to destination</h3></div><Map size={18} /></div>
          {route.status === 'available'
            ? <RouteMap route={route.value} transportMode={scenario.transportMode} />
            : <div className="visual-unavailable"><Leaf size={18} /><p>{route.reason}</p></div>}
          <p className="visual-note">{route.status === 'available' && route.value.routingKind === 'driving'
            ? `${route.value.distanceKm?.toFixed(1)} km · ${route.value.durationHours?.toFixed(1)} h driving route. ${route.value.originKind === 'country-proxy' ? 'Origin is a source-reported country proxy because no manufacturing place was reported. ' : ''}${route.value.weather ? `Current weather across ${route.value.weather.sampleCount} route points: ${route.value.weather.averageTemperatureC.toFixed(1)}°C average (${route.value.weather.minimumTemperatureC.toFixed(1)}–${route.value.weather.maximumTemperatureC.toFixed(1)}°C).` : 'Current route weather was unavailable.'}`
            : 'Manual map paths are direct-line scenarios for orientation, not road-routing claims. Place names are resolved by OpenStreetMap Nominatim.'}</p>
        </article>
      </div>

      <section className="assumptions-panel" aria-label="Model assumptions">
        <div><p className="eyebrow">Assumptions / model {modelConfig.version}</p><h3>Read the boundary before the number.</h3></div>
        <p>Cold-chain mode applies the demo assumption of 80% lower modeled nutrient loss and 40% higher freight emissions. Packaging is displayed from the source record; its carbon impact and water use are not modeled.</p>
      </section>
    </section>
  )
}
