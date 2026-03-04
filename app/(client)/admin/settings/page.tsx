import { getSettings } from './actions';
import { SettingsEditor } from '@/components/pages/admin/SettingsEditor';

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-display text-[24px] leading-[30px] text-fg">
        Settings
      </h1>
      <p className="mt-2 font-body text-[15px] leading-[24px] text-muted">
        Manage your site configuration and analytics integrations.
      </p>
      <div className="mt-8">
        <SettingsEditor settings={settings} />
      </div>
    </div>
  );
}
