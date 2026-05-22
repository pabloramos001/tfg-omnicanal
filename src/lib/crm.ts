export type GoogleSheetsCrmContact = {
  numeroCliente: string;
  fechaEntrada: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  mail: string;
  claveUnica: string;
  fuente: string;
  categoria: string;
  participaEn: string;
  estado: string;
  nivelInteres: "alto" | "medio" | "bajo";
  fechaUltimaActividad: string;
  ultimoContacto: string;
  proximoSeguimiento: string;
  facturacion: number;
  responsable: string;
  notas: string;
  activo: boolean;
  playtomic: boolean;
};

export const crmSheetColumns = [
  "numeroCliente",
  "fechaEntrada",
  "nombre",
  "apellidos",
  "telefono",
  "mail",
  "claveUnica",
  "fuente",
  "categoria",
  "participaEn",
  "estado",
  "nivelInteres",
  "fechaUltimaActividad",
  "ultimoContacto",
  "proximoSeguimiento",
  "facturacion",
  "responsable",
  "notas",
  "activo",
  "playtomic",
] as const;

export const crmContacts: GoogleSheetsCrmContact[] = [
  {
    numeroCliente: "CLI-00124",
    fechaEntrada: "2026-05-02",
    nombre: "Lucia",
    apellidos: "Martin Sanz",
    telefono: "+34 622 100 245",
    mail: "lucia.martin@example.com",
    claveUnica: "lucia.martin@example.com",
    fuente: "Jotform ranking primavera",
    categoria: "Ranking",
    participaEn: "Liga femenina",
    estado: "Pendiente de confirmar plaza",
    nivelInteres: "alto",
    fechaUltimaActividad: "2026-05-11",
    ultimoContacto: "WhatsApp plantilla recordatorio",
    proximoSeguimiento: "2026-05-13",
    facturacion: 240,
    responsable: "Paula",
    notas: "Pidio horario de tarde y seguimiento por WhatsApp.",
    activo: true,
    playtomic: true,
  },
  {
    numeroCliente: "CLI-00125",
    fechaEntrada: "2026-05-04",
    nombre: "Diego",
    apellidos: "Ruiz Lopez",
    telefono: "+34 611 203 109",
    mail: "diego.ruiz@example.com",
    claveUnica: "diego.ruiz@example.com",
    fuente: "WhatsApp inbound",
    categoria: "Torneo",
    participaEn: "Torneo mixto sabado",
    estado: "En seguimiento comercial",
    nivelInteres: "medio",
    fechaUltimaActividad: "2026-05-10",
    ultimoContacto: "Consulta inicial clasificada por IA",
    proximoSeguimiento: "2026-05-14",
    facturacion: 0,
    responsable: "Mario",
    notas: "Tiene dudas sobre nivel y condiciones de pago.",
    activo: true,
    playtomic: false,
  },
  {
    numeroCliente: "CLI-00126",
    fechaEntrada: "2026-05-07",
    nombre: "Carmen",
    apellidos: "Gil Ortega",
    telefono: "+34 699 118 406",
    mail: "carmen.gil@example.com",
    claveUnica: "carmen.gil@example.com",
    fuente: "Formulario web campus",
    categoria: "Escuela",
    participaEn: "Campus junior julio",
    estado: "Cliente activa",
    nivelInteres: "alto",
    fechaUltimaActividad: "2026-05-12",
    ultimoContacto: "Llamada cerrada por responsable",
    proximoSeguimiento: "2026-05-20",
    facturacion: 480,
    responsable: "Andrea",
    notas: "Familia recurrente. Prefiere email para documentacion.",
    activo: true,
    playtomic: true,
  },
];

export const crmSummary = {
  totalContactos: crmContacts.length,
  activos: crmContacts.filter((contact) => contact.activo).length,
  conPlaytomic: crmContacts.filter((contact) => contact.playtomic).length,
  facturacionTotal: crmContacts.reduce((total, contact) => total + contact.facturacion, 0),
  claveUnica: "mail",
  origen: "Google Sheets",
};