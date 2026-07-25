import { useState, useEffect } from "react";
import { getTargetTypes, getReasons, ReportOption } from "../services/reportApi";
import { updateReportMetadataCache } from "../utils/reportUtils";

export function useReportMetadata() {
  const [targetTypes, setTargetTypes] = useState<ReportOption[]>([]);
  const [reasons, setReasons] = useState<ReportOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getTargetTypes(), getReasons()])
      .then(([ttRes, rRes]) => {
        if (!active) return;
        
        const targetTypesList = (ttRes.success && ttRes.data) ? ttRes.data : [];
        const reasonsList = (rRes.success && rRes.data) ? rRes.data : [];
        
        if (targetTypesList.length > 0) {
          setTargetTypes(targetTypesList);
        }
        if (reasonsList.length > 0) {
          setReasons(reasonsList);
        }
        
        if (targetTypesList.length > 0 || reasonsList.length > 0) {
          updateReportMetadataCache(targetTypesList, reasonsList);
        }
      })
      .catch((err) => {
        console.error("Failed to load report metadata:", err);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return {
    targetTypes,
    reasons,
    loading,
  };
}
