// Citation:
// This code was generated with the help of Claude.
// This transcript https://claude.ai/share/73226b74-ddfd-4a0d-867b-137698ea2488
// documents the GenAI interaction that led to the generation of this code.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};