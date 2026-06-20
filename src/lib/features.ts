/** Recruiter "View Test" preview (answer key). Opt-in via env; off in production by default. */
export const isTestPreviewEnabled = import.meta.env.VITE_ENABLE_TEST_PREVIEW === 'true'
