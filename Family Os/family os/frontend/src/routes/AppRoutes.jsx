import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import PinLogin from "../pages/PinLogin";
import SelectRole from "../pages/SelectRole";
import ParentRoute from "./ParentRoute";
import ChildRoute from "./ChildRoute";
import RoleRedirect from "./RoleRedirect";
import ParentDashboard from "../pages/parent/Dashboard";
import ParentChildren from "../pages/parent/Children";
import ParentChores from "../pages/parent/Chores";
import ParentChoreNew from "../pages/parent/ChoreNew";
import ParentChoreEdit from "../pages/parent/ChoreEdit";
import ParentRewards from "../pages/parent/Rewards";
import ParentCoupons from "../pages/parent/Coupons";
import ParentReviews from "../pages/parent/Reviews";
import ChildDashboard from "../pages/child/Dashboard";
import ChildChoreDetail from "../pages/child/ChoreDetail";
import ChildRewards from "../pages/child/Rewards";
import ChildRewardDetail from "../pages/child/RewardDetail";
import ChildProfile from "../pages/child/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pin-login" element={<PinLogin />} />
      <Route path="/select-role" element={<SelectRole />} />

      <Route element={<ParentRoute />}>
        <Route path="/parent" element={<Navigate to="/parent/children" replace />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/parent/children" element={<ParentChildren />} />
        <Route path="/parent/chores" element={<ParentChores />} />
        <Route path="/parent/chores/new" element={<ParentChoreNew />} />
        <Route path="/parent/chores/:id/edit" element={<ParentChoreEdit />} />
        <Route path="/parent/rewards" element={<ParentRewards />} />
        <Route path="/parent/coupons" element={<ParentCoupons />} />
        <Route path="/parent/reviews" element={<ParentReviews />} />
      </Route>

      <Route element={<ChildRoute />}>
        <Route path="/child/dashboard" element={<ChildDashboard />} />
        <Route path="/child/chore/:id" element={<ChildChoreDetail />} />
        <Route path="/child/rewards" element={<ChildRewards />} />
        <Route path="/child/rewards/:id" element={<ChildRewardDetail />} />
        <Route path="/child/profile" element={<ChildProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
