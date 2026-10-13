import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Layers, FileCheck, Award } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden">
      {/* Background radial glow accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              Zio Tech <span className="text-cyan-600 font-semibold">GRC</span>
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            IS Audit v1.0
          </span>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 z-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Pane (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 w-fit">
              Enterprise Compliance SaaS
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Automated IS Audit & Regulatory Governance Engine
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Digitizing multi-year telecom compliance workflows for the Bangladesh Telecommunication Regulatory Commission (BTRC) and Fiber@Home Limited (FHL) with four-team collaborative boundaries.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <Layers className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">
                    Hierarchical ToR WBS Explorer
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Multi-level Terms of Reference with independent marks for Data Collection and Analysis.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <FileCheck className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">
                    DRT Request Hub & SLA Tracking
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Department-routed requests, two-tier status models, and real-time SLA delay calculation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">
                    Multi-Year Revenue Scoring
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Annual period weighting from 2009 through 2024 with normalized scoring calculations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card Pane */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">{children}</div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="px-6 py-4 border-t border-slate-200 bg-white/60 text-center text-xs text-slate-500 z-10">
        &copy; {new Date().getFullYear()} Zio Tech GRC. All rights reserved.
      </footer>
    </div>
  );
}
