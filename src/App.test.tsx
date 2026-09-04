import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'

const productPayload = {
  status: 1,
  product: {
    code: '8906009532363',
    product_name: 'Test Protein Bar',
    brands: 'Test Brand',
    nova_group: 4,
    ecoscore_grade: 'b',
    ingredients_text: 'Oats, protein blend.',
    additives_tags: ['en:e322'],
    packaging_tags: ['en:plastic'],
    countries: 'India',
    product_quantity: 50,
    product_quantity_unit: 'g',
    nutriments: { 'energy-kcal_100g': 380, proteins_100g: 20, 'vitamin-c_100g': 12 },
  },
}

describe('sork.', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    vi.restoreAllMocks()
  })

  it('opens the dashboard from the landing page', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /explore a product/i })[0])
    expect(screen.getByRole('heading', { name: /start with the record. then make the journey visible/i })).toBeInTheDocument()
  })

  it('validates barcodes before requesting data', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /explore a product/i })[0])
    fireEvent.change(screen.getByLabelText(/product barcode/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /^look up$/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an 8–14 digit product barcode.')
  })

  it('shows normalized, source-attributed facts from a successful lookup', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(productPayload), { status: 200 })))
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /explore a product/i })[0])
    fireEvent.change(screen.getByLabelText(/product barcode/i), { target: { value: '8906 0095-32363' } })
    fireEvent.click(screen.getByRole('button', { name: /^look up$/i }))
    expect(await screen.findByRole('heading', { name: 'Test Protein Bar' })).toBeInTheDocument()
    expect(screen.getByText('Group 4')).toBeInTheDocument()
    expect(screen.getByText('380 kcal/100g')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view source record/i })).toHaveAttribute('href', 'https://world.openfoodfacts.org/product/8906009532363')
  })

  it('explains an unavailable record without showing product fallbacks', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 0 }), { status: 200 })))
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /explore a product/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /max protein bar/i }))
    await waitFor(() => expect(screen.getByText('No product record found.')).toBeInTheDocument())
    expect(screen.queryByText('Test Protein Bar')).not.toBeInTheDocument()
  })

  it('identifies a partial record and labels unavailable metric data honestly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 1, product: { code: '8906009532363', product_name: 'Sparse record' } }), { status: 200 })))
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /explore a product/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /max protein bar/i }))
    expect(await screen.findByRole('heading', { name: 'Sparse record' })).toBeInTheDocument()
    expect(screen.getByText('Partial source record')).toBeInTheDocument()
    expect(screen.getAllByText('Not reported by Open Food Facts').length).toBeGreaterThan(1)
  })

  it('retries a failed network lookup', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce(new Response(JSON.stringify(productPayload), { status: 200 })))
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /explore a product/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /max protein bar/i }))
    expect(await screen.findByText('The product record is unavailable.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(await screen.findByRole('heading', { name: 'Test Protein Bar' })).toBeInTheDocument()
  })

  it('renders changing scenario estimates only after a product record is found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(productPayload), { status: 200 })))
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /explore a product/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /max protein bar/i }))
    expect(await screen.findByRole('heading', { name: /change the conditions, not the facts/i })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/transit temperature/i), { target: { value: '42' } })
    expect(screen.getByLabelText(/transit temperature/i)).toHaveValue('42')
    expect(await screen.findByText(/modeled vitamin c loss in 24 hours/i)).toBeInTheDocument()
  })

  it('opens a camera scanner fallback when camera APIs are unavailable', async () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /explore a product/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /scan barcode with camera/i }))
    expect(await screen.findByRole('dialog', { name: /aim at the barcode/i })).toBeInTheDocument()
  })
})
