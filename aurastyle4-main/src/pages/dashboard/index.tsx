import React from "react";
import { Navigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  // Simple redirect to the wardrobe page
  return <Navigate to="/dashboard/wardrobe" replace />;
};

export default Dashboard;
