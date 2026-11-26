import type { Metadata } from "next";
import { SimulationWorkspace } from "@/components/calculators/simulation-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Engineering Simulation — My Engineering Lab",
  description: "Interactive RC/RL transient step response, IoT duty-cycle power profiling, and vibration FFT spectrum simulations.",
};

export default function SimulationPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="illustrative">Simulated</Badge>
            <Badge variant="outline">Phase 6 · Simulation</Badge>
          </div>
        }
        title="Engineering Simulation"
        description="Interactive time-domain and frequency-domain analytical simulations: RC/RL transients, duty-cycle battery power profiles, and vibration FFT spectra."
      />
      <SimulationWorkspace />
    </div>
  );
}

