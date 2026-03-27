import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";

const SelectRole = () => {
  const navigate = useNavigate();
  const { familyId } = useAuth();

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <PageHeader title="Who is logging in?" subtitle="Pick your role to continue with a PIN." />
        <div className="button-row" style={{ marginTop: "1rem" }}>
          <button
            className="btn primary full-width"
            onClick={() => navigate(`/pin-login?role=parent`)}
          >
            I'm a Parent
          </button>
          <button
            className="btn ghost full-width"
            onClick={() => navigate(`/pin-login?role=child`)}
            disabled={!familyId}
            title={!familyId ? "Family not set yet" : ""}
          >
            I'm a Kid
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
