import { SITE_URL, getHome, getSettings } from "@/lib/content";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = SITE_URL;
  const title = "Модульные диваны — производство на заказ";
  const description =
    "Modno Home — производство модульных диванов. Выбирайте конфигурацию, ткань и размер. Доставка по России.";

  return {
    title,
    description,
    alternates: { canonical: baseUrl },
    openGraph: {
      title,
      description,
      url: baseUrl,
      type: "website",
      siteName: "Modno Home",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const HomeHero = dynamic(() =>
  import("@/components/sections/HomeHero").then((m) => m.HomeHero),
);
const VideoSection = dynamic(() =>
  import("@/components/sections/VideoSection").then((m) => m.VideoSection),
);
const DownloadCatalog = dynamic(() =>
  import("@/components/sections/DownloadCatalog").then(
    (m) => m.DownloadCatalog,
  ),
);
const ProductSections = dynamic(() =>
  import("@/components/sections/ProductSections").then(
    (m) => m.ProductSections,
  ),
);
const CalculationSection = dynamic(() =>
  import("@/components/sections/CalculationSection").then(
    (m) => m.CalculationSection,
  ),
);
const ReviewSection = dynamic(() =>
  import("@/components/sections/ReviewSection").then((m) => m.ReviewSection),
);
const FabricSelection = dynamic(() =>
  import("@/components/sections/FabricSelection").then(
    (m) => m.FabricSelection,
  ),
);
const ContactUsSection = dynamic(() =>
  import("@/components/sections/ContactUsSection").then(
    (m) => m.ContactUsSection,
  ),
);

export default async function HomePage() {
  const homeData = getHome();
  const settingsData = getSettings();
  const { heroSection, sofasSection, catalogSection } = homeData || {};
  const hero = heroSection || {};
  const titleBold = hero.titleBold
    ? hero.titleBold.split(",").map((s: string) => s.trim())
    : undefined;
  const title2Bold = hero.title2Bold
    ? hero.title2Bold.split(",").map((s: string) => s.trim())
    : undefined;
  const descriptionBold = hero.descriptionBold
    ? hero.descriptionBold.split(",").map((s: string) => s.trim())
    : undefined;

  const socials = (settingsData as any)?.header?.socials || {};
  const phone = (settingsData as any)?.header?.phone || "";
  const {
    title = "Каталог диванов",
    subtitle = "Которые украсят ваш интерьер",
    selectedSofas = [],
  } = sofasSection || {};

  const {
    title: catalogTitle,
    subtitle: catalogSubtitle,
    buttonLabel: catalogButton,
    edition: catalogEdition,
  } = catalogSection || {};

  const { videoSection } = homeData || {};
  const {
    title: videoTitle = "Короткие видео",
    subtitle: videoSubtitle = "В интерьере, на производстве, каркас и ткани",
    videos: rawVideos = [],
  } = videoSection || {};

  const videos = (rawVideos as any[]).map((v: any, i: number) => ({
    id: i + 1,
    title: v.title,
    overlayText: v.overlayText || "",
    views: v.views || 0,
    image: `/images/video-card/home/${i + 1}.webp`,
    video: v.videoUrl,
  }));

  const products = (selectedSofas || []).map((sofa: any) => ({
    id: sofa.id,
    title: sofa.title,
    category: sofa.category,
    image: `/images/cards/${sofa.imageFilename}`,
    price: sofa.price,
    oldPrice: sofa.oldPrice,
  }));

  const { fabricSection, reviewSection } = homeData || {};
  const { title: fabricTitle, subtitle: fabricSubtitle } = fabricSection || {};
  const { title: reviewTitle, images: reviewImages } = reviewSection || {};

  return (
    <div className='show-slow'>
      <HomeHero
        phone={phone}
        socials={socials}
        {...(heroSection || {})}
        titleBold={titleBold}
        title2Bold={title2Bold}
        descriptionBold={descriptionBold}
      />

      {videos.length > 0 && (
        <VideoSection
          title={videoTitle}
          subtitle={videoSubtitle}
          videos={videos}
        />
      )}
      <ProductSections title={title} subtitle={subtitle} products={products} />

      <DownloadCatalog
        title={catalogTitle}
        subtitle={catalogSubtitle}
        buttonLabel={catalogButton}
        edition={catalogEdition}
      />
      <FabricSelection title={fabricTitle} subtitle={fabricSubtitle} />
      {/* <CalculationSection socials={socials} /> */}

      <ReviewSection title={reviewTitle} images={reviewImages} />
      <ContactUsSection telegramUrl={socials.telegram} vkUrl={socials.vk} />
    </div>
  );
}
