export interface LotbLink {
  label: string;
  url: string;
}

export interface LotbProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  links: LotbLink[];
}

export interface LotbCohort {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'active' | 'inactive';
  interventionUrl: string;
}

export interface LotbConfig {
  projects: LotbProject[];
  msmsCohorts: LotbCohort[];
}

export const DEFAULT_LOTB_CONFIG: LotbConfig = {
  projects: [
    {
      id: "hp_futures",
      title: "H.P Futures",
      description: "In collaboration with UNESCO and Govt. of Himachal Pradesh. Works on CBE, Greening education in schools & Value through Sports. Spread across 8 districts of Himachal covering 3 regions of the Himalayas.",
      imageUrl: "",
      links: [
        { label: "Read Project Report", url: "#" },
        { label: "UNESCO Collaboration Details", url: "#" }
      ]
    },
    {
      id: "msms",
      title: "माझी शाळा, माझा स्वाभिमान",
      description: "In collaboration with Tribal development department Maharashtra - Works with 500 Ashramschools. Is a holistic school development program working directly with Teachers, Superintendents and Students.",
      imageUrl: "",
      links: []
    },
    {
      id: "gurushala",
      title: "Gurushala",
      description: "Innovating education and skilling bridging the digital divide through digital content provided through the platform, capacity building courses for teachers and students. Also has a Centre for AI in Education established in partnership with DIET Varanasi.",
      imageUrl: "",
      links: [
        { label: "Visit Gurushala Platform", url: "#" },
        { label: "Centre for AI Details", url: "#" }
      ]
    }
  ],
  msmsCohorts: [
    {
      id: "t1-4",
      title: "Teachers (1-4)",
      description: "Foundational Literacy and Numeracy (FLN) engagement. Teachers are trained to track classroom outcomes, conduct diagnostic assessments, and deliver tailored pedagogy using the Mission Mode approach.",
      imageUrl: "",
      status: "active",
      interventionUrl: "/intervention"
    },
    {
      id: "t5-7",
      title: "Teachers (5-7)",
      description: "Subject-specific pedagogical strategies focusing on transitioning students from foundational skills to advanced comprehension and applied problem-solving.",
      imageUrl: "",
      status: "inactive",
      interventionUrl: "#"
    },
    {
      id: "t8-12",
      title: "Teachers (8-12)",
      description: "Higher secondary capacity building focused on exam readiness, digital literacy, and preparing tribal students for competitive career trajectories.",
      imageUrl: "",
      status: "inactive",
      interventionUrl: "#"
    },
    {
      id: "english",
      title: "English Teachers",
      description: "Specialized language acquisition programs focusing on spoken English, phonics, and communication skills to bridge the regional language gap.",
      imageUrl: "",
      status: "inactive",
      interventionUrl: "#"
    },
    {
      id: "supt",
      title: "Superintendents",
      description: "Administrative leadership training focused on data-driven management, school hygiene, ecosystem tracking, and fostering a positive residential environment.",
      imageUrl: "",
      status: "inactive",
      interventionUrl: "#"
    }
  ]
};
