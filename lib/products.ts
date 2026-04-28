export type Product = {
  id: string;
  model: number;
  name: string;
  description: string;
  dimensions: string;
  widthCm: string;
  heightCm: string;
  thicknessCm: string;
  priceEur: number;
  pocketsAddOnEur: number;
  images: string[];
  customizable: true;
};

export const products: Product[] = [
  {
    id: "model-1",
    model: 1,
    name: "Model 1",
    description:
      "Defined by compact elegance and refined presence, crafted for everyday distinction.",
    dimensions: "23 x 15,6 x 7,4 cm",
    widthCm: "23",
    heightCm: "15,6",
    thicknessCm: "7,4",
    priceEur: 120,
    pocketsAddOnEur: 10,
    images: [
      "/images/model1/model1-1.jpeg",
      "/images/model1/model1-2.jpeg",
      "/images/model1/model1-3.jpeg",
      "/images/model1/model1-4.jpeg",
      "/images/model1/model1-5.jpeg",
      "/images/model1/model1-6.jpeg"
    ],
    customizable: true
  },
  {
    id: "model-2",
    model: 2,
    name: "Model 2",
    description:
      "Balanced in proportion and rich in texture, made for those who favor understated statement pieces.",
    dimensions: "22 x 14 x 6,5 cm",
    widthCm: "22",
    heightCm: "14",
    thicknessCm: "6,5",
    priceEur: 100,
    pocketsAddOnEur: 10,
    images: [
      "/images/model2/model2-1.jpeg",
      "/images/model2/model2-2.jpeg",
      "/images/model2/model2-3.jpeg",
      "/images/model2/model2-4.jpeg"
    ],
    customizable: true
  },
  {
    id: "model-3",
    model: 3,
    name: "Model 3",
    description:
      "Sculpted with bold character and spacious intent, elevating travel and occasion with artisan depth.",
    dimensions: "22 x 11,5 x 6 cm",
    widthCm: "22",
    heightCm: "11,5",
    thicknessCm: "6",
    priceEur: 90,
    pocketsAddOnEur: 10,
    images: [
      "/images/model3/model3-1.jpeg",
      "/images/model3/model3-2.jpeg",
      "/images/model3/model3-3.jpeg",
      "/images/model3/model3-4.jpeg",
      "/images/model3/model3-5.jpeg"
    ],
    customizable: true
  },
  {
    id: "model-4",
    model: 4,
    name: "Model 4",
    description:
      "A lighter silhouette with poised proportions, designed for refined everyday carry.",
    dimensions: "17 x 11,5 x 6 cm",
    widthCm: "17",
    heightCm: "11,5",
    thicknessCm: "6",
    priceEur: 70,
    pocketsAddOnEur: 10,
    images: ["/images/model4/model4-1.jpeg", "/images/model4/model4-2.jpeg"],
    customizable: true
  }
];
