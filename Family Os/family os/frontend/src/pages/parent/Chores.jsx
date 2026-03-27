import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../contexts/AuthContext";
import { getChoresByFamily, deleteChore } from "../../services/chores";

const ParentChores = () => {
  const { familyId } = useAuth();
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    const loadChores = async () => {
      if (!familyId) return;
      setLoading(true);
      const data = await getChoresByFamily(familyId);
      setChores(data);
      setLoading(false);
    };

    loadChores();
  }, [familyId]);

  return (
    <div className="page">
      <PageHeader
        title="Chores"
        subtitle="Create templates and recurring instances."
        action={
          <div className="button-row">
            <button className="btn ghost" onClick={() => window.history.back()}>
              Back
            </button>
            <Link to="/parent/chores/new" className="btn primary">
              New chore
            </Link>
          </div>
        }
      />

      <div className="summary-row">
        <div className="summary-card">
          <p className="muted">Total chores</p>
          <h3>{loading ? "…" : chores.length}</h3>
        </div>
        <div className="summary-card">
          <p className="muted">AI enabled</p>
          <h3>{loading ? "…" : chores.filter((c) => c.aiVerificationEnabled).length}</h3>
        </div>
        <div className="summary-card">
          <p className="muted">Photo proof</p>
          <h3>{loading ? "…" : chores.filter((c) => c.proofType?.includes("photo")).length}</h3>
        </div>
      </div>

      <section className="card-list">
        {loading && <p className="muted">Loading chores...</p>}
        {!loading && chores.length === 0 && (
          <p className="muted">No chores yet.</p>
        )}
        {chores.map((chore) => (
          <Card
            key={chore.id}
            title={chore.title}
            footer={<Badge label={`${chore.pointValue} pts`} />}
          >
            <p>{chore.description}</p>
            <p className="muted">Proof: {chore.proofType}</p>
            <div className="button-row">
              <button className="btn ghost" onClick={() => navigate(`/parent/chores/${chore.id}/edit`)}>
                Edit
              </button>
              <button className="btn danger" onClick={() => { setDeleteId(chore.id); setConfirmText(""); }}>
                Delete
              </button>
            </div>
          </Card>
        ))}
      </section>

      {deleteId && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Delete chore</h3>
            <p>Type DELETE to confirm.</p>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
            <div className="button-row">
              <button className="btn ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                className="btn danger"
                disabled={confirmText !== "DELETE"}
                onClick={async () => {
                  await deleteChore(deleteId);
                  setDeleteId(null);
                  setConfirmText("");
                  const data = await getChoresByFamily(familyId);
                  setChores(data);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav
        items={[
          { label: "Chores", to: "/parent/chores" },
          { label: "Reports", to: "/parent/reviews" },
          { label: "Children", to: "/parent/children" },
          { label: "Coupons", to: "/parent/coupons" },
        ]}
      />
    </div>
  );
};

export default ParentChores;
