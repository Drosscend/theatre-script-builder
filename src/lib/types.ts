import { Prisma } from "@prisma/client";

export type ScriptItemWithRelations = Prisma.ScriptItemGetPayload<{
  include: {
    narration: true;
    dialogue: true;
    image: true;
    lighting: true;
    sound: true;
    staging: true;
    movement: true;
  };
}>;

export type ScriptWithRelations = Prisma.ScriptGetPayload<{
  include: {
    items: {
      include: {
        narration: true;
        dialogue: true;
        image: true;
        lighting: true;
        sound: true;
        staging: true;
        movement: true;
      };
    };
    characters: true;
  };
}>;

