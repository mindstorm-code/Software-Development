import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import BottomNav from "../../components/BottomNav";
import { getChoreById, updateChore } from "../../services/chores";
import { uploadChoreImage } from "../../services/storage";
import { useAuth } from "../../contexts/AuthContext";

const ChoreEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { familyId } = useAuth();
  const [form, setForm] = useState(null);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const chore = await getChoreById(id);
      setForm({
        ...chore,
        checklistText: (chore.checklist || []).join("\n"),
      });
      setLoading(false);
    };
    load();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    let beforeImageUrl = form.beforeImageUrl;
    let afterImageUrl = form.afterImageUrl;

    if (beforeFile) {
      const upload = await uploadChoreImage({
        file: beforeFile,
        pathPrefix: "chores/before",
      });
      beforeImageUrl = upload.url;
    }

    if (afterFile) {
      const upload = await uploadChoreImage({
        file: afterFile,
        pathPrefix: "chores/after",
      });
      afterImageUrl = upload.url;
    }

    if (form.aiVerificationEnabled && !afterImageUrl) {
      setError("After image is required when AI verification is enabled.");
      setSaving(false);
      return;
    }

    const checklistArray = form.checklistText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    await updateChore(id, {
      title: form.title,
      description: form.description,
      assignedChildId: form.assignedChildId,
      recurrence: form.recurrence,
      pointValue: Number(form.pointValue) || 0,
      difficulty: form.difficulty,
      checklist: checklistArray,
      proofType: form.proofType,
      proofRequired: form.proofType !== "none",
      aiVerificationEnabled: form.aiVerificationEnabled,
      parentApprovalRequired: form.parentApprovalRequired,
      active: form.active !== false,
      familyId,
      beforeImageUrl,
      afterImageUrl,
    });

    setSaving(false);
    setMessage("Chore updated.");
    navigate("/parent/chores");
  };

  if (loading || !form) {
    return (
      <div className="page">
        <p>Loading chore...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Edit chore"
        subtitle="Update a recurring chore template."
        action={<button className="btn ghost" onClick={() => navigate(-1)}>Back</button>}
      />
      <form className="form" onSubmit={handleSubmit}>
        <label className="form-group">
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label className="form-group">
          Description
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
          />
        </label>
        <label className="form-group">
          Assigned child ID
          <input
            name="assignedChildId"
            value={form.assignedChildId || ""}
            onChange={handleChange}
            placeholder="child-uid"
          />
        </label>
        <div className="form-row">
          <label className="form-group">
            Recurrence
            <select name="recurrence" value={form.recurrence} onChange={handleChange}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          <label className="form-group">
            Points
            <input
              name="pointValue"
              type="number"
              min="0"
              value={form.pointValue}
              onChange={handleChange}
            />
          </label>
        </div>
        <label className="form-group">
          Difficulty
          <select name="difficulty" value={form.difficulty} onChange={handleChange}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <label className="form-group">
          Checklist (one per line)
          <textarea
            name="checklistText"
            value={form.checklistText || ""}
            onChange={handleChange}
            placeholder="1. Clear desk"
          />
        </label>
        <label className="form-group">
          Proof type
          <select name="proofType" value={form.proofType} onChange={handleChange}>
            <option value="none">None</option>
            <option value="checklist">Checklist</option>
            <option value="photo">Photo</option>
            <option value="photo_and_checklist">Photo + Checklist</option>
          </select>
        </label>
        <label className="form-group">
          Before image (optional)
          <input type="file" accept="image/*" onChange={(e) => setBeforeFile(e.target.files?.[0] || null)} />
          {form.beforeImageUrl && <span className="muted">Existing: {form.beforeImageUrl}</span>}
        </label>
        <label className="form-group">
          After image {form.aiVerificationEnabled ? "(required for AI)" : "(optional)"}
          <input type="file" accept="image/*" onChange={(e) => setAfterFile(e.target.files?.[0] || null)} />
          {form.afterImageUrl && <span className="muted">Existing: {form.afterImageUrl}</span>}
        </label>
        <label className="form-group checkbox">
          <input
            type="checkbox"
            name="aiVerificationEnabled"
            checked={form.aiVerificationEnabled}
            onChange={handleChange}
          />
          Enable AI verification
        </label>
        <label className="form-group checkbox">
          <input
            type="checkbox"
            name="parentApprovalRequired"
            checked={form.parentApprovalRequired}
            onChange={handleChange}
          />
          Parent approval required
        </label>
        <button className="btn primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update chore"}
        </button>
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}
      </form>

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

export default ChoreEdit;
