"use client";

import { useEffect } from "react";

export default function DomErrorHandler() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Guard Node.prototype.removeChild
      const originalRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function (child) {
        if (child && child.parentNode !== this) {
          if (typeof console !== "undefined" && console.warn) {
            console.warn("DOM Guard: Node to be removed is not a child of this node. Suppressed crash.", this, child);
          }
          return child;
        }
        return originalRemoveChild.apply(this, arguments);
      };

      // Guard Node.prototype.insertBefore
      const originalInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function (newNode, referenceNode) {
        if (referenceNode && referenceNode.parentNode !== this) {
          if (typeof console !== "undefined" && console.warn) {
            console.warn("DOM Guard: Reference node is not a child of this node. Appended to end instead.", this, referenceNode);
          }
          return this.appendChild(newNode);
        }
        return originalInsertBefore.apply(this, arguments);
      };
    }
  }, []);

  return null;
}
