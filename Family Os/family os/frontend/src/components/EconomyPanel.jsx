import { useEffect, useState } from "react";
import Card from "./Card";
import { apiFetch } from "../services/apiClient";
import { getChoresByFamily } from "../services/chores";

/**
 * Simplified Family Economy Panel
 * Shows only rate, weekly budget (editable), and total available points for the week.
 */
const EconomyPanel = ({ familyId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weeklyBudget, setWeeklyBudget] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [edit, setEdit] = useState(false);
  const [draftBudget, setDraftBudget] = useState(0);

  const derivePointsFromChores = async (famId) => {
    try {
      const chores = await getChoresByFamily(famId);
      return chores.reduce((sum, c) => sum + (Number(c.pointValue) || 0), 0);
    } catch {
      return 0;
    }
  };

  const cacheKey = familyId ? `economy_cache_${familyId}` : null;

  const writeCache = (data) => {
    if (!cacheKey) return;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  };

  const readCache = () => {
    if (!cacheKey) return null;
    try {
      const raw = localStorage.getItem(cacheKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const loadData = async () => {
    if (!familyId) {
      setError("Unable to load economy");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/economy/${familyId}`);
      const points =
        res.totalAvailablePoints !== undefined
          ? Number(res.totalAvailablePoints)
          : await derivePointsFromChores(familyId);
      setWeeklyBudget(Number(res.weeklyBudget ?? 0));
      setDraftBudget(Number(res.weeklyBudget ?? 0));
      setAvailablePoints(points);
      writeCache({ weeklyBudget: Number(res.weeklyBudget ?? 0), availablePoints: points });
    } catch (e) {
      const cached = readCache();
      if (cached) {
        setWeeklyBudget(Number(cached.weeklyBudget ?? 0));
        setDraftBudget(Number(cached.weeklyBudget ?? 0));
        setAvailablePoints(Number(cached.availablePoints ?? 0));
        setError("Using cached economy values");
        writeCache({
          weeklyBudget: Number(cached.weeklyBudget ?? 0),
          availablePoints: Number(cached.availablePoints ?? 0),
        });
      } else {
        const points = await derivePointsFromChores(familyId);
        setWeeklyBudget(0);
        setDraftBudget(0);
        setAvailablePoints(points);
        setError("Unable to load economy");
        writeCache({ weeklyBudget: 0, availablePoints: points });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  const saveBudget = async () => {
    if (!familyId) return;
    const nextBudget = Number(draftBudget) || 0;
    setWeeklyBudget(nextBudget); // optimistic update
    try {
      await apiFetch(`/api/economy/${familyId}`, {
        method: "PATCH",
        body: JSON.stringify({ weeklyBudget: nextBudget }),
      });
      setError("");
    } catch {
      setError("Unable to save changes (showing local value)");
    }
    writeCache({ weeklyBudget: nextBudget, availablePoints });
    setEdit(false);
  };

  if (loading) {
    return (
      <Card title="Family Economy">
        <p className="muted">Loading...</p>
      </Card>
    );
  }

  if (error && availablePoints === 0 && weeklyBudget === 0) {
    return (
      <Card title="Family Economy">
        <p className="form-error">Unable to load economy</p>
      </Card>
    );
  }

  const rate =
    availablePoints > 0
      ? Math.round((weeklyBudget / availablePoints) * 100) / 100
      : 0;

  return (
    <Card title="Family Economy">
      <div className="economy-simple">
        {availablePoints > 0 ? (
          <p className="rate-line">1 point = ${rate.toFixed(2)}</p>
        ) : (
          <p className="muted">Set up chores to calculate value</p>
        )}

        <div className="budget-row">
          <span>Weekly Budget: </span>
          {edit ? (
            <input
              type="number"
              value={draftBudget}
              onChange={(e) => setDraftBudget(e.target.value)}
            />
          ) : (
            <strong>${weeklyBudget.toFixed(2)}</strong>
          )}
          <button
            className="btn ghost"
            type="button"
            onClick={() => (edit ? saveBudget() : setEdit(true))}
          >
            {edit ? "Save" : "Edit"}
          </button>
          {edit && (
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setEdit(false);
                setDraftBudget(weeklyBudget);
              }}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="available-row">
          {availablePoints > 0 ? (
            <>
              <p className="muted">If all chores are completed:</p>
              <p className="available-points">
                {availablePoints.toLocaleString()} points available
              </p>
            </>
          ) : (
            <p className="muted">No chores found for this week.</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EconomyPanel;
