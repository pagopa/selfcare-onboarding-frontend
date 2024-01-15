export type CarnetPlan = {
  pricingPlan: string;
  messages: string;
  messagePrice: string;
  carnetPrice: string;
};

export type Echelon = {
  from: string;
  to: string;
  price: string;
};

export type PlansPrices = {
  carnetPlans: Array<CarnetPlan>;
  consumptionPlan: {
    pricingPlan: string;
    echelons: Array<Echelon>;
  };
};
