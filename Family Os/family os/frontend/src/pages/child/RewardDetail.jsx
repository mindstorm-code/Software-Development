import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../contexts/AuthContext";
import { getRewardById, redeemReward } from "../../services/rewards";
import { getChildPointsBalance } from "../../services/pointsLedger";

const ChildRewardDetail = () => {
  const { id } = useParams();
  const { user, familyId } = useAuth();
  const [reward, setReward] = useState(null);
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReward = async () => {
      if (!id || !familyId || !user?.uid) return;
      setLoading(true);
      const rewardDoc = await getRewardById(id);
      const balance = await getChildPointsBalance(user.uid, familyId);
      setReward(rewardDoc);
      setPoints(balance);
      setLoading(false);
    };

    loadReward();
  }, [id, familyId, user?.uid]);

  const handleRedeem = async () => {
    if (!reward || !user?.uid || !familyId) return;
    if (points < reward.pointCost) {
      setMessage("Keep saving! You don't have enough points yet.");
      return;
    }

    try {
      await redeemReward({ reward, childId: user.uid, familyId });
      const updatedBalance = await getChildPointsBalance(user.uid, familyId);
      setPoints(updatedBalance);
      setMessage("Redemption requested! Ask a parent to approve.");
    } catch (error) {
      setMessage(error.message || "Unable to redeem right now.");
    }
  };

  return (
    <div className="page">
      <PageHeader
        title={reward?.title || "Reward"}
        subtitle={reward?.description || ""}
        action={<button className="btn ghost" onClick={() => window.history.back()}>Back</button>}
      />

      <div className="card">
        {loading && <p className="muted">Loading reward...</p>}
        {!loading && reward && (
          <>
            <p className="muted">Cost: {reward.pointCost} points</p>
            <ProgressBar value={points} max={reward.pointCost} />
            <button className="btn primary full-width" onClick={handleRedeem}>
              Redeem reward
            </button>
            {message && <p className="form-helper">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default ChildRewardDetail;
