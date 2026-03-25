import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../contexts/AuthContext";
import { getPendingSubmissionsForParent } from "../../services/submissions";
import {
  generateChoreInstancesForToday,
  getChoreInstancesForTodayByFamily,
  getChoreInstanceById,
} from "../../services/choreInstances";
import { getChoreById } from "../../services/chores";
import { getUserProfile } from "../../services/firestore";
import { formatTimestamp } from "../../utils/date";
import { getFamilyPointsIssued } from "../../services/pointsLedger";

const ParentDashboard = () => {
  const { familyId } = useAuth();
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [choresDueToday, setChoresDueToday] = useState(0);
  const [pointsIssued, setPointsIssued] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!familyId) return;
      setLoading(true);
      await generateChoreInstancesForToday(familyId);
      const [pendingRaw, dueToday, issued] = await Promise.all([
        getPendingSubmissionsForParent(familyId),
        getChoreInstancesForTodayByFamily(familyId),
        getFamilyPointsIssued(familyId),
      ]);

      const pending = await Promise.all(
        pendingRaw.map(async (submission) => {
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
          };
        })
      );

      setPendingSubmissions(pending);
      setChoresDueToday(dueToday.length);
      setPointsIssued(issued);
      setLoading(false);
    };

    loadDashboard();
  }, [familyId]);

  return (
    <div className="page">
      <PageHeader title="Parent dashboard" subtitle="Quick snapshot of today." />

      <section className="stat-grid">
        <StatCard
          label="Pending reviews"
          value={loading ? "..." : pendingSubmissions.length}
          helper="Submissions waiting"
        />
        <StatCard
          label="Points issued"
          value={loading ? "..." : pointsIssued}
          helper="All time"
        />
        <StatCard
          label="Chores due today"
          value={loading ? "..." : choresDueToday}
          helper="Across family"
        />
      </section>

      <section className="section">
        <h2>Review queue</h2>
        <div className="card-list">
          {loading && <p className="muted">Loading submissions...</p>}
          {!loading && pendingSubmissions.length === 0 && (
            <p className="muted">No submissions waiting.</p>
          )}
          {pendingSubmissions.map((submission) => (
            <Card
              key={submission.id}
              title={submission.choreTitle || "Chore submission"}
              footer={<Badge label={submission.status} variant="warning" />}
            >
              <p>{submission.childName || "Child"}</p>
              <p className="muted">
                {submission.submittedAt
                  ? formatTimestamp(submission.submittedAt)
                  : "Submitted recently"}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <BottomNav
        items={[
          { label: "Dashboard", to: "/parent/dashboard" },
          { label: "Chores", to: "/parent/chores" },
          { label: "Reviews", to: "/parent/reviews" },
        ]}
      />
    </div>
  );
};

export default ParentDashboard;
