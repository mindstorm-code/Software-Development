import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { createCoupon, getCouponsByFamily, recalcCouponPoints } from "../../services/coupons";
import { uploadChoreImage } from "../../services/storage";
import { useAuth } from "../../contexts/AuthContext";
import BottomNav from "../../components/BottomNav";
import { getChildrenByFamily } from "../../services/users";
import { apiFetch } from "../../services/apiClient";

const ParentCoupons = () => {
  const { familyId } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    usdValue: 5,
    imageUrl: "",
    repeatable: true,
    dailyLimit: 0,
    assignedTo: "all",
    requiresApproval: false,
    dynamicPricing: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentRate, setCurrentRate] = useState(0.01);
  const [children, setChildren] = useState([]);

  const loadCoupons = async () => {
    if (!familyId) return;
    setLoading(true);
    const data = await getCouponsByFamily(familyId);
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      if (!familyId) return;
      try {
        const econ = await apiFetch(`/api/economy/${familyId}`);
        if (econ?.currentRate) {
          setCurrentRate(Number(econ.currentRate));
        } else if (econ?.weeklyBudget && econ?.totalAvailablePoints) {
          const autoRate =
            econ.totalAvailablePoints > 0
              ? Number(econ.weeklyBudget) / Number(econ.totalAvailablePoints)
              : 0.01;
          setCurrentRate(autoRate || 0.01);
        }
      } catch {
        setCurrentRate(0.01);
      }
      await loadCoupons();
      const kids = await getChildrenByFamily(familyId);
      setChildren(kids);
    };
    load();
  }, [familyId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const val =
      type === "checkbox"
        ? checked
        : name === "usdValue" || name === "dailyLimit"
        ? Number(value)
        : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const pointsRequired = useMemo(() => {
    const rateToUse = currentRate || 0.01;
    const pts = Math.max(1, Math.round((Number(form.usdValue) || 0) / rateToUse));
    return pts;
  }, [form.usdValue, currentRate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    let imageUrl = form.imageUrl;
    if (imageFile) {
      const upload = await uploadChoreImage({ file: imageFile, pathPrefix: "coupons" });
      imageUrl = upload.url;
    }

    const rateUsed = currentRate || 0.01;
    const pts = Math.max(1, pointsRequired);
    await createCoupon({
      ...form,
      imageUrl,
      usdValue: Number(form.usdValue) || 0,
      pointsRequired: pts,
      pointsCost: pts,
      pointCost: pts,
      lockedRate: form.dynamicPricing ? null : rateUsed,
      lastCalculatedAt: new Date().toISOString(),
      dailyLimit: form.repeatable ? form.dailyLimit : 0,
      familyId,
      rateUsed,
    });

    setForm({
      title: "",
      description: "",
      usdValue: 5,
      imageUrl: "",
      repeatable: true,
      dailyLimit: 0,
      assignedTo: "all",
      requiresApproval: false,
      dynamicPricing: true,
    });
    setImageFile(null);
    setMessage("Coupon saved.");
    await loadCoupons();
  };

  const handleAIGenerate = () => {
    const mockUrl = `ai-generated://${form.title || "coupon"}`;
    setForm((prev) => ({ ...prev, imageUrl: mockUrl }));
    setMessage("AI image generated (placeholder).");
  };

  return (
    <div className="page">
      <PageHeader
        title="Coupons"
        subtitle="USD cost auto-converts to points using family rate."
        action={<button className="btn ghost" onClick={() => window.history.back()}>Back</button>}
      />

      <form className="form card" onSubmit={handleSubmit}>
        <p className="muted">Current rate: 1 point = ${currentRate.toFixed(3)}</p>

        <label className="form-group">
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label className="form-group">
          Description
          <textarea name="description" value={form.description} onChange={handleChange} />
        </label>
        <label className="form-group">
          Cost (USD)
          <input
            type="number"
            name="usdValue"
            min="0"
            step="0.01"
            value={form.usdValue}
            onChange={handleChange}
            required
          />
          <p className="muted">This equals {pointsRequired} points</p>
          <p className="muted">(based on 1 point = ${currentRate.toFixed(3)})</p>
        </label>

        <label className="form-group inline">
          Repeatable
          <input
            type="checkbox"
            checked={form.repeatable}
            onChange={(e) => setForm((p) => ({ ...p, repeatable: e.target.checked }))}
          />
        </label>
        {form.repeatable && (
          <label className="form-group">
            Daily limit
            <input
              type="number"
              name="dailyLimit"
              min="0"
              value={form.dailyLimit}
              onChange={handleChange}
            />
          </label>
        )}

        <label className="form-group">
          Assign to
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange}>
            <option value="all">All children</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName || c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-group inline">
          Requires approval
          <input
            type="checkbox"
            checked={form.requiresApproval}
            onChange={(e) => setForm((p) => ({ ...p, requiresApproval: e.target.checked }))}
          />
        </label>
        <label className="form-group inline">
          Dynamic pricing
          <input
            type="checkbox"
            checked={form.dynamicPricing}
            onChange={(e) => setForm((p) => ({ ...p, dynamicPricing: e.target.checked }))}
          />
        </label>

        <label className="form-group">
          Attach image (optional)
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          {form.imageUrl && <span className="muted">Image set: {form.imageUrl}</span>}
        </label>
        <div className="button-row">
          <button type="button" className="btn ghost" onClick={handleAIGenerate}>
            AI generate image
          </button>
          <button type="submit" className="btn primary">
            Save coupon
          </button>
        </div>
        {message && <p className="form-success">{message}</p>}
      </form>

      <section className="card-list">
        {loading && <p className="muted">Loading coupons...</p>}
        {!loading && coupons.length === 0 && <p className="muted">No coupons yet.</p>}
        {coupons.map((coupon) => (
          <div className="card" key={coupon.id}>
            <h3>{coupon.title}</h3>
            <p>{coupon.description}</p>
            <p className="muted">
              ${coupon.usdValue || 0} • {coupon.pointsRequired || coupon.pointsCost || coupon.pointCost || 0} pts
            </p>
            {coupon.imageUrl && (
              <img src={coupon.imageUrl} alt={coupon.title} className="review-img" />
            )}
            <p className="muted">
              Repeatable: {coupon.repeatable ? "Yes" : "No"} | Daily limit:{" "}
              {coupon.dailyLimit || "–"} | Assigned: {coupon.assignedTo || "all"} | Approval:{" "}
              {coupon.requiresApproval ? "Yes" : "No"}
            </p>
            <button
              type="button"
              className="btn ghost"
              onClick={async () => {
                const updated = await recalcCouponPoints(coupon, currentRate);
                setCoupons((prev) =>
                  prev.map((c) => (c.id === coupon.id ? { ...c, ...updated } : c))
                );
              }}
            >
              Recalculate points
            </button>
          </div>
        ))}
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

export default ParentCoupons;
