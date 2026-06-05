"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_CONTACT_SETTINGS,
  mailtoDevisFromEmail,
  telLinkFromPhone,
  whatsappLink,
  type ContactSettings,
} from "@/lib/settings/contact-types";

export type PublicContact = ContactSettings & {
  telLink: string;
  mailtoDevis: string;
  whatsappHref: string;
};

function toPublicContact(settings: ContactSettings): PublicContact {
  return {
    ...settings,
    telLink: telLinkFromPhone(settings.phone),
    mailtoDevis: mailtoDevisFromEmail(settings.email),
    whatsappHref: whatsappLink(settings.whatsapp || settings.phone),
  };
}

const ContactContext = createContext<PublicContact>(
  toPublicContact(DEFAULT_CONTACT_SETTINGS)
);

export function ContactProvider({
  contact,
  children,
}: {
  contact: ContactSettings;
  children: React.ReactNode;
}) {
  return (
    <ContactContext.Provider value={toPublicContact(contact)}>
      {children}
    </ContactContext.Provider>
  );
}

export function usePublicContact() {
  return useContext(ContactContext);
}
