import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../contexts/AuthContext";
import { getPendingSubmissionsForParent, approveSubmission, rejectSubmission } from "../../services/submissions";
import { getChoreInstanceById } from "../../services/choreInstances";
import { getChoreById } from "../../services/chores";
import { getPendingRedemptions, approveRedemption, rejectRedemption, getRewardById } from "../../services/rewards";
import { getUserProfile } from "../../services/firestore";
import { formatTimestamp } from "../../utils/date";

const ParentReviews = () => {
  const { familyId, user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState({});
  const [pointsOverride, setPointsOverride] = useState({});

  const loadReviews = async () => {
    if (!familyId) return;
    setLoading(true);
    const pending = await getPendingSubmissionsForParent(familyId);

    const enriched = await Promise.all(
      pending.map(async (submission) => {
        const instance = submission.choreInstanceId
          ? await getChoreInstanceById(submission.choreInstanceId)
          : null;
        const chore = instance?.choreId ? await getChoreById(instance.choreId) : null;
        const childProfile = submission.childId
          ? await getUserProfile(submission.childId)
          : null;

        return {
          ...submission,
          choreTitle: chore?.title || submission.choreTitle || "Chore",
          childName: childProfile?.displayName || "Child",
          pointsSuggested: chore?.pointValue || 0,
          choreInstanceId: instance?.id || submission.choreInstanceId,
          afterImageUrl: chore?.afterImageUrl,
          beforeImageUrl: chore?.beforeImageUrl,
        };
      })
    );

    const pendingRedemptions = await getPendingRedemptions(familyId);
    const enrichedRedemptions = await Promise.all(
      pendingRedemptions.map(async (r) => {
        const reward = r.rewardId ? await getRewardById(r.rewardId) : null;
        const childProfile = r.childId ? await getUserProfile(r.childId) : null;
        return {
          ...r,
          rewardTitle: reward?.title || "Reward",
          childName: childProfile?.displayName || "Child",
          points: reward?.pointCost || reward?.pointsRequired || r.pointsSpent || 0,
        };
      })
    );

    setSubmissions(enriched);
    setRedemptions(enrichedRedemptions);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [familyId]);

  const handleApprove = async (submission) => {
    setActionState((prev) => ({ ...prev, [submission.id]: "approving" }));
    const overrideRaw = pointsOverride[submission.id];
    const overrideValue =
      overrideRaw === "" || overrideRaw === undefined ? null : Number(overrideRaw);
    const pointsAwarded =
      overrideValue === null || Number.isNaN(overrideValue)
        ? submission.pointsSuggested
        : overrideValue;
    await approveSubmission({
      submissionId: submission.id,
      reviewerId: user?.uid || "",
      pointsAwarded,
      notes: "Approved",
      choreInstanceId: submission.choreInstanceId,
      childId: submission.childId,
      familyId,
    });
    await loadReviews();
    setActionState((prev) => ({ ...prev, [submission.id]: "" }));
  };

  const handleReject = async (submission) => {
    setActionState((prev) => ({ ...prev, [submission.id]: "rejecting" }));
    await rejectSubmission({
      submissionId: submission.id,
      reviewerId: user?.uid || "",
      notes: "Rejected",
      choreInstanceId: submission.choreInstanceId,
    });
    await loadReviews();
    setActionState((prev) => ({ ...prev, [submission.id]: "" }));
  };

  const handleApproveRedemption = async (r) => {
    setActionState((prev) => ({ ...prev, [r.id]: "approving" }));
    const reward = { title: r.rewardTitle, pointCost: r.points, pointsRequired: r.points };
    await approveRedemption({
      redemptionId: r.id,
      reward,
      childId: r.childId,
      familyId,
    });
    await loadReviews();
    setActionState((prev) => ({ ...prev, [r.id]: "" }));
  };

  const handleRejectRedemption = async (r) => {
    setActionState((prev) => ({ ...prev, [r.id]: "rejecting" }));
    await rejectRedemption(r.id);
    await loadReviews();
    setActionState((prev) => ({ ...prev, [r.id]: "" }));
  };

  return (
    <div className="page">
      <PageHeader
        title="Review submissions & redemptions"
        subtitle="Approve, reject, or adjust points."
        action={<button className="btn ghost" onClick={() => window.history.back()}>Back</button>}
      />

      <section className="card-list">
        {loading && <p className="muted">Loading submissions...</p>}
        {!loading && submissions.length === 0 && (
          <p className="muted">No submissions waiting.</p>
        )}
        {submissions.map((submission) => (
          <Card
            key={submission.id}
            title={submission.choreTitle}
            footer={<Badge label={submission.status} variant="warning" />}
          >
            <p>{submission.childName}</p>
            <p className="muted">
              {submission.submittedAt
                ? formatTimestamp(submission.submittedAt)
                : "Submitted recently"}
            </p>
            <label className="form-group">
              Points to award
              <input
                type="number"
                min="0"
                value={
                  pointsOverride[submission.id] ??
                  submission.pointsSuggested ??
                  0
                }
                onChange={(event) =>
                  setPointsOverride((prev) => ({
                    ...prev,
                    [submission.id]: event.target.value,
                  }))
                }
              />
            </label>
            <div className="image-compare">
              {submission.afterImageUrl && (
                <div>
                  <p className="muted">Expected after</p>
                  <img className="review-img" src={submission.afterImageUrl} alt="Expected after" />
                </div>
              )}
              {submission.submittedImageUrl || submission.imageUrls?.[0] ? (
                <div>
                  <p className="muted">Submitted</p>
                  <img
                    className="review-img"
                    src={submission.submittedImageUrl || submission.imageUrls?.[0]}
                    alt="Submitted"
                  />
                </div>
              ) : null}
              {submission.beforeImageUrl && (
                <div>
                  <p className="muted">Reference before</p>
                  <img className="review-img" src={submission.beforeImageUrl} alt="Before" />
                </div>
              )}
            </div>
            <div className="button-row">
              <button
                className="btn success"
                disabled={actionState[submission.id]}
                onClick={() => handleApprove(submission)}
              >
                Approve
              </button>
              <button className="btn ghost" disabled>
                Needs info
              </button>
              <button
                className="btn danger"
                disabled={actionState[submission.id]}
                onClick={() => handleReject(submission)}
              >
                Reject
              </button>
            </div>
          </Card>
        ))}
      </section>

      <section className="card-list">
        <h2>Reward redemptions</h2>
        {!loading && redemptions.length === 0 && (
          <p className="muted">No redemptions waiting.</p>
        )}
        {redemptions.map((r) => (
          <Card
            key={r.id}
            title={r.rewardTitle}
            footer={<Badge label="pending" variant="warning" />}
          >
            <p>{r.childName}</p>
            <p className="muted">{r.points} pts</p>
            <div className="button-row">
              <button
                className="btn success"
                disabled={actionState[r.id]}
                onClick={() => handleApproveRedemption(r)}
              >
                Approve
              </button>
              <button
                className="btn danger"
                disabled={actionState[r.id]}
                onClick={() => handleRejectRedemption(r)}
              >
                Reject
              </button>
            </div>
          </Card>
        ))}
      </section>

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

export default ParentReviews;
