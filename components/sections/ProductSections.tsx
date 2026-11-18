"use client";

import { useModal } from "@/components/providers/ModalProvider";
import { ProductCard, SectionTitle } from "@/components/ui";
import { toSlug } from "@/lib/toSlug";
import Link from "next/link";
import React from "react";

interface Product {
  id: string | number;
  title: string;
  category?: string;
  price: string | number;
  oldPrice?: string | number;
  image: string;
}

interface ProductSectionsProps {
  title: string;
  subtitle?: string;
  products: Product[];
  className?: string;
}

/**
 * Section displaying a collection of products in a responsive grid.
 * Features a centered SectionTitle and an adaptive 3-column grid.
 */
export const ProductSections: React.FC<ProductSectionsProps> = ({
  title,
  subtitle,
  products,
  className = "",
}) => {
  const { openModal } = useModal();

  return (
    <section className={`w-full py-16 md:pb-24 md:pt-12 ${className}`}>
      <div className='content flex flex-col items-center'>
        {/* Centered Title */}
        <SectionTitle
          title={title}
          subtitle={subtitle}
          className='text-center mb-12 md:mb-16'
        />

        {/* Responsive Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full'>
          {products.map((product) => (
            <Link
              href={
                product.title === "Интерьерные кровати"
                  ? "#"
                  : `/sofa/${toSlug(product.title)}`
              }
              key={product.id}
              className='block'
            >
              <ProductCard
                title={product.title}
                category={product.category}
                image={product.image}
                price={product.price}
                oldPrice={product.oldPrice}
                onClick={
                  product.title === "Интерьерные кровати"
                    ? () =>
                        openModal(
                          "Раздел в разработке, уточняйте у менеджера",
                          "ЖДУ ЗВОНКА",
                          "Интерьерные кровати",
                        )
                    : undefined
                }
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
