import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import ProgressBar from "../../components/ProgressBar";
import BottomNav from "../../components/BottomNav";
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
  const quickWins = chores.filter((c) => c.pointValue > 0 && c.pointValue <= 10);

  return (
    <div className="page">
      <PageHeader
        title={user?.displayName ? `Hey ${user.displayName} 👋` : "Hey there! 👋"}
        subtitle=""
        action={<button className="btn ghost" onClick={() => window.history.back()}>Back</button>}
      />

      <section className="hero-strip">
        <div className="hero-chip">⭐ {loading ? "..." : points} points</div>
        <div className="hero-chip">🔥 2-day streak</div>
        <div className="hero-chip">🏅 Level 1 Explorer</div>
      </section>

      <section className="section">
        <h2>🎯 Your Missions Today</h2>
        <div className="missions-grid">
          {loading && <p className="muted">Loading chores...</p>}
          {!loading && chores.length === 0 && (
            <p className="muted">No chores due today.</p>
          )}
          {chores.map((chore) => (
            <Link key={chore.instanceId} to={`/child/chore/${chore.instanceId}`} className="mission-card">
              <div className="mission-emoji">⭐</div>
              <div className="mission-content">
                <h3>{chore.choreTitle}</h3>
                <p className="muted">{chore.description}</p>
              </div>
              <div className="mission-points">+{chore.pointValue} ⭐</div>
            </Link>
          ))}
        </div>
      </section>

      {bigReward && (
        <section className="section">
          <h2>🎁 Saving For</h2>
          <Card title={bigReward.title}>
            <p>{bigReward.description}</p>
            <ProgressBar value={points} max={bigReward.pointCost} />
            <p className="muted">
              {points} / {bigReward.pointCost} ⭐ • You're close! Just{" "}
              {Math.max(0, Math.ceil((bigReward.pointCost - points) / 10))} more chores!
            </p>
          </Card>
        </section>
      )}

      {quickWins.length > 0 && (
        <section className="section">
          <h2>⚡ Quick Wins</h2>
          <div className="missions-grid quick">
            {quickWins.map((chore) => (
              <Link key={chore.instanceId} to={`/child/chore/${chore.instanceId}`} className="mission-card small">
                <div className="mission-emoji">⚡</div>
                <div className="mission-content">
                  <h3>{chore.choreTitle}</h3>
                </div>
                <div className="mission-points">+{chore.pointValue} ⭐</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <BottomNav
        items={[
          { label: "Dashboard", to: "/child/dashboard" },
          { label: "Chores", to: "/child/dashboard" },
          { label: "Rewards", to: "/child/rewards" },
          { label: "Profile", to: "/child/profile" },
        ]}
      />
    </div>
  );
};

export default ChildDashboard;
