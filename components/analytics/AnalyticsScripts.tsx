'use client';

import Script from 'next/script';
import { useEffect } from 'react';

type AnalyticsScriptsProps = {
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
  yandexAnalyticsId?: string | null;
  posthogApiKey?: string | null;
  posthogBaseUrl?: string | null;
};

export function AnalyticsScripts({
  googleAnalyticsId,
  googleTagManagerId,
  yandexAnalyticsId,
  posthogApiKey,
  posthogBaseUrl,
}: AnalyticsScriptsProps) {
  useEffect(() => {
    if (!posthogApiKey) return;

    import('posthog-js').then((posthog) => {
      posthog.default.init(posthogApiKey, {
        api_host: posthogBaseUrl || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: true,
      });
    });
  }, [posthogApiKey, posthogBaseUrl]);

  return (
    <>
      {/* Google Analytics (GA4) */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {googleTagManagerId && (
        <Script id="gtm-snippet" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${googleTagManagerId}');
          `}
        </Script>
      )}

      {/* Yandex.Metrika */}
      {yandexAnalyticsId && (
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
            ym(${yandexAnalyticsId}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
          `}
        </Script>
      )}
    </>
  );
}
