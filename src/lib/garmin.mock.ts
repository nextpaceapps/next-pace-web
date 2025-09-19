/*
  Mocked Garmin connection utility for demo purposes.
  Simulates consent/authorization outcomes without any network requests.
*/

export type GarminState =
  | { status: 'NOT_CONNECTED' }
  | { status: 'CONNECTING' }
  | { status: 'CONNECTED' }
  | { status: 'ERROR'; message?: string };

let garminState: GarminState = { status: 'NOT_CONNECTED' };

/** Returns current mocked Garmin connection state. */
export function getGarminStatus(): GarminState {
  return garminState;
}

/**
 * Simulates a Garmin connect result.
 * @param result 'authorize' | 'deny' | 'cancel' | 'error'
 */
export function connectGarmin(result: 'authorize' | 'deny' | 'cancel' | 'error'): GarminState {
  garminState = { status: 'CONNECTING' };
  switch (result) {
    case 'authorize':
      garminState = { status: 'CONNECTED' };
      break;
    case 'deny':
    case 'cancel':
      garminState = { status: 'NOT_CONNECTED' };
      break;
    case 'error':
      garminState = { status: 'ERROR', message: 'Authorization failed (mocked).' };
      break;
    default:
      garminState = { status: 'ERROR', message: 'Unknown result (mocked).' };
  }
  return garminState;
}

/** Disconnects and returns to NOT_CONNECTED. */
export function disconnectGarmin(): GarminState {
  garminState = { status: 'NOT_CONNECTED' };
  return garminState;
}
