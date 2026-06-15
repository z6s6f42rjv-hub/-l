export default function RoundIndicator({ current, max }) {
  if (!max || !current) return null;
  return (
    <div className="round-indicator">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`ri-dot ${i + 1 < current ? 'done' : i + 1 === current ? 'active' : ''}`} />
      ))}
    </div>
  );
}
