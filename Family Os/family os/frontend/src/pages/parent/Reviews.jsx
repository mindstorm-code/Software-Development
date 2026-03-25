import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import { useAuth } from "../../contexts/AuthContext";
import { getPendingSubmissionsForParent, approveSubmission, rejectSubmission } from "../../services/submissions";
import { getChoreInstanceById } from "../../services/choreInstances";
import { getChoreById } from "../../services/chores";
import { getUserProfile } from "../../services/firestore";
import { formatTimestamp } from "../../utils/date";

const ParentReviews = () => {
  const { familyId, user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
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
        };
      })
    );

    setSubmissions(enriched);
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

  return (
    <div className="page">
      <PageHeader title="Review submissions" subtitle="Approve, reject, or adjust points." />

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
    </div>
  );
};

export default ParentReviews;
