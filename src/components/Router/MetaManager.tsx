import { useEffect } from "react";
import type { FlatRoute } from "../../types";

type Props = { route: FlatRoute };

/**
 * Syncs document.title and meta[name="description"] with the active route's meta.
 * Renders nothing — pure side effect component.
 */
export function MetaManager({ route }: Props) {
  useEffect(() => {
    const { meta } = route;
    if (!meta) return;

    if (meta.title && typeof meta.title === "string") {
      document.title = meta.title;
    }

    if (meta.description && typeof meta.description === "string") {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      tag.content = meta.description;
    }
  }, [route.path, route.meta]);

  return null;
}
