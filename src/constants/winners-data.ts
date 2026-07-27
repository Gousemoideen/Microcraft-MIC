export interface Winner {
  rank: 1 | 2 | 3;
  name: string;
  badgeLabel: string; // e.g. "CHAMPION", "2ND PLACE", "3RD PLACE", "RUNNER UP", "GRAND WINNER", "SILVER HACKER", "ROOT ACCESS", etc.
  icon: "trophy" | "medal" | "award" | "crown" | "code" | "terminal" | "shield" | "lock" | "star" | "key" | "bulb";
}

export interface EventWinnerGroup {
  id: string;
  title: string;
  categoryBadge: string;
  accentColor: string; // Hex or CSS color
  accentGlowColor: string; // RGBA string for glow shadow
  winners: {
    first: Winner;
    second: Winner;
    third: Winner;
  };
}

export const WINNERS_DATA: EventWinnerGroup[] = [
  {
    id: "vibeathon",
    title: "VIBEATHON",
    categoryBadge: "WORKSHOP",
    accentColor: "#00bfff", // Electric Blue
    accentGlowColor: "rgba(0, 191, 255, 0.5)",
    winners: {
      first: {
        rank: 1,
        name: "Sharan M",
        badgeLabel: "GRAND WINNER",
        icon: "terminal",
      },
      second: {
        rank: 2,
        name: "Dhiriti Vaz",
        badgeLabel: "RUNNER UP",
        icon: "code",
      },
      third: {
        rank: 3,
        name: "Anish Prakash",
        badgeLabel: "INNOVATOR",
        icon: "bulb",
      },
    },
  },
  {
    id: "arcnight",
    title: "ARCNIGHT",
    categoryBadge: "HACKATHON",
    accentColor: "#ff007f", // Neon Pink
    accentGlowColor: "rgba(255, 0, 127, 0.5)",
    winners: {
      first: {
        rank: 1,
        name: "Babakunn",
        badgeLabel: "CHAMPION",
        icon: "trophy",
      },
      second: {
        rank: 2,
        name: "Cyber Cooks",
        badgeLabel: "2ND PLACE",
        icon: "medal",
      },
      third: {
        rank: 3,
        name: "Big crab",
        badgeLabel: "3RD PLACE",
        icon: "award",
      },
    },
  },
  {
    id: "ctf-contest-1",
    title: "CTF CONTEST 1",
    categoryBadge: "CODING",
    accentColor: "#ff9900", // Orange/Amber
    accentGlowColor: "rgba(255, 153, 0, 0.5)",
    winners: {
      first: {
        rank: 1,
        name: "Michelle Elvin",
        badgeLabel: "CHAMPION",
        icon: "trophy",
      },
      second: {
        rank: 2,
        name: "Anantu Padhyay",
        badgeLabel: "2ND PLACE",
        icon: "medal",
      },
      third: {
        rank: 3,
        name: "Sreeansh Dash",
        badgeLabel: "3RD PLACE",
        icon: "award",
      },
    },
  },
  {
    id: "ctf-contest-2",
    title: "CTF CONTEST 2",
    categoryBadge: "SECURITY",
    accentColor: "#00ff66", // Neon Green
    accentGlowColor: "rgba(0, 255, 102, 0.5)",
    winners: {
      first: {
        rank: 1,
        name: "Aryan Pillai",
        badgeLabel: "ROOT ACCESS",
        icon: "shield",
      },
      second: {
        rank: 2,
        name: "Siddharth Sameer",
        badgeLabel: "SILVER HACKER",
        icon: "lock",
      },
      third: {
        rank: 3,
        name: "Ajay N",
        badgeLabel: "BRONZE HACKER",
        icon: "shield",
      },
    },
  },
];
