// Placeholder to avoid importing @reduxjs/toolkit in this build.
// The project uses classic reducers under src/redux/reducer/. Keep this file
// as a harmless module to avoid runtime import errors in other files.

export const login = () => ({ type: 'AUTH_LOGIN_REQUEST' });
export default function placeholder() { return null; }
