// Main barrel export for mirror components
export * from './ai';
export * from './editor';
export * from './test';
export * from './problem';
export * from './shared';

// Re-export remaining top-level components
export { default as AnalyticsView } from './AnalyticsView';
export { default as ExtensionOnboardingModal } from './ExtensionOnboardingModal';
export { default as HandleInputModal } from './HandleInputModal';
export { default as HandleInputSection } from './HandleInputSection';
export { default as SubmissionsList } from './SubmissionsList';
export { default as Whiteboard } from './Whiteboard';
