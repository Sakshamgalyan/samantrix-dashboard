"use client";

import { MarketingProvider } from "@/features/marketing-analytics/context";
import { MarketingContent } from "@/features/marketing-analytics/components/marketing-content";

/** /admin/marketing-analytics: marketing-site traffic, channels, audience and lead conversion. */
export const MarketingAnalyticsPage = () => {
  return (
    <MarketingProvider>
      <MarketingContent />
    </MarketingProvider>
  );
};

export default MarketingAnalyticsPage;
