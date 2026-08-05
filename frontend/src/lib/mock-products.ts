import type { StoreProduct } from "@/lib/api";

export const mockProducts: StoreProduct[] = [
  {
    id: "mock-ring-1",
    nameEn: "Rose Gold Signet Ring",
    nameAr: "خاتم سِجنت ذهب وردي",
    descriptionEn:
      "A polished rose gold signet ring with a minimalist engraved face for everyday elegance.",
    descriptionAr: "خاتم ذهبي وردي مصقول بوجه محفور بسيط لمظهر أنيق يومي.",
    price: "129.00",
    discountPrice: "99.00",
    stock: 12,
    status: "ACTIVE",
    category: {
      nameEn: "Rings",
      nameAr: "خواتم",
      slugEn: "rings",
    },
    images: [
      {
        id: "mock-img-ring-1",
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFshByLSsRpmDEEsYVlNDLyvX_F7h36W0ZFR2ksbv3jA&s=10",
        altText: "Rose gold signet ring",
        isPrimary: true,
      },
    ],
    variants: [],
    reviews: [],
  },
  {
    id: "mock-necklace-1",
    nameEn: "Pearl Halo Necklace",
    nameAr: "قلادة هالة اللؤلؤ",
    descriptionEn:
      "A delicate pearl halo necklace with soft gold accents for a refined finish.",
    descriptionAr: "قلادة هالة من اللؤلؤ مع لمسات ذهبية خفيفة لمظهر رقي.",
    price: "149.00",
    discountPrice: "119.00",
    stock: 24,
    status: "ACTIVE",
    category: {
      nameEn: "Necklaces",
      nameAr: "قلائد",
      slugEn: "necklaces",
    },
    images: [
      {
        id: "mock-img-necklace-1",
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqrY8fhk9-WtoyfWdS4AqAMvrECGPWkbiTnnBjWpzgig&s=10",
        altText: "Pearl halo necklace",
        isPrimary: true,
      },
    ],
    variants: [],
    reviews: [],
  },
  {
    id: "mock-earrings-1",
    nameEn: "Sapphire Drop Earrings",
    nameAr: "أقراط متدلية بالياقوت",
    descriptionEn:
      "Sparkling sapphire drop earrings with gold settings for evening glamour.",
    descriptionAr: "أقراط ياقوت متدلية بتثبيتات ذهبية لمظهر ساحر في المساء.",
    price: "89.00",
    discountPrice: null,
    stock: 18,
    status: "ACTIVE",
    category: {
      nameEn: "Earrings",
      nameAr: "أقراط",
      slugEn: "earrings",
    },
    images: [
      {
        id: "mock-img-earrings-1",
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnrIbmVU_HGy_5-o6mgopAJtzdNx5xIlQzXt3CM6d5DA&s=10",
        altText: "Sapphire drop earrings",
        isPrimary: true,
      },
    ],
    variants: [],
    reviews: [],
  },
  {
    id: "mock-bracelet-1",
    nameEn: "Leather Wrap Bracelet",
    nameAr: "سوار جلد ملفوف",
    descriptionEn:
      "A soft leather wrap bracelet finished with a brushed metal clasp for a refined accessory.",
    descriptionAr:
      "سوار جلد ناعم ملفوف مع إغلاق معدني مشطوف للحصول على إكسسوار أنيق.",
    price: "39.00",
    discountPrice: null,
    stock: 45,
    status: "ACTIVE",
    category: {
      nameEn: "Bracelets",
      nameAr: "أساور",
      slugEn: "bracelets",
    },
    images: [
      {
        id: "mock-img-bracelet-1",
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl78BYuSP_eANCx5dtwqu5NI6I4IEbz0XihmubdfQbfA&s=10",
        altText: "Leather wrap bracelet",
        isPrimary: true,
      },
    ],
    variants: [],
    reviews: [],
  },
  {
    id: "mock-accessories-1",
    nameEn: "Classic Leather Wallet",
    nameAr: "محفظة جلد كلاسيكية",
    descriptionEn:
      "A slim leather wallet with six card slots and a secure bill compartment.",
    descriptionAr: "محفظة جلدية نحيفة بستة فتحات بطاقات وجيب آمن للنقود.",
    price: "59.00",
    discountPrice: null,
    stock: 32,
    status: "ACTIVE",
    category: {
      nameEn: "Accessories",
      nameAr: "اكسسوارات",
      slugEn: "accessories",
    },
    images: [
      {
        id: "mock-img-accessories-1",
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr_zMFddi1YF4N_XomrDcz1YMvCL9elhOuEi3OPAwhag&s=10",
        altText: "Classic leather wallet",
        isPrimary: true,
      },
    ],
    variants: [],
    reviews: [],
  },
  {
    id: "mock-men-1",
    nameEn: "Cufflink Duo Set",
    nameAr: "مجموعة أزرار أكمام",
    descriptionEn:
      "A polished cufflink duo featuring brushed and high-shine finishes.",
    descriptionAr: "مجموعة أزرار أكمام مصقولة بتشطيبات مخططة ولامعة.",
    price: "69.00",
    discountPrice: "54.00",
    stock: 28,
    status: "ACTIVE",
    category: {
      nameEn: "Accessories",
      nameAr: "اكسسوارات",
      slugEn: "accessories",
    },
    images: [
      {
        id: "mock-img-men-1",
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNcpq7YEaTi_3dh5yyLaQSBZr4yEBfmMvdtNFuQKE5AA&s=10",
        altText: "Cufflink duo set",
        isPrimary: true,
      },
    ],
    variants: [],
    reviews: [],
  },
];

export function findMockProductById(id: string): StoreProduct | undefined {
  return mockProducts.find((product) => product.id === id);
}
