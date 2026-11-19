"use client";

import React, { createContext, useContext } from "react";

export type Messenger = "max" | "telegram";

type Links = Partial<Record<Messenger, string>>;

interface Contacts {
  /** Company profiles: `header.socials` in settings.json */
  socials: Links;
  /** Bots that send the catalog PDF after "Start": `catalogBots` in settings.json */
  catalogBots: Links;
}

const ContactsContext = createContext<Contacts>({ socials: {}, catalogBots: {} });

export const ContactsProvider: React.FC<{
  value: Contacts;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>
);

export const useContacts = () => useContext(ContactsContext);
