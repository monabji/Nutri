import { render, screen } from '@testing-library/react'
import App from './App'

describe('sork. landing page', () => {
  it('renders the landing page without dashboard content', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'There is more to a meal than its label.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /follow the build/i })).toHaveAttribute(
      'href',
      'https://github.com/monabji/Nutri',
    )
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument()
  })
})
