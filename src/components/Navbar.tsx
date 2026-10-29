export type Page = 'home' | 'explore' | 'trips' | 'how' | 'about' | 'results';

const LINKS: { page: Page; label: string }[] = [
  { page: 'home', label: 'Home' },
  { page: 'explore', label: 'Explore Destinations' },
  { page: 'trips', label: 'My Trips' },
  { page: 'how', label: 'How It Works' },
  { page: 'about', label: 'About' },
];

export default function Navbar({ page, onNav, tripCount }: { page: Page; onNav: (p: Page) => void; tripCount: number }) {
  return (
    <header className="nav">
      <button className="logo" onClick={() => onNav('home')} aria-label="Travel Ease home">
        <span className="logo-mark">✈</span> Travel<span>Ease</span>
      </button>
      <nav aria-label="Main">
        {LINKS.map((l) => (
          <button key={l.page} className={page === l.page ? 'active' : ''} onClick={() => onNav(l.page)} aria-current={page === l.page ? 'page' : undefined}>
            {l.label}{l.page === 'trips' && tripCount > 0 ? ` (${tripCount})` : ''}
          </button>
        ))}
      </nav>
    </header>
  );
}
