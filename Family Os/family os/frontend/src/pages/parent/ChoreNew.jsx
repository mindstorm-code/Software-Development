import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { createChore } from "../../services/chores";
import { useAuth } from "../../contexts/AuthContext";
import { uploadChoreImage } from "../../services/storage";
import BottomNav from "../../components/BottomNav";
import { getChildrenByFamily } from "../../services/users";
import { apiFetch } from "../../services/apiClient";

const defaultForm = {
  title: "",
  description: "",
  category: "",
  assignedChildId: "",
  recurrence: "daily",
  pointValue: 10,
  difficulty: "easy",
  checklist: "",
  proofRequired: true,
  proofType: "photo",
  aiVerificationEnabled: false,
  parentApprovalRequired: true,
  active: true,
  beforeImageUrl: "",
  afterImageUrl: "",
};

const ParentChoreNew = () => {
  const { familyId, user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [children, setChildren] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [suggestedPoints, setSuggestedPoints] = useState(null);
  const [econ, setEcon] = useState(null);

  useEffect(() => {
    const loadChildren = async () => {
      if (!familyId) return;
      setChildrenLoading(true);
      const kids = await getChildrenByFamily(familyId);
      setChildren(kids);
      setChildrenLoading(false);
    };
    loadChildren();
  }, [familyId]);

  useEffect(() => {
    const loadEconomy = async () => {
      if (!familyId) return;
      try {
        const res = await apiFetch(`/api/economy/${familyId}`);
        setEcon(res);
      } catch {
        setEcon(null);
      }
    };
    loadEconomy();
  }, [familyId]);

  const basePointsByCategory = {
    "Quick Task": 5,
    "Daily Responsibility": 10,
    "Standard Chore": 15,
    "Deep Clean": 20,
    "Heavy Work": 30,
    "Bonus / Initiative": 25,
  };

  const computeSuggested = (category) => {
    const basePoints = basePointsByCategory[category] || 10;
    if (!econ || !econ.weeklyBudget || !econ.totalAvailablePoints) {
      return basePoints;
    }
    const totalPts = Number(econ.totalAvailablePoints);
    if (totalPts <= 0) return basePoints;
    const budget = Number(econ.weeklyBudget);
    const targetPoints = budget * 10;
    const adjustmentFactor = targetPoints / totalPts;
    let suggested = basePoints * adjustmentFactor;
    suggested = Math.max(3, Math.min(50, suggested));
    return Math.round(suggested);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextVal = type === "checkbox" ? checked : value;
    setForm((prev) => {
      const updated = { ...prev, [name]: nextVal };
      if (name === "category") {
        const suggestion = computeSuggested(nextVal);
        setSuggestedPoints(suggestion);
        // Only overwrite if user hasn't touched pointValue manually (heuristic: when equal to default or previous suggestion)
        if (prev.pointValue === defaultForm.pointValue || prev.pointValue === suggestedPoints) {
          updated.pointValue = suggestion;
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!familyId) {
      setMessage("Missing family setup.");
      return;
    }

    const checklistArray = form.checklist
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!form.category) {
      setError("Category is required.");
      return;
    }

    if (Number(form.pointValue) < 1) {
      setError("Points must be at least 1.");
      return;
    }

    const now = new Date();
    const recurrenceConfig = {
      dayOfWeek: now.getDay(),
      dayOfMonth: now.getDate(),
      month: now.getMonth(),
    };

    try {
      setUploading(true);

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
        setUploading(false);
        return;
      }

      await createChore({
        ...form,
        pointValue: Number(form.pointValue) || 1,
        checklist: checklistArray,
        proofRequired: form.proofType !== "none",
        recurrenceConfig,
        familyId,
        createdBy: user?.uid || "",
        beforeImageUrl,
        afterImageUrl,
      });

      setMessage("Chore created.");
      setForm(defaultForm);
      setSuggestedPoints(null);
      setBeforeFile(null);
      setAfterFile(null);
    } finally {
      setUploading(false);
    }

  };

  return (
    <div className="page">
      <PageHeader
        title="New chore"
        subtitle="Create a recurring chore template."
        action={<button className="btn ghost" onClick={() => window.history.back()}>Back</button>}
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
            value={form.description}
            onChange={handleChange}
          />
        </label>
        <label className="form-group">
          Category
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="Quick Task">Quick Task</option>
            <option value="Daily Responsibility">Daily Responsibility</option>
            <option value="Standard Chore">Standard Chore</option>
            <option value="Deep Clean">Deep Clean</option>
            <option value="Heavy Work">Heavy Work</option>
            <option value="Bonus / Initiative">Bonus / Initiative</option>
          </select>
        </label>
        {suggestedPoints !== null && (
          <div className="muted">
            Suggested: {suggestedPoints} points
            {econ && econ.weeklyBudget && econ.totalAvailablePoints ? (
              <span> (based on your family economy)</span>
            ) : null}
          </div>
        )}
        <label className="form-group">
          Assigned child
          <select
            name="assignedChildId"
            value={form.assignedChildId}
            onChange={handleChange}
            disabled={childrenLoading}
          >
            <option value="">Select a child</option>
            <option value="all">All children (everyone must do it)</option>
            <option value="open">Open bonus (any child can claim)</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.displayName || child.name || child.id}
              </option>
            ))}
          </select>
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
            name="checklist"
            value={form.checklist}
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
        <button className="btn primary" type="submit" disabled={uploading}>
          {uploading ? "Saving..." : "Save chore"}
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

export default ParentChoreNew;
