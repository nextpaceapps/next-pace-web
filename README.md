# NEXT PACE Web (Mocked Auth/Connect Flows)

This branch implements a mocked Google login and Garmin connect experience for UX validation.

## Run
- Install: `npm i`
- Dev server: `npm run dev`
- Open: `http://localhost:3000`

## Validate Flows
- Login: `/login` has a mocked "Continue with Google" button and simulate Cancel/Error buttons.
- Profile: `/profile` requires a session; use the login success to navigate.
- Connect: On Profile, use "Connect Garmin (authorize)" or simulate Deny/Cancel/Error.
- Disconnect: When connected, click "Disconnect".

Details in `specs/002-specify-as-a/quickstart.md`.
