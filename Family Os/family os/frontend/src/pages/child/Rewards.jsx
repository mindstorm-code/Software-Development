import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import { useAuth } from "../../contexts/AuthContext";
import { getRewardsByFamily } from "../../services/rewards";

const ChildRewards = () => {
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
      <PageHeader title="Rewards store" subtitle="Pick something fun to work toward." />

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
            <Link to={`/child/rewards/${reward.id}`} className="btn ghost">
              View reward
            </Link>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default ChildRewards;
