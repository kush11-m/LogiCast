
import { useState } from "react";
import { Activity, Package, ShieldAlert, Truck } from "lucide-react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type Prediction = {
  predicted_late_delivery_risk: number;
  late_delivery_probability: number;
  model: string;
};

function App() {
  const [orderJson, setOrderJson] = useState("");
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function predictRisk() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const order = JSON.parse(orderJson);
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? "Prediction failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><Truck size={24} /></div>
          <div>
            <h1>LogiCast</h1>
            <p>Supply chain intelligence</p>
          </div>
        </div>
        <span className="status">
          <Activity size={15} /> Prediction dashboard
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">PREDICTIVE LOGISTICS</p>
        <h2>Know the risk before the delivery.</h2>
        <p>
          Analyze order details and estimate late-delivery risk using your
          trained machine-learning model.
        </p>
      </section>

      <section className="content">
        <div className="panel">
          <div className="panel-heading">
            <Package size={20} />
            <h3>Order input</h3>
          </div>

          <p className="muted">
            Paste the contents of data/processed/sample_order.json.
            Include all 17 model features.
          </p>

          <textarea
            value={orderJson}
            onChange={(event) => setOrderJson(event.target.value)}
            placeholder='{ "Type": "...", "Shipping Mode": "...", ... }'
            rows={14}
            spellCheck={false}
          />

          <button
            onClick={predictRisk}
            disabled={loading || !orderJson.trim()}
          >
            {loading ? "Analyzing order..." : "Predict delivery risk"}
          </button>

          {error && <p className="error">{error}</p>}
        </div>

        <div className="panel result-panel">
          <div className="panel-heading">
            <ShieldAlert size={20} />
            <h3>Risk assessment</h3>
          </div>

          {!result && !error && (
            <div className="empty-state">
              <Truck size={38} />
              <p>Your prediction will appear here.</p>
            </div>
          )}

          {result && (
            <div className="result">
              <span
                className={`risk-tag ${
                  result.predicted_late_delivery_risk ? "high" : "low"
                }`}
              >
                {result.predicted_late_delivery_risk
                  ? "Late-delivery risk detected"
                  : "No late-delivery risk detected"}
              </span>

              <p className="muted">Estimated late-risk probability</p>
              <div className="probability">
                {(result.late_delivery_probability * 100).toFixed(1)}%
              </div>

              <div className="progress">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, result.late_delivery_probability * 100)
                    )}%`,
                  }}
                />
              </div>

              <p className="muted">Model: {result.model}</p>
              <p className="disclaimer">
                This is a model estimate, not a guarantee of delivery timing.
              </p>
            </div>
          )}
        </div>
      </section>

      <footer>LogiCast · Predict earlier. Act faster. Deliver better.</footer>
    </main>
  );
}

export default App;
