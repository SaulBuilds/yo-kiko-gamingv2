import { Fighter } from "./character";

export type CharacterStats = {
  name: string;
  health: number;
  walkSpeed: number;
  jumpForce: number;
  specialMoves: SpecialMove[];
  description: string;
  color: string; // Temporary until we have sprites
};

export type SpecialMove = {
  name: string;
  damage: number;
  input: string[]; // Array of required inputs
  description: string;
};

export const CHARACTER_ROSTER: Record<string, CharacterStats> = {
  ryu: {
    name: "Ryu",
    health: 1000,
    walkSpeed: 5,
    jumpForce: 20,
    color: "blue",
    description: "The wandering warrior seeking perfect mastery of the fighting arts.",
    specialMoves: [
      {
        name: "Hadoken",
        damage: 50,
        input: ["down", "down-forward", "forward", "punch"],
        description: "Fires a surge of spiritual energy"
      },
      {
        name: "Shoryuken",
        damage: 120,
        input: ["forward", "down", "down-forward", "punch"],
        description: "Rising Dragon Fist"
      },
      {
        name: "Tatsumaki Senpukyaku",
        damage: 80,
        input: ["down", "down-back", "back", "kick"],
        description: "Hurricane Kick"
      }
    ]
  },
  ken: {
    name: "Ken",
    health: 950,
    walkSpeed: 6,
    jumpForce: 22,
    color: "red",
    description: "A passionate fighter combining Shotokan karate with his own innovations.",
    specialMoves: [
      {
        name: "Shoryuken",
        damage: 130,
        input: ["forward", "down", "down-forward", "punch"],
        description: "Flaming Dragon Punch"
      },
      {
        name: "Hadoken",
        damage: 45,
        input: ["down", "down-forward", "forward", "punch"],
        description: "Fireball"
      },
      {
        name: "Tatsumaki Senpukyaku",
        damage: 75,
        input: ["down", "down-back", "back", "kick"],
        description: "Hurricane Kick"
      }
    ]
  },
  chunli: {
    name: "Chun-Li",
    health: 900,
    walkSpeed: 7,
    jumpForce: 23,
    color: "lightblue",
    description: "The strongest woman in the world, master of lightning-fast kicks.",
    specialMoves: [
      {
        name: "Kikoken",
        damage: 40,
        input: ["down", "down-forward", "forward", "punch"],
        description: "Energy Projectile"
      },
      {
        name: "Spinning Bird Kick",
        damage: 90,
        input: ["down", "up", "kick"],
        description: "Aerial Spinning Kick"
      },
      {
        name: "Hyakuretsukyaku",
        damage: 100,
        input: ["kick", "kick", "kick"],
        description: "Lightning Kicks"
      }
    ]
  }
};
