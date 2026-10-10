import RequestsView from "./RequestView";

export default function AdminPendingDeposits() {
  return <RequestsView kind="deposit" scope="pending" />;
}