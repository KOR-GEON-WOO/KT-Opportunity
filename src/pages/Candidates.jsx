import CandidateTable from "../components/CandidateTable";
import InstallStatus from "../components/InstallStatus";

export default function Candidates({ mode = "list", ...props }) {
  if (mode === "install") {
    return <InstallStatus {...props} />;
  }

  return <CandidateTable {...props} />;
}
