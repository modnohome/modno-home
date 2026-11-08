import "@/assets/style/globals.css";
import { Footer, Header } from "@/components/sections";
import { getSettings } from "@/lib/content";
import type { Metadata } from "next";
import Script from "next/script";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  const seo = settings?.seo || {};

  return {
    title: {
      default: seo.title || "Modno Home",
      template: `%s | ${seo.title || "Modno Home"}`,
    },
    description: seo.description || "Modno Home - Luxury Interior Design",
    keywords: seo.keywords || "",
  };
}

import { GlobalModal } from "@/components/common/GlobalModal";
import { ModalProvider } from "@/components/providers/ModalProvider";

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSettings();
  const seo = settings?.seo || {};
  const scripts = seo.scripts || {};

  return (
    <html lang='ru' className='h-full' suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        {scripts.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${scripts.googleAnalyticsId}`}
              strategy='afterInteractive'
            />
            <Script id='google-analytics' strategy='afterInteractive'>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${scripts.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}

        {/* Yandex Metrika */}
        {scripts.yandexMetrikaId && (
          <Script id='yandex-metrika' strategy='afterInteractive'>
            {`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(${scripts.yandexMetrikaId}, "init", {
                    clickmap:true,
                    trackLinks:true,
                    accurateTrackBounce:true,
                    webvisor:true
              });
            `}
          </Script>
        )}

        {/* Custom Head Script */}
        {scripts.head && (
          <script dangerouslySetInnerHTML={{ __html: scripts.head }} />
        )}
      </head>
      <body
        className='font-sans antialiased flex flex-col min-h-screen '
        suppressHydrationWarning
      >
        <ModalProvider>
          {/* Custom Body Script (e.g. GTM noscript) */}
          {scripts.body && (
            <div dangerouslySetInnerHTML={{ __html: scripts.body }} />
          )}

          {/* Yandex Metrika Noscript */}
          {scripts.yandexMetrikaId && (
            <noscript>
              <div>
                <img
                  src={`https://mc.yandex.ru/watch/${scripts.yandexMetrikaId}`}
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=''
                />
              </div>
            </noscript>
          )}

          <Header data={settings || {}} />
          <main className='grow'>{children}</main>
          <Footer data={settings} />

          <GlobalModal socials={settings?.header?.socials} />
        </ModalProvider>
      </body>
    </html>
  );
}
