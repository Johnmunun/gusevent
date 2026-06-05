export const contact = {
  email: "Gustavinekyowa@gmail.com",
  phone: "+21658778309",
  phoneDisplay: "+216 58 778 309",
  address: {
    line1: "Tunis",
    line2: "Organisation d'événements sur mesure",
  },
} as const;

export const mailtoDevis = `mailto:${contact.email}?subject=${encodeURIComponent("Demande de devis")}`;

export const telLink = `tel:${contact.phone.replace(/\s/g, "")}`;
