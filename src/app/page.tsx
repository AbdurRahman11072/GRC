import Link from 'next/link';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 relative overflow-hidden">
      {/* Background radial glow accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full text-center space-y-8 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Next.js 16 + Express.js Hybrid SaaS Engine
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
          Zio Tech GRC Platform
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Enterprise Information Systems (IS) Audit and Regulatory Compliance system with 4-Team collaborative architecture, multi-year revenue weighting, and Cloudflare R2 evidence storage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left pt-2">
          <div className="p-4 rounded-xl border border-slate-200 bg-white/90 shadow-2xs backdrop-blur-sm">
            <h3 className="font-semibold text-slate-900 text-sm">Org Team 1</h3>
            <p className="text-xs text-slate-500 mt-1">Regulatory Interface mapped to Client Team 1 (Regulator/BTRC).</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white/90 shadow-2xs backdrop-blur-sm">
            <h3 className="font-semibold text-slate-900 text-sm">Org Team 2</h3>
            <p className="text-xs text-slate-500 mt-1">Operational Audit unit mapped to Client Team 2 (Auditee/FHL).</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white/90 shadow-2xs backdrop-blur-sm">
            <h3 className="font-semibold text-slate-900 text-sm">Client Team 1</h3>
            <p className="text-xs text-slate-500 mt-1">Regulator oversight, macro scoring dashboards, and compliance view.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white/90 shadow-2xs backdrop-blur-sm">
            <h3 className="font-semibold text-slate-900 text-sm">Client Team 2</h3>
            <p className="text-xs text-slate-500 mt-1">Department-based evidence upload portal (Marketing, Sales, IT, etc.).</p>
          </div>
        </div>

        {/* Primary Auth Navigation Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Workspace
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-2xs transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Register Organization
          </Link>
          <a
            href="/api/v1/health"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          >
            API Health Check
          </a>
        </div>
      </div>
    </main>
  );
}
