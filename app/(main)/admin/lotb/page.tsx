import { getSettings } from "@/app/actions";
import { LotbConfig, DEFAULT_LOTB_CONFIG } from "@/lib/lotb_config";
import LotbAdminClient from "./LotbAdminClient";

export const dynamic = "force-dynamic";

export default async function LotbAdminPage() {
  const settings = await getSettings();
  
  let lotbConfig: LotbConfig = DEFAULT_LOTB_CONFIG;
  if (settings.lotb_config) {
    try {
      lotbConfig = JSON.parse(settings.lotb_config);
      // Basic merge to ensure new defaults (like MSMS cohorts if they were missing) are present
      lotbConfig = {
        projects: lotbConfig.projects || DEFAULT_LOTB_CONFIG.projects,
        msmsCohorts: lotbConfig.msmsCohorts || DEFAULT_LOTB_CONFIG.msmsCohorts
      };
    } catch (e) {
      console.error("Failed to parse lotb_config from DB, falling back to defaults", e);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">LOTB Directory Editor</h1>
        <p className="text-slate-500 mt-2">Manage dynamic content (images, links, text) for the Learn Out of The Box pages.</p>
      </div>

      <LotbAdminClient initialConfig={lotbConfig} />
    </div>
  );
}
