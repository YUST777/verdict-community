// src/z-color.ts
import { NoReactInternals } from "remotion/no-react";
import { z } from "zod";
var REMOTION_COLOR_BRAND = "__remotion-color";
var parseColor = (value) => {
  const colored = NoReactInternals.processColor(value).toString(16).padStart(8, "0");
  const opacity = parseInt(colored.slice(0, 2), 16);
  const r = parseInt(colored.slice(2, 4), 16);
  const g = parseInt(colored.slice(4, 6), 16);
  const b = parseInt(colored.slice(6, 8), 16);
  return { a: opacity, r, g, b };
};
var zColor = () => z.string().refine((value) => {
  try {
    parseColor(value);
    return true;
  } catch {
    return false;
  }
}, { message: "Invalid color" }).describe(REMOTION_COLOR_BRAND);

// src/z-matrix.ts
import { z as z2 } from "zod";
var REMOTION_MATRIX_BRAND = "__remotion-matrix";
var zMatrix = () => z2.array(z2.number().step(0.01)).refine((value) => {
  const count = value.length;
  const root = Math.sqrt(count);
  return Number.isInteger(root) && root > 0;
}, { message: "Invalid matrix, must be a square matrix" }).describe(REMOTION_MATRIX_BRAND);

// src/z-textarea.ts
import { z as z3 } from "zod";
var REMOTION_TEXTAREA_BRAND = "__remotion-textarea";
var zTextarea = () => z3.string().describe(REMOTION_TEXTAREA_BRAND);

// src/index.ts
var ZodZypesInternals = {
  parseColor,
  REMOTION_COLOR_BRAND,
  REMOTION_TEXTAREA_BRAND,
  REMOTION_MATRIX_BRAND
};
export {
  zTextarea,
  zMatrix,
  zColor,
  ZodZypesInternals
};
