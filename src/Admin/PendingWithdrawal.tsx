import RequestsView from "./RequestView";

export default function AdminPendingWithdrawals() {
  return <RequestsView kind="withdrawal" scope="pending" />;
}