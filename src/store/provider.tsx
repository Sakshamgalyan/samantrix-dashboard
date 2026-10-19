"use client";

import React, { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";

/** One Redux store per browser tab (created lazily so it is never shared between requests). */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  return <Provider store={store}>{children}</Provider>;
}
