import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import { useAuth } from "../../contexts/AuthContext";
import { getChoresByFamily } from "../../services/chores";

const ParentChores = () => {
  const { familyId } = useAuth();
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <Link to="/parent/chores/new" className="btn primary">
            New chore
          </Link>
        }
      />

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
          </Card>
        ))}
      </section>
    </div>
  );
};

export default ParentChores;
