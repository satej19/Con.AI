import { ArrowRight, Boxes, ChartNoAxesCombined, HardHat, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <main className="home-page">
      <nav className="home-nav">
        <Link to="/" className="home-brand"><span className="home-brand-mark"><HardHat size={20} /></span><span>Con<span>.AI</span></span></Link>
        <div className="home-actions"><Link to="/login" className="home-login">Sign in</Link><Link to="/register" className="home-register">Create workspace <ArrowRight size={15} /></Link></div>
      </nav>
      <section className="home-hero">
        <div className="home-copy"><p className="eyebrow"><ShieldCheck size={14} /> CONSTRUCTION MATERIAL INTELLIGENCE</p><h1>Keep every site supplied, accountable, and moving.</h1><p className="home-lead">One operational workspace for projects, procurement, inventory, waste, and cost decisions.</p><div className="home-cta"><Link to="/register" className="home-primary">Start your workspace <ArrowRight size={17} /></Link><Link to="/login" className="home-secondary">Sign in to an existing workspace</Link></div></div>
        <div className="home-signal" aria-label="Workspace capabilities"><div className="signal-grid"><Signal icon={<Boxes size={19} />} label="Materials" value="Live catalog" /><Signal icon={<Truck size={19} />} label="Procurement" value="PO lifecycle" /><Signal icon={<ChartNoAxesCombined size={19} />} label="Decisions" value="Cost intelligence" /></div><div className="signal-line"><span /> <span /> <span /></div><p>From first order to final variance.</p></div>
      </section>
      <footer className="home-footer"><span>Built for construction operations teams</span><span>Access is organization-managed</span></footer>
    </main>
  );
}
function Signal({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="signal-card"><span className="signal-icon">{icon}</span><span className="signal-label">{label}</span><strong>{value}</strong></div>; }
