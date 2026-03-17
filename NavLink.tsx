import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const Footer = () => (
  <footer className="bg-primary text-primary-foreground py-12">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-coral flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-display text-lg font-bold">QuizPulse</span>
          </div>
          <p className="text-sm opacity-70">Create engaging quizzes and surveys. Share with the world.</p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Links</h4>
          <div className="space-y-2 text-sm opacity-70">
            <Link to="/quizzes" className="block hover:opacity-100 transition-opacity">Browse Quizzes</Link>
            <Link to="/contact" className="block hover:opacity-100 transition-opacity">Support</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Contact</h4>
          <p className="text-sm opacity-70">Have questions? Reach out through our support page.</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-50">
        © {new Date().getFullYear()} QuizPulse. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
