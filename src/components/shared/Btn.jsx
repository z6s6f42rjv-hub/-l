export default function Btn({ children, onClick, variant = '', disabled, style }) {
  return (
    <button
      className={`btn ${variant ? 'btn-' + variant : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
