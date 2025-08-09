import { ConvexReactClient } from "convex/react";
import { env } from "../env";

export const convex = new ConvexReactClient(env.WAKU_CONVEX_URL);
