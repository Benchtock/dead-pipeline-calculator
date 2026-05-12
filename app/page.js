"use client";

import { useState, useEffect, useCallback } from "react";

const INDUSTRY_OPTIONS = [
  { label: "SaaS / Software", multiplier: 0.35 },
  { label: "Agency / Marketing", multiplier: 0.32 },
  { label: "Professional services", multiplier: 0.28 },
  { label: "Other", multiplier: 0.30 },
];

function fmt(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}
function fmtN(n) {
  return Math.round(n).toLocaleString("en-US");
}

function MetricCard({ label, value, highlight }) {
  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "1rem 1.25rem",
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: highlight ? "var(--green)" : "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{value}</p>
    </div>
  );
}

function SliderRow({ label, id, min, max, value, onChange, suffix }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label htmlFor={id} style={{ fontSize: 13, color: "var(--muted)" }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{value}{suffix}</span>
      </div>
      <input
        type="range" id={id} min={min} max={max} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--green)" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{min}{suffix}</span>
        <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{max}{suffix}</span>
      </div>
    </div>
  );
}

export default function DeadPipelineCalculator() {
  const [totalContacts, setTotalContacts] = useState(2000);
  const [avgDeal, setAvgDeal] = useState(15000);
  const [closeRate, setCloseRate] = useState(20);
  const [industryIdx, setIndustryIdx] = useState(0);
  const [pctDark, setPctDark] = useState(45);
  const [pctInmarket, setPctInmarket] = useState(30);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [results, setResults] = useState(null);
  const [animated, setAnimated] = useState(false);

  const multiplier = INDUSTRY_OPTIONS[industryIdx].multiplier;

  const compute = useCallback(() => {
    const dormant = totalContacts * (pctDark / 100);
    const inmarket = dormant * (pctInmarket / 100);
    const pipeline = inmarket * avgDeal;
    const fullPotential = pipeline * (closeRate / 100);
    const conservative = fullPotential * multiplier;
    return { dormant, inmarket, pipeline, fullPotential, conservative };
  }, [totalContacts, avgDeal, closeRate, pctDark, pctInmarket, multiplier]);

  useEffect(() => {
    setResults(compute());
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, [compute]);

  async function handleSubmit() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // Replace this URL with your n8n webhook or API route
      const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || "/api/capture";

      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          dormant_contacts: Math.round(results.dormant),
          in_market_estimate: Math.round(results.inmarket),
          estimated_pipeline: Math.round(results.pipeline),
          full_potential: Math.round(results.fullPotential),
          conservative_recovery: Math.round(results.conservative),
          industry: INDUSTRY_OPTIONS[industryIdx].label,
          inputs: { totalContacts, avgDeal, closeRate, pctDark, pctInmarket },
          source: "dead-pipeline-calculator",
          submitted_at: new Date().toISOString(),
        }),
      });

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again or email benoit@dfyworkforce.com directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        :root {
          --bg: #F7F6F2;
          --card-bg: #FFFFFF;
          --border: #E2E0D8;
          --text: #1A1916;
          --muted: #6B6860;
          --muted-2: #9E9C96;
          --green: #0F6E56;
          --green-light: #E1F5EE;
          --green-border: #9FE1CB;
          --mono: 'DM Mono', 'Fira Mono', monospace;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #141412;
            --card-bg: #1E1D1A;
            --border: #2E2D29;
            --text: #F0EEE8;
            --muted: #8A8880;
            --muted-2: #5A5955;
            --green: #5DCAA5;
            --green-light: #04342C;
            --green-border: #0F6E56;
          }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', 'Helvetica Neue', sans-serif; -webkit-font-smoothing: antialiased; }
        input[type=number], select {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 15px;
          padding: 10px 12px;
          width: 100%;
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
        }
        input[type=number]:focus, select:focus { border-color: var(--green); }
        input[type=email] {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 14px;
          padding: 10px 12px;
          flex: 1;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        input[type=email]:focus { border-color: var(--green); }
        input[type=range] { cursor: pointer; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fadeUp 0.3s ease forwards; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "3rem 1rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: 10 }}>DFY Workforce</p>
            <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15, color: "var(--text)", marginBottom: 12 }}>
              Dead Pipeline<br />Calculator
            </h1>
            <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6, maxWidth: 480 }}>
              Enter four numbers. Find out how much revenue is sitting untouched in your CRM right now.
            </p>
          </div>

          {/* Input section */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.5rem", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>Your CRM numbers</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6 }}>Total contacts in CRM</label>
                <input type="number" value={totalContacts} min={0} onChange={e => setTotalContacts(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6 }}>Average deal value ($)</label>
                <input type="number" value={avgDeal} min={0} onChange={e => setAvgDeal(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6 }}>Current close rate (%)</label>
                <input type="number" value={closeRate} min={1} max={100} onChange={e => setCloseRate(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6 }}>Industry</label>
                <select value={industryIdx} onChange={e => setIndustryIdx(Number(e.target.value))}>
                  {INDUSTRY_OPTIONS.map((opt, i) => (
                    <option key={i} value={i}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>Assumptions</p>
              <SliderRow label="Contacts gone dark (6+ months)" id="pct-dark" min={10} max={80} value={pctDark} onChange={setPctDark} suffix="%" />
              <SliderRow label="Still in-market (industry average)" id="pct-inmarket" min={10} max={50} value={pctInmarket} onChange={setPctInmarket} suffix="%" />
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className={animated ? "animate-in" : ""} style={{ background: "var(--green-light)", border: "1px solid var(--green-border)", borderRadius: 14, padding: "1.5rem", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--green)", marginBottom: 16 }}>Your results</p>

              {/* Headline */}
              <div style={{ textAlign: "center", padding: "1.5rem 1rem", marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Conservative recoverable revenue</p>
                <p style={{ fontSize: 48, fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums", lineHeight: 1, marginBottom: 8 }}>
                  {fmt(results.conservative)}
                </p>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  from {fmtN(results.dormant)} dormant contacts
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <MetricCard label="Dormant contacts" value={fmtN(results.dormant)} />
                <MetricCard label="Still in-market" value={fmtN(results.inmarket)} />
                <MetricCard label="Estimated pipeline" value={fmt(results.pipeline)} />
                <MetricCard label="Full recovery potential" value={fmt(results.fullPotential)} highlight />
              </div>

              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                Conservative estimate applies a {Math.round(multiplier * 100)}% reactivation rate for {INDUSTRY_OPTIONS[industryIdx].label}. Full potential assumes all in-market contacts convert at your current close rate.
              </p>
            </div>
          )}

          {/* CTA */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.5rem" }}>
            {!submitted ? (
              <>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                  Want to know how much of this is actually recoverable?
                </p>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
                  Drop your email and Benoit will send you a breakdown specific to your situation — no pitch, no deck, just the numbers.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      background: "var(--green)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "0 20px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: submitting ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      opacity: submitting ? 0.7 : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {submitting ? "Sending..." : "Send my results →"}
                  </button>
                </div>
                {error && <p style={{ fontSize: 13, color: "#A32D2D", marginTop: 8 }}>{error}</p>}
                <p style={{ fontSize: 12, color: "var(--muted-2)", marginTop: 8 }}>No spam. One reply. Unsubscribe anytime.</p>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <p style={{ fontSize: 20, marginBottom: 8 }}>✓</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--green)", marginBottom: 6 }}>Got it.</p>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>Benoit will follow up shortly with a breakdown for your specific situation.</p>
              </div>
            )}
          </div>

          <p style={{ fontSize: 12, color: "var(--muted-2)", textAlign: "center", marginTop: 20 }}>
            Built by <a href="https://dfyworkforce.com" style={{ color: "var(--muted)", textDecoration: "underline" }}>DFY Workforce</a> — lead reactivation for SaaS companies.
          </p>

        </div>
      </div>
    </>
  );
}
