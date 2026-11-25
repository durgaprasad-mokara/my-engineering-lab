import "server-only";
import { catalogueToSearchItems, type CatalogueSearchItem } from "@/lib/knowledge/search";
import { getAntennas } from "./antennas";
import { getCommunicationModules } from "./communication";
import { getComponents } from "./components";
import { getMicrocontrollers } from "./microcontrollers";
import { getSensors } from "./sensors";

export async function getCatalogueSearchItems(): Promise<CatalogueSearchItem[]> {
  const [components, sensors, mcus, communication, antennas] = await Promise.all([
    getComponents(),
    getSensors(),
    getMicrocontrollers(),
    getCommunicationModules(),
    getAntennas(),
  ]);
  return catalogueToSearchItems({ components, sensors, mcus, communication, antennas });
}
