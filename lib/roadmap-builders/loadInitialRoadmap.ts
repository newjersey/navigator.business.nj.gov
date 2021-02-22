import { Roadmap } from "../types/Roadmap";
import { BusinessForm } from "../types/form";
import cloneDeep from "lodash/cloneDeep";
import restaurantRoadmap from "../../roadmaps/restaurant.json";
import ecommerceRoadmap from "../../roadmaps/ecommerce.json";
import homeContractorRoadmap from "../../roadmaps/home-contractor.json";

export const loadInitialRoadmap = (businessType: BusinessForm["businessType"]["businessType"]): Roadmap => {
  if (businessType === "Restaurant") {
    return cloneDeep(restaurantRoadmap as Roadmap);
  } else if (businessType === "E-Commerce") {
    return cloneDeep(ecommerceRoadmap as Roadmap);
  } else if (businessType === "Home Improvement Contractor") {
    return cloneDeep(homeContractorRoadmap as Roadmap);
  } else {
    return cloneDeep(restaurantRoadmap as Roadmap);
  }
};
