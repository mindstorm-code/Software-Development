import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import ProgressBar from "../../components/ProgressBar";
import BottomNav from "../../components/BottomNav";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../contexts/AuthContext";
import { getChoreInstancesForToday } from "../../services/choreInstances";
import { getChoreById } from "../../services/chores";
import { getRewardsByFamily } from "../../services/rewards";
import { getChildPointsBalance } from "../../services/pointsLedger";

const ChildDashboard = () => {
  const { user, familyId } = useAuth();
  const [chores, setChores] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.uid || !familyId) return;
      setLoading(true);
      const instances = await getChoreInstancesForToday(user.uid, familyId);
      const pendingInstances = instances.filter(
        (instance) => instance.status === "pending"
      );
      const choreDetails = await Promise.all(
        pendingInstances.map(async (instance) => {
          const chore = await getChoreById(instance.choreId);
          return {
            instanceId: instance.id,
            ...instance,
            choreTitle: chore?.title || "Chore",
            description: chore?.description || "",
            pointValue: chore?.pointValue || 0,
            proofType: chore?.proofType || "none",
          };
        })
      );
      const rewardData = await getRewardsByFamily(familyId);
      const balance = await getChildPointsBalance(user.uid, familyId);

      setChores(choreDetails);
      setRewards(rewardData);
      setPoints(balance);
      setLoading(false);
    };

    loadDashboard();
  }, [user?.uid, familyId]);

  const bigReward = rewards[0];

  return (
    <div className="page">
      <PageHeader title="Hey there!" subtitle="Your chores for today." />

      <section className="stat-grid">
        <StatCard label="Points balance" value={loading ? "..." : points} />
        <StatCard label="Streak" value="-" helper="Coming soon" />
      </section>

      <section className="section">
        <h2>Due today</h2>
        <div className="card-list">
          {loading && <p className="muted">Loading chores...</p>}
          {!loading && chores.length === 0 && (
            <p className="muted">No chores due today.</p>
          )}
          {chores.map((chore) => (
            <Card
              key={chore.instanceId}
              title={chore.choreTitle}
              footer={<Badge label={`${chore.pointValue} pts`} />}
            >
              <p>{chore.description}</p>
              <p className="muted">Proof: {chore.proofType}</p>
              <Link className="btn ghost" to={`/child/chore/${chore.instanceId}`}>
                Open chore
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {bigReward && (
        <section className="section">
          <h2>Saving for</h2>
          <Card title={bigReward.title}>
            <p>{bigReward.description}</p>
            <ProgressBar value={points} max={bigReward.pointCost} />
          </Card>
        </section>
      )}

      <BottomNav
        items={[
          { label: "Dashboard", to: "/child/dashboard" },
          { label: "Chores", to: "/child/dashboard" },
          { label: "Rewards", to: "/child/rewards" },
        ]}
      />
    </div>
  );
};

export default ChildDashboard;
