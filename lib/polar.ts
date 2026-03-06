import { getPolar } from '@/config/polar';

export async function createCheckoutUrl(userId: string, productId: string, email?: string): Promise<string> {
  const polar = getPolar();
  const checkout = await polar.checkouts.create({
    products: [productId],
    metadata: { userId },
    customerEmail: email,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
  });
  return checkout.url;
}

export async function getCustomerPortalUrl(polarCustomerId: string): Promise<string> {
  const polar = getPolar();
  const session = await polar.customerSessions.create({
    customerId: polarCustomerId,
  });
  return session.customerPortalUrl;
}
