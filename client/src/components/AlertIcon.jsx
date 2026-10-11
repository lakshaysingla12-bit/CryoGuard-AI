const icons = {
  Critical: "bi-exclamation-octagon text-danger",
  Warning: "bi-exclamation-triangle text-warning",
  Success: "bi-check-circle text-success",
};

function AlertIcon({ severity }) {
  return <i className={"bi alert-icon " + icons[severity]}></i>;
}

export default AlertIcon;
