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
      title: "H.P FUTURES",
      description: "A transformative initiative by the Govt. of Himachal Pradesh and UNESCO, aimed at strengthening the quality and relevance of education across the state. Focuses on Competency-Based Education (CBE), Greening Education, and Values Education through Sports in alignment with NEP 2020.",
      imageUrl: "",
      links: [
        { label: "Read Project Report", url: "#" },
        { label: "UNESCO Collaboration Details", url: "#" }
      ]
    },
    {
      id: "msms",
      title: "माझी शाळा, माझा स्वाभिमान",
      description: "A holistic 3-year Ashramschool development program in collaboration with the Tribal Development Department of Maharashtra. Engaging over 498 Ashramschools across Nashik, Thane, Nagpur, and Amravati with targeted capacity-building for teachers and superintendents.",
      imageUrl: "",
      links: []
    },
    {
      id: "gurushala",
      title: "Gurushala",
      description: "An initiative of Vodafone Idea Foundation implemented by Pratham, dedicated to strengthening teaching and learning through technology-enabled education. Provides free, high-quality professional development, digital resources, and assessments.",
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
      title: "इयत्ता 1–4: पायाभूत साक्षरता व संख्याज्ञान",
      description: "Foundational Literacy and Numeracy (FLN) engagement for Grades 1-4. Teachers are trained to track classroom outcomes, conduct diagnostic assessments, and deliver tailored pedagogy using the Mission Mode approach.",
      imageUrl: "",
      status: "active",
      interventionUrl: "/intervention"
    },
    {
      id: "t5-7",
      title: "इयत्ता 5-7: कॅच-अप कोर्स",
      description: "Catch-up course implementation and subject-specific pedagogical strategies focusing on transitioning students from foundational skills to advanced comprehension and applied problem-solving.",
      imageUrl: "",
      status: "inactive",
      interventionUrl: "#"
    },
    {
      id: "t8-12",
      title: "इयत्ता 8–12: NEP-संलग्न पाठ-योजना",
      description: "Activity-based, NEP-aligned lesson plans for higher secondary capacity building focused on exam readiness, digital literacy, and preparing tribal students for competitive career trajectories.",
      imageUrl: "",
      status: "inactive",
      interventionUrl: "#"
    },
    {
      id: "english",
      title: "इंग्रजी शिक्षक",
      description: "Specialized language acquisition programs focusing on spoken English, phonics, and communication skills to bridge the regional language gap.",
      imageUrl: "",
      status: "inactive",
      interventionUrl: "#"
    },
    {
      id: "supt",
      title: "अधीक्षक क्षमता-बांधणी",
      description: "Administrative leadership training for superintendents focused on data-driven management, school hygiene, ecosystem tracking, and fostering a positive residential environment.",
      imageUrl: "",
      status: "inactive",
      interventionUrl: "#"
    }
  ]
};
