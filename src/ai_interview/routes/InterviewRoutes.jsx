import React from 'react';
import { Route } from 'react-router-dom';
import InterviewView from '../pages/InterviewView';

/**
 * Dedicated AI Voice & Technical Interview Routes
 * Hardware verification, live speech-to-text, AI question generation, and scorecards.
 */
export const InterviewRoutes = [
  <Route key="interview-token" path="/interview/:interviewToken" element={<InterviewView />} />,
  <Route key="interview-app" path="/interview/app" element={<InterviewView />} />,
];

export { InterviewView };
export default InterviewRoutes;

