import { useEffect, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BookOpen, Boxes, Check,
  ChevronDown, CircleHelp, Code2, Gauge, LoaderCircle,
  FileText, Package, RotateCcw, ShieldCheck, Truck, Warehouse, X,
} from "lucide-react";
import featureOptions from "./featureOptions.json";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const links = [
  { label: "API documentation", hint: "Interactive Swagger docs", href: `${API_URL}/docs`, icon: BookOpen },
  { label: "OpenAPI schema", hint: "JSON endpoint reference", href: `${API_URL}/openapi.json`, icon: Code2 },
  { label: "API health", hint: "Check service availability", href: `${API_URL}/health`, icon: Activity },
  { label: "Project documentation", hint: "Project report · Google Docs", href: "https://docs.google.com/document/d/1F1bWohJEfL--A0TF7L_VN5WCkbdlZ8q64wJFwEtX7e0/edit?usp=sharing", icon: FileText },
  { label: "Project source", hint: "Code and setup guide", href: "https://github.com/kush11-m/LogiCast", icon: Code2 },
];
const categoricalFields = [
  { key: "Type", label: "Order type" }, { key: "Shipping Mode", label: "Shipping mode" },
  { key: "Category Name", label: "Product category" }, { key: "Department Name", label: "Department" },
  { key: "Customer Segment", label: "Customer segment" }, { key: "Market", label: "Market" },
  { key: "Order Region", label: "Order region" }, { key: "Order Country", label: "Order country" },
  { key: "Order State", label: "Order state" },
] as const;
const numericFields = [
  { key: "Days for shipment (scheduled)", label: "Scheduled shipment days", min: 0, max: 30, step: 1, initial: 2 },
  { key: "Order Item Product Price", label: "Product price", min: 0, max: 10000, step: 0.01, initial: 100 },
  { key: "Order Item Quantity", label: "Quantity", min: 1, max: 100, step: 1, initial: 1 },
  { key: "Order Item Discount", label: "Discount amount", min: 0, max: 10000, step: 0.01, initial: 0 },
  { key: "Order Item Discount Rate", label: "Discount rate", min: 0, max: 1, step: 0.01, initial: 0 },
] as const;
type OrderForm = Record<string, string | number>;
type Prediction = { predicted_late_delivery_risk: number; late_delivery_probability: number; model: string };
function createInitialOrder(): OrderForm {
  const order: OrderForm = {};
  for (const field of categoricalFields) order[field.key] = featureOptions[field.key][0] ?? "";
  for (const field of numericFields) order[field.key] = field.initial;
  Object.assign(order, { Order_Month: 4, Order_DayOfWeek: 5, Order_Day: 22 });
  order.Type = "CASH";
  order["Shipping Mode"] = "Standard Class";
  order["Category Name"] = "Men's Footwear";
  order["Department Name"] = "Apparel";
  order["Market"] = "LATAM";
  order["Order Region"] = "Central America";
  order["Order Country"] = "Honduras";
  order["Order State"] = "Yoro";
  order["Customer Segment"] = "Consumer";
  order["Days for shipment (scheduled)"] = 4;
  order["Order Item Product Price"] = 129.99;
  return order;
}
const performance = [
  { label: "Accuracy", value: 69.07, note: "Final test score · baseline 69.18% (−0.11 pts)" },
  { label: "Precision", value: 77.63, note: "Final test score · baseline 82.98% (−5.35 pts)" },
  { label: "Recall", value: 60.99, note: "Final test score · baseline 54.87% (+6.12 pts)" },
  { label: "F1 score", value: 68.31, note: "Final test score · baseline 66.06% (+2.25 pts)" },
  { label: "ROC–AUC", value: 74.37, note: "Ability to separate classes" },
  { label: "PR–AUC", value: 81.40, note: "Precision–recall performance" },
];

function App() {
  const [order, setOrder] = useState<OrderForm>(createInitialOrder);
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "predict" | "resources">("overview");
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [booting, setBooting] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("PR–AUC");

  useEffect(() => {
    const bootTimer = window.setTimeout(() => setBooting(false), 700);
    const controller = new AbortController();
    let active = true;
    let retryTimer = 0;
    const checkApi = async () => {
      try {
        const response = await fetch(`${API_URL}/health`, { signal: controller.signal });
        if (active) setApiStatus(response.ok ? "online" : "offline");
      } catch {
        if (active) setApiStatus("offline");
      } finally {
        if (active) retryTimer = window.setTimeout(checkApi, 15000);
      }
    };
    void checkApi();
    return () => {
      active = false;
      window.clearTimeout(bootTimer);
      window.clearTimeout(retryTimer);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "predict") return;
    const scrollTimer = window.setTimeout(() => {
      document.getElementById("prediction")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(scrollTimer);
  }, [activeTab]);

  useEffect(() => {
    if (!loading) return;
    const scrollTimer = window.setTimeout(() => {
      document.getElementById("prediction-result")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    return () => window.clearTimeout(scrollTimer);
  }, [loading]);

  function updateField(key: string, value: string | number) {
    setOrder((previous) => ({ ...previous, [key]: value }));
    setResult(null); setError("");
  }
  function resetForm() { setOrder(createInitialOrder()); setResult(null); setError(""); }
  async function predictRisk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Please check the order details and try again.");
      setResult(data as Prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to the prediction API.");
    } finally { setLoading(false); }
  }
  const probability = result ? Math.max(0, Math.min(1, result.late_delivery_probability)) : 0;
  const metric = performance.find((item) => item.label === selectedMetric) ?? performance[5];

  return (
    <>
      {booting && <div className="boot-screen" role="status" aria-label="Starting LogiCast">
        <div className="boot-loader" aria-hidden="true"><span className="boot-loader-ring"/><div className="boot-mark"><Truck size={18}/></div></div>
        <div className="boot-copy"><strong>LogiCast</strong><span>STARTING</span></div>
        <div className="boot-progress"><i/></div>
      </div>}
      <div className={`app-shell ${booting ? "app-hidden" : ""}`}>
        <div className="ambient-field" aria-hidden="true"><i/><i/><i/></div>
        <aside className="rail">
          <button className="logo-mark" type="button" onClick={() => setActiveTab("overview")} aria-label="LogiCast home"><Truck size={20} /></button>
          <div className="rail-divider" />
          <button className={`rail-button ${activeTab === "overview" ? "selected" : ""}`} onClick={() => setActiveTab("overview")} aria-label="Overview" title="Overview"><Gauge size={18} /></button>
          <button className={`rail-button ${activeTab === "predict" ? "selected" : ""}`} onClick={() => setActiveTab("predict")} aria-label="Try a prediction" title="Try a prediction"><Activity size={18} /></button>
          <button className={`rail-button ${activeTab === "resources" ? "selected" : ""}`} onClick={() => setActiveTab("resources")} aria-label="Developer hub" title="Developer hub"><BookOpen size={18} /></button>
          <div className="rail-spacer" />
          <a className="rail-button" href="https://github.com/kush11-m/LogiCast" target="_blank" rel="noreferrer" aria-label="GitHub repository" title="GitHub"><Code2 size={18} /></a>
        </aside>
        <main id="overview" className="dashboard">
          <header className="topbar">
            <button className="wordmark" type="button" onClick={() => setActiveTab("overview")}><span className="wordmark-icon"><Truck size={17} /></span>LogiCast</button>
            <nav className="top-nav" aria-label="Main navigation">
              <button className={activeTab === "overview" ? "top-nav-active" : ""} onClick={() => setActiveTab("overview")}>Overview</button>
              <button className={activeTab === "predict" ? "top-nav-active" : ""} onClick={() => setActiveTab("predict")}>Prediction lab</button>
              <button className={activeTab === "resources" ? "top-nav-active" : ""} onClick={() => setActiveTab("resources")}>Developer hub</button>
            </nav>
            <div className="api-pill"><span className={`status-dot ${apiStatus}`} />{apiStatus === "checking" ? "Connecting" : apiStatus === "online" ? "API online" : "API unavailable"}</div>
          </header>

          <section className="page-heading">
            <div><p className="kicker">SUPPLY CHAIN INTELLIGENCE <span>·</span> {activeTab === "overview" ? "MODEL OVERVIEW" : activeTab === "predict" ? "PREDICTION LAB" : "DEVELOPER HUB"}</p><h1>{activeTab === "overview" ? "Delivery risk, at a glance." : activeTab === "predict" ? "Try a delivery prediction." : "Docs, links & contact."}</h1><p className="page-subtitle">{activeTab === "overview" ? "Explore the source data, model performance, and what its scores mean." : activeTab === "predict" ? "Enter an order to get a late-delivery risk estimate from the model." : "API references, project documentation, and a way to reach the maintainer."}</p></div>
            {activeTab !== "resources" && <button className="button button-dark" onClick={() => setActiveTab(activeTab === "overview" ? "predict" : "overview")}>{activeTab === "overview" ? "Test a sample order" : "Back to overview"}<ArrowUpRight size={15} /></button>}
          </section>

          {activeTab === "overview" ? (
            <>
          <section className="stat-grid" aria-label="Project data summary">
            <article className="stat-card feature-stat"><div className="stat-label"><span className="stat-icon"><Boxes size={16} /></span>Orders in dataset</div><strong>180,519</strong><div className="stat-foot"><span className="status-check"><Check size={12} /></span>DataCo supply chain records</div><div className="stat-glow" aria-hidden="true" /></article>
            <article className="stat-card"><div className="stat-label"><span className="stat-icon"><Package size={16} /></span>Model inputs</div><strong>17</strong><div className="stat-foot">Order, product & location fields</div><div className="stat-mini"><span>9 categorical · 8 numeric/date</span><span>17 total</span></div><div className="mini-track"><i style={{width:"53%"}} /></div></article>
            <article className="stat-card"><div className="stat-label"><span className="stat-icon"><Warehouse size={16} /></span>Model features</div><strong>1,327</strong><div className="stat-foot">After preprocessing & encoding</div><div className="stat-mini"><span>Feature expansion</span><span>78×</span></div><div className="mini-track"><i style={{width:"78%"}} /></div></article>
            <article className="stat-card"><div className="stat-label"><span className="stat-icon"><ShieldCheck size={16} /></span>Selected model</div><strong className="model-name">Random Forest</strong><div className="stat-foot">Recall-focused classifier</div><div className="model-chip"><span className="status-check"><Check size={12} /></span>Threshold 0.395</div></article>
          </section>

          <section className="content-grid">
            <article className="panel performance-panel">
              <div className="panel-header"><div><p className="panel-overline">FINAL EVALUATION</p><h2>Model performance</h2><p className="panel-subtitle">Chronological test set · 36,104 orders</p></div><span className="baseline-tag"><span /> Threshold 0.395</span></div>
              <div className="chart-layout">
                <div className="metric-list" role="list" aria-label="Evaluation metrics">
                  {performance.map((item) => <button className={`metric-row ${selectedMetric === item.label ? "metric-active" : ""}`} key={item.label} onClick={() => setSelectedMetric(item.label)} aria-pressed={selectedMetric === item.label}>
                    <span className="metric-row-label">{item.label}</span><span className="metric-bar"><i style={{width:`${item.value}%`}} /></span><strong>{item.value.toFixed(1)}%</strong>
                  </button>)}
                </div>
                <div className="metric-detail" aria-live="polite"><div className="detail-topline"><span>SELECTED METRIC</span><span className="detail-trend"><ArrowUpRight size={13} /> Test score</span></div><div className="detail-value">{metric.value.toFixed(1)}<small>%</small></div><div className="detail-name">{metric.label}</div><p>{metric.note}. Evaluation results are not a guarantee of future outcomes.</p><div className="detail-scale"><span>0%</span><i><b style={{width:`${metric.value}%`}} /></i><span>100%</span></div></div>
              </div>
              <div className="chart-caption"><span><i className="legend-dot" /> Final test-set metrics · threshold 0.395</span><span>Choose a metric to inspect</span></div>
            </article>

            <article className="panel insight-panel">
              <div className="panel-header"><div><p className="panel-overline">WHAT THIS MEANS</p><h2>Useful signal. Clear limits.</h2><p className="panel-subtitle">Read the model with context.</p></div><span className="insight-icon"><CircleHelp size={17} /></span></div>
              <div className="insight-callout"><div className="insight-score"><span>77.63%</span><small>precision</small></div><p>About 78 of every 100 flagged orders were late. Baseline: 82.98% (−5.35 pts).</p></div>
              <div className="insight-row"><span><ArrowDownRight size={15} /> Recall</span><strong>60.99%</strong><small>Baseline 54.87% · +6.12 pts</small></div>
              <div className="insight-row"><span><ArrowUpRight size={15} /> F1 score</span><strong>68.31%</strong><small>Baseline 66.06% · +2.25 pts</small></div>
              <p className="caveat"><ShieldCheck size={14} /> Treat every result as an estimate for review, not a delivery guarantee.</p>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel workflow-panel"><div className="panel-header"><div><p className="panel-overline">HOW IT WORKS</p><h2>From order details to a useful signal</h2></div></div><div className="workflow">
              <div className="workflow-item"><span className="workflow-index">01</span><div><strong>Describe an order</strong><p>Enter its shipping, product and location details.</p></div></div><div className="workflow-connector" /><div className="workflow-item"><span className="workflow-index">02</span><div><strong>Estimate its risk</strong><p>The saved preprocessing pipeline and classifier score it.</p></div></div><div className="workflow-connector" /><div className="workflow-item"><span className="workflow-index">03</span><div><strong>Review the result</strong><p>See the predicted class and estimated probability.</p></div></div>
            </div><button className="text-link" onClick={() => setActiveTab("predict")}>Try the sample prediction <ArrowUpRight size={14} /></button></article>
            <article className="panel data-panel"><div className="panel-header"><div><p className="panel-overline">THE DATA</p><h2>Built for real order context</h2><p className="panel-subtitle">One order, 17 model inputs.</p></div><span className="data-icon"><Boxes size={17} /></span></div><div className="data-bands"><div><span>Shipping & order</span><i style={{width:"18%"}} /></div><div><span>Product & customer</span><i style={{width:"41%"}} /></div><div><span>Market & location</span><i style={{width:"18%"}} /></div><div><span>Order date</span><i style={{width:"18%"}} /></div></div><p className="data-footnote">Fields are grouped by how people describe an order. Values are transformed before model scoring.</p></article>
          </section>


            </>
          ) : activeTab === "predict" ? (
            <>
          <section id="prediction" className={`prediction-section ${activeTab === "predict" ? "prediction-focused" : ""}`}>
            <div className="section-intro"><div><p className="panel-overline">INTERACTIVE · SAMPLE ORDER</p><h2>Try a prediction</h2><p className="panel-subtitle">A realistic example is prefilled. Adjust it and run the model.</p></div><button type="button" className="button button-light" onClick={resetForm}><RotateCcw size={14} /> Reset sample</button></div>
            <div className="prediction-flow">
              <form className="panel prediction-form" onSubmit={predictRisk}>
                <div className="form-section"><h3><Package size={15} /> Order & shipping</h3><div className="form-grid">
                  {categoricalFields.slice(0,4).map((field)=><label className="field" key={field.key}><span>{field.label}</span><select value={String(order[field.key]??"")} onChange={(event)=>updateField(field.key,event.target.value)} required>{(featureOptions[field.key]??[]).map((option)=><option key={option} value={option}>{option.trim()}</option>)}</select><ChevronDown className="select-chevron" size={13}/></label>)}
                  {numericFields.slice(0,1).map((field)=><label className="field" key={field.key}><span>{field.label}</span><input type="number" min={field.min} max={field.max} step={field.step} required value={order[field.key]} onChange={(event)=>updateField(field.key,Number(event.target.value))}/></label>)}
                </div></div>
                <div className="form-section"><h3><Boxes size={15} /> Product & customer</h3><div className="form-grid">
                  {categoricalFields.slice(4,6).map((field)=><label className="field" key={field.key}><span>{field.label}</span><select value={String(order[field.key]??"")} onChange={(event)=>updateField(field.key,event.target.value)} required>{(featureOptions[field.key]??[]).map((option)=><option key={option} value={option}>{option.trim()}</option>)}</select><ChevronDown className="select-chevron" size={13}/></label>)}
                  {numericFields.slice(1).map((field)=><label className="field" key={field.key}><span>{field.label}</span><input type="number" min={field.min} max={field.max} step={field.step} required value={order[field.key]} onChange={(event)=>updateField(field.key,Number(event.target.value))}/></label>)}
                </div></div>
                <div className="form-section"><h3><Warehouse size={15} /> Market & location</h3><div className="form-grid">
                  {categoricalFields.slice(6).map((field)=><label className="field" key={field.key}><span>{field.label}</span><input list={`options-${field.key}`} value={String(order[field.key]??"")} onChange={(event)=>updateField(field.key,event.target.value)} placeholder={`Search ${field.label.toLowerCase()}`} required/><datalist id={`options-${field.key}`}>{(featureOptions[field.key]??[]).map((option)=><option key={option} value={option}/>)}</datalist></label>)}
                </div></div>
                <div className="form-section"><h3><Activity size={15} /> Order date</h3><div className="form-grid three-cols">
                  {[{key:"Order_Month",label:"Month (1–12)",min:1,max:12},{key:"Order_DayOfWeek",label:"Weekday (0–6)",min:0,max:6},{key:"Order_Day",label:"Day (1–31)",min:1,max:31}].map(field=><label className="field" key={field.key}><span>{field.label}</span><input type="number" min={field.min} max={field.max} required value={order[field.key]} onChange={(event)=>updateField(field.key,Number(event.target.value))}/></label>)}
                </div></div>
                {error && <p className="error-message" role="alert"><X size={15}/>{error}</p>}
                <button className="button button-primary predict-button" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={16}/> Scoring this order…</> : <>Generate risk estimate <ArrowUpRight size={15}/></>}</button>
              </form>
              {(result || loading) && <aside id="prediction-result" className="panel result-panel" aria-live="polite"><div className="panel-header"><div><p className="panel-overline">PREDICTION RESULT</p><h2>{result ? "Order risk estimate" : "Your result appears here"}</h2></div><span className="result-shield"><ShieldCheck size={17}/></span></div>
                {loading ? <div className="result-skeleton"><i/><i/><i/><i/></div> : result ? <div className="result-content"><div className={`risk-badge ${result.predicted_late_delivery_risk ? "risk-high" : "risk-low"}`}><span/>{result.predicted_late_delivery_risk ? "Risk flagged" : "Risk not flagged"}</div><div className="result-label">Estimated late-delivery probability</div><div className="result-probability">{(probability*100).toFixed(1)}<small>%</small></div><div className="probability-track"><i style={{width:`${probability*100}%`}}/></div><div className="result-scale"><span>Lower</span><span>Higher</span></div><div className="result-detail"><span>Predicted class</span><strong>{result.predicted_late_delivery_risk}</strong></div><div className="result-detail"><span>Decision threshold</span><strong>39.5%</strong></div><div className="result-detail"><span>Model</span><strong>{result.model}</strong></div><p className="result-note">This is a model estimate based on historical patterns, not a guarantee of delivery performance.</p></div> : <div className="result-empty"><div className="result-gauge"><Gauge size={25}/></div><h3>Ready when you are</h3><p>Run the prefilled example to see a probability, predicted class, and model name.</p><div className="result-placeholder"><span>Risk probability</span><span>—</span></div></div>}
              </aside>}
            </div>
          </section>

            </>
          ) : (
            <>
          <section className="resources-hero">
            <div><p className="panel-overline">START HERE</p><h2>Explore LogiCast</h2><p className="panel-subtitle">Find the API guide, project documentation, endpoint reference, and project source.</p></div>
            <a className="contact-card" href="https://github.com/kush11-m" target="_blank" rel="noreferrer"><span className="contact-avatar"><Code2 size={20}/></span><span className="contact-copy"><small>PROJECT MAINTAINER</small><strong>@kush11-m</strong><em>Contact on GitHub</em></span><ArrowUpRight className="contact-arrow" size={17}/></a>
          </section>
          <section id="resources" className="resources-section"><div className="section-intro"><div><p className="panel-overline">DEVELOPER LINKS</p><h2>Documentation & links</h2><p className="panel-subtitle">API references, project write-up, and source code.</p></div></div><div className="resource-grid">{links.map(({label,hint,href,icon:Icon})=><a className="resource-link" href={href} key={label} target="_blank" rel="noreferrer"><span className="resource-icon"><Icon size={16}/></span><span className="resource-copy"><strong>{label}</strong><small>{hint}</small></span><ArrowUpRight className="resource-arrow" size={15}/></a>)}</div></section>            </>
          )}
        </main>
      </div>
    </>
  );
}
export default App;
