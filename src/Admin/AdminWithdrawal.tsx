import RequestsView from "./RequestView";

export default function AdminWithdrawals() {
  return <RequestsView kind="withdrawal" scope="all" />;
}