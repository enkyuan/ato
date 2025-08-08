import { init } from '@instantdb/react';

// For now, use the app ID directly since Waku env vars aren't loading properly
// TODO: Fix environment variable loading in Waku
const APP_ID = '0aaa1c06-c4cd-4dc3-b08d-35be4b6a8a36';

const db = init({ appId: APP_ID });

export default db;