export type ViolationCategory =
  | "hand_hygiene"
  | "ppe"
  | "sterilization"
  | "none";

export const CATEGORY_LABELS: Record<ViolationCategory, string> = {
  hand_hygiene: "Hand Hygiene",
  ppe: "PPE",
  sterilization: "Sterilization / Disinfection",
  none: "No Violation",
};

export type HotspotKind =
  | "nurse"
  | "doctor"
  | "patient"
  | "sink"
  | "ppe_bin"
  | "cart"
  | "bedrail"
  | "callbutton"
  | "tray";

// One concrete scenario that can appear at a slot in a given round.
export interface HotspotVariant {
  variantId: string;
  scene: string;
  category: ViolationCategory;
  correctAnswer: string;
  explanation: string;
  // Optional override for the slot's display label (kept short).
  labelOverride?: string;
}

// A fixed prop position in the level. The same slot can host many different
// scenarios across rounds (one variant chosen per round at random).
export interface HotspotSlot {
  slotId: string;
  kind: HotspotKind;
  position: [number, number, number];
  label: string;
  variants: HotspotVariant[];
}

// A "live" hotspot for the current round — produced by sampling a variant
// for a chosen slot. This is the unit that the rest of the game (HUD,
// Player, Hotspots, Summary) consumes.
export interface Hotspot {
  id: string; // slot id (stable across rounds for answered/dedup keys)
  variantId: string;
  kind: HotspotKind;
  position: [number, number, number];
  label: string;
  scene: string;
  category: ViolationCategory;
  explanation: string;
  correctAnswer: string;
}

export type LevelId = "medsurg" | "icu" | "or" | "ed";

export interface LevelLayout {
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  walls: [number, number, number, number][];
  startPosition: [number, number, number];
  floorColor: string;
  accentColor: string;
}

export interface Level {
  id: LevelId;
  label: string;
  shortLabel: string;
  blurb: string;
  slots: HotspotSlot[];
  layout: LevelLayout;
}

// How many hotspots are activated per round. If a level has fewer slots
// than this, we just use them all.
export const HOTSPOTS_PER_ROUND = 10;

// ─────────────────────────────────────────────────────────────
// LEVEL 1: MED-SURG
// ─────────────────────────────────────────────────────────────
const MEDSURG_SLOTS: HotspotSlot[] = [
  {
    slotId: "ms-lobby-nurse",
    kind: "nurse",
    position: [-4, 0, -3],
    label: "Triage Nurse (Lobby)",
    variants: [
      {
        variantId: "ms-lobby-nurse-skip-hh",
        scene:
          "The triage nurse just finished checking in a coughing patient and is now reaching for a clipboard to greet a new arrival. She has not visited the wall sink between the two encounters.",
        category: "hand_hygiene",
        correctAnswer: "Hand Hygiene",
        explanation:
          "Hand hygiene must be performed between every patient encounter (WHO 'Moment 4: After touching a patient'). Skipping the sink or alcohol rub between two patients is one of the most common — and most preventable — drivers of healthcare-associated infections.",
      },
      {
        variantId: "ms-lobby-nurse-no-mask",
        scene:
          "The triage nurse is screening a patient who is openly coughing and reports a fever. She is gowned but is not wearing a surgical mask, and the patient hasn't been offered one either.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Symptomatic respiratory patients require source control (mask the patient) AND staff respiratory PPE. Triage of febrile, coughing patients without a mask exposes the nurse and everyone else in the lobby — this is a textbook respiratory hygiene gap.",
      },
      {
        variantId: "ms-lobby-nurse-clean",
        scene:
          "The triage nurse just finished with a patient, walked to the wall-mounted alcohol rub, performed a full 20-second rub, and is now greeting the next arrival with clean hands and a fresh clipboard.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Visible, complete alcohol-based hand rub between patients is exactly WHO Moments 4 → 1 done right. Reinforce this with the team rather than flag it.",
      },
    ],
  },
  {
    slotId: "ms-lobby-receptionist",
    kind: "doctor",
    position: [4, 0, -3],
    label: "Receptionist",
    variants: [
      {
        variantId: "ms-lobby-receptionist-clean",
        scene:
          "The receptionist is sitting behind a glass partition, processing paperwork. No patient contact, no procedures, standard street clothes.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Administrative staff in clean, low-risk zones with no patient contact do not require PPE. Flagging this as a violation would be over-calling — part of being an effective IP specialist is calibrating what is and isn't actually a risk.",
      },
      {
        variantId: "ms-lobby-receptionist-eating",
        scene:
          "The receptionist has a half-eaten sandwich on the workstation desk, sitting directly on top of a stack of patient intake forms and next to the shared sign-in pen.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Food at a reception desk that hosts shared patient items (pens, forms, clipboards) creates a contamination reservoir. Most facility IP policy prohibits food at any clinical-adjacent workstation, including reception.",
      },
    ],
  },
  {
    slotId: "ms-hall-cart",
    kind: "cart",
    position: [0, 0, 6],
    label: "Equipment Cart in Hallway",
    variants: [
      {
        variantId: "ms-hall-cart-soiled",
        scene:
          "A mobile equipment cart sits in the corridor. A blood pressure cuff and stethoscope rest on it. The cuff is visibly soiled and there is no log indicating it was disinfected after the last patient.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Shared, non-critical patient equipment (BP cuffs, stethoscopes, pulse oximeters) must be disinfected between patients with an EPA-registered hospital disinfectant. Visibly soiled equipment in a shared area is a textbook cross-contamination route.",
      },
      {
        variantId: "ms-hall-cart-clean",
        scene:
          "The shared equipment cart is clean, the BP cuff and pulse ox sit in labeled bins, and a between-patient disinfection log on the side has been initialed for every patient encounter today.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Documented between-patient disinfection of shared equipment, plus organized storage, is the IP-correct pattern. Acknowledge this rather than flag it.",
      },
    ],
  },
  {
    slotId: "ms-hall-doctor",
    kind: "doctor",
    position: [-3, 0, 10],
    label: "Physician Walking the Hall",
    variants: [
      {
        variantId: "ms-hall-doctor-clean",
        scene:
          "A physician walks down the hall wearing a clean white coat, carrying a tablet. They are heading toward the nurse station and have not had patient contact.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Walking through a clean corridor without active patient contact does not by itself violate IP standards. Watch for what the staff member does next, not what they're wearing in transit.",
      },
      {
        variantId: "ms-hall-doctor-skipped-rub",
        scene:
          "A physician just exited a patient room — you can see the door swinging shut behind him — and walked straight past the wall-mounted alcohol rub dispenser without using it, heading for the workstation.",
        category: "hand_hygiene",
        correctAnswer: "Hand Hygiene",
        explanation:
          "WHO Moment 4 (after touching a patient) and Moment 5 (after touching patient surroundings) require hand hygiene at the threshold. Walking from a patient room straight to a shared keyboard without hand hygiene is one of the highest-yield contamination paths to flag.",
      },
      {
        variantId: "ms-hall-doctor-coat",
        scene:
          "A physician is walking the hall in a white coat with sleeves visibly stained at the cuffs. He's about to enter the next patient's room without changing.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Visibly soiled garments crossing into a patient room are a contact-precautions failure. White coats with stained cuffs should be changed; the cuffs are exactly the contact zone with patients during exams.",
      },
    ],
  },
  {
    slotId: "ms-room1-bedrail",
    kind: "bedrail",
    position: [-9, 0, 4],
    label: "Patient Room 1 — Bedrails",
    variants: [
      {
        variantId: "ms-room1-bedrail-dusty",
        scene:
          "The room was just turned over after a discharge. Floors and linens are clean, but the bedrails, overbed table edges, and the call button are dusty and clearly were not wiped down during terminal cleaning.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "High-touch surfaces — bedrails, call buttons, bed controls, overbed tables, doorknobs — are the highest-yield targets for terminal cleaning. Skipping them after a discharge leaves a contaminated reservoir for the next patient.",
      },
      {
        variantId: "ms-room1-bedrail-clean",
        scene:
          "Room 1 was just terminal-cleaned. Bedrails, call button and overbed table all show fresh disinfection wipe marks and the EVS turnover checklist is initialed and dated 30 minutes ago.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Visible recent disinfection of every high-touch surface plus a signed turnover checklist is exactly what terminal cleaning should look like. Recognize good EVS work — it makes the rest of the unit safer.",
      },
    ],
  },
  {
    slotId: "ms-room1-nurse",
    kind: "nurse",
    position: [-7, 0, 6],
    label: "Nurse in Patient Room 1",
    variants: [
      {
        variantId: "ms-room1-nurse-reused-gown",
        scene:
          "A nurse is reusing a yellow disposable isolation gown that was hung on the back of the door from an earlier shift. She's adjusting it now to enter and check vitals on a patient on contact precautions.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Disposable isolation gowns are single-use. They must be doffed and discarded immediately after leaving the patient's room and never re-donned. Re-using a hung gown defeats the entire purpose of contact precautions.",
      },
      {
        variantId: "ms-room1-nurse-glove-no-hh",
        scene:
          "A nurse is about to start an IV. She pulled gloves directly out of the box and is donning them without performing any hand hygiene first — straight from the workstation keyboard to gloves.",
        category: "hand_hygiene",
        correctAnswer: "Hand Hygiene",
        explanation:
          "Hand hygiene is required BEFORE donning gloves (WHO Moment 2: Before clean/aseptic procedure). Contamination on the hands transfers to the outside of the glove during donning — gloves are not a substitute for hand hygiene.",
      },
    ],
  },
  {
    slotId: "ms-room2-doctor",
    kind: "doctor",
    position: [9, 0, 4],
    label: "Physician in Patient Room 2",
    variants: [
      {
        variantId: "ms-room2-doctor-doff-order",
        scene:
          "The doctor is doffing PPE after seeing a patient on droplet precautions. They are pulling the N95 off first while still wearing the contaminated gown and gloves, then peeling gloves last.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Correct doffing sequence (CDC) is gloves → goggles/face shield → gown → mask/respirator, performed at the threshold of the room with hand hygiene between steps. Removing the respirator first contaminates the face and hair with whatever is on the gown and gloves.",
      },
      {
        variantId: "ms-room2-doctor-clean",
        scene:
          "The doctor is at the doorway doffing PPE in correct order — gloves first into the bin, hand hygiene, then gown, hand hygiene, then mask by the straps — and is now stepping out clean.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Textbook CDC doffing sequence with hand hygiene between steps. This is the reference behavior IP teams should be coaching toward — flagging this would be over-calling.",
      },
    ],
  },
  {
    slotId: "ms-room2-patient",
    kind: "patient",
    position: [7, 0, 6],
    label: "Patient in Bed 2",
    variants: [
      {
        variantId: "ms-room2-patient-stable",
        scene:
          "Patient is resting in bed, IV running normally, monitor leads attached correctly. Linens are clean, hand sanitizer is mounted at the door.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "A stable patient in a clean room with proper equipment is not itself a violation. Resist the urge to flag every interactable — over-calling erodes credibility with frontline staff.",
      },
      {
        variantId: "ms-room2-patient-foley",
        scene:
          "The patient has an indwelling urinary catheter. The drainage bag is sitting on the floor next to the bed and the tubing is looped above the level of the bladder.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "CAUTI bundle: drainage bag must stay below bladder level and never touch the floor; tubing must drain by gravity without dependent loops. Bag-on-the-floor is both a contamination route and a backflow risk for catheter-associated UTI.",
      },
    ],
  },
  {
    slotId: "ms-station-sink",
    kind: "sink",
    position: [0, 0, 14],
    label: "Nurse Station Sink",
    variants: [
      {
        variantId: "ms-station-sink-empty-rub",
        scene:
          "The hand-wash sink at the nurse station has soap and paper towels, but the alcohol-based hand rub dispenser next to it is empty and a 'tech notified' sticker has been there for three days.",
        category: "hand_hygiene",
        correctAnswer: "Hand Hygiene",
        explanation:
          "Hand hygiene infrastructure is part of hand hygiene compliance. An empty alcohol-rub dispenser at a high-traffic station drops compliance dramatically — staff will skip the rub rather than walk to a sink. Refill schedules and dispenser audits are an IP responsibility.",
      },
      {
        variantId: "ms-station-sink-stocked",
        scene:
          "The nurse station sink is fully stocked: soap dispenser full, paper towels full, alcohol rub dispenser full with a recent audit sticker, and a hand-hygiene poster mounted above eye level.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Fully stocked, well-signed hand hygiene infrastructure is the substrate that makes compliance possible. Recognize and reinforce — this is what an audit-ready station looks like.",
      },
    ],
  },
  {
    slotId: "ms-supply-ppebin",
    kind: "ppe_bin",
    position: [12, 0, 10],
    label: "Supply Closet — PPE Bin",
    variants: [
      {
        variantId: "ms-supply-ppebin-mixed",
        scene:
          "The PPE bin in the supply closet is stocked with gowns and gloves, but the surgical masks are mixed into the same open bin as a stack of N95 respirators, and several N95s have been opened from their packaging and left loose.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Respirators (N95) and surgical masks are not interchangeable and must be stored separately so staff grab the right one for the task. Loose, unpackaged N95s are no longer guaranteed to provide a seal and should be discarded, not re-stocked.",
      },
      {
        variantId: "ms-supply-ppebin-organized",
        scene:
          "The PPE bin has labeled compartments — gowns, gloves by size, surgical masks, and N95s in their original sealed packaging on a separate shelf with the respirator program sign-off list posted.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Labeled, segregated PPE storage with respirators kept in original packaging plus a posted respiratory protection program is exactly correct. This is the kind of micro-organization IP teams should highlight as a model.",
      },
    ],
  },
  {
    slotId: "ms-supply-tray",
    kind: "tray",
    position: [10, 0, 12],
    label: "Supply Closet — Disinfectant Tray",
    variants: [
      {
        variantId: "ms-supply-tray-wrong-product",
        scene:
          "A spray bottle labeled 'glass cleaner' is being used to wipe down a procedure tray that just held a used speculum. The proper hospital disinfectant is on the next shelf over, untouched.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Glass cleaner is not a hospital-grade disinfectant. Semi-critical equipment surfaces require an EPA-registered disinfectant with the correct contact (wet) time. Wrong product = no disinfection, regardless of how clean the surface looks.",
      },
      {
        variantId: "ms-supply-tray-correct",
        scene:
          "The procedure tray is being wiped down with an EPA-registered hospital disinfectant wipe; the contact-time chart is taped to the shelf and a timer is running on the tray to ensure the surface stays wet for the full dwell.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Correct EPA-registered product with documented contact-time discipline is exactly the disinfection standard. Don't flag good practice — call it out as a model for the rest of the unit.",
      },
    ],
  },
  {
    slotId: "ms-hall-callbutton",
    kind: "callbutton",
    position: [3, 0, 10],
    label: "Hallway Call Button Panel",
    variants: [
      {
        variantId: "ms-hall-callbutton-clean",
        scene:
          "A wall-mounted call button panel outside Room 1 is functional and clean — it shows recent disinfection wipe marks and is on the EVS turnover checklist.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Documented, recent disinfection of a high-touch surface is exactly what you want to see. Recognizing good practice is as much a part of IP rounding as catching violations.",
      },
      {
        variantId: "ms-hall-callbutton-sticky",
        scene:
          "The call button panel outside Room 1 is sticky to the touch with visible fingerprints and dried liquid residue. There are no wipe marks and the panel is not on the EVS high-touch checklist.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "High-touch panels in the hallway are exactly the surfaces that need to be on the daily disinfection checklist. Visible residue means the panel is being missed — both an EVS process gap and an IP-mappable risk.",
      },
    ],
  },
];

const MEDSURG_LAYOUT: LevelLayout = {
  bounds: { minX: -13, maxX: 14, minZ: -7, maxZ: 17 },
  walls: [
    [-13, -0.2, -1, 0.2],
    [1, -0.2, 14, 0.2],
    [-6, 1, -5.8, 3.5],
    [-6, 6.5, -5.8, 9],
    [5.8, 1, 6, 3.5],
    [5.8, 6.5, 6, 9],
    [5.8, 9.5, 6, 9.7],
    [5.8, 12.3, 6, 14],
  ],
  startPosition: [0, 1.6, -5],
  floorColor: "#cfd8e3",
  accentColor: "#2563eb",
};

// ─────────────────────────────────────────────────────────────
// LEVEL 2: ICU
// ─────────────────────────────────────────────────────────────
const ICU_SLOTS: HotspotSlot[] = [
  {
    slotId: "icu-entry-sink",
    kind: "sink",
    position: [0, 0, -4],
    label: "ICU Entry Hand-Wash Sink",
    variants: [
      {
        variantId: "icu-entry-sink-clean",
        scene:
          "The entry sink to the ICU has hot/cold water, soap, paper towels, and a freshly stocked alcohol rub dispenser with a recent audit sticker. A hand-hygiene poster is mounted above.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "A fully stocked, well-signed entry hand-hygiene station is exactly what you want at the threshold of a critical care unit. Acknowledge good infrastructure — it's the substrate that makes compliance possible.",
      },
      {
        variantId: "icu-entry-sink-broken",
        scene:
          "The entry sink to the ICU has a 'water out of service' sign on the faucet, the alcohol rub dispenser next to it is empty, and there's no nearby alternative within sight.",
        category: "hand_hygiene",
        correctAnswer: "Hand Hygiene",
        explanation:
          "An out-of-service entry sink with no working alcohol rub dispenser at the threshold of an ICU is a critical hand hygiene infrastructure failure. Staff cannot comply with WHO Moment 1 (before patient contact) if there's no working option at the entry point.",
      },
    ],
  },
  {
    slotId: "icu-bay1-nurse",
    kind: "nurse",
    position: [-9, 0, 3],
    label: "ICU Bay 1 — Nurse Suctioning",
    variants: [
      {
        variantId: "icu-bay1-nurse-no-eyes",
        scene:
          "A nurse is performing open endotracheal suctioning on a ventilated patient. She's wearing gloves and a gown, but no eye protection or face shield, and no surgical mask.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Open suctioning of a ventilated airway is a high-risk aerosol-generating procedure. Full PPE is required: gown, gloves, fit-tested respirator (or surgical mask if not on airborne precautions), and eye protection. Splatter to mucous membranes is a documented exposure route.",
      },
      {
        variantId: "icu-bay1-nurse-full",
        scene:
          "The nurse is performing in-line suctioning with full PPE — gown, gloves, fit-tested N95, and a face shield. Closed-suction system is in use to minimize aerosols.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Full PPE plus closed in-line suction is the IP-correct approach to an aerosol-generating procedure. Reinforce this practice as the standard rather than flag.",
      },
    ],
  },
  {
    slotId: "icu-bay1-bedrail",
    kind: "bedrail",
    position: [-7, 0, 3],
    label: "ICU Bay 1 — Bed & Vent Surfaces",
    variants: [
      {
        variantId: "icu-bay1-bedrail-clean",
        scene:
          "Bed surfaces, vent control panel, and IV pump touchscreen all show fresh disinfection wipe marks. The room turnover log confirms terminal cleaning was completed two hours ago.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Documented, visible disinfection of high-touch ICU surfaces — including ventilator panels and IV pumps — is the standard. Reinforce this practice with the team rather than flagging it.",
      },
      {
        variantId: "icu-bay1-bedrail-skipped",
        scene:
          "Bay 1 was just turned over for a new admission. The bed and IV pump have been wiped, but the vent control panel and the touchscreen on the patient monitor are still smudged and dusty — clearly missed during turnover.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "ICU terminal cleaning has to include EVERY high-touch electronic — vent panels and monitor touchscreens are repeatedly handled and easily missed. Partial turnover is an IP-mappable gap; the bay is not actually 'ready.'",
      },
    ],
  },
  {
    slotId: "icu-bay2-doctor",
    kind: "doctor",
    position: [9, 0, 3],
    label: "ICU Bay 2 — Intensivist at Bedside",
    variants: [
      {
        variantId: "icu-bay2-doctor-skipped-hh",
        scene:
          "The intensivist examined the patient, then walked directly to the workstation-on-wheels and started typing notes — no glove removal, no hand hygiene between the patient and the keyboard.",
        category: "hand_hygiene",
        correctAnswer: "Hand Hygiene",
        explanation:
          "Hand hygiene is required before touching the workstation after patient contact (WHO Moments 4 & 5). Shared keyboards become contaminated reservoirs. The 'patient zone → environment' transition is one of the most-missed hand-hygiene moments in the ICU.",
      },
      {
        variantId: "icu-bay2-doctor-tie",
        scene:
          "The intensivist is leaning over the patient to listen with a stethoscope. His necktie is dangling and brushing against the patient's chest dressing.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Loose ties and lanyards trail through patient zones and can contact wounds, dressings, and lines. 'Bare below the elbows' guidance and removal of dangling articles is standard during direct patient care.",
      },
    ],
  },
  {
    slotId: "icu-bay2-patient",
    kind: "patient",
    position: [7, 0, 3],
    label: "ICU Bay 2 — Patient on Vent",
    variants: [
      {
        variantId: "icu-bay2-patient-bundle",
        scene:
          "Sedated patient on a ventilator. Head of bed elevated 30°, ETT secure, oral care kit visible, in-line suction system in place.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Ventilator bundle elements (HOB ≥30°, oral care, secure tubing, in-line suction) are textbook VAP prevention. The patient is not a violation — the bundle is being followed.",
      },
      {
        variantId: "icu-bay2-patient-flat",
        scene:
          "The ventilated patient is lying flat — head of bed at 0°. The oral care kit is unopened on the side table and the suction canister is overflowing past the fill line.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "VAP bundle failures: HOB <30° increases aspiration risk, skipped oral care lets oropharyngeal flora colonize, and an overflowing suction canister can backflow into the airway. All three together are a serious bundle breakdown to flag.",
      },
    ],
  },
  {
    slotId: "icu-bay3-cart",
    kind: "cart",
    position: [-9, 0, 9],
    label: "ICU Bay 3 — Glucometer Cart",
    variants: [
      {
        variantId: "icu-bay3-cart-bloody",
        scene:
          "A shared point-of-care glucometer is on a cart between bays. The device is visibly speckled with dried blood and there is no disinfection log next to it.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Shared glucometers must be disinfected between every patient with an EPA-registered, manufacturer-approved wipe. Glucometer contamination has caused documented hepatitis B/C outbreaks in healthcare settings.",
      },
      {
        variantId: "icu-bay3-cart-logged",
        scene:
          "The shared glucometer is in a clean docking station with the manufacturer-approved disinfectant wipes mounted next to it; the between-patient disinfection log is current and signed for every check today.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Documented between-patient disinfection of the glucometer with the right product is the IP standard for shared point-of-care devices. Recognize this — it directly prevents bloodborne pathogen transmission.",
      },
    ],
  },
  {
    slotId: "icu-bay3-bedrail",
    kind: "bedrail",
    position: [-7, 0, 9],
    label: "ICU Bay 3 — CVC Dressing",
    variants: [
      {
        variantId: "icu-bay3-bedrail-clean",
        scene:
          "The central venous catheter dressing on this patient is intact, dated 48 hours ago (within the 7-day window for transparent dressings), and the insertion site is clean and dry.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "A clean, dated, intact transparent CLABSI dressing within its change interval is correct CLABSI bundle compliance. Well-dated dressings make IP rounds easier — not a violation.",
      },
      {
        variantId: "icu-bay3-bedrail-loose",
        scene:
          "The CVC dressing is undated, peeling at the edges, and the gauze underneath looks damp and discolored. The insertion site is partially visible through the loose film.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "CLABSI bundle failure: undated dressing means the change interval can't be tracked, and a loose/damp dressing has lost its sterile barrier. Both raise CLABSI risk significantly and trigger an immediate dressing change with full sterile technique.",
      },
    ],
  },
  {
    slotId: "icu-bay4-nurse",
    kind: "nurse",
    position: [9, 0, 9],
    label: "ICU Bay 4 — Nurse with Long Sleeves",
    variants: [
      {
        variantId: "icu-bay4-nurse-sleeves",
        scene:
          "A nurse is performing a dressing change. The cuffs of her long-sleeve undershirt are extending past her gloves and trailing into the sterile field.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Long sleeves under gloves can wick moisture, contaminate sterile fields, and prevent proper hand hygiene at the wrists. 'Bare below the elbows' is the standard during patient care and procedural tasks in many IP guidelines.",
      },
      {
        variantId: "icu-bay4-nurse-sterile",
        scene:
          "The nurse is performing a dressing change with sleeves rolled above the elbows, sterile gloves donned correctly, and a sterile field set up with the field margins respected.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Bare-below-the-elbows technique with proper sterile field discipline is exactly the procedural IP standard. Recognize and reinforce.",
      },
    ],
  },
  {
    slotId: "icu-station-doctor",
    kind: "doctor",
    position: [0, 0, 7],
    label: "Central Monitoring Station",
    variants: [
      {
        variantId: "icu-station-doctor-food",
        scene:
          "A physician is reviewing telemetry at the central station. He's eating a sandwich and has a coffee cup placed directly on the keyboard tray.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Food and drink at clinical workstations are prohibited under most facility IP policies and CMS guidance. Spills create persistent reservoirs in keyboards, and the practice undermines surface disinfection rounds.",
      },
      {
        variantId: "icu-station-doctor-clean",
        scene:
          "The physician at the central station is reviewing telemetry on a clean, food-free workstation, with disinfectant wipes mounted on the side and a posted 'wipe before sign-out' policy.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "A food-free workstation with co-located disinfectant wipes and a sign-out hygiene policy is exactly the workflow design IP teams want. Don't flag good practice.",
      },
    ],
  },
  {
    slotId: "icu-station-callbutton",
    kind: "callbutton",
    position: [-2, 0, 7],
    label: "Telemetry Touchscreen",
    variants: [
      {
        variantId: "icu-station-callbutton-clean",
        scene:
          "The shared telemetry touchscreen at the central station has a posted disinfection schedule on the side: 'wiped every shift change' with initials for the past three shifts.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "A documented, signed shift-change disinfection schedule for high-touch shared electronics is best practice. This is the kind of micro-process IP teams should highlight and replicate elsewhere.",
      },
      {
        variantId: "icu-station-callbutton-smudged",
        scene:
          "The telemetry touchscreen is heavily smudged and visibly soiled. The shift-change disinfection schedule on the side has not been initialed in over a week.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "A high-touch shared touchscreen with no recent disinfection sign-off and visible soil is an IP gap — and the missed sign-offs are a pattern, not a one-off. Re-establishing shift-change accountability is the corrective action.",
      },
    ],
  },
  {
    slotId: "icu-supply-ppebin",
    kind: "ppe_bin",
    position: [11, 0, -3],
    label: "Isolation Cart — Contact Precautions",
    variants: [
      {
        variantId: "icu-supply-ppebin-cdiff",
        scene:
          "The isolation cart outside the C. diff patient's bay has gowns and gloves, but only alcohol-based hand rub — no soap-and-water sign and no reminder that ABHR doesn't kill C. diff spores.",
        category: "hand_hygiene",
        correctAnswer: "Hand Hygiene",
        explanation:
          "Alcohol-based hand rub does NOT inactivate C. difficile spores. Contact precautions for C. diff specifically require soap-and-water hand washing. The cart should clearly direct staff to the sink, not the rub.",
      },
      {
        variantId: "icu-supply-ppebin-stocked",
        scene:
          "The isolation cart outside a contact-precautions bay is stocked with gowns, gloves in three sizes, and a clear precautions sign listing the required PPE and hand-hygiene method for the specific organism.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "A well-stocked isolation cart with organism-specific PPE and hand-hygiene guidance is exactly what you want at the door of a precautions room. Recognize good cart maintenance — it directly drives compliance.",
      },
    ],
  },
  {
    slotId: "icu-supply-tray",
    kind: "tray",
    position: [11, 0, 12],
    label: "Clean Supply Room — Linens",
    variants: [
      {
        variantId: "icu-supply-tray-clean",
        scene:
          "Clean linens are stored on covered shelves at least 8 inches above the floor, in a closed supply room. The shelves are dated and rotated.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Covered, off-floor, dated and rotated clean linen storage meets standard IP and CMS guidance. Don't flag well-organized clean storage just because it's a supply room.",
      },
      {
        variantId: "icu-supply-tray-floor",
        scene:
          "A bundle of clean linens is sitting directly on the supply room floor, with the door propped open. Nearby cardboard shipping boxes are stored on the same shelf as wrapped sterile supplies.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Clean supplies on the floor are no longer clean. Cardboard shipping containers shed particulate and may carry pests — they don't belong on the same shelves as sterile or clean stock. Door propped open also defeats environmental controls.",
      },
    ],
  },
];

const ICU_LAYOUT: LevelLayout = {
  bounds: { minX: -13, maxX: 14, minZ: -7, maxZ: 17 },
  walls: [
    [-13, -0.2, -1, 0.2],
    [1, -0.2, 14, 0.2],
    [-5.8, 1, -5.6, 5],
    [5.6, 1, 5.8, 5],
    [-13, 6.0, -3, 6.2],
    [3, 6.0, 14, 6.2],
    [-5.8, 7, -5.6, 11],
    [5.6, 7, 5.8, 11],
    [-13, 11.5, 9, 11.7],
    [11, 11.5, 14, 11.7],
  ],
  startPosition: [0, 1.6, -6],
  floorColor: "#dde6f0",
  accentColor: "#0ea5e9",
};

// ─────────────────────────────────────────────────────────────
// LEVEL 3: OR
// ─────────────────────────────────────────────────────────────
const OR_SLOTS: HotspotSlot[] = [
  {
    slotId: "or-scrub-sink",
    kind: "sink",
    position: [-9, 0, -3],
    label: "Scrub Sink Station",
    variants: [
      {
        variantId: "or-scrub-sink-clean",
        scene:
          "Surgical scrub sink with hands-free knee controls, antimicrobial soap dispenser full, sterile brushes stocked, posted scrub procedure clearly visible.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "A properly equipped scrub station with hands-free controls, antimicrobial soap, and posted procedure is exactly the infrastructure required for surgical hand antisepsis. Reinforce, don't flag.",
      },
      {
        variantId: "or-scrub-sink-empty",
        scene:
          "The scrub sink antimicrobial soap dispenser is empty, the brush holder is empty, and the knee-control on the right faucet is broken — staff have been turning the handle by hand.",
        category: "hand_hygiene",
        correctAnswer: "Hand Hygiene",
        explanation:
          "Surgical hand antisepsis depends on working infrastructure: antimicrobial soap, brushes (where indicated), and hands-free controls so the scrubbed hands aren't recontaminated. An empty/broken scrub station is a direct hand hygiene failure to escalate.",
      },
    ],
  },
  {
    slotId: "or-scrub-doctor",
    kind: "doctor",
    position: [-7, 0, -3],
    label: "Surgeon at Scrub Sink",
    variants: [
      {
        variantId: "or-scrub-doctor-rushed",
        scene:
          "A surgeon is scrubbing in. He scrubbed for about 30 seconds, rinsed quickly, and is now reaching for the OR door handle with bare wet hands before donning sterile gown and gloves.",
        category: "hand_hygiene",
        correctAnswer: "Hand Hygiene",
        explanation:
          "Surgical hand antisepsis requires a full timed scrub (typically 2–5 minutes per facility policy or per product IFU) and hands must be kept above the elbows after rinsing. Touching contaminated surfaces (like a door handle) before gowning re-contaminates the field.",
      },
      {
        variantId: "or-scrub-doctor-correct",
        scene:
          "The surgeon completed a full timed scrub, hands held above the elbows, walked through the OR door (pushed open by the circulator), and is being gowned and gloved by the scrub tech with sterile technique.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Full timed scrub + hands-above-elbows + hands-free door entry + gowning by the scrub tech is the textbook surgical antisepsis sequence. Recognize this as the model behavior.",
      },
    ],
  },
  {
    slotId: "or-corridor-cart",
    kind: "cart",
    position: [0, 0, -2],
    label: "Sub-Sterile Corridor Case Cart",
    variants: [
      {
        variantId: "or-corridor-cart-clean",
        scene:
          "A case cart is staged in the sub-sterile corridor with sterile-wrapped instrument trays. The wrappers are intact, integrity indicators are green, and the cart has a recent processing label from SPD.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Properly wrapped, indicator-verified, SPD-labeled instrument trays staged in a sub-sterile corridor are appropriate. The integrity of the wrap and the indicators are what matter — the location is fine.",
      },
      {
        variantId: "or-corridor-cart-wet",
        scene:
          "A case cart in the sub-sterile corridor has visible water droplets on top of the sterile wrap of one tray. The cart was just rolled in from the clean corridor where condensation formed.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Wet packs are considered contaminated — moisture wicks microorganisms through the sterile barrier. Any sterile-wrapped tray with visible moisture must be removed from the case cart and reprocessed.",
      },
    ],
  },
  {
    slotId: "or-corridor-nurse",
    kind: "nurse",
    position: [3, 0, -2],
    label: "Circulator in Corridor",
    variants: [
      {
        variantId: "or-corridor-nurse-mask-down",
        scene:
          "The circulating nurse is wearing her surgical mask pulled down around her neck while chatting in the corridor between cases. She's about to head back into OR 2 without changing it.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Masks are not lanyards. Once a mask is pulled below the chin, the inner surface is contaminated by neck/skin flora and oral secretions and must not be re-positioned over the face. Pull and replace, never pull and re-don.",
      },
      {
        variantId: "or-corridor-nurse-correct",
        scene:
          "The circulating nurse stepped into the corridor, removed her mask by the ear loops, dropped it in the bin, performed hand hygiene, and is now donning a fresh mask before re-entering the OR.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Discard-and-replace (with hand hygiene in between) is the correct mask handling between cases. This is the behavior IP teams should be coaching toward in OR traffic.",
      },
    ],
  },
  {
    slotId: "or1-patient",
    kind: "patient",
    position: [-9, 0, 6],
    label: "OR 1 — Patient on Table",
    variants: [
      {
        variantId: "or1-patient-bundle",
        scene:
          "Patient is positioned, prepped with chlorhexidine in concentric circles, and draped with sterile drapes that fully cover the field. Antibiotic prophylaxis was given 45 minutes ago per anesthesia record.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Correct chlorhexidine prep technique, full sterile draping, and timely (within 60 min) prophylactic antibiotics are core SSI prevention bundle elements being followed correctly.",
      },
      {
        variantId: "or1-patient-no-abx",
        scene:
          "Patient is prepped and draped, but the anesthesia record shows the prophylactic antibiotic was hung but not actually started — the IV bag is still spiked but clamped, and incision is in 2 minutes.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "SCIP/SSI bundle: prophylactic antibiotics must be infused and complete within 60 minutes prior to incision. Hung-but-not-running is a process failure that must be caught at time-out, not after closure.",
      },
    ],
  },
  {
    slotId: "or1-doctor",
    kind: "doctor",
    position: [-7, 0, 7],
    label: "OR 1 — Surgeon Mid-Case",
    variants: [
      {
        variantId: "or1-doctor-door-propped",
        scene:
          "The surgeon is operating with sterile gown and gloves, but the OR door has been propped open with a wedge to allow easier traffic in and out for supplies.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "OR doors must remain closed during procedures to maintain positive-pressure airflow that protects the sterile field. Propping doors disrupts laminar flow and is associated with increased SSI rates. Traffic in/out should also be minimized.",
      },
      {
        variantId: "or1-doctor-correct",
        scene:
          "The surgeon is operating with full sterile gown and gloves; the OR door is closed, traffic is minimized, and the circulator is documenting on the workstation outside the sterile field.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Closed doors, minimized traffic, and clear separation between sterile field and circulator documentation is the IP-correct OR pattern for protecting laminar airflow and the sterile field.",
      },
    ],
  },
  {
    slotId: "or1-tray",
    kind: "tray",
    position: [-5, 0, 7],
    label: "OR 1 — Back Table",
    variants: [
      {
        variantId: "or1-tray-tear",
        scene:
          "An instrument tray on the back table has a sterile wrap with a small visible tear at one corner. The scrub tech noticed it but is using the tray anyway.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Any breach in the sterile wrap — even a tiny tear or a wet spot — invalidates the sterility of the entire tray. The tray must be removed from the field and reprocessed. Sterility is binary: it's sterile or it isn't.",
      },
      {
        variantId: "or1-tray-clean",
        scene:
          "The back table tray was opened with intact wrap, both internal and external sterilization indicators have changed correctly, and the count was completed and documented before incision.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Verified intact wrap, validated chemical indicators, and a documented pre-incision count is exactly the sterile processing handoff IP wants to see at the back table.",
      },
    ],
  },
  {
    slotId: "or2-nurse",
    kind: "nurse",
    position: [9, 0, 6],
    label: "OR 2 — Anesthesia Provider",
    variants: [
      {
        variantId: "or2-nurse-syringe-reuse",
        scene:
          "The anesthesia provider drew up a propofol syringe and is reusing the same syringe (with a fresh needle) on the next patient because 'it's a new needle and there's still drug left.'",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "ONE needle, ONE syringe, ONE patient — always. Reusing syringes between patients (even with new needles) has caused multiple documented HBV/HCV outbreaks. This is a CDC-priority safe-injection-practices violation.",
      },
      {
        variantId: "or2-nurse-clean",
        scene:
          "The anesthesia provider is drawing up medication using a fresh syringe and needle from individually packaged single-use vials, with the medication preparation area separated from the patient zone.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "One-syringe-one-patient with single-use vials and a separated medication prep area is exactly the CDC safe-injection-practices standard. Reinforce this behavior across all providers.",
      },
    ],
  },
  {
    slotId: "or2-bedrail",
    kind: "bedrail",
    position: [7, 0, 7],
    label: "OR 2 — Anesthesia Workstation",
    variants: [
      {
        variantId: "or2-bedrail-clean",
        scene:
          "The anesthesia machine, monitors, and IV pole all show fresh disinfection wipe marks. Between-case turnover checklist is signed by both the circulator and the anesthesia tech.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Documented between-case disinfection of anesthesia surfaces — signed off by both nursing and anesthesia — is exactly the closed-loop process IP wants. Recognize and reinforce.",
      },
      {
        variantId: "or2-bedrail-skipped",
        scene:
          "The anesthesia workstation between cases shows the laryngoscope handle still on the surface uncleaned, blood on the BP cuff, and the keyboard has not been wiped. The room flip is happening in 5 minutes.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Anesthesia workstation surfaces — laryngoscope handles, BP cuffs, keyboards, IV pumps — are repeatedly missed in fast room flips. Skipping them is a documented driver of OR-related cross-contamination and an IP-mappable gap.",
      },
    ],
  },
  {
    slotId: "or-supply-ppebin",
    kind: "ppe_bin",
    position: [11, 0, 11],
    label: "Sterile Storage Room Entry",
    variants: [
      {
        variantId: "or-supply-ppebin-pressure",
        scene:
          "Sterile supplies are stored in a room that shares a vent with the soiled utility room next door. There's no documented positive-pressure differential and the door is propped open.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Sterile storage must be a positive-pressure room, separated from soiled utility (which must be negative-pressure). Propping the door and unverified pressure differentials risk contaminating sterile inventory with airflow from dirty areas.",
      },
      {
        variantId: "or-supply-ppebin-correct",
        scene:
          "Sterile storage is closed, the door has a 'positive pressure verified' sticker dated this month, and the wall-mounted differential gauge reads within range. Stock is on dated, rotated wire shelving.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Verified positive-pressure differential with documentation, closed door, and rotated wire shelving is exactly the AORN/AAMI standard for sterile storage. Recognize this — it's the kind of micro-control that prevents large-scale recalls.",
      },
    ],
  },
  {
    slotId: "or-supply-tray",
    kind: "tray",
    position: [9, 0, 11],
    label: "Soiled Utility Room",
    variants: [
      {
        variantId: "or-supply-tray-dry",
        scene:
          "Used instruments are sitting uncovered, dry, on a counter in the soiled utility room. The pre-treatment enzymatic spray is on the shelf but hasn't been applied; the SPD pickup is in 90 minutes.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Soiled instruments must be kept moist (enzymatic spray, gel, or covered with a damp towel) immediately after use. Dried bioburden is dramatically harder to remove and reduces the effectiveness of downstream sterilization. Point-of-use treatment is an SPD prerequisite.",
      },
      {
        variantId: "or-supply-tray-treated",
        scene:
          "Used instruments are in a closed transport container that's been pre-treated with enzymatic spray and labeled with the pickup time. The soiled utility room door is closed and the negative-pressure indicator is green.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Point-of-use enzymatic treatment, closed transport with labeling, and verified negative pressure in the soiled utility room is the IP-correct handoff to SPD. Recognize this — it directly improves downstream sterilization outcomes.",
      },
    ],
  },
  {
    slotId: "or-corridor-callbutton",
    kind: "callbutton",
    position: [3, 0, 11],
    label: "OR Suite Temperature/Humidity Log",
    variants: [
      {
        variantId: "or-corridor-callbutton-clean",
        scene:
          "A wall-mounted log shows OR suite temperature (68–73°F) and humidity (30–60%) recorded twice daily for the past month, with no out-of-range entries.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Maintaining OR temperature and humidity within the AAMI/ASHRAE recommended ranges and documenting it is a core environmental IP control. Consistent logs are evidence of a working program.",
      },
      {
        variantId: "or-corridor-callbutton-gaps",
        scene:
          "The OR suite temperature/humidity log has multiple blank days over the past two weeks, and three of the recorded humidity readings were above 65% with no corrective action documented.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Out-of-range humidity readings without documented response are an environmental IP gap — high humidity in the OR risks microbial growth on stored sterile supplies. Missed log days indicate the monitoring process itself isn't reliable.",
      },
    ],
  },
];

const OR_LAYOUT: LevelLayout = {
  bounds: { minX: -13, maxX: 14, minZ: -7, maxZ: 17 },
  walls: [
    [-5.8, 2, -5.6, 5],
    [-5.8, 7, -5.6, 10],
    [-13, 1.8, -5.6, 2],
    [-13, 10, -5.6, 10.2],
    [5.6, 2, 5.8, 5],
    [5.6, 7, 5.8, 10],
    [5.6, 1.8, 13, 2],
    [5.6, 10, 13, 10.2],
    [-13, 11.7, 1, 11.9],
    [3, 11.7, 8, 11.9],
    [10, 11.7, 14, 11.9],
    [9.8, 11.9, 10, 17],
  ],
  startPosition: [0, 1.6, -6],
  floorColor: "#e2e8d8",
  accentColor: "#16a34a",
};

// ─────────────────────────────────────────────────────────────
// LEVEL 4: ED
// ─────────────────────────────────────────────────────────────
const ED_SLOTS: HotspotSlot[] = [
  {
    slotId: "ed-triage-nurse",
    kind: "nurse",
    position: [-4, 0, -4],
    label: "Triage — Intake Nurse",
    variants: [
      {
        variantId: "ed-triage-nurse-clean",
        scene:
          "The triage nurse is screening a patient who reports fever, productive cough, and recent travel. She's wearing a surgical mask and putting one on the patient. A respiratory pathway sign is posted.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Source control (masking the patient), staff masking, and following the respiratory illness screening pathway at triage is the model approach for ED respiratory triage. Don't flag good practice.",
      },
      {
        variantId: "ed-triage-nurse-no-mask",
        scene:
          "The triage nurse is screening a patient with cough and fever, leaning in close to take a blood pressure reading. Neither the nurse nor the patient is masked, and no respiratory pathway has been initiated.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Failing to mask BOTH the symptomatic patient and the staff during triage of a respiratory illness is a textbook respiratory hygiene gap. The triage nurse is the first line of defense for unit-level outbreak prevention.",
      },
    ],
  },
  {
    slotId: "ed-triage-patient",
    kind: "patient",
    position: [4, 0, -4],
    label: "Waiting Area — Coughing Patient",
    variants: [
      {
        variantId: "ed-triage-patient-no-mask",
        scene:
          "A patient in the open waiting area is coughing audibly without a mask. Masks and tissues are available at reception two feet away but no one has offered one to him.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Source control (masks for symptomatic patients in shared waiting spaces) is a core respiratory hygiene/cough etiquette IP standard. Available supplies don't help if staff aren't actively offering them — this is a workflow gap, not a stocking gap.",
      },
      {
        variantId: "ed-triage-patient-masked",
        scene:
          "A patient with an audible cough is sitting in a designated respiratory waiting area, masked, with tissues and a hand-rub dispenser within reach and a 'cover your cough' sign posted overhead.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "A separated respiratory waiting area, masked symptomatic patient, and visible cough-etiquette supports is the textbook IP setup for ED respiratory flow. Recognize this design.",
      },
    ],
  },
  {
    slotId: "ed-hall-cart",
    kind: "cart",
    position: [0, 0, 4],
    label: "Hallway Crash Cart",
    variants: [
      {
        variantId: "ed-hall-cart-checked",
        scene:
          "Crash cart is locked, sealed, and shows a current daily check tag. The defibrillator self-test light is green and the cart top is wiped clean.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "A sealed, daily-checked, clean-topped crash cart with a functioning defibrillator is exactly what you want. Daily check documentation is also a Joint Commission expectation.",
      },
      {
        variantId: "ed-hall-cart-dirty-top",
        scene:
          "The crash cart is sealed and locked, but the cart top is being used as a counter — a coffee cup, a clipboard with patient labels, and a stethoscope draped over it. No recent surface wipe.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "The crash cart top is a clinical surface, not a counter. Food/drink and unrelated equipment on top defeat surface disinfection and risk contaminating the cart contents during a code. Both an IP and Joint Commission concern.",
      },
    ],
  },
  {
    slotId: "ed-hall-doctor",
    kind: "doctor",
    position: [-3, 0, 6],
    label: "Hallway — ED Physician",
    variants: [
      {
        variantId: "ed-hall-doctor-airborne",
        scene:
          "An ED physician just exited a room marked 'Suspected TB — Airborne Precautions' and is walking down the open hall. He's still wearing his N95 and has not yet doffed.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Airborne precautions PPE (N95) must be doffed inside the airborne isolation room (AIIR), or at the threshold using designated doffing procedures, never in shared hallways. Walking out of an AIIR still gowned/respirator'd contaminates corridor surfaces.",
      },
      {
        variantId: "ed-hall-doctor-correct",
        scene:
          "The ED physician finished doffing PPE inside the AIIR, performed hand hygiene at the threshold, and is walking the hall in clean scrubs and a fresh surgical mask.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Doffing inside the isolation room with hand hygiene at the threshold, then donning clean attire before re-entering shared space, is the correct AIIR exit sequence. Recognize and coach toward this.",
      },
    ],
  },
  {
    slotId: "ed-trauma-doctor",
    kind: "doctor",
    position: [-9, 0, 4],
    label: "Trauma Bay 1 — Lead Trauma Surgeon",
    variants: [
      {
        variantId: "ed-trauma-doctor-clean",
        scene:
          "The trauma surgeon is in full PPE — gown, gloves, eye protection, mask — actively managing a bloody trauma resuscitation. Sharps container is mounted at point of use.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Standard precautions for bloody resuscitations require fluid-resistant gown, gloves, mask, and eye protection — all in place here. Point-of-use sharps containers are also exactly right. This is competent IP-aware trauma care.",
      },
      {
        variantId: "ed-trauma-doctor-no-eyes",
        scene:
          "The trauma surgeon is intubating a bloody trauma patient. He has gown and gloves on, but no face shield or goggles, and his surgical mask is loose under the chin.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Bloody airway procedures are high-splash exposure events — eye protection is non-negotiable, and the mask must seal at the bridge and under the chin. Missing eye PPE during intubation is one of the highest-yield PPE catches in trauma.",
      },
    ],
  },
  {
    slotId: "ed-trauma-tray",
    kind: "tray",
    position: [-7, 0, 6],
    label: "Trauma Bay 1 — Procedure Tray",
    variants: [
      {
        variantId: "ed-trauma-tray-sharp",
        scene:
          "A used central line kit is sitting on the procedure tray, with the contaminated needle uncapped and lying loose. The sharps container is right there but the needle hasn't been disposed.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Sharps must go directly into a sharps container at the point of use, never left loose, never recapped. This is both an IP cross-contamination issue and a major OSHA bloodborne pathogen needle-stick injury risk.",
      },
      {
        variantId: "ed-trauma-tray-clean",
        scene:
          "The procedure tray after a central line placement is organized: sharps already in the wall-mounted point-of-use container, soiled gauze in the biohazard bag, and the tray is being wiped down with hospital disinfectant.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Immediate point-of-use sharps disposal, biohazard segregation, and surface disinfection after a procedure is exactly the IP-correct turnover. Reinforce this with the trauma team — it's protective for both patients and staff.",
      },
    ],
  },
  {
    slotId: "ed-room1-bedrail",
    kind: "bedrail",
    position: [9, 0, 4],
    label: "ED Room 1 — Stretcher After Discharge",
    variants: [
      {
        variantId: "ed-room1-bedrail-skipped",
        scene:
          "The ED stretcher in this room was just used for a patient who was discharged. The mattress, side rails, and IV pole show no fresh wipe marks. The 'ready' magnet is already flipped to green.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Between-patient turnover in the ED requires disinfection of the stretcher, rails, and high-touch equipment with appropriate contact (wet) time before flipping the room to 'ready.' Skipping this in a fast-paced ED is a common driver of cross-transmission.",
      },
      {
        variantId: "ed-room1-bedrail-clean",
        scene:
          "The ED stretcher, side rails, IV pole and overbed table all show fresh disinfection wipe marks; the 'ready' magnet is flipped only after the contact time has elapsed and the turnover log is initialed.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Documented ED room turnover with full contact time before flipping to 'ready' is the IP-correct rapid-cycle process. Recognize this — it's how you maintain throughput without sacrificing IP control.",
      },
    ],
  },
  {
    slotId: "ed-room2-nurse",
    kind: "nurse",
    position: [7, 0, 6],
    label: "ED Room 2 — Nurse Drawing Blood",
    variants: [
      {
        variantId: "ed-room2-nurse-no-hh",
        scene:
          "A nurse is drawing blood from a patient. She put gloves on but never performed hand hygiene before donning them — straight from the workstation to gloves to venipuncture.",
        category: "hand_hygiene",
        correctAnswer: "Hand Hygiene",
        explanation:
          "Hand hygiene is required BEFORE donning gloves (WHO Moment 2: Before clean/aseptic procedure). Gloves are not a substitute for hand hygiene — contamination on the hands transfers to the outside of the glove during donning.",
      },
      {
        variantId: "ed-room2-nurse-correct",
        scene:
          "The nurse performed alcohol rub at the door, donned gloves, scrubbed the venipuncture site with chlorhexidine and let it dry, and is now drawing blood with a single-use safety device.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Hand hygiene → gloves → site antisepsis with adequate dry time → safety-engineered device is the textbook IP-correct phlebotomy sequence. Reinforce as the standard.",
      },
    ],
  },
  {
    slotId: "ed-decon-sink",
    kind: "sink",
    position: [-11, 0, 11],
    label: "Decontamination Room Sink",
    variants: [
      {
        variantId: "ed-decon-sink-ready",
        scene:
          "The dedicated decon room has its own sink, eye wash, separate ventilation, and a stocked decon kit (gowns, double gloves, respirators, shoe covers). Door is closed.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "A purpose-built decon room with separate ventilation, eye wash, and a stocked PPE kit — kept closed when not in use — is the IP-correct setup. This is the kind of infrastructure that lets the ED handle hazmat/contaminated arrivals safely.",
      },
      {
        variantId: "ed-decon-sink-empty",
        scene:
          "The decon room sink has an out-of-service tag, the eye wash hasn't been weekly-flushed in a month per the sticker, and the decon PPE kit is missing the respirators and shoe covers.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "An incomplete decon kit with broken eye wash and unflushed weekly check fails on multiple IP fronts: missing respirators leave staff unprotected during contaminated arrivals, and unmaintained eye-wash equipment is an OSHA finding.",
      },
    ],
  },
  {
    slotId: "ed-supply-ppebin",
    kind: "ppe_bin",
    position: [11, 0, 11],
    label: "ED Supply Alcove — Glove Box",
    variants: [
      {
        variantId: "ed-supply-ppebin-mixed",
        scene:
          "A multi-pack glove box is mounted on the wall but the sizes (S, M, L) are mixed in a single open bin underneath, and several gloves have fallen onto the floor and been put back into the bin.",
        category: "ppe",
        correctAnswer: "PPE",
        explanation:
          "Gloves dropped on the floor must be discarded, not returned to stock. Mixing sizes in an open bin defeats the wall-mounted dispenser system and contaminates the supply. PPE storage hygiene is part of PPE compliance.",
      },
      {
        variantId: "ed-supply-ppebin-organized",
        scene:
          "Wall-mounted glove dispensers in S/M/L are stocked from above with sealed boxes, sizes are separated, and a 'do not return dropped gloves' sign is posted with a small bin labeled 'discard.'",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Top-loaded sealed dispensers, separated sizes, and a clear discard policy is the IP-correct PPE storage micro-design. Recognize this — small workflow signals like the 'discard' bin drive real compliance.",
      },
    ],
  },
  {
    slotId: "ed-station-callbutton",
    kind: "callbutton",
    position: [3, 0, 14],
    label: "ED Tracking Board Touchscreen",
    variants: [
      {
        variantId: "ed-station-callbutton-clean",
        scene:
          "The wall-mounted ED tracking board is a high-touch shared touchscreen. There's a dispenser of disinfectant wipes mounted directly next to it and a posted 'wipe before/after' sign.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Co-locating disinfectant wipes with high-touch shared screens, plus signage, makes the right behavior the easy behavior. Recognize this small but high-leverage workflow design.",
      },
      {
        variantId: "ed-station-callbutton-dirty",
        scene:
          "The ED tracking board touchscreen is heavily smudged with what looks like dried blood near the lower edge. The wipe dispenser next to it is empty and the 'wipe before/after' sign is peeling off the wall.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Visible biological soil on a high-touch shared screen plus an empty wipe dispenser is a compounded failure: the surface is contaminated AND the means to clean it isn't available. Both must be corrected immediately.",
      },
    ],
  },
  {
    slotId: "ed-station-doctor",
    kind: "doctor",
    position: [-3, 0, 14],
    label: "Physician Workstation",
    variants: [
      {
        variantId: "ed-station-doctor-stethoscope",
        scene:
          "A physician is wearing a stethoscope around her neck. She uses it on a patient on contact precautions, then walks out and uses the same stethoscope on the next patient without disinfecting it.",
        category: "sterilization",
        correctAnswer: "Sterilization / Disinfection",
        explanation:
          "Stethoscopes are shared, non-critical patient equipment and must be disinfected between patients with an alcohol wipe or hospital-grade wipe. They are documented MRSA/VRE/C. diff transmission vectors when not cleaned.",
      },
      {
        variantId: "ed-station-doctor-clean",
        scene:
          "The physician wipes down her stethoscope with an alcohol wipe before leaving the patient's room, performs hand hygiene at the door, and only re-dons the stethoscope at the next patient's room after a second wipe.",
        category: "none",
        correctAnswer: "No Violation",
        explanation:
          "Wipe → hand hygiene → wipe at the next room is the IP-correct pattern for a personally carried but patient-shared device. Reinforce this — it eliminates a common transmission vector.",
      },
    ],
  },
];

const ED_LAYOUT: LevelLayout = {
  bounds: { minX: -13, maxX: 14, minZ: -7, maxZ: 17 },
  walls: [
    [-13, -1.8, -2, -1.6],
    [2, -1.8, 14, -1.6],
    [-5.8, 2, -5.6, 5],
    [-5.8, 7, -5.6, 8],
    [-13, 8, -5.6, 8.2],
    [5.8, 2, 6, 5],
    [5.8, 7, 6, 8],
    [6, 8, 13, 8.2],
    [-9.5, 9.5, -9.3, 13],
    [-13, 13, -9.3, 13.2],
    [9.5, 9.5, 9.7, 13],
    [9.7, 13, 14, 13.2],
  ],
  startPosition: [0, 1.6, -6],
  floorColor: "#e6dfdf",
  accentColor: "#dc2626",
};

// ─────────────────────────────────────────────────────────────
// LEVEL REGISTRY
// ─────────────────────────────────────────────────────────────
export const LEVELS: Record<LevelId, Level> = {
  medsurg: {
    id: "medsurg",
    label: "Med-Surg Unit",
    shortLabel: "Med-Surg",
    blurb:
      "A standard medical-surgical floor. Lobby, two patient rooms, nurse station, supply closet. Good warm-up for IP fundamentals.",
    slots: MEDSURG_SLOTS,
    layout: MEDSURG_LAYOUT,
  },
  icu: {
    id: "icu",
    label: "Intensive Care Unit",
    shortLabel: "ICU",
    blurb:
      "Four ICU bays around a central monitoring station. Higher acuity means higher-stakes IP slips — invasive lines, vents, and isolation precautions.",
    slots: ICU_SLOTS,
    layout: ICU_LAYOUT,
  },
  or: {
    id: "or",
    label: "Operating Room Suite",
    shortLabel: "OR",
    blurb:
      "Two operating rooms, scrub corridor, sterile and soiled storage. Sterile-field discipline, traffic, and SPD/processing dominate this round.",
    slots: OR_SLOTS,
    layout: OR_LAYOUT,
  },
  ed: {
    id: "ed",
    label: "Emergency Department",
    shortLabel: "ED",
    blurb:
      "Triage, waiting area, trauma bay, ED rooms, decon room. Fast pace, high turnover, mixed precautions — easy to cut corners.",
    slots: ED_SLOTS,
    layout: ED_LAYOUT,
  },
};

export const LEVEL_ORDER: LevelId[] = ["medsurg", "icu", "or", "ed"];

// Total scenarios across all levels (for menu display).
export function totalScenarioPoolSize(): number {
  return LEVEL_ORDER.reduce(
    (n, id) =>
      n +
      LEVELS[id].slots.reduce((m, s) => m + s.variants.length, 0),
    0,
  );
}

// Per-level scenario pool size (sum of variants across slots).
export function levelScenarioPoolSize(levelId: LevelId): number {
  return LEVELS[levelId].slots.reduce((m, s) => m + s.variants.length, 0);
}

// How many hotspots will be live in a round of this level.
export function levelRoundSize(levelId: LevelId): number {
  return Math.min(HOTSPOTS_PER_ROUND, LEVELS[levelId].slots.length);
}

// Build a randomized round: pick N slots at random, then pick a random
// variant from each slot. Returns ready-to-use Hotspot objects.
export function sampleLevelHotspots(
  levelId: LevelId,
  count: number = HOTSPOTS_PER_ROUND,
): Hotspot[] {
  const slots = LEVELS[levelId].slots;
  const shuffled = [...slots];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const chosen = shuffled.slice(0, Math.min(count, slots.length));
  return chosen.map((slot) => {
    const v =
      slot.variants[Math.floor(Math.random() * slot.variants.length)];
    return {
      id: slot.slotId,
      variantId: v.variantId,
      kind: slot.kind,
      position: slot.position,
      label: v.labelOverride ?? slot.label,
      scene: v.scene,
      category: v.category,
      correctAnswer: v.correctAnswer,
      explanation: v.explanation,
    };
  });
}

// Count of "real" violations among a sampled hotspot list.
export function hotspotsTotalViolations(hotspots: Hotspot[]): number {
  return hotspots.filter((h) => h.category !== "none").length;
}

export const POINTS_CORRECT = 10;
export const POINTS_WRONG = -5;
