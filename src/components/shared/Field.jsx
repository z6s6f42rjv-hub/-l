export default function Field({ label, children }) {
  return (
    <div className="field">
      {label && <div className="lbl">{label}</div>}
      {children}
    </div>
  );
}
