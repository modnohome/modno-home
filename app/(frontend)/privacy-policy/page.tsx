import { RichText } from "@/components/common/RichText";
import { getSettings } from "@/lib/content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  return {
    title: settings?.footer?.privacyPolicyText || "Политика конфиденциальности",
  };
}

export default async function PrivacyPolicyPage() {
  const settings = getSettings();
  const content = settings?.footer?.privacyPolicyContent;

  return (
    <div className='content py-16 md:pb-28 md:pt-48'>
      <h1 className='text-3xl md:text-4xl font-bold mb-8 text-black text-center'>
        {settings?.footer?.privacyPolicyText || "Политика конфиденциальности"}
      </h1>
      <div className='text-black'>
        {content ? (
          <RichText content={content} />
        ) : (
          <p>Текст политики еще не заполнен.</p>
        )}
      </div>
    </div>
  );
}
