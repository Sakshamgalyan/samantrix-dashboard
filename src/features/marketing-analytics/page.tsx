"use client";

import { MarketingProvider } from "./context";
import { MarketingContent } from "./components/marketing-content";

/** /admin/marketing-analytics: marketing-site traffic, channels, audience and lead conversion. */
export function MarketingAnalyticsPage() {
  return (
    <MarketingProvider>
      <MarketingContent />
    </MarketingProvider>
  );
}

export default MarketingAnalyticsPage;
