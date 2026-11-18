import React from 'react';
import { Route } from 'react-router-dom';
import AssignmentView from '../pages/AssignmentView';

/**
 * Dedicated AI Assignment Routes
 * High-stakes proctored coding examination environment.
 */
export const AssignmentRoutes = [
  <Route key="assignment-base" path="/assignment" element={<AssignmentView />} />,
  <Route key="assignment-app" path="/assignment/app" element={<AssignmentView />} />,
  <Route key="assignment-token" path="/assignment/:assignmentToken" element={<AssignmentView />} />,
];

export { AssignmentView };
export default AssignmentRoutes;

