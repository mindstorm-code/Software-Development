import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../contexts/AuthContext";
import { getChildrenByFamily, updateChildProfile } from "../../services/users";
import { getChildPointsBalance } from "../../services/pointsLedger";
import { getChoreInstancesForToday } from "../../services/choreInstances";
import { uploadChoreImage } from "../../services/storage";

const calcAgeGroup = (age) => {
  const a = Number(age) || 0;
  if (a <= 7) return "2-7";
  if (a <= 12) return "8-12";
  return "13-20";
};

const ChildProfileEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { familyId } = useAuth();

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ displayName: "", age: "", skillLevel: 3 });
  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [points, setPoints] = useState(0);
  const [progress, setProgress] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    const load = async () => {
      if (!id || !familyId) return;
      const kids = await getChildrenByFamily(familyId);
      const match = kids.find((k) => k.id === id);
      setChild(match || null);
      if (match) {
        setForm({
          displayName: match.displayName || "",
          age: match.age || "",
          skillLevel: match.skillLevel || 3,
        });
        const bal = await getChildPointsBalance(match.id, familyId);
        setPoints(bal);
        const today = await getChoreInstancesForToday(match.id, familyId);
        const completed = today.filter((ci) => ci.status === "approved").length;
        setProgress({ total: today.length, completed });
      }
      setLoading(false);
    };
    load();
  }, [id, familyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const ageNum = Number(form.age);
    if (Number.isNaN(ageNum)) {
      setError("Age must be a number");
      return;
    }
    const skill = Number(form.skillLevel);
    if (skill < 1 || skill > 5) {
      setError("Skill level must be between 1 and 5");
      return;
    }
    let photoUrl = child?.photoUrl || "";
    if (photoFile) {
      const uploaded = await uploadChoreImage({ file: photoFile, pathPrefix: "avatars" });
      photoUrl = uploaded.url;
    }
    await updateChildProfile(child.id, {
      displayName: form.displayName,
      age: ageNum,
      ageGroup: calcAgeGroup(ageNum),
      skillLevel: skill,
      photoUrl,
    });
    setMessage("Profile updated");
  };

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading child...</p>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="page">
        <p className="muted">Child not found.</p>
      </div>
    );
  }

  const progressPct =
    progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="page">
      <PageHeader
        title="Edit child"
        subtitle="Update profile details."
        action={<button className="btn ghost" onClick={() => navigate(-1)}>Back</button>}
      />

      <Card
        title={child.displayName || "Child"}
        footer={<Badge label={`${points} pts`} />}
      >
        <div className="child-row">
          <div className="avatar">
            {child.photoUrl ? <img src={child.photoUrl} alt={child.displayName} /> : <span>{(child.displayName || "C").slice(0,1)}</span>}
          </div>
          <div>
            <p className="muted">Age group: {child.ageGroup || calcAgeGroup(form.age)}</p>
            <p className="muted">Skill level: {child.skillLevel || form.skillLevel}</p>
          </div>
        </div>
        <div className="form-group">
          <p className="muted">Today's progress</p>
          <ProgressBar value={progressPct} max={100} />
          <p className="muted">
            {progress.completed} / {progress.total} tasks complete
          </p>
        </div>
      </Card>

      <form className="form card" onSubmit={handleSubmit}>
        <label className="form-group">
          Name
          <input
            value={form.displayName}
            onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
            required
          />
        </label>
        <label className="form-group">
          Age
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
            required
          />
        </label>
        <label className="form-group">
          Skill level (1-5)
          <input
            type="number"
            min="1"
            max="5"
            value={form.skillLevel}
            onChange={(e) => setForm((p) => ({ ...p, skillLevel: e.target.value }))}
          />
        </label>
        <label className="form-group">
          Profile photo
          <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
        </label>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <button className="btn primary" type="submit">
          Save changes
        </button>
      </form>
    </div>
  );
};

export default ChildProfileEdit;
