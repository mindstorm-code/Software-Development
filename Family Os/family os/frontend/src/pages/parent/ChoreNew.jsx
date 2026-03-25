import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { createChore } from "../../services/chores";
import { useAuth } from "../../contexts/AuthContext";

const defaultForm = {
  title: "",
  description: "",
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
};

const ParentChoreNew = () => {
  const { familyId, user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!familyId) {
      setMessage("Missing family setup.");
      return;
    }

    const checklistArray = form.checklist
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const now = new Date();
    const recurrenceConfig = {
      dayOfWeek: now.getDay(),
      dayOfMonth: now.getDate(),
      month: now.getMonth(),
    };

    await createChore({
      ...form,
      checklist: checklistArray,
      proofRequired: form.proofType !== "none",
      recurrenceConfig,
      familyId,
      createdBy: user?.uid || "",
    });

    setMessage("Chore created.");
    setForm(defaultForm);
  };

  return (
    <div className="page">
      <PageHeader title="New chore" subtitle="Create a recurring chore template." />

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
          Assigned child ID
          <input
            name="assignedChildId"
            value={form.assignedChildId}
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
        <button className="btn primary" type="submit">
          Save chore
        </button>
        {message && <p className="form-success">{message}</p>}
      </form>
    </div>
  );
};

export default ParentChoreNew;
