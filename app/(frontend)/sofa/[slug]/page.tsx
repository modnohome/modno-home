import { PhoneIcon, TelegramSquareIcon, VkSquareIcon } from "@/assets/icons";
import { InfoSofa } from "@/components/sections";
import { ColorSelector, HeroTitle, SofaShowcase } from "@/components/ui";
import {
  SITE_URL,
  getHome,
  getSettings,
  getSofaPages,
  getSofas,
} from "@/lib/content";
import { toSlug } from "@/lib/toSlug";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import { notFound } from "next/navigation";

const VideoSection = dynamic(() =>
  import("@/components/sections/VideoSection").then((m) => m.VideoSection),
);
const ConfigSection = dynamic(() =>
  import("@/components/sections/ConfigSection").then((m) => m.ConfigSection),
);
const CalculationSection = dynamic(() =>
  import("@/components/sections/CalculationSection").then(
    (m) => m.CalculationSection,
  ),
);
const DownloadCatalog = dynamic(() =>
  import("@/components/sections/DownloadCatalog").then(
    (m) => m.DownloadCatalog,
  ),
);
const OtherCardsSection = dynamic(() =>
  import("@/components/sections/OtherCardsSection").then(
    (m) => m.OtherCardsSection,
  ),
);
const ReviewSection = dynamic(() =>
  import("@/components/sections/ReviewSection").then((m) => m.ReviewSection),
);
const RealzView = dynamic(() =>
  import("@/components/sections/RealzView").then((m) => m.RealzView),
);
const FabricSelection = dynamic(() =>
  import("@/components/sections/FabricSelection").then(
    (m) => m.FabricSelection,
  ),
);

interface SofaPageProps {
  params: Promise<{ slug: string }>;
}

function getSofaData(slug: string) {
  const sofas = getSofas();
  const currentSofa = sofas.find((sofa) => sofa.slug === slug) || null;

  // Manually selected related sofas (slugs); fallback: other active sofas
  const related = (currentSofa?.relatedSofas || [])
    .map((relatedSlug: string) => sofas.find((sofa) => sofa.slug === relatedSlug))
    .filter(Boolean);
  const otherSofas = (
    related.length > 0 ? related : sofas.filter((sofa) => sofa.slug !== slug)
  )
    .slice(0, 4)
    .map((sofa: any) => ({
      id: sofa.id,
      title: sofa.title,
      category: sofa.category,
      image: `/images/cards/${sofa.imageFilename}`,
      price: sofa.price,
      oldPrice: sofa.oldPrice,
    }));

  return {
    currentSofa,
    otherSofas,
    relatedSofasTitle:
      currentSofa?.relatedSofasTitle || "Другие модели диванов",
    relatedSofasSubtitle:
      currentSofa?.relatedSofasSubtitle || "Выбирайте подходящий для себя",
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getSofaPages().map((sofa) => ({ slug: sofa.slug }));
}

export async function generateMetadata({
  params,
}: SofaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { currentSofa: sofa } = getSofaData(slug);

  if (!sofa) {
    return { title: "Диван не найден" };
  }

  const baseUrl = SITE_URL;
  const title = `${sofa.category || "Диван"} ${sofa.title}`;
  const description = `${sofa.category || "Диван"} ${sofa.title} — от ${Number(sofa.price).toLocaleString("ru-RU")} ₽. Производство модульных диванов.`;
  const folder = ((sofa as any).folderName || toSlug(sofa.title)).toLowerCase();
  const url = `${baseUrl}/sofa/${slug}/`;
  const imageUrl = `${baseUrl}/sofas/${folder}/bg-hero.webp`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SofaPage({ params }: SofaPageProps) {
  const { slug } = await params;
  const { currentSofa: sofa, otherSofas, relatedSofasTitle, relatedSofasSubtitle } =
    getSofaData(slug);
  const settingsData = getSettings();
  const homeData = getHome();
  const socials = (settingsData as any)?.header?.socials || {};
  const phone = (settingsData as any)?.header?.phone || "";
  const phoneClean = phone.replace(/[\s\-\(\)]/g, "");

  const { fabricSection } = (homeData as any) || {};
  const { title: fabricTitle, subtitle: fabricSubtitle } = fabricSection || {};

  if (!sofa) {
    notFound();
  }

  // Folder for images (always lowercase for case-sensitive Linux/Vercel)
  const folder = ((sofa as any).folderName || toSlug(sofa.title)).toLowerCase();
  const basePath = `/sofas/${folder}`;

  // Hero data
  const hero = (sofa as any).hero || {};
  const topBold = hero.topBold
    ? hero.topBold.split(",").map((s: string) => s.trim())
    : [];
  const bottomBold = hero.bottomBold
    ? hero.bottomBold.split(",").map((s: string) => s.trim())
    : [];
  const descriptionBold = hero.descriptionBold
    ? hero.descriptionBold.split(",").map((s: string) => s.trim())
    : [];
  // Use uploaded viewImages if available, otherwise fallback to viewsCount
  const sofaData = sofa as unknown as Record<string, unknown>;
  const uploadedViews = ((sofaData.viewImages as { image: { url?: string } | string }[]) || [])
    .map((item) =>
      typeof item.image === "object" && item.image?.url ? item.image.url : "",
    )
    .filter(Boolean);
  const viewsCount = (sofaData.viewsCount as number) || 0;
  const viewImages = uploadedViews.length > 0
    ? uploadedViews
    : Array.from({ length: viewsCount }, (_, i) => `${basePath}/views/${i + 1}.webp`);

  // Showcase data
  const showcase = (sofa as any).showcase || {};

  // Info data
  const info = (sofa as any).info || {};

  // Configs data
  const configs = ((sofa as any).configs || []).map((c: any, i: number) => ({
    image: `${basePath}/config-${i + 1}.webp`,
    title: c.title,
    subtitle: c.description,
    dimensions: c.dimensions || "",
    price: c.price,
    oldPrice: c.oldPrice,
  }));

  // Videos data: the first three from the list
  const videos = ((sofa as any).videos || []).slice(0, 3).map((v: any, i: number) => ({
    id: i + 1,
    title: v.title,
    overlayText: v.overlayText || "",
    views: v.views || 0,
    image: "",
    video: v.videoUrl,
  }));

  return (
    <div className='w-full show-slow'>
      <div
        className='pt-7.5 lg:pt-40 pb-12 md:pb-14 relative overflow-hidden'
        style={{ backgroundColor: hero.bgColor || "#E9E9E7" }}
      >
        <Image
          src={`${basePath}/bg-hero.webp`}
          alt={sofa.title}
          fill
          className='hidden lg:block object-cover object-top z-0 w-full'
          priority
        />
        <Image
          src={`${basePath}/bg-hero-mob.webp`}
          alt={sofa.title}
          fill
          className='lg:hidden object-cover sm:object-[center_24%]  md:object-[center_18%] object-top  z-0'
          priority
        />
        <div className='content pt-15'>
          <div className='flex flex-col lg:flex-row justify-between  mb-10 md:mb-30'>
            <div className='flex lg:hidden flex-col items-center gap-4 z-2 mb-6'>
              <a
                href={`tel:${phoneClean}`}
                className='text-2xl font-semibold leading-[1.2]'
              >
                {phone}
              </a>
              <div className='flex items-center gap-3'>
                {socials.vk && (
                  <a
                    href={socials.vk}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <VkSquareIcon className='w-10 h-10' />
                  </a>
                )}
                {socials.telegram && (
                  <a
                    href={socials.telegram}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <TelegramSquareIcon className='w-10 h-10' />
                  </a>
                )}
                <a href={`tel:${phoneClean}`}>
                  <PhoneIcon className='w-10 h-10' />
                </a>
              </div>
            </div>
            <div className=' flex flex-col justify-between w-full relative z-2  '>
              <HeroTitle
                topLine={
                  hero.topLine || `${sofa.category || "Диван"} ${sofa.title}`
                }
                bottomLine={hero.bottomLine || ""}
                bottomBold={bottomBold}
                description={hero.description || ""}
                topBold={topBold}
                descriptionBold={descriptionBold}
                className='mb-48'
                {...(sofa.title === "Cloud" && {
                  bottomLineClassName: "lg:text-[23px] md:max-w-[450px]",
                })}
              />
              <div className='flex justify-center w-full relative z-2 mb-5 lg:mb-0 '>
                <ColorSelector sofaName={sofa.title} />
              </div>
            </div>
            <div className='relative z-2'>
              <InfoSofa
                socials={socials}
                equipment={info.equipment || ""}
                sizes={info.sizes || []}
                materials={info.materials || []}
                price={sofa.price}
                oldPrice={sofa.oldPrice ?? undefined}
                sofaName={sofa.title}
                className='shrink-0 mx-auto lg:mx-0'
              />
            </div>
          </div>

          <div className='relative flex flex-col lg:flex-row gap-6 items-start z-2'>
            <div className='flex-1 w-full'>
              <RealzView images={viewImages} />
            </div>
          </div>
        </div>
      </div>

      {(showcase.title || videos.length > 0) && (
        <VideoSection
          title='Короткие видео и описание'
          subtitle='Обзор этой модели, про размеры и ткани'
          videos={videos}
          aside={
            showcase.title && (
              <SofaShowcase
                title={showcase.title}
                description={showcase.description || ""}
                specs={showcase.specs}
                image={`${basePath}/section-2-mob.webp`}
              />
            )
          }
        />
      )}

      <CalculationSection socials={socials} />

      <ConfigSection
        title={sofa.configsTitle || undefined}
        subtitle={sofa.configsSubtitle || undefined}
        configs={configs}
        sofaName={sofa.title}
      />

      <CalculationSection socials={socials} />
      <FabricSelection title={fabricTitle} subtitle={fabricSubtitle} />
      <OtherCardsSection
        title={relatedSofasTitle}
        subtitle={relatedSofasSubtitle}
        products={otherSofas}
      />

      <DownloadCatalog />

      <ReviewSection hasBackground={false} />
    </div>
  );
}
