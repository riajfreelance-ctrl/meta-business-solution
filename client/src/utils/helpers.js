export const safeToDate = (ts) => {
  if (!ts) return null;
  try {
    let d = (typeof ts.toDate === 'function') ? ts.toDate() : new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
  }
};
