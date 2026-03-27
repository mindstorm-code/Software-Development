import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../contexts/AuthContext";
import { getChildPointsBalance } from "../../services/pointsLedger";
import { getRewardsByFamily } from "../../services/rewards";
import { uploadChoreImage } from "../../services/storage";
import { updateUserProfileFields } from "../../services/users";

const ChildProfile = () => {
  const { user, familyId } = useAuth();
  const [balance, setBalance] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid || !familyId) return;
      const [bal, rewardsData] = await Promise.all([
        getChildPointsBalance(user.uid, familyId),
        getRewardsByFamily(familyId),
      ]);
      setBalance(bal);
      setRewards(rewardsData || []);
      setPhotoUrl(user?.photoURL || user?.photoUrl || "");
    };
    load();
  }, [user?.uid, familyId]);

  return (
    <div className="page">
      <PageHeader
        title={user?.displayName ? `${user.displayName}'s profile` : "My profile"}
        subtitle="Points, spending, and focus areas."
        action={<button className="btn ghost" onClick={() => window.history.back()}>Back</button>}
      />
      <div className="card">
        <div className="profile-row">
          <div className="avatar">
            {photoUrl ? <img src={photoUrl} alt="Avatar" /> : <span>{(user?.displayName || "C").slice(0,1)}</span>}
          </div>
          <div>
            <p className="muted">Points balance</p>
            <h2>{balance} pts</h2>
          </div>
        </div>
        <label className="btn ghost">
          {savingPhoto ? "Uploading..." : "Change photo"}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !user?.uid) return;
              setSavingPhoto(true);
              const upload = await uploadChoreImage({ file, pathPrefix: "avatars" });
              await updateUserProfileFields(user.uid, { photoUrl: upload.url });
              setPhotoUrl(upload.url);
              setSavingPhoto(false);
            }}
          />
        </label>
      </div>
      <div className="card">
        <p className="muted">Spending / Rewards</p>
        {rewards.length === 0 && <p>No rewards yet.</p>}
        {rewards.map((reward) => (
          <div key={reward.id} className="profile-row">
            <span>{reward.title}</span>
            <span className="muted">{reward.pointCost} pts</span>
          </div>
        ))}
      </div>
      <div className="card">
        <p className="muted">Struggle course</p>
        <p>Placeholder: add parent-noted improvement areas.</p>
      </div>
    </div>
  );
};

export default ChildProfile;
