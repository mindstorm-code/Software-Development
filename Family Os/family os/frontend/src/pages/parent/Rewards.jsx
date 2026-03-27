import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import { useAuth } from "../../contexts/AuthContext";
import { getRewardsByFamily } from "../../services/rewards";

const ParentRewards = () => {
  const { familyId } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRewards = async () => {
      if (!familyId) return;
      setLoading(true);
      const data = await getRewardsByFamily(familyId);
      setRewards(data);
      setLoading(false);
    };

    loadRewards();
  }, [familyId]);

  return (
    <div className="page">
      <PageHeader
        title="Rewards"
        subtitle="Create rewards and manage redemptions."
        action={
          <div className="button-row">
            <button className="btn ghost" onClick={() => window.history.back()}>
              Back
            </button>
            <a className="btn ghost" href="/parent/coupons">
              Coupons
            </a>
          </div>
        }
      />

      <section className="card-list">
        {loading && <p className="muted">Loading rewards...</p>}
        {!loading && rewards.length === 0 && (
          <p className="muted">No rewards yet.</p>
        )}
        {rewards.map((reward) => (
          <Card
            key={reward.id}
            title={reward.title}
            footer={<Badge label={`${reward.pointCost} pts`} />}
          >
            <p>{reward.description}</p>
            <p className="muted">Category: {reward.category}</p>
          </Card>
        ))}
      </section>

      <button className="btn primary full-width">Add reward</button>

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

export default ParentRewards;
