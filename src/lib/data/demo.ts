/**
 * DEMO DATA — shown only when Supabase is not configured.
 * Every surface that renders these values displays a "Demo data" badge.
 * Values are deliberately generic and do not describe real products, prices or measurements.
 */
import type {
  CatalogueComponent,
  CatalogueMcu,
  CatalogueSensor,
  ComponentSummary,
  ConfigurationSummary,
  DashboardData,
  DesignSummary,
  NotificationSummary,
  ProjectSummary,
  Stat,
  TaskSummary,
  TelemetryPoint,
  Viewer,
} from "./types";
import { STAT_LABELS } from "./stats";

const hoursAgo = (h: number, now: Date) => new Date(now.getTime() - h * 3600_000).toISOString();

const URLS = {
  yageoRc0805: "https://www.yageo.com/en/Product/Index/rchip/general_purpose",
  murataMlc: "https://pim.murata.com/en-global/pim/details/?partNum=GRM21BR71C104KA01#",
  infineonIrlz44n: "https://www.infineon.com/cms/en/product/power/mosfet/n-channel/irlz44n/",
  infineonIrlz44nDs: "https://www.infineon.com/dgdl/irlz44npbf.pdf?fileId=5546d462533600a401535626b7721fdf",
  tiLm358: "https://www.ti.com/lit/ds/symlink/slos068ab.pdf",
  ams1117: "https://www.alldatasheet.com/datasheet-pdf/pdf/457815/AMS/AMS1117.html",
  vishay1n4148: "https://www.vishay.com/ppg?85503",
  vishay1n4148Ds: "https://www.vishay.com/docs/85748/1n4148w.pdf",
  kingbrightLed: "https://www.digikey.com/en/products/detail/kingbright/WP7113ID/2650733",
  onsemiPn2222a: "https://www.onsemi.com/products/interfaces/amplifiers-comparators/general-purpose-low-vce-sat-transistors/pn2222a",
  usbTypeC: "https://www.usb.org/documents",
  hcsr04: "https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf",
  dht22: "https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf",
  bmp280Page: "https://www.bosch-sensortec.com/products/environmental-sensors/pressure-sensors/bmp280.html",
  bmp280Ds: "https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bmp280-ds001.pdf",
  mpu6050Page: "https://product.tdk.com/en/search/sensor/mortion-inertial/imu/info?part_no=MPU-6050",
  mpu6050Ds: "https://www.cdiweb.com/datasheets/invensense/ps-mpu-6000a-00.pdf",
  acs712: "https://www.allegromicro.com/en/products/sense/current-sensor-ics/zero-to-fifty-amp-integrated-conductor-sensor-ics/acs712",
  yfs201: "https://wiki.seeedstudio.com/Water_Flow_Sensor/",
  esp32Wroom: "https://espressif.com/documentation/esp32-wroom-32_datasheet_en.pdf",
  arduinoUno: "https://docs.arduino.cc/hardware/uno-r3/",
  atmega328p: "https://www.microchip.com/en-us/product/ATmega328P",
  stm32f103c8: "https://www.st.com/resource/en/datasheet/stm32f103c8.pdf",
  rpiPico: "https://datasheets.raspberrypi.com/pico/pico_datasheet.pdf",
  rp2040: "https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf",
  nrf52840: "https://docs.nordicsemi.com/bundle/ps_nrf52840/page/key_features.html",
} as const;

export function demoCatalogueComponents(): CatalogueComponent[] {
  return [
    {
      id: "demo-comp-rc0805",
      slug: "yageo-rc0805-thick-film-resistor",
      name: "Yageo RC0805 Thick-Film Chip Resistor (10 kΩ, 1%)",
      manufacturer: "Yageo",
      partNumber: "RC0805FR-0710KL",
      package: "0805 (2012 Metric)",
      description:
        "General-purpose SMD thick-film chip resistor for pull-ups, voltage dividers, current sensing, and signal termination.",
      category: "Resistors",
      categorySlug: "resistors",
      operatingPrinciple:
        "Dissipates electrical power as heat via a ruthenium-oxide thick-film resistive layer printed on a high-purity alumina ceramic substrate.",
      internalStructure:
        "Alumina ceramic core, ruthenium-based resistive glaze, glass passivation overcoat, and nickel-tin plated wrap-around terminations.",
      interfaces: ["Two-terminal passive"],
      applications: ["I2C pull-up resistors", "ADC voltage dividers", "LED current limiting", "Op-amp feedback networks"],
      advantages: ["Low cost and high availability", "Lead-free and RoHS compliant", "Stable ±100 ppm/°C temperature coefficient"],
      limitations: ["0.125 W power rating limits high-current use", "Higher current noise than thin-film resistors", "Limited surge handling"],
      verificationStatus: "typical",
      sourceUrl: URLS.yageoRc0805,
      datasheetUrl: URLS.yageoRc0805,
      sourceTitle: "Yageo RC_L General Purpose Chip Resistors Series",
      pinout: [
        { pin: "1", name: "Terminal A", function: "Non-polarized resistive terminal" },
        { pin: "2", name: "Terminal B", function: "Non-polarized resistive terminal" },
      ],
      ratings: [
        { key: "power_rating", label: "Rated Power (70 °C)", min: null, typ: 0.125, max: 0.125, unit: "W", conditions: "Tamb ≤ 70 °C", verificationStatus: "typical", source: URLS.yageoRc0805 },
        { key: "working_voltage", label: "Max Working Voltage", min: null, typ: null, max: 150, unit: "V", conditions: "DC or RMS", verificationStatus: "typical", source: URLS.yageoRc0805 },
        { key: "temp_coeff", label: "Temperature Coefficient", min: -100, typ: null, max: 100, unit: "ppm/°C", conditions: "10 Ω ≤ R ≤ 1 MΩ", verificationStatus: "typical", source: URLS.yageoRc0805 },
        { key: "operating_temp", label: "Operating Temperature", min: -55, typ: null, max: 155, unit: "°C", conditions: "Derated above 70 °C", verificationStatus: "typical", source: URLS.yageoRc0805 },
      ],
      alternatives: [
        { slug: "murata-grm21br71c104ka01", name: "Murata GRM21BR71C104KA01 (0805 footprint pair)", relation: "compatible", notes: "Shares 0805 PCB land pattern for RC low-pass filters." },
      ],
    },
    {
      id: "demo-comp-grm21-100nf",
      slug: "murata-grm21br71c104ka01",
      name: "Murata 100 nF X7R MLCC (0805, 16 V)",
      manufacturer: "Murata Electronics",
      partNumber: "GRM21BR71C104KA01",
      package: "0805 (2012 Metric)",
      description:
        "100 nF ±10% X7R multilayer ceramic capacitor rated at 16 V DC for IC supply decoupling and high-frequency bypassing.",
      category: "Capacitors",
      categorySlug: "capacitors",
      operatingPrinciple:
        "Stores energy in an electrostatic field across interleaved nickel inner electrodes separated by Class II barium-titanate (X7R) ceramic dielectric.",
      internalStructure:
        "Stacked ceramic dielectric layers with alternating internal electrodes bonded to copper/nickel/tin external terminations.",
      interfaces: ["Two-terminal passive"],
      applications: ["MCU VCC decoupling", "LDO input/output stabilization", "RC anti-aliasing filters"],
      advantages: ["Very low ESR and ESL at MHz frequencies", "Non-polarized", "Wide -55 °C to +125 °C X7R temperature range"],
      limitations: ["DC bias capacitance derating on Class II dielectrics", "Susceptible to board-flex cracking without careful PCB orientation"],
      verificationStatus: "typical",
      sourceUrl: URLS.murataMlc,
      datasheetUrl: URLS.murataMlc,
      sourceTitle: "Murata PIM GRM21BR71C104KA01 Product Specification",
      pinout: [
        { pin: "1", name: "Terminal A", function: "Non-polarized capacitor electrode" },
        { pin: "2", name: "Terminal B", function: "Non-polarized capacitor electrode" },
      ],
      ratings: [
        { key: "capacitance", label: "Nominal Capacitance", min: 90, typ: 100, max: 110, unit: "nF", conditions: "1 kHz, 1.0 Vrms, 25 °C (±10%)", verificationStatus: "typical", source: URLS.murataMlc },
        { key: "rated_voltage", label: "Rated DC Voltage", min: null, typ: null, max: 16, unit: "V", conditions: "-55 °C to +125 °C", verificationStatus: "typical", source: URLS.murataMlc },
        { key: "operating_temp", label: "Operating Temperature", min: -55, typ: null, max: 125, unit: "°C", conditions: "X7R ΔC/C ≤ ±15%", verificationStatus: "typical", source: URLS.murataMlc },
      ],
    },
    {
      id: "demo-comp-irlz44n",
      slug: "infineon-irlz44n",
      name: "Infineon IRLZ44N Logic-Level N-Channel MOSFET",
      manufacturer: "Infineon Technologies",
      partNumber: "IRLZ44NPbF",
      package: "TO-220AB",
      description:
        "55 V, 47 A logic-level N-channel HEXFET power MOSFET suitable for direct 5 V microcontroller gate drive in motor and solenoid loads.",
      category: "MOSFETs",
      categorySlug: "mosfets",
      operatingPrinciple:
        "Applies positive gate-to-source voltage above VGS(th) to invert a p-type channel under the gate oxide, conducting current from drain to source.",
      internalStructure:
        "Planar/trench vertical power MOSFET silicon die mounted on a copper TO-220 leadframe with an integrated parasitic body diode.",
      interfaces: ["Gate drive (voltage controlled)", "High-current Drain-Source switch"],
      applications: ["DC motor PWM switching", "Solenoid & relay drivers", "Low-side DC load switching"],
      advantages: ["Low RDS(on) ≈ 22 mΩ at VGS = 10 V (25 mΩ at 5 V)", "Logic-level gate threshold (1–2 V)", "High continuous drain current capability"],
      limitations: ["3.3 V GPIO drive gives incomplete enhancement at high currents (use 5 V gate driver)", "Large gate charge (~48 nC) requires fast driver for high-frequency PWM"],
      verificationStatus: "typical",
      sourceUrl: URLS.infineonIrlz44n,
      datasheetUrl: URLS.infineonIrlz44nDs,
      sourceTitle: "Infineon IRLZ44NPbF Datasheet",
      pinout: [
        { pin: "1", name: "G", function: "Gate control terminal" },
        { pin: "2", name: "D", function: "Drain (also connected to mounting tab)" },
        { pin: "3", name: "S", function: "Source return terminal" },
      ],
      ratings: [
        { key: "vds", label: "Drain-Source Breakdown (V(BR)DSS)", min: 55, typ: null, max: null, unit: "V", conditions: "VGS = 0 V, ID = 250 µA", verificationStatus: "typical", source: URLS.infineonIrlz44nDs },
        { key: "id_cont", label: "Continuous Drain Current (25 °C)", min: null, typ: null, max: 47, unit: "A", conditions: "TC = 25 °C, VGS = 10 V (package/thermal limited)", verificationStatus: "typical", source: URLS.infineonIrlz44nDs },
        { key: "rds_on_5v", label: "On-State Resistance RDS(on)", min: null, typ: null, max: 25, unit: "mΩ", conditions: "VGS = 5.0 V, ID = 25 A", verificationStatus: "typical", source: URLS.infineonIrlz44nDs },
        { key: "vgs_th", label: "Gate Threshold Voltage VGS(th)", min: 1.0, typ: null, max: 2.0, unit: "V", conditions: "VDS = VGS, ID = 250 µA", verificationStatus: "typical", source: URLS.infineonIrlz44nDs },
      ],
      alternatives: [
        { slug: "onsemi-pn2222a", name: "onsemi PN2222A NPN BJT", relation: "alternative", notes: "Lower-cost alternative only for loads under ~500 mA." },
      ],
    },
    {
      id: "demo-comp-lm358",
      slug: "ti-lm358",
      name: "Texas Instruments LM358 Dual Operational Amplifier",
      manufacturer: "Texas Instruments",
      partNumber: "LM358P / LM358DR",
      package: "DIP-8 / SOIC-8",
      description:
        "Industry-standard dual operational amplifier supporting single-supply operation from 3 V to 32 V with ground-sensing input common-mode range.",
      category: "Operational amplifiers",
      categorySlug: "op-amps",
      operatingPrinciple:
        "High-gain differential input stage drives a class-AB output stage; external negative feedback sets closed-loop gain, filtering, or buffering.",
      internalStructure:
        "Monolithic bipolar IC containing two internally frequency-compensated operational amplifiers sharing bias and supply rails.",
      interfaces: ["Analog differential input", "Single-ended analog output"],
      applications: ["Sensor signal conditioning", "4–20 mA / shunt current amplifiers", "Active low-pass filters", "Voltage followers"],
      advantages: ["Single-supply operation down to 3 V", "Input common-mode range includes ground (V-)", "Internal unity-gain compensation"],
      limitations: ["Output cannot swing fully to positive rail (≈ VCC - 1.5 V)", "Crossover distortion on class-AB output without load bias", "1 MHz typical GBW limits high-speed signals"],
      verificationStatus: "typical",
      sourceUrl: URLS.tiLm358,
      datasheetUrl: URLS.tiLm358,
      sourceTitle: "TI LM358 Industry-Standard Dual Operational Amplifiers (SLOS068AB)",
      documentRev: "SLOS068AB",
      pinout: [
        { pin: "1", name: "OUT1", function: "Channel 1 output" },
        { pin: "2", name: "IN1-", function: "Channel 1 inverting input" },
        { pin: "3", name: "IN1+", function: "Channel 1 non-inverting input" },
        { pin: "4", name: "GND / V-", function: "Negative supply or ground" },
        { pin: "5", name: "IN2+", function: "Channel 2 non-inverting input" },
        { pin: "6", name: "IN2-", function: "Channel 2 inverting input" },
        { pin: "7", name: "OUT2", function: "Channel 2 output" },
        { pin: "8", name: "VCC / V+", function: "Positive power supply" },
      ],
      ratings: [
        { key: "supply_voltage", label: "Single Supply Voltage", min: 3, typ: null, max: 32, unit: "V", conditions: "LM358 standard grade", verificationStatus: "typical", source: URLS.tiLm358 },
        { key: "gbw", label: "Gain-Bandwidth Product", min: null, typ: 0.7, max: null, unit: "MHz", conditions: "Typical small-signal", verificationStatus: "typical", source: URLS.tiLm358 },
        { key: "vio", label: "Input Offset Voltage", min: null, typ: 2, max: 7, unit: "mV", conditions: "25 °C", verificationStatus: "typical", source: URLS.tiLm358 },
        { key: "iq", label: "Quiescent Supply Current", min: null, typ: 0.7, max: 1.2, unit: "mA", conditions: "Both amplifiers, no load, VCC = 5 V", verificationStatus: "typical", source: URLS.tiLm358 },
      ],
    },
    {
      id: "demo-comp-ams1117",
      slug: "ams1117-3v3",
      name: "AMS1117-3.3 1 A Low-Dropout Linear Regulator",
      manufacturer: "Advanced Monolithic Systems",
      partNumber: "AMS1117-3.3",
      package: "SOT-223 / TO-252",
      description:
        "Fixed 3.3 V positive linear LDO voltage regulator capable of delivering up to 1 A output current with thermal shutdown and current limiting.",
      category: "LDO regulators",
      categorySlug: "ldo",
      operatingPrinciple:
        "Regulates output voltage to 3.3 V by modulating an internal NPN Darlington pass element via an error amplifier comparing divided output against a 1.25 V bandgap reference.",
      internalStructure:
        "Precision bandgap voltage reference, error amplifier, NPN pass transistor, overcurrent protection, and thermal shutdown circuit.",
      interfaces: ["DC linear regulation (VIN → 3.3 V)"],
      applications: ["5 V USB to 3.3 V logic rail", "ESP32 / STM32 development boards", "Post-buck low-noise analog rails"],
      advantages: ["Simple 3-pin layout", "Up to 1 A output current", "Integrated thermal and current limiting"],
      limitations: ["High dropout voltage (~1.1–1.3 V at 1 A) unsuitable for 3.7 V Li-ion cells near discharge", "High quiescent current (~5–10 mA) unsuitable for battery sleep nodes", "Requires ≥ 10–22 µF output capacitor with controlled ESR"],
      verificationStatus: "typical",
      sourceUrl: URLS.ams1117,
      datasheetUrl: URLS.ams1117,
      sourceTitle: "AMS1117 1A Low Dropout Voltage Regulator Datasheet",
      pinout: [
        { pin: "1", name: "GND", function: "Ground reference" },
        { pin: "2", name: "VOUT", function: "Regulated 3.3 V output (and SOT-223 tab)" },
        { pin: "3", name: "VIN", function: "Unregulated DC input (4.75 V to 15 V)" },
      ],
      ratings: [
        { key: "vout", label: "Regulated Output Voltage", min: 3.234, typ: 3.3, max: 3.366, unit: "V", conditions: "IOUT = 10 mA, TJ = 25 °C", verificationStatus: "typical", source: URLS.ams1117 },
        { key: "dropout", label: "Dropout Voltage (VIN - VOUT)", min: null, typ: 1.1, max: 1.3, unit: "V", conditions: "IOUT = 1 A", verificationStatus: "typical", source: URLS.ams1117 },
        { key: "vin_max", label: "Max Input Voltage", min: null, typ: null, max: 15, unit: "V", conditions: "Absolute continuous input", verificationStatus: "typical", source: URLS.ams1117 },
        { key: "iq", label: "Quiescent Current", min: null, typ: 5, max: 10, unit: "mA", conditions: "VIN ≤ 15 V", verificationStatus: "typical", source: URLS.ams1117 },
      ],
    },
    {
      id: "demo-comp-1n4148",
      slug: "vishay-1n4148",
      name: "Vishay 1N4148 Fast-Switching Signal Diode",
      manufacturer: "Vishay Semiconductors",
      partNumber: "1N4148",
      package: "DO-35 (Axial) / SOD-123 (1N4148W)",
      description:
        "High-speed silicon epitaxial planar switching diode rated to 100 V reverse voltage and ~4 ns reverse recovery time.",
      category: "Diodes",
      categorySlug: "diodes",
      operatingPrinciple:
        "Conducts forward current across a lightly doped silicon p-n junction above ~0.7 V while blocking reverse voltage up to 100 V with fast minority-carrier recombination.",
      internalStructure:
        "Diffused silicon epitaxial planar p-n junction hermetically sealed in glass DO-35 or molded SMD package.",
      interfaces: ["Two-terminal PN junction"],
      applications: ["GPIO voltage clamping", "Signal rectification", "Small relay flyback protection", "Diode-OR logic"],
      advantages: ["Very fast 4 ns reverse recovery", "Low junction capacitance (~4 pF)", "Inexpensive and ubiquitous"],
      limitations: ["Not rated for power rectification (> 200–300 mA)", "Higher forward drop (~0.7–1.0 V) than Schottky diodes"],
      verificationStatus: "typical",
      sourceUrl: URLS.vishay1n4148,
      datasheetUrl: URLS.vishay1n4148Ds,
      sourceTitle: "Vishay 1N4148 / 1N4148W Fast Switching Diode Datasheet",
      pinout: [
        { pin: "1", name: "Anode", function: "Positive forward-conduction terminal" },
        { pin: "2", name: "Cathode", function: "Negative terminal (marked with band)" },
      ],
      ratings: [
        { key: "vrrm", label: "Repetitive Peak Reverse Voltage", min: null, typ: null, max: 100, unit: "V", conditions: "TA = 25 °C", verificationStatus: "typical", source: URLS.vishay1n4148Ds },
        { key: "if_avg", label: "Average Forward Current", min: null, typ: null, max: 150, unit: "mA", conditions: "Continuous DC", verificationStatus: "typical", source: URLS.vishay1n4148Ds },
        { key: "vf", label: "Forward Voltage VF", min: null, typ: 0.72, max: 1.0, unit: "V", conditions: "IF = 10 mA", verificationStatus: "typical", source: URLS.vishay1n4148Ds },
        { key: "trr", label: "Reverse Recovery Time trr", min: null, typ: null, max: 4, unit: "ns", conditions: "IF = 10 mA to IR = 1 mA", verificationStatus: "typical", source: URLS.vishay1n4148Ds },
      ],
    },
    {
      id: "demo-comp-red-led-5mm",
      slug: "generic-5mm-red-led",
      name: "Generic 5 mm Red Indicator LED (ref. WP7113ID)",
      manufacturer: "Generic / Kingbright reference",
      partNumber: "WP7113ID (reference)",
      package: "T-1 3/4 (5 mm Through-Hole)",
      description:
        "Standard diffused 5 mm red status indicator LED (~625–635 nm wavelength) driven via an external current-limiting resistor.",
      category: "LEDs",
      categorySlug: "leds",
      operatingPrinciple:
        "Electroluminescence in a forward-biased GaAsP/AlGaInP semiconductor junction emits red photons proportional to forward current.",
      internalStructure:
        "Semiconductor die mounted in a reflective cathode cup, gold wire bond to anode lead, encapsulated in red-tinted epoxy dome.",
      interfaces: ["Current-driven optical indicator"],
      applications: ["Power/status indication", "Logic state debugging", "Panel indicators"],
      advantages: ["Low forward voltage (~1.8–2.1 V) compatible with 3.3 V and 5 V logic", "Long operational lifetime", "Easy breadboard prototyping"],
      limitations: ["Requires external series resistor to limit current", "Low reverse breakdown voltage (~5 V)"],
      verificationStatus: "estimated",
      sourceUrl: URLS.kingbrightLed,
      datasheetUrl: URLS.kingbrightLed,
      sourceTitle: "Kingbright WP7113ID 5 mm High Efficiency Red LED Reference",
      pinout: [
        { pin: "1", name: "Anode (+)", function: "Longer lead — connect toward positive rail via resistor" },
        { pin: "2", name: "Cathode (-)", function: "Shorter lead / flat rim side — connect toward ground" },
      ],
      ratings: [
        { key: "vf", label: "Forward Voltage VF", min: 1.8, typ: 2.0, max: 2.5, unit: "V", conditions: "IF = 20 mA (estimated generic range)", verificationStatus: "estimated", source: URLS.kingbrightLed },
        { key: "if_nom", label: "Nominal Forward Current", min: 2, typ: 10, max: 20, unit: "mA", conditions: "Indicator duty (20 mA max typical)", verificationStatus: "estimated", source: URLS.kingbrightLed },
        { key: "vr", label: "Reverse Voltage VR", min: null, typ: null, max: 5, unit: "V", conditions: "Absolute maximum reverse bias", verificationStatus: "estimated", source: URLS.kingbrightLed },
      ],
    },
    {
      id: "demo-comp-pn2222a",
      slug: "onsemi-pn2222a",
      name: "onsemi PN2222A / 2N2222 General-Purpose NPN BJT",
      manufacturer: "onsemi",
      partNumber: "PN2222A",
      package: "TO-92",
      description:
        "Classic general-purpose small-signal and low-power switching NPN bipolar junction transistor rated to 40 V VCEO and 600–800 mA peak collector current.",
      category: "Transistors (BJT)",
      categorySlug: "bjts",
      operatingPrinciple:
        "Small base-emitter forward current modulates a larger collector-emitter current by current gain β (hFE) in active mode or low-VCE(sat) saturation in switch mode.",
      internalStructure:
        "Planar silicon NPN structure (emitter-base-collector junctions) in a molded TO-92 three-lead package.",
      interfaces: ["Base-current controlled switch/amplifier"],
      applications: ["Relay coil & buzzer drivers", "Low-power LED array switching", "Small-signal audio/sensor amplification"],
      advantages: ["Well-characterized and inexpensive", "Fast switching transition frequency (~250–300 MHz)", "Drives loads up to ~500 mA continuously"],
      limitations: ["Requires continuous base current (causes GPIO load)", "Higher saturation loss than logic-level MOSFETs above ~300 mA", "Pinout varies between 2N2222 metal can and P2N2222A/PN2222A TO-92"],
      verificationStatus: "typical",
      sourceUrl: URLS.onsemiPn2222a,
      datasheetUrl: URLS.onsemiPn2222a,
      sourceTitle: "onsemi PN2222A NPN General-Purpose Amplifier Documentation",
      pinout: [
        { pin: "1", name: "E", function: "Emitter (verify TO-92 variant pinout on datasheet)" },
        { pin: "2", name: "B", function: "Base control terminal (via base resistor)" },
        { pin: "3", name: "C", function: "Collector load terminal" },
      ],
      ratings: [
        { key: "vceo", label: "Collector-Emitter Voltage VCEO", min: null, typ: null, max: 40, unit: "V", conditions: "IB = 0", verificationStatus: "typical", source: URLS.onsemiPn2222a },
        { key: "ic", label: "Collector Current IC (max)", min: null, typ: null, max: 600, unit: "mA", conditions: "Continuous (package dissipation limited)", verificationStatus: "typical", source: URLS.onsemiPn2222a },
        { key: "hfe", label: "DC Current Gain hFE", min: 100, typ: null, max: 300, unit: "×", conditions: "IC = 150 mA, VCE = 10 V", verificationStatus: "typical", source: URLS.onsemiPn2222a },
        { key: "vce_sat", label: "Collector-Emitter Saturation VCE(sat)", min: null, typ: null, max: 0.3, unit: "V", conditions: "IC = 150 mA, IB = 15 mA", verificationStatus: "typical", source: URLS.onsemiPn2222a },
      ],
      alternatives: [
        { slug: "infineon-irlz44n", name: "Infineon IRLZ44N Logic-Level MOSFET", relation: "alternative", notes: "Preferred for loads > 500 mA or low-loss PWM switching." },
      ],
    },
    {
      id: "demo-comp-usbc-16p",
      slug: "usb-c-16pin-receptacle",
      name: "Generic 16-Pin USB Type-C Receptacle (USB 2.0 + CC)",
      manufacturer: "Generic (USB-IF Type-C compliant)",
      partNumber: "TYPE-C-31-M-12 (typical)",
      package: "SMD Mid/Top Mount + 4 THT Shield Tabs",
      description:
        "Reversible 16-pin USB Type-C connector exposing VBUS, GND, USB 2.0 D+/D-, CC1/CC2 configuration channel pins, and SBU pins for power + UART/USB programming.",
      category: "USB-C",
      categorySlug: "usb-c",
      operatingPrinciple:
        "Symmetrical dual-row contact geometry supports reversible plug orientation; 5.1 kΩ pulldowns on CC1 and CC2 signal a 5 V Sink device to USB-C power sources.",
      internalStructure:
        "Stamped copper-alloy contacts in high-temperature LCP insulator surrounded by a stainless-steel EMI shield shell.",
      interfaces: ["USB 2.0 (480 Mbps)", "USB-C CC1/CC2 (5 V / up to 3 A advertisement)"],
      applications: ["Device power & USB programming", "USB-to-UART debug ports", "5 V 3 A embedded power input"],
      advantages: ["Reversible user-friendly connector", "Easier hand/reflow soldering than 24-pin full-featured receptacles", "Supports 5 V @ up to 3 A with passive 5.1 kΩ CC resistors"],
      limitations: ["No SuperSpeed USB 3.x differential pairs", "Omitting 5.1 kΩ CC1/CC2 pulldown resistors causes USB-C-to-USB-C hosts to supply 0 V"],
      verificationStatus: "estimated",
      sourceUrl: URLS.usbTypeC,
      datasheetUrl: URLS.usbTypeC,
      sourceTitle: "USB-IF USB Type-C Cable and Connector Specification",
      pinout: [
        { pin: "A1/B12", name: "GND", function: "Ground return" },
        { pin: "A4/B9", name: "VBUS", function: "Bus power (5 V default)" },
        { pin: "A5", name: "CC1", function: "Configuration channel 1 (5.1 kΩ to GND for Sink)" },
        { pin: "B5", name: "CC2", function: "Configuration channel 2 (separate 5.1 kΩ to GND for Sink)" },
        { pin: "A6/B6", name: "D+", function: "USB 2.0 differential data +" },
        { pin: "A7/B7", name: "D-", function: "USB 2.0 differential data -" },
      ],
      ratings: [
        { key: "vbus", label: "Nominal VBUS Voltage", min: 4.75, typ: 5.0, max: 5.5, unit: "V", conditions: "Legacy / Default USB-C 5 V", verificationStatus: "estimated", source: URLS.usbTypeC },
        { key: "ibus", label: "Current Rating (VBUS)", min: null, typ: 3.0, max: 3.0, unit: "A", conditions: "Combined VBUS/GND pins (verify specific connector datasheet)", verificationStatus: "estimated", source: URLS.usbTypeC },
      ],
    },
  ];
}

export function demoCatalogueSensors(): CatalogueSensor[] {
  return [
    {
      id: "demo-sens-hcsr04",
      slug: "hc-sr04",
      name: "HC-SR04 Ultrasonic Ranging Module",
      sensorGroup: "distance_detection",
      measurand: "Non-contact Distance",
      measurementPrinciple: "Time-of-Flight (ToF) of 40 kHz acoustic ultrasonic pulses reflected from a target surface.",
      howItWorks:
        "A 10 µs high pulse on TRIG fires an 8-cycle 40 kHz ultrasonic burst. The module asserts ECHO high for a duration proportional to round-trip acoustic travel time (distance = t × speed_of_sound / 2).",
      internalConstruction:
        "Twin 40 kHz piezoelectric transducer cans (transmitter and receiver), MAX232/charge-pump ultrasonic driver, comparator/amplifier chain, and timing microcontroller.",
      outputType: "pulse",
      protocols: ["GPIO Trigger/Echo Pulse"],
      calibrationProcedure:
        "Apply ambient air-temperature compensation to speed of sound c ≈ 331.3 + 0.606 × T(°C) m/s and verify zero-offset against a rigid target at a measured reference distance.",
      environmentalLimits: "0 °C to +70 °C typical; non-condensing indoor air (not waterproof; acoustic reflections degrade on soft/angled surfaces).",
      applications: ["Tank level prototyping", "Obstacle avoidance robotics", "Short-range presence detection"],
      advantages: ["Inexpensive and widely documented", "Unaffected by target colour or transparency", "Simple 2-pin GPIO timing interface"],
      disadvantages: ["Requires 5 V supply on standard modules (ECHO needs level shifting for 3.3 V MCUs)", "Wide ~15° beam cone causes false reflections in narrow enclosures", "Not weatherproof"],
      verificationStatus: "typical",
      sourceUrl: URLS.hcsr04,
      sourceTitle: "HC-SR04 Ultrasonic Ranging Module Datasheet",
      specs: [
        { key: "range", minValue: 2, typValue: null, maxValue: 400, unit: "cm", conditions: "Flat hard target perpendicular to beam", verificationStatus: "typical", source: URLS.hcsr04 },
        { key: "accuracy", minValue: null, typValue: 3, maxValue: null, unit: "mm", conditions: "Typical ranging resolution/accuracy at moderate distance", verificationStatus: "typical", source: URLS.hcsr04 },
        { key: "supply_voltage", minValue: 4.5, typValue: 5.0, maxValue: 5.5, unit: "V", conditions: "Standard 5 V module", verificationStatus: "typical", source: URLS.hcsr04 },
        { key: "operating_current", minValue: null, typValue: 15, maxValue: null, unit: "mA", conditions: "Active ranging burst", verificationStatus: "typical", source: URLS.hcsr04 },
        { key: "response_time", minValue: 60, typValue: null, maxValue: null, unit: "ms", conditions: "Recommended minimum measurement cycle", verificationStatus: "typical", source: URLS.hcsr04 },
      ],
    },
    {
      id: "demo-sens-dht22",
      slug: "dht22",
      name: "DHT22 (AM2302) Temperature & Humidity Sensor",
      sensorGroup: "environmental",
      measurand: "Relative Humidity & Ambient Temperature",
      measurementPrinciple: "Capacitive polymer humidity sensing paired with an NTC thermistor temperature element.",
      howItWorks:
        "An onboard 8-bit MCU reads capacitance changes in a hygroscopic polymer film and voltage across an internal NTC thermistor, streaming a 40-bit calibrated digital frame over a single-wire bidirectional data line.",
      internalConstruction:
        "Polymer capacitive humidity element, NTC thermistor, internal calibration EEPROM, and 8-bit microcontroller in a louvered plastic housing.",
      outputType: "digital",
      protocols: ["Proprietary 1-Wire Single-Bus"],
      calibrationProcedure:
        "Factory-calibrated in an environmental chamber with coefficients stored in internal OTP memory; field validation uses saturated salt reference chambers.",
      environmentalLimits: "-40 °C to +80 °C, 0–100% RH (avoid prolonged condensation or chemical vapors).",
      applications: ["Greenhouse monitoring", "HVAC room logging", "Indoor weather stations"],
      advantages: ["Factory calibrated digital output", "Wide -40 to +80 °C range", "Single GPIO data pin with external pull-up"],
      disadvantages: ["Slow 0.5 Hz max sampling rate (1 reading per 2 s)", "Timing-sensitive proprietary 1-wire protocol", "Polymer drift over long-term high-humidity exposure"],
      verificationStatus: "typical",
      sourceUrl: URLS.dht22,
      sourceTitle: "Aosong DHT22 / AM2302 Digital Temperature & Humidity Sensor Datasheet",
      specs: [
        { key: "range", minValue: 0, typValue: null, maxValue: 100, unit: "% RH", conditions: "Relative humidity (-40..80 °C temperature)", verificationStatus: "typical", source: URLS.dht22 },
        { key: "accuracy", minValue: -2, typValue: null, maxValue: 2, unit: "% RH", conditions: "Typical RH accuracy (±0.5 °C temperature)", verificationStatus: "typical", source: URLS.dht22 },
        { key: "resolution", minValue: null, typValue: 0.1, maxValue: null, unit: "% RH / °C", conditions: "16-bit data frame resolution", verificationStatus: "typical", source: URLS.dht22 },
        { key: "supply_voltage", minValue: 3.3, typValue: 5.0, maxValue: 6.0, unit: "V", conditions: "DC supply", verificationStatus: "typical", source: URLS.dht22 },
        { key: "operating_current", minValue: 1.0, typValue: null, maxValue: 1.5, unit: "mA", conditions: "During measurement (40–50 µA standby)", verificationStatus: "typical", source: URLS.dht22 },
        { key: "response_time", minValue: 2000, typValue: null, maxValue: null, unit: "ms", conditions: "Minimum 2 s polling period", verificationStatus: "typical", source: URLS.dht22 },
      ],
    },
    {
      id: "demo-sens-bmp280",
      slug: "bmp280",
      name: "Bosch Sensortec BMP280 Pressure & Temperature Sensor",
      sensorGroup: "environmental",
      measurand: "Barometric Pressure & Temperature",
      measurementPrinciple: "Piezo-resistive MEMS pressure membrane bridge with integrated silicon temperature compensation.",
      howItWorks:
        "Atmospheric pressure deflects a micromachined silicon membrane forming a Wheatstone bridge; an internal ADC digitizes pressure and temperature, and the host applies factory trimming coefficients stored in NVM.",
      internalConstruction:
        "MEMS piezo-resistive pressure die co-packaged with a mixed-signal ASIC in an 8-pin 2.0 × 2.5 mm metal-lid LGA package.",
      outputType: "digital",
      protocols: ["I2C", "SPI"],
      calibrationProcedure:
        "Individual factory calibration coefficients (dig_T1..3, dig_P1..9) are read from NVM registers at boot; altitude estimation requires sea-level QNH reference pressure.",
      environmentalLimits: "-40 °C to +85 °C; 300 to 1100 hPa (not waterproof — keep dust/liquids away from pressure port hole).",
      applications: ["Barometric altimetry / drones", "Weather stations", "Indoor floor-level detection"],
      advantages: ["Ultra-low power (~2.7 µA @ 1 Hz)", "High pressure resolution (0.16 Pa / ~1.3 cm altitude)", "Both I2C and SPI interfaces"],
      disadvantages: ["Measures temperature for internal compensation (self-heating skews ambient readings slightly)", "Requires 1.8–3.6 V logic (needs level shifter for 5 V MCUs)"],
      verificationStatus: "typical",
      sourceUrl: URLS.bmp280Page,
      sourceTitle: "Bosch Sensortec BMP280 Datasheet (BST-BMP280-DS001)",
      specs: [
        { key: "range", minValue: 300, typValue: null, maxValue: 1100, unit: "hPa", conditions: "Barometric pressure (+9000 m to -500 m)", verificationStatus: "typical", source: URLS.bmp280Ds },
        { key: "accuracy", minValue: -1.0, typValue: null, maxValue: 1.0, unit: "hPa", conditions: "Absolute pressure 300..1100 hPa, 0..65 °C", verificationStatus: "typical", source: URLS.bmp280Ds },
        { key: "resolution", minValue: null, typValue: 0.16, maxValue: null, unit: "Pa", conditions: "Ultra-high resolution mode", verificationStatus: "typical", source: URLS.bmp280Ds },
        { key: "supply_voltage", minValue: 1.71, typValue: 3.3, maxValue: 3.6, unit: "V", conditions: "VDD core & VDDIO", verificationStatus: "typical", source: URLS.bmp280Ds },
        { key: "operating_current", minValue: null, typValue: 0.0027, maxValue: null, unit: "mA", conditions: "2.7 µA at 1 Hz ultra-low power pressure + temp", verificationStatus: "typical", source: URLS.bmp280Ds },
      ],
    },
    {
      id: "demo-sens-mpu6050",
      slug: "mpu-6050",
      name: "TDK InvenSense MPU-6050 6-Axis MotionTracking IMU",
      sensorGroup: "motion",
      measurand: "3-Axis Angular Velocity & 3-Axis Linear Acceleration",
      measurementPrinciple: "Differential capacitive MEMS proof masses for linear acceleration and Coriolis vibrating-structure MEMS gyroscopes.",
      howItWorks:
        "Six simultaneous 16-bit ADCs sample three orthogonal accelerometer axes and three orthogonal gyroscope axes, feeding FIFO buffers and an onboard Digital Motion Processor (DMP) over I2C.",
      internalConstruction:
        "Dual-sensor MEMS silicon die bonded to a mixed-signal CMOS ASIC inside a 4 × 4 × 0.9 mm QFN-24 package.",
      outputType: "digital",
      protocols: ["I2C"],
      calibrationProcedure:
        "Capture stationary flat zero-g / zero-rate bias offsets at operating temperature and compute scale/misalignment calibration matrices; fuse accel + gyro with complementary or Kalman filter.",
      environmentalLimits: "-40 °C to +85 °C; up to 10,000 g shock survival (unpowered).",
      applications: ["Robot balance & orientation", "Drone flight stabilization", "Vibration & tilt monitoring"],
      advantages: ["Integrated 16-bit ADCs and programmable full-scale ranges", "Onboard FIFO reduces MCU polling overhead", "Wide software/driver ecosystem"],
      disadvantages: ["No magnetometer (yaw drifts without external compass)", "End-of-life/legacy compared to ICM-42688-P for new designs", "3.3 V logic I/O only"],
      verificationStatus: "typical",
      sourceUrl: URLS.mpu6050Page,
      sourceTitle: "InvenSense MPU-6000 / MPU-6050 Product Specification",
      specs: [
        { key: "range", minValue: -16, typValue: null, maxValue: 16, unit: "g", conditions: "Selectable ±2g / ±4g / ±8g / ±16g accel (±250..±2000 °/s gyro)", verificationStatus: "typical", source: URLS.mpu6050Ds },
        { key: "resolution", minValue: null, typValue: 16, maxValue: null, unit: "bit", conditions: "Simultaneous 16-bit ADCs on all 6 axes", verificationStatus: "typical", source: URLS.mpu6050Ds },
        { key: "supply_voltage", minValue: 2.375, typValue: 3.3, maxValue: 3.46, unit: "V", conditions: "VDD supply", verificationStatus: "typical", source: URLS.mpu6050Ds },
        { key: "operating_current", minValue: null, typValue: 3.9, maxValue: null, unit: "mA", conditions: "All 6 axes active", verificationStatus: "typical", source: URLS.mpu6050Ds },
        { key: "sample_rate", minValue: null, typValue: 1000, maxValue: null, unit: "Hz", conditions: "Accelerometer ODR (Gyro up to 8 kHz)", verificationStatus: "typical", source: URLS.mpu6050Ds },
      ],
    },
    {
      id: "demo-sens-acs712",
      slug: "acs712",
      name: "Allegro ACS712 Hall-Effect Linear Current Sensor (±5 A variant)",
      sensorGroup: "industrial",
      measurand: "AC / DC Electrical Current",
      measurementPrinciple: "Linear Hall-effect sensing of the magnetic field induced by current flowing through an integrated 1.2 mΩ copper conduction path.",
      howItWorks:
        "Load current flows between IP+ and IP- copper leads; a precision low-offset Hall IC measures the induced flux density and outputs a ratiometric analog voltage centered at VCC / 2.",
      internalConstruction:
        "Galvanically isolated copper leadframe conduction path integrated above a monolithic Hall IC in an 8-pin SOIC package.",
      outputType: "analog",
      protocols: ["Ratiometric Analog Voltage"],
      calibrationProcedure:
        "Sample VOUT at zero load current to measure zero-amp offset (~VCC/2), then scale ADC readings by variant sensitivity (185 mV/A for 5 A, 100 mV/A for 20 A, 66 mV/A for 30 A).",
      environmentalLimits: "-40 °C to +85 °C; 2.1 kVRMS minimum isolation voltage (check regional mains safety creepage/clearance).",
      applications: ["Motor phase/load current monitoring", "Battery charge/discharge telemetry", "Overcurrent fault detection"],
      advantages: ["2.1 kVRMS galvanic isolation between load and MCU", "Measures both AC and DC currents", "Very low 1.2 mΩ primary conductor resistance"],
      disadvantages: ["Requires 5 V supply (output centered at 2.5 V; needs divider for 3.3 V ADC)", "Sensitive to nearby stray magnetic fields", "Zero-current output drifts slightly with temperature"],
      verificationStatus: "typical",
      sourceUrl: URLS.acs712,
      sourceTitle: "Allegro MicroSystems ACS712 Product & Datasheet Overview",
      specs: [
        { key: "range", minValue: -5, typValue: null, maxValue: 5, unit: "A", conditions: "ACS712ELCTR-05B-T (20 A / 30 A variants also exist)", verificationStatus: "typical", source: URLS.acs712 },
        { key: "sensitivity", minValue: 180, typValue: 185, maxValue: 190, unit: "mV/A", conditions: "5 A variant at TA = 25 °C", verificationStatus: "typical", source: URLS.acs712 },
        { key: "accuracy", minValue: -1.5, typValue: 1.5, maxValue: 1.5, unit: "%", conditions: "Total output error at TA = 25 °C", verificationStatus: "typical", source: URLS.acs712 },
        { key: "bandwidth", minValue: null, typValue: 80, maxValue: null, unit: "kHz", conditions: "Set externally via FILTER pin capacitor", verificationStatus: "typical", source: URLS.acs712 },
        { key: "supply_voltage", minValue: 4.5, typValue: 5.0, maxValue: 5.5, unit: "V", conditions: "VCC supply", verificationStatus: "typical", source: URLS.acs712 },
        { key: "operating_current", minValue: null, typValue: 10, maxValue: 13, unit: "mA", conditions: "VCC = 5.0 V, output open", verificationStatus: "typical", source: URLS.acs712 },
      ],
    },
    {
      id: "demo-sens-yfs201",
      slug: "yf-s201",
      name: "YF-S201 Hall-Effect Turbine Water Flow Sensor",
      sensorGroup: "water",
      measurand: "Volumetric Water Flow Rate & Totalized Volume",
      measurementPrinciple: "Axial-vane turbine rotor spins proportionally to water velocity; an embedded magnet triggers a Hall-effect switch to emit frequency pulses.",
      howItWorks:
        "Water enters the 1/2\" NPT/BSP housing and turns a pinwheel rotor carrying a permanent magnet. A sealed Hall sensor outputs a square-wave pulse train (~7.5 Hz per L/min, ~450 pulses/L).",
      internalConstruction:
        "Injection-molded POM/nylon body, stainless-steel shaft pinwheel rotor with embedded magnet, and epoxy-potted Hall sensor module.",
      outputType: "pulse",
      protocols: ["5V TTL Pulse Frequency (GPIO Interrupt)"],
      calibrationProcedure:
        "Measure actual dispensed water mass/volume across low, nominal, and peak flow rates to calibrate the empirical K-factor (pulses per liter) for the installed pipe geometry.",
      environmentalLimits: "Water temp ≤ 80 °C (non-freezing), max static pressure ≤ 1.75 MPa; install upstream mesh strainer to prevent rotor jamming.",
      applications: ["Smart water meter prototypes", "Irrigation dosing control", "Coolant flow monitoring"],
      advantages: ["Low cost and simple interrupt-based pulse counting", "Electronics isolated from water stream", "Wide 5–18 V working voltage"],
      disadvantages: ["Not certified for utility revenue billing", "Mechanical impeller wears over time and introduces pressure drop", "Minimum threshold (~1 L/min) misses very slow drip leaks"],
      verificationStatus: "estimated",
      sourceUrl: URLS.yfs201,
      sourceTitle: "Seeed Studio YF-S201 Water Flow Sensor Reference",
      specs: [
        { key: "range", minValue: 1, typValue: null, maxValue: 30, unit: "L/min", conditions: "Clean water without suspended grit", verificationStatus: "estimated", source: URLS.yfs201 },
        { key: "accuracy", minValue: -10, typValue: null, maxValue: 10, unit: "%", conditions: "Typical uncalibrated tolerance across 1..30 L/min", verificationStatus: "estimated", source: URLS.yfs201 },
        { key: "supply_voltage", minValue: 5.0, typValue: 5.0, maxValue: 18.0, unit: "V", conditions: "4.5 V min tested; pull-up output to MCU VDD", verificationStatus: "estimated", source: URLS.yfs201 },
        { key: "operating_current", minValue: null, typValue: null, maxValue: 15, unit: "mA", conditions: "5 V supply", verificationStatus: "estimated", source: URLS.yfs201 },
        { key: "max_pressure", minValue: null, typValue: null, maxValue: 1.75, unit: "MPa", conditions: "Water line hydrostatic limit", verificationStatus: "estimated", source: URLS.yfs201 },
      ],
    },
  ];
}

export function demoCatalogueMcus(): CatalogueMcu[] {
  return [
    {
      id: "demo-mcu-esp32",
      slug: "esp32-wroom-32",
      name: "Espressif ESP32-WROOM-32",
      vendor: "Espressif Systems",
      architecture: "Xtensa LX6 (32-bit)",
      cpu: "Dual-core Xtensa 32-bit LX6",
      maxClockMhz: 240,
      flashKb: 4096,
      ramKb: 520,
      gpioCount: 34,
      wireless: ["Wi-Fi 802.11 b/g/n", "Bluetooth 4.2 BR/EDR", "BLE"],
      devTools: ["ESP-IDF", "PlatformIO", "Arduino IDE"],
      languages: ["C", "C++", "MicroPython"],
      applications: ["Wi-Fi/BLE IoT nodes", "Smart meters & telemetry gateways", "Edge audio & sensor hubs"],
      verificationStatus: "typical",
      sourceUrl: URLS.esp32Wroom,
      sourceTitle: "Espressif ESP32-WROOM-32 Datasheet",
      adc: { channels: 18, bits: 12 },
      dac: { channels: 2, bits: 8 },
      peripherals: { uart: 3, spi: 4, i2c: 2, i2s: 2, can_twai: 1, pwm_channels: 16 },
      power: {
        activeMa: 160,
        deepSleepUa: 10,
        supplyVoltageMin: 3.0,
        supplyVoltageMax: 3.6,
        verificationStatus: "typical",
        source: URLS.esp32Wroom,
      },
    },
    {
      id: "demo-mcu-uno-r3",
      slug: "arduino-uno-r3",
      name: "Arduino Uno R3 (ATmega328P)",
      vendor: "Arduino / Microchip",
      architecture: "8-bit AVR RISC",
      cpu: "Microchip ATmega328P",
      maxClockMhz: 16,
      flashKb: 32,
      ramKb: 2,
      gpioCount: 20,
      wireless: [],
      devTools: ["Arduino IDE", "PlatformIO", "Microchip Studio"],
      languages: ["C", "C++ (Arduino)"],
      applications: ["Electronics learning & labs", "Simple 5 V sensor/actuator rigs", "Benchtop test jigs"],
      verificationStatus: "typical",
      sourceUrl: URLS.arduinoUno,
      sourceTitle: "Arduino Uno R3 & Microchip ATmega328P Documentation",
      adc: { channels: 6, bits: 10 },
      dac: null,
      peripherals: { uart: 1, spi: 1, i2c: 1, pwm_channels: 6 },
      power: {
        activeMa: 45,
        deepSleepUa: null,
        supplyVoltageMin: 5.0,
        supplyVoltageMax: 5.0,
        verificationStatus: "estimated",
        source: URLS.atmega328p,
      },
    },
    {
      id: "demo-mcu-stm32f103",
      slug: "stm32f103c8",
      name: "STMicroelectronics STM32F103C8 (Blue Pill MCU)",
      vendor: "STMicroelectronics",
      architecture: "ARM Cortex-M3 (32-bit)",
      cpu: "ARM 32-bit Cortex-M3",
      maxClockMhz: 72,
      flashKb: 64,
      ramKb: 20,
      gpioCount: 37,
      wireless: [],
      devTools: ["STM32CubeIDE", "PlatformIO", "OpenOCD"],
      languages: ["C", "C++", "Rust"],
      applications: ["Motor control & timers", "CAN/RS-485 industrial bridges", "Deterministic real-time control"],
      verificationStatus: "typical",
      sourceUrl: URLS.stm32f103c8,
      sourceTitle: "STMicroelectronics STM32F103C8 Medium-Density Datasheet",
      adc: { channels: 10, bits: 12 },
      dac: null,
      peripherals: { uart: 3, spi: 2, i2c: 2, can: 1, usb: "Full-Speed 2.0" },
      power: {
        activeMa: 36,
        deepSleepUa: 2,
        supplyVoltageMin: 2.0,
        supplyVoltageMax: 3.6,
        verificationStatus: "typical",
        source: URLS.stm32f103c8,
      },
    },
    {
      id: "demo-mcu-pico",
      slug: "raspberry-pi-pico",
      name: "Raspberry Pi Pico (RP2040)",
      vendor: "Raspberry Pi",
      architecture: "ARM Cortex-M0+ (32-bit)",
      cpu: "Dual-core ARM Cortex-M0+",
      maxClockMhz: 133,
      flashKb: 2048,
      ramKb: 264,
      gpioCount: 26,
      wireless: [],
      devTools: ["Pico SDK (CMake)", "PlatformIO", "Thonny", "VS Code"],
      languages: ["C", "C++", "MicroPython", "CircuitPython"],
      applications: ["Custom PIO timing protocols", "USB HID/CDC instruments", "Robotics peripheral controllers"],
      verificationStatus: "typical",
      sourceUrl: URLS.rpiPico,
      sourceTitle: "Raspberry Pi Pico & RP2040 Datasheets",
      adc: { channels: 3, bits: 12 },
      dac: null,
      peripherals: { uart: 2, spi: 2, i2c: 2, pio_state_machines: 8, usb: "1.1 Host/Device" },
      power: {
        activeMa: 25,
        deepSleepUa: 800,
        supplyVoltageMin: 1.8,
        supplyVoltageMax: 5.5,
        verificationStatus: "typical",
        source: URLS.rp2040,
      },
    },
    {
      id: "demo-mcu-nrf52840",
      slug: "nrf52840",
      name: "Nordic Semiconductor nRF52840",
      vendor: "Nordic Semiconductor",
      architecture: "ARM Cortex-M4F (32-bit)",
      cpu: "ARM Cortex-M4 with FPU",
      maxClockMhz: 64,
      flashKb: 1024,
      ramKb: 256,
      gpioCount: 48,
      wireless: ["BLE 5.3", "Thread", "Zigbee", "802.15.4", "NFC-A"],
      devTools: ["nRF Connect SDK (Zephyr)", "SEGGER J-Link", "PlatformIO"],
      languages: ["C", "C++", "Rust", "CircuitPython"],
      applications: ["Coin-cell BLE wearables", "Thread/Matter mesh nodes", "Ultra-low-power field sensors"],
      verificationStatus: "typical",
      sourceUrl: URLS.nrf52840,
      sourceTitle: "Nordic Semiconductor nRF52840 Product Specification",
      adc: { channels: 8, bits: 12 },
      dac: null,
      peripherals: { uart: 2, spi: 4, i2c: 2, qspi: 1, usb: "Full-Speed 2.0", nfc: 1 },
      power: {
        activeMa: 5,
        deepSleepUa: 1.5,
        supplyVoltageMin: 1.7,
        supplyVoltageMax: 5.5,
        verificationStatus: "typical",
        source: URLS.nrf52840,
      },
    },
  ];
}

import {
  demoCatalogueCommunication,
  demoCatalogueAntennas,
  demoSpectrumRegulations,
} from "./demo-phase3";

export {
  demoCatalogueCommunication,
  demoCatalogueAntennas,
  demoSpectrumRegulations,
};

export function demoStats(): Stat[] {
  const v: Record<string, number> = {
    components: demoCatalogueComponents().length,
    sensors: demoCatalogueSensors().length,
    microcontrollers: demoCatalogueMcus().length,
    communication_modules: demoCatalogueCommunication().length,
    antenna_types: demoCatalogueAntennas().length,
    iot_projects: 3,
    robotics_projects: 1,
    saved_configurations: 5,
    completed_experiments: 4,
  };
  return STAT_LABELS.map(({ key, label }) =>
    key === "learning_progress"
      ? { key, label, value: 18, display: "18 / 365", hint: "days completed" }
      : { key, label, value: v[key] ?? 0 },
  );
}

export function demoRecentComponents(): ComponentSummary[] {
  return demoCatalogueComponents()
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      partNumber: c.partNumber,
      category: c.category,
    }));
}

export function demoProjects(now = new Date()): ProjectSummary[] {
  return [
    { id: "demo-p1", name: "Smart Water Meter (4G)", kind: "iot", industry: "water", status: "design", updatedAt: hoursAgo(3, now) },
    { id: "demo-p2", name: "Motor Vibration Monitor", kind: "iot", industry: "industrial", status: "research", updatedAt: hoursAgo(28, now) },
    { id: "demo-p3", name: "Soil Moisture Node (LoRaWAN)", kind: "iot", industry: "agriculture", status: "planning", updatedAt: hoursAgo(75, now) },
    { id: "demo-p4", name: "Differential-drive Rover", kind: "robotics", industry: null, status: "development", updatedAt: hoursAgo(130, now) },
  ];
}

export function demoConfigurations(): ConfigurationSummary[] {
  return [
    { id: "c1", name: "Config A — Cat 1 modem", selected: true, scores: { cost: 3, power: 3, performance: 4, compatibility: 5, scalability: 4 } },
    { id: "c2", name: "Config B — LTE-M / NB-IoT", selected: false, scores: { cost: 3, power: 5, performance: 3, compatibility: 4, scalability: 5 } },
    { id: "c3", name: "Config C — LoRaWAN", selected: false, scores: { cost: 4, power: 5, performance: 2, compatibility: 4, scalability: 3 } },
    { id: "c4", name: "Config D — Cat 4 modem", selected: false, scores: { cost: 2, power: 2, performance: 5, compatibility: 4, scalability: 4 } },
    { id: "c5", name: "Config E — Wi-Fi bridge", selected: false, scores: { cost: 5, power: 2, performance: 4, compatibility: 3, scalability: 2 } },
  ];
}

export function demoTasks(): TaskSummary[] {
  return [
    { id: "t1", title: "Study: Ohm's law and power dissipation", status: "completed", dueTime: "07:30" },
    { id: "t2", title: "Exercise: measure a resistor divider with a multimeter", status: "pending", dueTime: "18:00" },
    { id: "t3", title: "Quiz: resistor colour codes", status: "pending", dueTime: "21:00" },
  ];
}

export function demoTaskDates(now = new Date()): string[] {
  const y = now.getFullYear();
  const m = now.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  const days = [2, 3, 5, 8, 9, 12, 15, 16, 19, 22, 23, 26, now.getDate()].filter((d) => d <= last);
  return [...new Set(days)].map((d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
}

export function demoDesigns(now = new Date()): DesignSummary[] {
  return [
    { id: "d1", name: "Water meter — block diagram", type: "diagram", updatedAt: hoursAgo(5, now) },
    { id: "d2", name: "Sensor-to-cloud architecture", type: "architecture", updatedAt: hoursAgo(50, now) },
    { id: "d3", name: "Config A shortlist", type: "configuration", updatedAt: hoursAgo(96, now) },
  ];
}

/** Synthetic household-style flow profile (morning and evening peaks). Not a measurement. */
export function demoTelemetry(now = new Date()): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  for (let i = 47; i >= 0; i--) {
    const t = new Date(start.getTime() - i * 30 * 60_000);
    const h = t.getHours() + t.getMinutes() / 60;
    const peak = (c: number, w: number, a: number) => a * Math.exp(-((h - c) ** 2) / (2 * w * w));
    const value = 0.2 + peak(7.5, 1.1, 9) + peak(13, 0.8, 3) + peak(20, 1.4, 6.5) + 0.4 * Math.sin(i * 1.7);
    points.push({ t: t.toISOString(), value: Math.max(0, Number(value.toFixed(2))) });
  }
  return points;
}

export function demoNotifications(now = new Date()): NotificationSummary[] {
  return [
    { id: "n1", title: "Daily lesson ready", body: "Day 19 — Capacitors: charge, discharge and time constants.", createdAt: hoursAgo(1, now), read: false },
    { id: "n2", title: "Phase 1 foundation deployed", body: "Dashboard, navigation and authentication are available.", createdAt: hoursAgo(20, now), read: true },
  ];
}

export const DEMO_VIEWER: Viewer = { mode: "demo", id: null, name: "Demo Engineer", email: null, initials: "DE" };

export function demoDashboard(now = new Date()): DashboardData {
  return {
    mode: "demo",
    errors: [],
    stats: demoStats(),
    recentProjects: demoProjects(now),
    configurations: demoConfigurations(),
    configurationsProject: "Smart Water Meter (4G)",
    tasksToday: demoTasks(),
    taskDates: demoTaskDates(now),
    recentComponents: demoRecentComponents(),
    savedDesigns: demoDesigns(now),
    telemetry: { metric: "Flow rate", unit: "L/min", points: demoTelemetry(now), source: "demo" },
  };
}
