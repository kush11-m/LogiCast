
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Gauge,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import featureOptions from "./featureOptions.json";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const categoricalFields = [
  { key: "Type", label: "Order type" },
  { key: "Shipping Mode", label: "Shipping mode" },
  { key: "Category Name", label: "Product category" },
  { key: "Department Name", label: "Department" },
  { key: "Customer Segment", label: "Customer segment" },
  { key: "Market", label: "Market" },
  { key: "Order Region", label: "Order region" },
  { key: "Order Country", label: "Order country" },
  { key: "Order State", label: "Order state" },
] as const;

const numericFields = [
  {
    key: "Days for shipment (scheduled)",
    label: "Scheduled shipment days",
    min: 0,
    max: 30,
    step: 1,
    initial: 2,
  },
  {
    key: "Order Item Product Price",
    label: "Product price",
    min: 0,
    max: 10000,
    step: 0.01,
    initial: 100,
  },
  {
    key: "Order Item Quantity",
    label: "Quantity",
    min: 1,
    max: 100,
    step: 1,
    initial: 1,
  },
  {
    key: "Order Item Discount",
    label: "Discount amount",
    min: 0,
    max: 10000,
    step: 0.01,
    initial: 0,
  },
  {
    key: "Order Item Discount Rate",
    label: "Discount rate",
    min: 0,
    max: 1,
    step: 0.01,
    initial: 0,
  },
] as const;

type OrderForm = Record<string, string | number>;

type Prediction = {
  predicted_late_delivery_risk: number;
  late_delivery_probability: number;
  model: string;
};

function createInitialOrder(): OrderForm {
  const order: OrderForm = {};

  for (const field of categoricalFields) {
    order[field.key] = featureOptions[field.key][0] ?? "";
  }

  for (const field of numericFields) {
    order[field.key] = field.initial;
  }

  order.Order_Month = 6;
  order.Order_DayOfWeek = 2;
  order.Order_Day = 15;

  return order;
}

function App() {
  const [order, setOrder] = useState<OrderForm>(createInitialOrder);
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "predict">(
    "overview"
  );

  function updateField(key: string, value: string | number) {
    setOrder((previous) => ({ ...previous, [key]: value }));
    setResult(null);
    setError("");
  }

  function resetForm() {
    setOrder(createInitialOrder());
    setResult(null);
    setError("");
  }

  async function predictRisk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? "Prediction failed.");
      }

      setResult(data as Prediction);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the prediction API."
      );
    } finally {
      setLoading(false);
    }
  }

  const probability = result
    ? Math.max(0, Math.min(1, result.late_delivery_probability))
    : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-mark">
            <Truck size={23} />
          </span>
          <span>
            <strong>LogiCast</strong>
            <small>LOGISTICS INTELLIGENCE</small>
          </span>
        </a>

        <p className="nav-label">WORKSPACE</p>

        <button
          className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
          type="button"
        >
          <Gauge size={18} />
          Overview
        </button>

        <button
          className={`nav-item ${activeTab === "predict" ? "active" : ""}`}
          onClick={() => setActiveTab("predict")}
          type="button"
        >
          <Activity size={18} />
          Risk prediction
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span />
            Model API
          </div>
          <p>Predict earlier. Act faster.</p>
          <small>LogiCast · ML prototype</small>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              WORKSPACE / {activeTab.toUpperCase()}
            </p>
            <h1>
              {activeTab === "overview"
                ? "Supply chain overview"
                : "Delivery risk assessment"}
            </h1>
          </div>

          <div className="topbar-right">
            <span className="environment">
              <span />
              Local environment
            </span>
            <span className="avatar">LC</span>
          </div>
        </header>

        {activeTab === "overview" ? (
          <>
            <section className="welcome">
              <div>
                <p className="eyebrow">PREDICTIVE LOGISTICS PLATFORM</p>
                <h2>
                  Visibility today.
                  <br />
                  <span>Fewer surprises tomorrow.</span>
                </h2>
                <p className="welcome-copy">
                  Estimate late-delivery risk from order characteristics and
                  use model insights to support smarter logistics decisions.
                </p>
                <button
                  className="primary-button"
                  onClick={() => setActiveTab("predict")}
                  type="button"
                >
                  Assess an order <ArrowUpRight size={17} />
                </button>
              </div>

              <div className="hero-graphic" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="hero-truck">
                  <Truck size={64} strokeWidth={1.2} />
                </div>
                <span className="floating-card floating-top">
                  <Activity size={15} /> Risk intelligence
                </span>
                <span className="floating-card floating-bottom">
                  <ShieldCheck size={15} /> Model-powered
                </span>
              </div>
            </section>

            <section className="section-heading">
              <div>
                <h3>Model snapshot</h3>
                <p>Recorded baseline results from the current evaluation run.</p>
              </div>
              <span className="snapshot-label">
                <span />
                Baseline model
              </span>
            </section>

            <section className="metrics-grid">
              <article className="metric-card">
                <div className="metric-top">
                  <span>Accuracy</span>
                  <Gauge size={18} />
                </div>
                <strong>69.18%</strong>
                <small>Correct predictions</small>
              </article>

              <article className="metric-card">
                <div className="metric-top">
                  <span>PR-AUC</span>
                  <Activity size={18} />
                </div>
                <strong>0.814</strong>
                <small>Precision-recall performance</small>
              </article>

              <article className="metric-card">
                <div className="metric-top">
                  <span>ROC-AUC</span>
                  <ArrowUpRight size={18} />
                </div>
                <strong>0.744</strong>
                <small>Class separation</small>
              </article>

              <article className="metric-card">
                <div className="metric-top">
                  <span>F1 score</span>
                  <ShieldCheck size={18} />
                </div>
                <strong>0.661</strong>
                <small>Precision-recall balance</small>
              </article>
            </section>

            <section className="lower-grid">
              <article className="content-card dataset-card">
                <div className="card-title">
                  <div className="title-icon">
                    <Boxes size={19} />
                  </div>
                  <div>
                    <h3>Project at a glance</h3>
                    <p>What powers LogiCast</p>
                  </div>
                </div>

                <div className="stat-row">
                  <span>Dataset records</span>
                  <strong>180,519</strong>
                </div>
                <div className="stat-row">
                  <span>Input features</span>
                  <strong>17</strong>
                </div>
                <div className="stat-row">
                  <span>Transformed features</span>
                  <strong>1,327</strong>
                </div>
                <div className="stat-row">
                  <span>Selected baseline</span>
                  <strong>Random Forest</strong>
                </div>

                <div className="dataset-note">
                  <CheckCircle2 size={17} />
                  <span>
                    Preprocessing artifacts and model are saved locally.
                  </span>
                </div>
              </article>

              <article className="content-card risk-card">
                <div className="card-title">
                  <div className="title-icon warning-icon">
                    <AlertTriangle size={19} />
                  </div>
                  <div>
                    <h3>Prediction workflow</h3>
                    <p>From order details to risk estimate</p>
                  </div>
                </div>

                <div className="workflow-step">
                  <span>01</span>
                  <div>
                    <strong>Describe the order</strong>
                    <p>Enter shipping, product and market attributes.</p>
                  </div>
                </div>

                <div className="workflow-step">
                  <span>02</span>
                  <div>
                    <strong>Run the model</strong>
                    <p>
                      The saved preprocessor and classifier generate a
                      prediction.
                    </p>
                  </div>
                </div>

                <div className="workflow-step">
                  <span>03</span>
                  <div>
                    <strong>Review the estimate</strong>
                    <p>
                      Use the output as a signal for further review, not a
                      guarantee.
                    </p>
                  </div>
                </div>

                <button
                  className="text-button"
                  onClick={() => setActiveTab("predict")}
                  type="button"
                >
                  Start a prediction <ArrowUpRight size={16} />
                </button>
              </article>
            </section>
          </>
        ) : (
          <section className="prediction-layout">
            <div className="content-card form-card">
              <div className="section-heading form-heading">
                <div>
                  <h3>Order details</h3>
                  <p>Provide the 17 features used by the current model.</p>
                </div>
                <button
                  type="button"
                  className="reset-button"
                  onClick={resetForm}
                >
                  <RotateCcw size={15} /> Reset
                </button>
              </div>

              <form onSubmit={predictRisk}>
                <div className="form-section-title">
                  <Package size={17} /> Order and shipping
                </div>

                <div className="form-grid">
                  {categoricalFields.slice(0, 4).map((field) => (
                    <label className="field" key={field.key}>
                      <span>{field.label}</span>
                      <select
                        value={String(order[field.key] ?? "")}
                        onChange={(event) =>
                          updateField(field.key, event.target.value)
                        }
                        required
                      >
                        {(featureOptions[field.key] ?? []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="select-chevron"
                        size={14}
                      />
                    </label>
                  ))}

                  {numericFields.slice(0, 1).map((field) => (
                    <label className="field" key={field.key}>
                      <span>{field.label}</span>
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        required
                        value={order[field.key]}
                        onChange={(event) =>
                          updateField(field.key, Number(event.target.value))
                        }
                      />
                    </label>
                  ))}
                </div>

                <div className="form-section-title">
                  <Boxes size={17} /> Product and customer
                </div>

                <div className="form-grid">
                  {categoricalFields.slice(4, 6).map((field) => (
                    <label className="field" key={field.key}>
                      <span>{field.label}</span>
                      <select
                        value={String(order[field.key] ?? "")}
                        onChange={(event) =>
                          updateField(field.key, event.target.value)
                        }
                        required
                      >
                        {(featureOptions[field.key] ?? []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="select-chevron"
                        size={14}
                      />
                    </label>
                  ))}

                  {numericFields.slice(1).map((field) => (
                    <label className="field" key={field.key}>
                      <span>{field.label}</span>
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        required
                        value={order[field.key]}
                        onChange={(event) =>
                          updateField(field.key, Number(event.target.value))
                        }
                      />
                    </label>
                  ))}
                </div>

                <div className="form-section-title">
                  <Search size={17} /> Market and location
                </div>

                <div className="form-grid">
                  {categoricalFields.slice(6).map((field) => (
                    <label className="field" key={field.key}>
                      <span>{field.label}</span>
                      <input
                        list={`options-${field.key}`}
                        value={String(order[field.key] ?? "")}
                        onChange={(event) =>
                          updateField(field.key, event.target.value)
                        }
                        placeholder={`Search ${field.label.toLowerCase()}`}
                        required
                      />
                      <datalist id={`options-${field.key}`}>
                        {(featureOptions[field.key] ?? []).map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    </label>
                  ))}
                </div>

                <div className="form-section-title">
                  <Activity size={17} /> Order date attributes
                </div>

                <div className="form-grid three-columns">
                  <label className="field">
                    <span>Order month (1–12)</span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      required
                      value={order.Order_Month}
                      onChange={(event) =>
                        updateField("Order_Month", Number(event.target.value))
                      }
                    />
                  </label>

                  <label className="field">
                    <span>Day of week (0–6)</span>
                    <input
                      type="number"
                      min="0"
                      max="6"
                      required
                      value={order.Order_DayOfWeek}
                      onChange={(event) =>
                        updateField(
                          "Order_DayOfWeek",
                          Number(event.target.value)
                        )
                      }
                    />
                  </label>

                  <label className="field">
                    <span>Day of month (1–31)</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      value={order.Order_Day}
                      onChange={(event) =>
                        updateField("Order_Day", Number(event.target.value))
                      }
                    />
                  </label>
                </div>

                <button
                  className="primary-button submit-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Analyzing order..." : "Generate risk assessment"}
                  <ArrowUpRight size={17} />
                </button>

                {error && <p className="error-message">{error}</p>}
              </form>
            </div>

            <aside className="content-card result-card">
              <div className="card-title">
                <div className="title-icon">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <h3>Risk assessment</h3>
                  <p>Prediction output</p>
                </div>
              </div>

              {!result ? (
                <div className="result-empty">
                  <div className="empty-illustration">
                    <Gauge size={35} />
                  </div>
                  <h4>Awaiting order details</h4>
                  <p>
                    Complete the form and generate a prediction to see the
                    model's risk estimate here.
                  </p>
                </div>
              ) : (
                <div className="result-content">
                  <span
                    className={`risk-badge ${
                      result.predicted_late_delivery_risk
                        ? "risk-high"
                        : "risk-low"
                    }`}
                  >
                    {result.predicted_late_delivery_risk ? (
                      <AlertTriangle size={15} />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    {result.predicted_late_delivery_risk
                      ? "Late risk flagged"
                      : "Late risk not flagged"}
                  </span>

                  <p className="result-label">Estimated probability</p>
                  <div className="result-probability">
                    {(probability * 100).toFixed(1)}
                    <span>%</span>
                  </div>

                  <div className="probability-track">
                    <div style={{ width: `${probability * 100}%` }} />
                  </div>

                  <div className="result-scale">
                    <span>0% · Lower</span>
                    <span>Higher · 100%</span>
                  </div>

                  <div className="result-detail">
                    <span>Predicted class</span>
                    <strong>{result.predicted_late_delivery_risk}</strong>
                  </div>

                  <div className="result-detail">
                    <span>Model</span>
                    <strong>{result.model}</strong>
                  </div>

                  <div className="result-disclaimer">
                    This estimate reflects patterns learned from historical
                    data. It is not a guarantee of actual delivery performance.
                  </div>
                </div>
              )}
            </aside>
          </section>
        )}

        <footer className="footer">
          <span>LogiCast · Supply chain risk intelligence</span>
          <span>Machine-learning estimates · For decision support</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
