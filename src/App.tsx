import { ArrowDownRight, ArrowUpRight, Leaf, Menu, ScanLine, X } from 'lucide-react'
import { useState } from 'react'

const journey = [
  {
    index: '01',
    title: 'Scan the surface',
    copy: 'Start with the barcode already printed on the pack.',
  },
  {
    index: '02',
    title: 'Reveal the record',
    copy: 'Bring together the product facts that are publicly available.',
  },
  {
    index: '03',
    title: 'Make the journey visible',
    copy: 'Explore transport conditions as transparent, clearly labeled scenarios.',
  },
]

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={() => scrollTo('top')} aria-label="Back to top">
          <BrandMark />
          <span>sork.</span>
        </button>

        <nav className={menuOpen ? 'nav nav--open' : 'nav'} aria-label="Main navigation">
          <button onClick={() => scrollTo('how-it-works')}>How it works</button>
          <button onClick={() => scrollTo('principles')}>Why it matters</button>
          <button className="nav-cta" onClick={() => scrollTo('next')}>Follow the journey <ArrowUpRight size={15} /></button>
        </nav>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="hero-index">Food, made more legible.</p>
          <h1 id="hero-title">There is more to a meal than its label.</h1>
          <p className="hero-intro">
            sork. traces the signals behind a product—what it contains, how it is packaged, and the journey it may have taken to reach you.
          </p>
          <button className="primary-button" onClick={() => scrollTo('how-it-works')}>
            See the approach <ArrowDownRight size={18} />
          </button>
        </div>

        <div className="signal-frame" aria-label="An abstract trace from field to fork">
          <div className="signal-frame__topline">
            <span>Trace / 01</span>
            <span>Food system signal</span>
          </div>
          <div className="signal-core">
            <div className="scan-orbit">
              <ScanLine size={27} strokeWidth={1.35} />
            </div>
            <svg className="trace-line" viewBox="0 0 430 230" role="img" aria-label="A route becoming clearer">
              <path d="M25 182C85 182 98 71 166 71c69 0 70 104 136 104 54 0 62-65 102-65" />
              <circle cx="25" cy="182" r="4" />
              <circle cx="166" cy="71" r="4" />
              <circle cx="302" cy="175" r="4" />
              <circle cx="404" cy="110" r="5" />
            </svg>
            <div className="trace-copy trace-copy--left"><Leaf size={14} /> origin</div>
            <div className="trace-copy trace-copy--right">your shelf</div>
          </div>
          <p className="signal-caption">A barcode is not the full story. It is a place to begin.</p>
        </div>
      </section>

      <section className="journey-section" id="how-it-works" aria-labelledby="journey-title">
        <div className="section-heading">
          <p>How it works</p>
          <h2 id="journey-title">A calmer way to ask better questions about food.</h2>
        </div>
        <div className="journey-list">
          {journey.map((item) => (
            <article className="journey-row" key={item.index}>
              <span className="journey-index">{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <ArrowUpRight className="journey-arrow" size={19} />
            </article>
          ))}
        </div>
      </section>

      <section className="principles-section" id="principles" aria-labelledby="principles-title">
        <div className="principles-quote">
          <p className="section-label">Built around uncertainty</p>
          <h2 id="principles-title">Clarity does not mean pretending to know everything.</h2>
        </div>
        <div className="principles-panel">
          <div>
            <span className="panel-number">01</span>
            <h3>Facts stay factual.</h3>
            <p>Source data is shown as source data, with gaps made visible instead of silently filled.</p>
          </div>
          <div>
            <span className="panel-number">02</span>
            <h3>Scenarios stay honest.</h3>
            <p>Any estimate is framed as a model, shaped by clear assumptions you can inspect.</p>
          </div>
        </div>
      </section>

      <section className="next-section" id="next" aria-labelledby="next-title">
        <div>
          <p className="section-label">The first chapter</p>
          <h2 id="next-title">The product journey is coming into view.</h2>
        </div>
        <div className="next-action">
          <p>We are building the product exploration experience next. For now, meet the idea behind it.</p>
          <a href="https://github.com/monabji/Nutri" className="outline-button" target="_blank" rel="noreferrer">
            Follow the build <ArrowUpRight size={17} />
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <div className="brand brand--static"><BrandMark /><span>sork.</span></div>
        <p>Food, made more legible.</p>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  )
}

export default App
