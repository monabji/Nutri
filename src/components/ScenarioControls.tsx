import { MapPinned } from 'lucide-react'
import type { Availability, ResolvedRoute, ScenarioInput, TransportMode } from '../types/scenario'

type Props = {
  scenario: ScenarioInput
  onChange: (patch: Partial<ScenarioInput>) => void
  onResolveRoute: () => void
  routeLoading: boolean
  automaticRoute: Availability<ResolvedRoute>
  onRetryAutomaticRoute: () => void
}

const parseOptionalNumber = (value: string) => value === '' ? undefined : Number(value)

export function ScenarioControls({ scenario, onChange, onResolveRoute, routeLoading, automaticRoute, onRetryAutomaticRoute }: Props) {
  return (
    <section className="scenario-controls" aria-labelledby="scenario-controls-title">
        <div className="scenario-controls__heading">
          <div>
            <p className="eyebrow">Scenario controls</p>
            <h2 id="scenario-controls-title">Change the conditions, not the facts.</h2>
          </div>
        </div>

      <div className={routeLoading ? 'automatic-route-status automatic-route-status--loading' : automaticRoute.status === 'available' ? 'automatic-route-status automatic-route-status--ready' : 'automatic-route-status'} role="status">
        {routeLoading ? 'Auto-resolving source location, driving route, and current weather…' : automaticRoute.status === 'available'
          ? `Auto-filled from ${automaticRoute.value.originKind === 'manufacturing-place' ? 'the source-reported manufacturing place' : 'a source-reported country proxy'} to your device location.`
          : <><span>{automaticRoute.reason}</span><button type="button" onClick={onRetryAutomaticRoute}>Retry auto-resolution</button></>}
      </div>

      <div className="scenario-controls__grid">
        <label className="range-field">
          <span>Transit temperature <strong>{scenario.temperatureC}°C</strong></span>
          <input
            type="range"
            min="15"
            max="42"
            value={scenario.temperatureC}
            onChange={(event) => onChange({ temperatureC: Number(event.target.value) })}
          />
          <small>15°C <span>42°C</span></small>
        </label>

        <label className="range-field">
          <span>Transit duration <strong>{scenario.transitHours} h</strong></span>
          <input
            type="range"
            min="0"
            max="48"
            value={scenario.transitHours}
            onChange={(event) => onChange({ transitHours: Number(event.target.value) })}
          />
          <small>0 h <span>48 h</span></small>
        </label>

        <fieldset className="mode-field">
          <legend>Transport mode</legend>
          {(['ambient-truck', 'cold-chain-reefer'] as TransportMode[]).map((mode) => (
            <label key={mode} className={scenario.transportMode === mode ? 'mode-option mode-option--active' : 'mode-option'}>
              <input
                type="radio"
                name="transport-mode"
                checked={scenario.transportMode === mode}
                onChange={() => onChange({ transportMode: mode })}
              />
              <span>{mode === 'ambient-truck' ? 'Ambient truck' : 'Cold-chain reefer'}</span>
              <small>{mode === 'ambient-truck' ? 'Lower emissions' : 'Lower modeled nutrient loss'}</small>
            </label>
          ))}
        </fieldset>

        <div className="scenario-field-group">
          <label>
            <span>Route distance (km)</span>
            <input type="number" min="0" inputMode="decimal" value={scenario.distanceKm ?? ''} onChange={(event) => onChange({ distanceKm: parseOptionalNumber(event.target.value) })} placeholder="Enter distance" />
          </label>
          <label>
            <span>Product mass (kg)</span>
            <input type="number" min="0" step="0.001" inputMode="decimal" value={scenario.massKg ?? ''} onChange={(event) => onChange({ massKg: parseOptionalNumber(event.target.value) })} placeholder="Enter mass" />
          </label>
          <label>
            <span>Printed expiry (optional)</span>
            <input type="date" value={scenario.printedExpiryDate ?? ''} onChange={(event) => onChange({ printedExpiryDate: event.target.value || undefined })} />
          </label>
        </div>

        <div className="route-fields">
          <label>
            <span>Origin</span>
            <input value={scenario.origin ?? ''} onChange={(event) => onChange({ origin: event.target.value })} placeholder="e.g. Bengaluru, India" />
          </label>
          <label>
            <span>Destination</span>
            <input value={scenario.destination ?? ''} onChange={(event) => onChange({ destination: event.target.value })} placeholder="e.g. Mumbai, India" />
          </label>
          <button className="route-button" type="button" onClick={onResolveRoute} disabled={routeLoading}>
            <MapPinned size={16} /> {routeLoading ? 'Locating…' : 'Display route'}
          </button>
        </div>
      </div>
    </section>
  )
}
