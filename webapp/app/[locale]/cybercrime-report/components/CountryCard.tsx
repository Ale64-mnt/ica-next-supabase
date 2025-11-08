// app/[locale]/cybercrime-report/components/CountryCard.tsx
'use client';
import React from 'react';
import { ExternalLink, Mail, Phone, Globe } from 'lucide-react';

interface CountryCardProps {
  countryCode: string;
  flag: string;
}

export function CountryCard({ countryCode, flag }: CountryCardProps) {
  // Tutti i dati dai tuoi testi - strutturati
  const countryData = {
    austria: {
      name: "Österreich",
      authority: "Bundesministerium für Inneres – Internet-Kriminalität",
      website: "https://www.onlinesicherheit.gv.at",
      email: "against-cybercrime@bmi.gv.at",
      phone: "",
      emergency: "133",
      description: "Online-Meldungen können per E-Mail gesendet werden; bei bekannten Tätern ist eine Anzeige bei der nächsten Polizeidienststelle erforderlich"
    },
    belgium: {
      name: "Belgique/België",
      authority: "Safeonweb (Centre for Cybersecurity Belgium)",
      website: "https://www.safeonweb.be",
      email: "suspicious@safeonweb.be", 
      phone: "",
      emergency: "112",
      description: "Sur le site safeonweb.be, vous pouvez signaler des incidents et transférer des messages suspects; la police locale coopère avec les unités informatiques régionales et fédérales"
    },
    bulgaria: {
      name: "България",
      authority: "Дирекция 'Киберпрестъпност' – ГДБОП",
      website: "https://cybercrime.bg",
      email: "",
      phone: "",
      emergency: "112",
      description: "Свидетели на киберпрестъпления подават сигнали в най-близкото районно управление или директно в Дирекция 'Киберпрестъпност'"
    },
    croatia: {
      name: "Hrvatska",
      authority: "Policija Republike Hrvatske",
      website: "https://mup.gov.hr",
      email: "",
      phone: "192",
      emergency: "112",
      description: "Kaznena prijava podnosi se usmeno ili pisano u najbližoj policijskoj postaji ili telefonom na broj 192. Elektroničke prijave moguće su putem e-Građani (e-Policija)"
    },
    cyprus: {
      name: "Κύπρος",
      authority: "Γραφείο Καταπολέμησης Ηλεκτρονικού Εγκλήματος – Αστυνομία Κύπρου",
      website: "https://www.gov.cy/en/service/reporting-information-or-complaint-on-cybercrime-issues",
      email: "cybercrime@police.gov.cy",
      phone: "+357 22808200",
      emergency: "112",
      description: "Μπορείτε να υποβάλετε πληροφορίες ή παράπονο σχετικά με ηλεκτρονικό έγκλημα τηλεφωνικά ή με email"
    },
    denmark: {
      name: "Danmark",
      authority: "Politi",
      website: "https://politi.dk/anmeld",
      email: "",
      phone: "",
      emergency: "112",
      description: "Digital svindel kan anmeldes online på politi.dk/anmeld under kategorien 'Økonomisk svindel på nettet'"
    },
    estonia: {
      name: "Eesti",
      authority: "Politsei- ja Piirivalveamet / CERT-EE",
      website: "https://cyber.politsei.ee",
      email: "",
      phone: "612 3000",
      emergency: "112", 
      description: "Kahtlustatavat e-kirja, kontovargust või raha kaotust saab teatada veebivormi kaudu; infotelefon 612 3000"
    },
    finland: {
      name: "Suomi",
      authority: "Poliisi",
      website: "https://poliisi.fi",
      email: "",
      phone: "0295 41 9800",
      emergency: "112",
      description: "Rikosilmoituksen voi tehdä netissä tai poliisiasemalla; poliisi on velvollinen ottamaan ilmoituksen vastaan"
    },
    france: {
      name: "France",
      authority: "PHAROS",
      website: "https://internet-signalement.gouv.fr",
      email: "",
      phone: "",
      emergency: "112",
      description: "Signalez un contenu ou un délit en ligne sur internet-signalement.gouv.fr (ex : violences, menaces, escroqueries)"
    },
    germany: {
      name: "Deutschland",
      authority: "Polizei – Onlinewache/Internetwache",
      website: "https://www.polizei.de",
      email: "",
      phone: "116 116",
      emergency: "110",
      description: "In vielen Bundesländern können Anzeigen online erstattet werden; ansonsten bei jeder Polizeidienststelle oder Staatsanwaltschaft"
    },
    greece: {
      name: "Ελλάδα",
      authority: "Διεύθυνση Δίωξης Ηλεκτρονικού Εγκλήματος – Ελληνική Αστυνομία",
      website: "https://gov.gr",
      email: "",
      phone: "",
      emergency: "112",
      description: "Στην πλατφόρμα gov.gr υποβάλλεται αναφορά ψηφιακής απάτης με υπογραφή και πλήρη στοιχεία; απαιτείται αυθεντικοποίηση (Taxisnet ή τράπεζα)"
    },
    ireland: {
      name: "Éire",
      authority: "An Garda Síochána",
      website: "https://www.garda.ie",
      email: "",
      phone: "",
      emergency: "112",
      description: "Victims of online scams should report to their local Garda station and provide emails, account details and other evidence"
    },
    italy: {
      name: "Italia",
      authority: "Polizia Postale e delle Comunicazioni",
      website: "https://www.commissariatodips.it",
      email: "",
      phone: "113",
      emergency: "112",
      description: "È possibile segnalare online tramite 'Segnala online' o sporgere denuncia presso gli uffici della Polizia Postale"
    },
    latvia: {
      name: "Latvija",
      authority: "CERT.LV un Valsts policija",
      website: "https://cert.lv",
      email: "",
      phone: "+371 67085888",
      emergency: "112",
      description: "Incidentus var ziņot pa tālr. +371 67085888 vai e-pastā; policija izmanto 112 ārkārtas zvaniem"
    },
    lithuania: {
      name: "Lietuva",
      authority: "Nacionalinis kibernetinio saugumo centras (NKSC) ir Cyber-policija",
      website: "https://nksc.lt",
      email: "cert@nksc.lt",
      phone: "+370 706 84 116",
      emergency: "112",
      description: "Incidentus galima pranešti užpildžius formą arba el. paštu cert@nksc.lt; Cyber-policija pasiekiama per cyberpolice@policija.lt"
    },
    luxembourg: {
      name: "Lëtzebuerg",
      authority: "Police Grand-Ducale, CIRCL et Spambee",
      website: "https://police.public.lu",
      email: "contact@police.public.lu",
      phone: "+352 244 244 244",
      emergency: "112",
      description: "La police reçoit les plaintes en commissariat ou au parquet; pour certains vols mineurs il existe une procédure en ligne via guichet.lu"
    },
    malta: {
      name: "Malta",
      authority: "Malta Police Force – Cyber Crime Unit",
      website: "https://pulizija.gov.mt",
      email: "computer.crime@gov.mt",
      phone: "+356 2294 2231",
      emergency: "112",
      description: "For emergencies call 112; complaints can be filed at any police station or through the remote reporting service (non-urgent)"
    },
    netherlands: {
      name: "Nederland",
      authority: "Fraudehelpdesk en Politie",
      website: "https://fraudehelpdesk.nl",
      email: "",
      phone: "0900 8844",
      emergency: "112",
      description: "Meld fraud via het online formulier op fraudehelpdesk.nl; telefonisch contact is niet mogelijk. Voor spoed bel 112, voor niet-spoed 0900 8844"
    },
    poland: {
      name: "Polska",
      authority: "Centralne Biuro Zwalczania Cyberprzestępczości (CBZC)",
      website: "https://cbzc.policja.gov.pl",
      email: "kontakt.cbzc@cbzc.policja.gov.pl",
      phone: "47 72 136 99",
      emergency: "112",
      description: "Zgłoszenia przyjmowane są przez e-mail i pod numerem alarmowym 47 72 136 99 (24/7)"
    },
    portugal: {
      name: "Portugal",
      authority: "UNC3T",
      website: "https://www.policiajudiciaria.pt",
      email: "unc3t@pj.pt",
      phone: "+351 21 196 7000",
      emergency: "112",
      description: "Denúncias eletrónicas através do portal queixeletronica.pj.pt (requere Cartão de Cidadão)"
    },
    romania: {
      name: "România",
      authority: "Directoratul Naţional pentru Securitate Cibernetică (DNSC)",
      website: "https://dnsc.ro",
      email: "cybercrime@politiaromana.ro",
      phone: "021 208 25 25",
      emergency: "112",
      description: "DNSC prin formularul site-ului dnsc.ro. DIICOT avertizează că infractorii pot falsifica numere oficiale"
    },
    slovakia: {
      name: "Slovensko",
      authority: "SK-CERT (Národný bezpečnostný úrad)",
      website: "https://www.sk-cert.sk",
      email: "incident@nbu.gov.sk",
      phone: "",
      emergency: "112",
      description: "Incidenty sa oznamujú prostredníctvom Jednotného informačného systému kybernetickej bezpečnosti alebo e-mailom"
    },
    slovenia: {
      name: "Slovenija",
      authority: "Policija",
      website: "https://www.policija.si",
      email: "",
      phone: "113",
      emergency: "112",
      description: "Telefonske številke: nujni 113 in anonimni 080-1200 za prijavo kaznivih dejanj ali sumov. Prijave so možne tudi na policijskih postajah ali preko spletnih obrazcev"
    },
    spain: {
      name: "España",
      authority: "Policía Nacional y Guardia Civil",
      website: "https://www.policia.es",
      email: "",
      phone: "091",
      emergency: "112",
      description: "La Policía Nacional permite denunciar en cualquier comisaría (24 h) o mediante la denuncia telefónica/Internet; en urgencia llame 091 o 112"
    },
    sweden: {
      name: "Sverige",
      authority: "Polisen",
      website: "https://polisen.se",
      email: "",
      phone: "114 14",
      emergency: "112",
      description: "Anmäl brott så snart som möjligt; vid icke akut ärenden ring 114 14 eller besök en polisstation. Från utlandet ring +46 77 114 14 00"
    }
  };

  const data = countryData[countryCode as keyof typeof countryData];

  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b">
        <span className="text-2xl">{flag}</span>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{data.name}</h3>
          <p className="text-sm text-gray-600">{data.authority}</p>
        </div>
      </div>

      {/* Contenuto */}
      <div className="space-y-4 flex-1">
        {/* Sito Web */}
        <div>
          <a 
            href={data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            Sito Ufficiale
          </a>
        </div>

        {/* Contatti */}
        <div className="space-y-2">
          {data.email && (
            <a 
              href={`mailto:${data.email}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              <Mail className="w-4 h-4" />
              {data.email}
            </a>
          )}
          
          {data.phone && (
            <a 
              href={`tel:${data.phone}`}
              className="flex items-center gap-2 text-gray-700 text-sm"
            >
              <Phone className="w-4 h-4" />
              {data.phone}
            </a>
          )}
        </div>

        {/* Descrizione */}
        <p className="text-sm text-gray-600 flex-1">{data.description}</p>

        {/* Emergenza */}
        <div className="pt-3 border-t mt-auto">
          <a 
            href={`tel:${data.emergency}`}
            className="text-red-600 font-semibold text-sm hover:text-red-800"
          >
            🚨 Emergenza: {data.emergency}
          </a>
        </div>
      </div>
    </div>
  );
}
