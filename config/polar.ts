import { Polar } from '@polar-sh/sdk';

export function getPolar() {
  return new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: process.env.POLAR_SANDBOX === 'true' ? 'sandbox' : 'production',
  });
}
