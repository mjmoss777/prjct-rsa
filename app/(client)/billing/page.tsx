import { getBillingInfo } from './actions';
import { BillingClient } from './BillingClient';

export default async function BillingPage() {
  const billing = await getBillingInfo();

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-display text-[24px] leading-[30px] text-fg">Billing</h1>
      <p className="mt-2 font-body text-[15px] leading-[24px] text-muted">
        Manage your subscription and view usage.
      </p>
      <div className="mt-8">
        <BillingClient billing={billing} />
      </div>
    </div>
  );
}
