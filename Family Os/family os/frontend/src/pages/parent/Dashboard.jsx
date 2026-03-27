import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import ProgressBar from "../../components/ProgressBar";
import BottomNav from "../../components/BottomNav";
import EconomyPanel from "../../components/EconomyPanel";
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
import { getChildrenByFamily } from "../../services/users";
import { getChoresByChild } from "../../services/chores";
import { getChoreInstancesForToday } from "../../services/choreInstances";

const ParentDashboard = () => {
  const { familyId, user } = useAuth();
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [choresDueToday, setChoresDueToday] = useState(0);
  const [pointsIssued, setPointsIssued] = useState(0);
  const [loading, setLoading] = useState(true);
  const [childrenProgress, setChildrenProgress] = useState([]);

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

      // child progress
      const kids = await getChildrenByFamily(familyId);
      const kidProgress = await Promise.all(
        kids.map(async (child) => {
          const todayInstances = await getChoreInstancesForToday(child.id, familyId);
          const totalTasks = todayInstances.length;
          const completedTasks = todayInstances.filter((ci) => ci.status === "approved").length;
          const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
          return {
            id: child.id,
            name: child.displayName || child.name || "Child",
            totalTasks,
            completedTasks,
            progress,
            streakDays: child.streakDays || 0,
            rating: child.rating || 4,
          };
        })
      );
      setChildrenProgress(kidProgress);

      setLoading(false);
    };

    loadDashboard();
  }, [familyId]);

  return (
    <div className="page">
      <PageHeader
        title={user?.displayName ? `Hi, ${user.displayName}` : "Parent dashboard"}
        subtitle="Quick snapshot of today."
        action={<button className="btn ghost" onClick={() => window.history.back()}>Back</button>}
      />

      <section className="section">
        <h2>House state</h2>
        <Card title="House Score: 82 / 100" footer={<Badge label="Running smoothly" variant="success" />}>
          <ProgressBar value={82} max={100} />
        </Card>
      </section>

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

      <section className="section">
        <h2>Children progress</h2>
        <div className="card-list">
          {childrenProgress.length === 0 && !loading && (
            <p className="muted">No children yet.</p>
          )}
          {childrenProgress.map((child) => (
            <Card key={child.id} title={child.name}>
              <p className="muted">
                🔥 Streak: {child.streakDays} days • ⭐ Rating: {child.rating} / 5
              </p>
              <ProgressBar value={child.progress} max={100} />
              <p className="muted">
                {child.completedTasks} / {child.totalTasks} tasks complete today
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section">
        <EconomyPanel familyId={familyId} />
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

export default ParentDashboard;
