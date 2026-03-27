import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import ProgressBar from "../../components/ProgressBar";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../contexts/AuthContext";
import {
  getChildrenByFamily,
  updateUserPin,
  createChildUser,
  deleteChildUser,
  updateUserProfileFields,
} from "../../services/users";
import { getChildPointsBalance } from "../../services/pointsLedger";
import { hashPin } from "../../utils/pin";
import { uploadChoreImage } from "../../services/storage";
import { getChoresByChild } from "../../services/chores";
import { getChoreInstancesForToday } from "../../services/choreInstances";

const ParentChildren = () => {
  const { familyId } = useAuth();
  const [children, setChildren] = useState([]);
  const [modalChild, setModalChild] = useState(null);
  const [pinForm, setPinForm] = useState({ pin: "", confirm: "", resetRequired: false });
  const [pinError, setPinError] = useState("");
  const [savingPin, setSavingPin] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", pin: "", confirm: "" });
  const [addError, setAddError] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editChild, setEditChild] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteChild, setDeleteChild] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const loadChildren = async () => {
    if (!familyId) return;
    setLoading(true);
    const childProfiles = await getChildrenByFamily(familyId);
    const enriched = await Promise.all(
      childProfiles.map(async (child) => {
        const points = await getChildPointsBalance(child.id, familyId);
        const chores = await getChoresByChild(child.id, familyId);
        const todayInstances = await getChoreInstancesForToday(child.id, familyId);
        const choresToday = chores.map((chore) => {
          const instance = todayInstances.find((ci) => ci.choreId === chore.id);
          return { title: chore.title, status: instance?.status || "pending" };
        });
        const totalTasks = todayInstances.length;
        const completedTasks = todayInstances.filter((ci) => ci.status === "approved").length;
        const streakDays = child.streakDays || 0;
        const rating = child.rating || 4; // placeholder if none
        return {
          ...child,
          points,
          choresToday,
          totalTasks,
          completedTasks,
          streakDays,
          rating,
        };
      })
    );
    setChildren(enriched);
    setLoading(false);
  };

  useEffect(() => {
    loadChildren();
  }, [familyId]);

  const openPinModal = (child) => {
    setModalChild(child);
    setPinForm({ pin: "", confirm: "", resetRequired: false });
    setPinError("");
  };

  const closePinModal = () => {
    setModalChild(null);
  };

  const handlePinSave = async () => {
    setPinError("");
    if (!/^[0-9]{4}$/.test(pinForm.pin)) {
      setPinError("PIN must be exactly 4 digits.");
      return;
    }
    if (pinForm.pin !== pinForm.confirm) {
      setPinError("PINs do not match.");
      return;
    }
    setSavingPin(true);
    const hashed = await hashPin(pinForm.pin);
    await updateUserPin({
      userId: modalChild.id,
      pinHash: hashed,
      pinResetRequired: pinForm.resetRequired,
    });
    setSavingPin(false);
    closePinModal();
    await loadChildren();
  };

  const handleRemovePin = async () => {
    setSavingPin(true);
    await updateUserPin({
      userId: modalChild.id,
      pinHash: "",
      pinResetRequired: false,
    });
    setSavingPin(false);
    closePinModal();
    await loadChildren();
  };

  return (
    <div className="page">
      <PageHeader
        title="Children"
        subtitle="Family control center."
        action={<button className="btn ghost" onClick={() => window.history.back()}>Back</button>}
      />

      <section className="card-list">
        <button className="btn primary full-width" onClick={() => setAddOpen(true)}>
          Add Child
        </button>
        {loading && <p className="muted">Loading children...</p>}
        {!loading && children.length === 0 && (
          <p className="muted">No child profiles yet.</p>
        )}
        {children.map((child) => {
          const progress = child.totalTasks
            ? Math.round((child.completedTasks / child.totalTasks) * 100)
            : 0;
          return (
            <Card
              key={child.id}
              title={child.displayName || child.name || "Child"}
              footer={<Badge label={`${child.points || 0} pts`} />}
            >
              <div className="child-row">
                <div className="avatar">
                  {child.photoUrl ? (
                    <img src={child.photoUrl} alt={child.displayName} />
                  ) : (
                    <span>{(child.displayName || "C").slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <p className="muted">{child.familyId}</p>
                  <p>
                    🔥 Streak: {child.streakDays || 0} days
                    <br />
                    ⭐ Rating: {child.rating || 4} / 5
                  </p>
                </div>
              </div>

              <div className="form-group">
                <p className="muted">Progress</p>
                <ProgressBar value={progress} max={100} />
                <p className="muted">
                  {child.completedTasks} / {child.totalTasks} tasks complete
                </p>
              </div>

              {child.choresToday?.length > 0 && (
                <div className="muted small">
                  {child.choresToday.map((c) => (
                    <div key={`${child.id}-${c.title}`}>{c.title}: {c.status}</div>
                  ))}
                </div>
              )}

              <div className="button-row">
                <button className="btn ghost" onClick={() => alert("Profile view coming soon")}>
                  View Profile
                </button>
                <button className="btn ghost" onClick={() => openPinModal(child)}>
                  Reset PIN
                </button>
                <button className="btn ghost" onClick={() => { setEditChild(child); setEditName(child.displayName || ""); }}>
                  Edit
                </button>
                <button className="btn danger" onClick={() => { setDeleteChild(child); setDeleteConfirm(""); }}>
                  Delete
                </button>
                <label className="btn ghost">
                  Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setAvatarUploading(true);
                      const uploaded = await uploadChoreImage({ file, pathPrefix: "avatars" });
                      await updateUserProfileFields(child.id, { photoUrl: uploaded.url });
                      setAvatarUploading(false);
                      await loadChildren();
                    }}
                  />
                </label>
              </div>
            </Card>
          );
        })}
      </section>

      {addOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Add Child</h3>
            <label className="form-group">
              Child Name
              <input
                value={addForm.name}
                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </label>
            <label className="form-group">
              PIN (4 digits)
              <input
                inputMode="numeric"
                maxLength="4"
                value={addForm.pin}
                onChange={(e) => setAddForm((p) => ({ ...p, pin: e.target.value }))}
              />
            </label>
            <label className="form-group">
              Confirm PIN
              <input
                inputMode="numeric"
                maxLength="4"
                value={addForm.confirm}
                onChange={(e) => setAddForm((p) => ({ ...p, confirm: e.target.value }))}
              />
            </label>
            {addError && <p className="form-error">{addError}</p>}
            <div className="button-row">
              <button className="btn ghost" onClick={() => setAddOpen(false)}>
                Cancel
              </button>
              <button
                className="btn primary"
                disabled={addSaving}
                onClick={async () => {
                  setAddError("");
                  if (!addForm.name.trim()) {
                    setAddError("Name is required.");
                    return;
                  }
                  if (!/^[0-9]{4}$/.test(addForm.pin)) {
                    setAddError("PIN must be exactly 4 digits.");
                    return;
                  }
                  if (addForm.pin !== addForm.confirm) {
                    setAddError("PINs do not match.");
                    return;
                  }
                  setAddSaving(true);
                  const pinHash = await hashPin(addForm.pin);
                  await createChildUser({
                    displayName: addForm.name.trim(),
                    pinHash,
                    familyId,
                  });
                  setAddSaving(false);
                  setAddOpen(false);
                  setAddForm({ name: "", pin: "", confirm: "" });
                  await loadChildren();
                  alert("Child added successfully");
                }}
              >
                {addSaving ? "Creating..." : "Create Child"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalChild && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Reset PIN for {modalChild.displayName || "Child"}</h3>
            <label className="form-group">
              New PIN (4 digits)
              <input
                inputMode="numeric"
                maxLength="4"
                value={pinForm.pin}
                onChange={(e) => setPinForm((p) => ({ ...p, pin: e.target.value }))}
              />
            </label>
            <label className="form-group">
              Confirm PIN
              <input
                inputMode="numeric"
                maxLength="4"
                value={pinForm.confirm}
                onChange={(e) => setPinForm((p) => ({ ...p, confirm: e.target.value }))}
              />
            </label>
            <label className="form-group checkbox">
              <input
                type="checkbox"
                checked={pinForm.resetRequired}
                onChange={(e) => setPinForm((p) => ({ ...p, resetRequired: e.target.checked }))}
              />
              Require PIN reset on next login
            </label>
            {pinError && <p className="form-error">{pinError}</p>}
            <div className="button-row">
              <button className="btn ghost" onClick={closePinModal}>
                Cancel
              </button>
              <button className="btn danger" onClick={handleRemovePin} disabled={savingPin}>
                Remove PIN
              </button>
              <button className="btn primary" onClick={handlePinSave} disabled={savingPin}>
                {savingPin ? "Saving..." : "Save PIN"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editChild && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Edit child</h3>
            <label className="form-group">
              Name
              <input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </label>
            <div className="button-row">
              <button className="btn ghost" onClick={() => setEditChild(null)}>Cancel</button>
              <button
                className="btn primary"
                onClick={async () => {
                  if (!editName.trim()) return;
                  await updateUserProfileFields(editChild.id, { displayName: editName.trim() });
                  setEditChild(null);
                  await loadChildren();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteChild && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Delete {deleteChild.displayName || "child"}</h3>
            <p>Type DELETE to confirm.</p>
            <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
            <div className="button-row">
              <button className="btn ghost" onClick={() => setDeleteChild(null)}>Cancel</button>
              <button
                className="btn danger"
                disabled={deleteConfirm !== "DELETE"}
                onClick={async () => {
                  await deleteChildUser(deleteChild.id);
                  setDeleteChild(null);
                  setDeleteConfirm("");
                  await loadChildren();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ParentChildren;
