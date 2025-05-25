const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const defaultMetadata = {
  metadataBase: new URL(defaultUrl),
  title: "Piggsy | Sistema de Contabilidad",
  description:
    "Sistema de contabilidad para llevar un diario de movimientos contables y generar reportes financieros",
  keywords: [
    "contabilidad",
    "finanzas",
    "diario contable",
    "balance general",
    "estado de resultados",
  ],
  authors: [
    { name: "Jorge Armando Ceras Cárdenas" },
    { name: "José de Jesús Flores Sanchez" },
    { name: "Jorge Armando Ceras Cárdenas" },
  ],
  openGraph: {
    title: "Piggsy | Sistema de Contabilidad",
    description:
      "Sistema de contabilidad para llevar un diario de movimientos contables y generar reportes financieros",
    type: "website",
  },
};

export const signinMetadata = {
  ...defaultMetadata,
  title: "Iniciar sesión | Piggsy",
  description:
    "Inicia sesión en Piggsy para acceder a tu cuenta y gestionar tus movimientos contables.",
};
