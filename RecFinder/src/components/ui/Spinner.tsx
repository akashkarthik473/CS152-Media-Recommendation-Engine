import "./Spinner.css";

type SpinnerProps = {
  label?: string;
};

export function Spinner({ label }: SpinnerProps) {
  return (
    <div className="ui-spinner" role="status" aria-live="polite">
      <span className="ui-spinner__dot" />
      {label ? <span className="ui-spinner__label">{label}</span> : null}
    </div>
  );
}
