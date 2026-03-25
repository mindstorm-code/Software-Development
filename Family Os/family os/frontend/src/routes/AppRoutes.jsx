import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ParentRoute from "./ParentRoute";
import ChildRoute from "./ChildRoute";
import RoleRedirect from "./RoleRedirect";
import ParentDashboard from "../pages/parent/Dashboard";
import ParentChildren from "../pages/parent/Children";
import ParentChores from "../pages/parent/Chores";
import ParentChoreNew from "../pages/parent/ChoreNew";
import ParentRewards from "../pages/parent/Rewards";
import ParentReviews from "../pages/parent/Reviews";
import ChildDashboard from "../pages/child/Dashboard";
import ChildChoreDetail from "../pages/child/ChoreDetail";
import ChildRewards from "../pages/child/Rewards";
import ChildRewardDetail from "../pages/child/RewardDetail";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ParentRoute />}>
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/parent/children" element={<ParentChildren />} />
        <Route path="/parent/chores" element={<ParentChores />} />
        <Route path="/parent/chores/new" element={<ParentChoreNew />} />
        <Route path="/parent/rewards" element={<ParentRewards />} />
        <Route path="/parent/reviews" element={<ParentReviews />} />
      </Route>

      <Route element={<ChildRoute />}>
        <Route path="/child/dashboard" element={<ChildDashboard />} />
        <Route path="/child/chore/:id" element={<ChildChoreDetail />} />
        <Route path="/child/rewards" element={<ChildRewards />} />
        <Route path="/child/rewards/:id" element={<ChildRewardDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
