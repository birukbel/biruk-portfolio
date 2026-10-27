import { revalidatePath, revalidateTag } from "next/cache";
import { CONTENT_TAG } from "./content";

/** Every admin write goes through this so public pages refresh within seconds. */
export function refreshPublic() {
  revalidateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}
