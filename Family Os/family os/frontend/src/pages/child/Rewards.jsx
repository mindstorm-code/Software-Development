import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../contexts/AuthContext";
import { redeemReward } from "../../services/rewards";
import { getChildPointsBalance } from "../../services/pointsLedger";
import { getCouponsByFamily } from "../../services/coupons";

const ChildRewards = () => {
  const { familyId, user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const loadRewards = async () => {
      if (!familyId || !user?.uid) return;
      setLoading(true);
      const [couponData, pts] = await Promise.all([
        getCouponsByFamily(familyId),
        getChildPointsBalance(user.uid, familyId),
      ]);
      setPoints(pts || 0);
      const couponsAsRewards = (couponData || []).map((c) => ({
        id: `coupon-${c.id}`,
        title: c.title,
        description: c.description,
        pointCost: c.pointsRequired || c.pointsCost || c.pointCost || 0,
        requiresApproval: c.requiresApproval || false,
        type: "coupon",
      }));
      setRewards(couponsAsRewards);
      setLoading(false);
    };

    loadRewards();
  }, [familyId, user?.uid]);

  return (
    <div className="page">
      <PageHeader
        title="Rewards store"
        subtitle="Pick something fun to work toward."
        action={<button className="btn ghost" onClick={() => window.history.back()}>Back</button>}
      />

      <section className="card-list">
        {loading && <p className="muted">Loading rewards...</p>}
        {!loading && rewards.length === 0 && (
          <p className="muted">No rewards yet. Ask your parent to add a reward!</p>
        )}
        {rewards.map((reward) => (
          <Card
            key={reward.id}
            title={reward.title}
            footer={<Badge label={`${reward.pointCost} pts`} />}
          >
            <p>{reward.description}</p>
            {reward.pointCost > 0 && (
              <>
                <ProgressBar value={Math.min(points, reward.pointCost)} max={reward.pointCost} />
                <p className="muted">
                  You have {points} / {reward.pointCost} pts •{" "}
                  {points >= reward.pointCost
                    ? "You can afford this!"
                    : `Need ${Math.max(0, reward.pointCost - points)} more pts`}
                </p>
              </>
            )}
            <div className="button-row">
              <Link to={`/child/rewards/${reward.id}`} className="btn ghost">
                View reward
              </Link>
              <button
                className="btn primary"
                onClick={async () => {
                  try {
                    await redeemReward({
                      reward: {
                        id: reward.id.replace("coupon-", ""),
                        title: reward.title,
                        pointCost: reward.pointCost,
                        requiresApproval: reward.requiresApproval,
                      },
                      childId: user?.uid,
                      familyId,
                    });
                    alert("Redemption submitted for approval.");
                  } catch (e) {
                    alert(e.message || "Unable to redeem.");
                  }
                }}
              >
                Redeem
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  const val = prompt("Enter points to pay toward this reward:");
                  const pts = Number(val);
                  if (Number.isNaN(pts) || pts <= 0) return;
                  // TODO: implement pay-toward ledger entry; placeholder alert for now
                  alert(`Paid ${pts} points toward ${reward.title}. (Saving not yet persisted)`);
                }}
              >
                Pay toward
              </button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default ChildRewards;
