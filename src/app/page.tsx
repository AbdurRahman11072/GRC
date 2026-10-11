import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Next.js 16 + Express.js Hybrid SaaS Engine
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Zio Tech GRC Platform
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
          Enterprise Information Systems (IS) Audit and Regulatory Compliance system with 4-Team collaborative architecture, multi-year revenue weighting, and Cloudflare R2 evidence storage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left pt-6">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-200 text-sm">Org Team 1</h3>
            <p className="text-xs text-slate-400 mt-1">Regulatory Interface mapped to Client Team 1 (Regulator/BTRC).</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-200 text-sm">Org Team 2</h3>
            <p className="text-xs text-slate-400 mt-1">Operational Audit unit mapped to Client Team 2 (Auditee/FHL).</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-200 text-sm">Client Team 1</h3>
            <p className="text-xs text-slate-400 mt-1">Regulator oversight, macro scoring dashboards, and compliance view.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-200 text-sm">Client Team 2</h3>
            <p className="text-xs text-slate-400 mt-1">Department-based evidence upload portal (Marketing, Sales, IT, etc.).</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="/api/v1/health"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
          >
            Check API Health
          </a>
          <a
            href="/health"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
          >
            Server Status
          </a>
        </div>
      </div>
    </main>
  );
}
