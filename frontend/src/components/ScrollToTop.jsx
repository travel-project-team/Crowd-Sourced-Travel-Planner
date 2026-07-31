// Citation:
// This code was generated with the help of Google Gemini.
// This transcript https://share.google/aimode/GnoQphPqSvuIvvvqN
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