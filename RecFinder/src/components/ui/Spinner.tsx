import "./Spinner.css";

// props for the Spinner, an optional label is announced alongside the spinner for users
// using assistive tech
type SpinnerProps = {
  label?: string;
};

// Shared Spinner component shown while async work is in flight (route loading, button
// loading, recommendation generation) so the user gets feedback that something is happening
// Input: SpinnerProps with optional label
// Output: JSX status indicator with spinning dot and optional label
export function Spinner({ label }: SpinnerProps) {
  return (
    <div className="ui-spinner" role="status" aria-live="polite">
      <span className="ui-spinner__dot" />
      {label ? <span className="ui-spinner__label">{label}</span> : null}
    </div>
  );
}
