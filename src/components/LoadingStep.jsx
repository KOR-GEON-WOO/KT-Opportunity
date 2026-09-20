export default function LoadingStep({ title, detail }) {
  return (
    <section className="panel loading-panel" aria-live="polite">
      <div className="loading-spinner" />
      <span className="section-kicker">Agent Processing</span>
      <h2>{title}</h2>
      <p>{detail}</p>

      <div className="loading-track">
        <span />
      </div>
    </section>
  );
}
