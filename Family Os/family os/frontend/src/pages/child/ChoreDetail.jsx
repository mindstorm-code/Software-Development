import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { uploadChoreImage } from "../../services/storage";
import { createSubmission, updateSubmission } from "../../services/submissions";
import { verifyChoreSubmission } from "../../services/ai";
import { validateSubmission } from "../../utils/validators";
import { getChoreInstanceById, updateChoreInstance } from "../../services/choreInstances";
import { getChoreById } from "../../services/chores";
import { useAuth } from "../../contexts/AuthContext";

const ChildChoreDetail = () => {
  const { id } = useParams();
  const { user, familyId } = useAuth();
  const [choreInstance, setChoreInstance] = useState(null);
  const [chore, setChore] = useState(null);
  const [checklistCompleted, setChecklistCompleted] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [startedAt, setStartedAt] = useState(Date.now());

  useEffect(() => {
    const loadChore = async () => {
      if (!id) return;
      setLoading(true);
      const instance = await getChoreInstanceById(id);
      const choreDoc = instance?.choreId ? await getChoreById(instance.choreId) : null;
      setChoreInstance(instance);
      setChore(choreDoc);
      setLoading(false);
      setStartedAt(Date.now());
    };

    loadChore();
  }, [id]);

  const proofType = chore?.proofType || "none";

  const toggleChecklist = (item) => {
    setChecklistCompleted((prev) =>
      prev.includes(item) ? prev.filter((entry) => entry !== item) : [...prev, item]
    );
  };

  const handleImages = (event) => {
    const files = Array.from(event.target.files || []).slice(0, 2);
    setImageFiles(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const error = validateSubmission({
      proofType,
      checklistCompleted,
      imageFiles,
      checklistItems: chore?.checklist || [],
    });
    if (error) {
      setMessage(error);
      return;
    }

    if (!choreInstance || !chore || !user?.uid || !familyId) {
      setMessage("Missing chore details.");
      return;
    }

    if (choreInstance.status && choreInstance.status !== "pending") {
      setMessage("This chore has already been submitted.");
      return;
    }

    const uploads = await Promise.all(
      imageFiles.map((file) => uploadChoreImage({ file }))
    );

    const imageUrls = uploads.map((upload) => upload.url);
    const imageHashes = uploads.map((upload) => upload.hash).filter(Boolean);
    const submittedImageUrl = imageUrls[0];

    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const submissionId = await createSubmission({
      familyId,
      choreInstanceId: id,
      childId: user.uid,
      checklistCompleted,
      imageUrls,
      imageHashes,
      submittedImageUrl,
      status: "submitted",
      startedAt: new Date(startedAt).toISOString(),
      durationSeconds,
    });

    await updateChoreInstance(id, { status: "submitted", durationSeconds });

    if (chore.aiVerificationEnabled) {
      const aiReview = await verifyChoreSubmission({
        choreTitle: chore.title,
        choreDescription: chore.description,
        checklist: chore.checklist || [],
        submittedImageUrl,
        afterImageUrl: chore.afterImageUrl,
        beforeImageUrl: chore.beforeImageUrl,
      });
      await updateSubmission(submissionId, { aiReview });
    }

    setMessage("Submitted! Your parent will review it soon.");
    setChecklistCompleted([]);
    setImageFiles([]);
  };

  return (
    <div className="page">
      <PageHeader title="Submit chore" subtitle="Show your work and earn points." />
      <button className="btn ghost" onClick={() => window.history.back()} style={{ marginBottom: "8px" }}>
        Back
      </button>

      <form className="form" onSubmit={handleSubmit}>
        {loading && <p className="muted">Loading chore...</p>}
        {!loading && !chore && (
          <p className="muted">Chore not found.</p>
        )}
        {!loading && chore && (
          <>
            <div className="form-group">
              <p className="label">Checklist</p>
              <div className="checklist">
                {(chore.checklist || []).map((item) => (
                  <label key={item} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={checklistCompleted.includes(item)}
                      onChange={() => toggleChecklist(item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
            {(proofType === "photo" || proofType === "photo_and_checklist") && (
              <label className="form-group">
                Upload photos (1-2)
                <input type="file" accept="image/*" multiple onChange={handleImages} />
              </label>
            )}
          </>
        )}
        <button className="btn primary" type="submit" disabled={loading}>
          Submit chore
        </button>
        {message && <p className="form-helper">{message}</p>}
      </form>
    </div>
  );
};

export default ChildChoreDetail;
