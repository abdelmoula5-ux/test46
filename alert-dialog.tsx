import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X, BarChart3 } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-coral flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">QuizPulse</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/quizzes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Quizzes</Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Support</Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-coral hover:text-coral/80 transition-colors">Admin</Link>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={() => signOut()}>Sign Out</Button>
          ) : (
            <Button size="sm" onClick={() => navigate('/auth')} className="gradient-coral border-0 text-accent-foreground">
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-6 py-4 space-y-3">
          <Link to="/" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/quizzes" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Quizzes</Link>
          <Link to="/contact" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Support</Link>
          {isAdmin && <Link to="/admin" className="block text-sm font-medium text-coral" onClick={() => setMobileOpen(false)}>Admin</Link>}
          {user ? (
            <Button variant="outline" size="sm" className="w-full" onClick={() => { signOut(); setMobileOpen(false); }}>Sign Out</Button>
          ) : (
            <Button size="sm" className="w-full gradient-coral border-0 text-accent-foreground" onClick={() => { navigate('/auth'); setMobileOpen(false); }}>Sign In</Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
