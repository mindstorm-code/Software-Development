import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import { useAuth } from "../../contexts/AuthContext";
import { getChildrenByFamily } from "../../services/users";
import { getChildPointsBalance } from "../../services/pointsLedger";

const ParentChildren = () => {
  const { familyId } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChildren = async () => {
      if (!familyId) return;
      setLoading(true);
      const childProfiles = await getChildrenByFamily(familyId);
      const enriched = await Promise.all(
        childProfiles.map(async (child) => {
          const points = await getChildPointsBalance(child.id, familyId);
          return { ...child, points };
        })
      );
      setChildren(enriched);
      setLoading(false);
    };

    loadChildren();
  }, [familyId]);

  return (
    <div className="page">
      <PageHeader title="Children" subtitle="Manage child profiles and points." />

      <section className="card-list">
        {loading && <p className="muted">Loading children...</p>}
        {!loading && children.length === 0 && (
          <p className="muted">No child profiles yet.</p>
        )}
        {children.map((child) => (
          <Card
            key={child.id}
            title={child.displayName || child.name || "Child"}
            footer={<Badge label={`${child.points || 0} pts`} />}
          >
            <p>Role: {child.role}</p>
            <button className="btn ghost">View profile</button>
          </Card>
        ))}
      </section>

      <button className="btn primary full-width">Add child profile</button>
    </div>
  );
};

export default ParentChildren;
