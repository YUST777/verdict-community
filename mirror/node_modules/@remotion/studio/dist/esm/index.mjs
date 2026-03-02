var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/api/create-composition.tsx
import { Composition, Still } from "remotion";
import { jsx } from "react/jsx-runtime";
var createComposition = ({
  ...other
}) => () => {
  return /* @__PURE__ */ jsx(Composition, {
    ...other
  });
};
var createStill = ({
  ...other
}) => () => {
  return /* @__PURE__ */ jsx(Still, {
    ...other
  });
};

// src/api/delete-static-file.ts
import { getRemotionEnvironment } from "remotion";

// src/components/call-api.ts
var callApi = (endpoint, body, signal) => {
  return new Promise((resolve, reject) => {
    fetch(endpoint, {
      method: "post",
      headers: {
        "content-type": "application/json"
      },
      signal,
      body: JSON.stringify(body)
    }).then((res) => res.json()).then((data) => {
      if (data.success) {
        resolve(data.data);
      } else {
        reject(new Error(data.error));
      }
    }).catch((err) => {
      reject(err);
    });
  });
};

// src/api/delete-static-file.ts
var deleteStaticFile = async (relativePath) => {
  if (!getRemotionEnvironment().isStudio) {
    throw new Error("deleteStaticFile() is only available in the Studio");
  }
  if (window.remotion_isReadOnlyStudio) {
    throw new Error("deleteStaticFile() is not available in Read-Only Studio");
  }
  if (relativePath.startsWith(window.remotion_staticBase)) {
    relativePath = relativePath.substring(window.remotion_staticBase.length + 1);
  }
  const res = await callApi("/api/delete-static-file", { relativePath });
  return res;
};
// src/components/RenderModal/SchemaEditor/scroll-to-default-props-path.ts
import React from "react";
var DEFAULT_PROPS_PATH_CLASSNAME = "__remotion-default-props-editor-label";
var DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME = "__remotion-default-props-editor-label-active";
var defaultPropsEditorScrollableAreaRef = React.createRef();

// src/api/focus-default-props-path.ts
var focusDefaultPropsPath = ({
  path,
  scrollBehavior
}) => {
  const currentlyActive = document.querySelector(`.${DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME}`);
  if (currentlyActive !== null) {
    currentlyActive.classList.remove(DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME);
  }
  const query = document.querySelector(`.${DEFAULT_PROPS_PATH_CLASSNAME}[data-json-path="${path.join(".")}"]`);
  if (query === null) {
    return {
      success: false
    };
  }
  query.scrollIntoView({ behavior: scrollBehavior });
  query.classList.add(DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME);
  return {
    success: true
  };
};
// src/api/get-static-files.ts
var warnedServer = false;
var warnedPlayer = false;
var warnServerOnce = () => {
  if (warnedServer) {
    return;
  }
  warnedServer = true;
  console.warn("Called getStaticFiles() on the server. The API is only available in the browser. An empty array was returned.");
};
var warnPlayerOnce = () => {
  if (warnedPlayer) {
    return;
  }
  warnedPlayer = true;
  console.warn("Called getStaticFiles() while using the Remotion Player. The API is only available while using the Remotion Studio. An empty array was returned.");
};
var getStaticFiles = () => {
  if (typeof document === "undefined") {
    warnServerOnce();
    return [];
  }
  if (window.remotion_isPlayer) {
    warnPlayerOnce();
    return [];
  }
  return window.remotion_staticFiles;
};
// src/api/go-to-composition.ts
import { Internals } from "remotion";
var goToComposition = (compositionId) => {
  Internals.compositionSelectorRef.current?.selectComposition(compositionId);
};
// src/api/helpers/calc-new-props.ts
import { Internals as Internals2, getRemotionEnvironment as getRemotionEnvironment2 } from "remotion";
var calcNewProps = (compositionId, defaultProps) => {
  if (!getRemotionEnvironment2().isStudio) {
    throw new Error("saveDefaultProps can only be called in the Remotion Studio.");
  }
  const { compositionsRef, editorPropsProviderRef } = Internals2;
  const compositionsStore = compositionsRef.current;
  if (!compositionsStore) {
    throw new Error("No compositions ref found. Are you in the Remotion Studio and are the Remotion versions aligned?");
  }
  const compositions = compositionsStore.getCompositions();
  const composition = compositions.find((c) => c.id === compositionId);
  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found. Available compositions: ${compositions.map((c) => c.id).join(", ")}`);
  }
  const propsStore = editorPropsProviderRef.current;
  if (!propsStore) {
    throw new Error("No props store found. Are you in the Remotion Studio and are the Remotion versions aligned?");
  }
  const savedDefaultProps = composition.defaultProps ?? {};
  const unsavedDefaultProps = propsStore.getProps()[compositionId] ?? savedDefaultProps;
  const generatedDefaultProps = defaultProps({
    schema: composition.schema,
    savedDefaultProps,
    unsavedDefaultProps
  });
  return {
    composition,
    generatedDefaultProps
  };
};

// src/api/pause.ts
import { Internals as Internals3 } from "remotion";
var pause = () => {
  Internals3.timeValueRef.current?.pause();
};
// src/api/play.ts
import { Internals as Internals4 } from "remotion";
var play = (e) => {
  Internals4.timeValueRef.current?.play(e);
};
// src/api/reevaluate-composition.ts
import { Internals as Internals5 } from "remotion";
var reevaluateComposition = () => {
  Internals5.resolveCompositionsRef.current?.reloadCurrentlySelectedComposition();
};
// src/api/restart-studio.ts
import { getRemotionEnvironment as getRemotionEnvironment3 } from "remotion";
var restartStudio = () => {
  if (!getRemotionEnvironment3().isStudio) {
    throw new Error("restartStudio() is only available in the Studio");
  }
  if (window.remotion_isReadOnlyStudio) {
    throw new Error("restartStudio() is not available in read-only Studio");
  }
  return callApi("/api/restart-studio", {});
};
// src/api/save-default-props.ts
import { getRemotionEnvironment as getRemotionEnvironment4 } from "remotion";

// src/components/RenderModal/SchemaEditor/zod-schema-type.ts
var getZodDef = (schema) => {
  if (schema._def)
    return schema._def;
  if (schema._zod)
    return schema._zod.def;
  throw new Error("Invalid zod schema: missing _def and _zod");
};
var v3TypeNameMap = {
  ZodString: "string",
  ZodNumber: "number",
  ZodBoolean: "boolean",
  ZodObject: "object",
  ZodArray: "array",
  ZodEnum: "enum",
  ZodUnion: "union",
  ZodDiscriminatedUnion: "discriminatedUnion",
  ZodOptional: "optional",
  ZodNullable: "nullable",
  ZodDefault: "default",
  ZodTuple: "tuple",
  ZodDate: "date",
  ZodAny: "any",
  ZodUnknown: "unknown",
  ZodBigInt: "bigint",
  ZodNull: "null",
  ZodUndefined: "undefined",
  ZodEffects: "effects",
  ZodLiteral: "literal",
  ZodRecord: "record",
  ZodNever: "never",
  ZodVoid: "void",
  ZodNaN: "nan",
  ZodSymbol: "symbol",
  ZodIntersection: "intersection",
  ZodMap: "map",
  ZodSet: "set",
  ZodLazy: "lazy",
  ZodFunction: "function",
  ZodNativeEnum: "nativeEnum",
  ZodCatch: "catch",
  ZodPromise: "promise",
  ZodBranded: "branded",
  ZodPipeline: "pipeline"
};
var isZodV3Schema = (schema) => {
  const def = getZodDef(schema);
  return "typeName" in def;
};
var getZodSchemaType = (schema) => {
  const def = getZodDef(schema);
  if ("typeName" in def) {
    const { typeName } = def;
    return v3TypeNameMap[typeName] ?? typeName;
  }
  const { type } = def;
  if (type === "union" && def.discriminator !== undefined) {
    return "discriminatedUnion";
  }
  return type;
};
var getZodSchemaDescription = (schema) => {
  if (isZodV3Schema(schema)) {
    return getZodDef(schema).description;
  }
  return schema.description;
};
var getObjectShape = (schema) => {
  const { shape } = getZodDef(schema);
  return typeof shape === "function" ? shape() : shape;
};
var getArrayElement = (schema) => {
  const def = getZodDef(schema);
  return isZodV3Schema(schema) ? def.type : def.element;
};
var getInnerType = (schema) => {
  return getZodDef(schema).innerType;
};
var getEffectsInner = (schema) => {
  return getZodDef(schema).schema;
};
var getUnionOptions = (schema) => {
  return getZodDef(schema).options;
};
var getIntersectionSchemas = (schema) => {
  const def = getZodDef(schema);
  return { left: def.left, right: def.right };
};
var getTupleItems = (schema) => {
  return getZodDef(schema).items;
};
var getRecordValueType = (schema) => {
  return getZodDef(schema).valueType;
};
var getRecordKeyType = (schema) => {
  return getZodDef(schema).keyType;
};
var getPipelineOutput = (schema) => {
  return getZodDef(schema).out;
};
var getBrandedInner = (schema) => {
  return isZodV3Schema(schema) ? getZodDef(schema).type : schema;
};

// src/components/RenderModal/SchemaEditor/extract-enum-json-paths.ts
var extractEnumJsonPaths = ({
  schema,
  zodRuntime,
  currentPath,
  zodTypes
}) => {
  const description = getZodSchemaDescription(schema);
  if (zodTypes && description === zodTypes.ZodZypesInternals.REMOTION_MATRIX_BRAND) {
    return [currentPath];
  }
  const typeName = getZodSchemaType(schema);
  switch (typeName) {
    case "object": {
      const shape = getObjectShape(schema);
      const keys = Object.keys(shape);
      return keys.map((key) => {
        return extractEnumJsonPaths({
          schema: shape[key],
          zodRuntime,
          currentPath: [...currentPath, key],
          zodTypes
        });
      }).flat(1);
    }
    case "array": {
      return extractEnumJsonPaths({
        schema: getArrayElement(schema),
        zodRuntime,
        currentPath: [...currentPath, "[]"],
        zodTypes
      });
    }
    case "union": {
      return getUnionOptions(schema).map((option) => {
        return extractEnumJsonPaths({
          schema: option,
          zodRuntime,
          currentPath,
          zodTypes
        });
      }).flat(1);
    }
    case "discriminatedUnion": {
      return getUnionOptions(schema).map((op) => {
        return extractEnumJsonPaths({
          schema: op,
          zodRuntime,
          currentPath,
          zodTypes
        });
      }).flat(1);
    }
    case "literal": {
      return [currentPath];
    }
    case "effects": {
      return extractEnumJsonPaths({
        schema: getEffectsInner(schema),
        zodRuntime,
        currentPath,
        zodTypes
      });
    }
    case "intersection": {
      const { left, right } = getIntersectionSchemas(schema);
      const leftValue = extractEnumJsonPaths({
        schema: left,
        zodRuntime,
        currentPath,
        zodTypes
      });
      const rightValue = extractEnumJsonPaths({
        schema: right,
        zodRuntime,
        currentPath,
        zodTypes
      });
      return [...leftValue, ...rightValue];
    }
    case "tuple": {
      return getTupleItems(schema).map((item, i) => extractEnumJsonPaths({
        schema: item,
        zodRuntime,
        currentPath: [...currentPath, i],
        zodTypes
      })).flat(1);
    }
    case "record": {
      const recordPath = [...currentPath, "{}"];
      const keyResults = extractEnumJsonPaths({
        schema: getRecordKeyType(schema),
        zodRuntime,
        currentPath: recordPath,
        zodTypes
      });
      const valueResults = extractEnumJsonPaths({
        schema: getRecordValueType(schema),
        zodRuntime,
        currentPath: recordPath,
        zodTypes
      });
      return [...keyResults, ...valueResults];
    }
    case "function": {
      throw new Error("Cannot create a value for type function");
    }
    case "enum": {
      return [currentPath];
    }
    case "nativeEnum": {
      return [];
    }
    case "optional":
    case "nullable":
    case "catch": {
      return extractEnumJsonPaths({
        schema: getInnerType(schema),
        zodRuntime,
        currentPath,
        zodTypes
      });
    }
    case "default": {
      return extractEnumJsonPaths({
        schema: getInnerType(schema),
        zodRuntime,
        currentPath,
        zodTypes
      });
    }
    case "promise": {
      return [];
    }
    case "branded": {
      return extractEnumJsonPaths({
        schema: getBrandedInner(schema),
        zodRuntime,
        currentPath,
        zodTypes
      });
    }
    case "pipeline":
    case "pipe": {
      return extractEnumJsonPaths({
        schema: getPipelineOutput(schema),
        zodRuntime,
        currentPath,
        zodTypes
      });
    }
    case "string":
    case "number":
    case "bigint":
    case "boolean":
    case "nan":
    case "date":
    case "symbol":
    case "undefined":
    case "null":
    case "any":
    case "unknown":
    case "never":
    case "void":
    case "map":
    case "lazy":
    case "set":
    case "custom": {
      return [];
    }
    default:
      throw new Error("Not implemented: " + typeName);
  }
};

// src/components/RenderQueue/actions.ts
import { NoReactInternals } from "remotion/no-react";
var callUpdateDefaultPropsApi = (compositionId, defaultProps, enumPaths) => {
  return callApi("/api/update-default-props", {
    compositionId,
    defaultProps: NoReactInternals.serializeJSONWithSpecialTypes({
      data: defaultProps,
      indent: undefined,
      staticBase: window.remotion_staticBase
    }).serializedString,
    enumPaths
  });
};

// src/api/save-default-props.ts
var saveDefaultProps = async ({
  compositionId,
  defaultProps
}) => {
  if (!getRemotionEnvironment4().isStudio) {
    throw new Error("saveDefaultProps() is only available in the Studio");
  }
  if (window.remotion_isReadOnlyStudio) {
    throw new Error("saveDefaultProps() is not available in read-only Studio");
  }
  try {
    await import("zod");
  } catch {
    throw new Error('"zod" is required to use saveDefaultProps(), but is not installed.');
  }
  const z = await import("zod");
  let zodTypes = null;
  try {
    zodTypes = await import("@remotion/zod-types");
  } catch {}
  const { generatedDefaultProps, composition } = calcNewProps(compositionId, defaultProps);
  const res = await callUpdateDefaultPropsApi(compositionId, generatedDefaultProps, composition.schema ? extractEnumJsonPaths({
    schema: composition.schema,
    zodRuntime: z,
    currentPath: [],
    zodTypes
  }) : []);
  if (res.success) {
    return Promise.resolve();
  }
  const err = new Error(res.reason);
  err.stack = res.stack;
  return Promise.reject(err);
};
// src/api/seek.ts
import { Internals as Internals6 } from "remotion";
var seek = (frame) => {
  Internals6.timeValueRef.current?.seek(Math.max(0, frame));
};
// src/api/toggle.ts
import { Internals as Internals7 } from "remotion";
var toggle = (e) => {
  Internals7.timeValueRef.current?.toggle(e);
};
// src/api/update-default-props.ts
import { Internals as Internals8 } from "remotion";
var updateDefaultProps = ({
  compositionId,
  defaultProps
}) => {
  const { generatedDefaultProps, composition } = calcNewProps(compositionId, defaultProps);
  const propsStore = Internals8.editorPropsProviderRef.current;
  if (!propsStore) {
    throw new Error("No props store found. Are you in the Remotion Studio and are the Remotion versions aligned?");
  }
  propsStore.setProps((prev) => {
    return {
      ...prev,
      [composition.id]: generatedDefaultProps
    };
  });
  window.dispatchEvent(new CustomEvent(Internals8.PROPS_UPDATED_EXTERNALLY, {
    detail: {
      resetUnsaved: null
    }
  }));
};
// src/api/visual-control.ts
import { getRemotionEnvironment as getRemotionEnvironment5 } from "remotion";

// src/visual-controls/VisualControls.tsx
import {
  createContext,
  createRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { useRemotionEnvironment } from "remotion";
import { jsx as jsx2 } from "react/jsx-runtime";
var VisualControlsTabActivatedContext = createContext(false);
var VisualControlsContext = createContext({
  handles: {}
});
var visualControlRef = createRef();
var SetVisualControlsContext = createContext({
  updateHandles: () => {
    throw new Error("updateHandles is not implemented");
  },
  updateValue: () => {
    throw new Error("updateValue is not implemented");
  },
  visualControl: () => {
    throw new Error("visualControl is not implemented");
  }
});

// src/api/visual-control.ts
var visualControl = (key, value, schema) => {
  if (getRemotionEnvironment5().isRendering) {
    return value;
  }
  if (!visualControlRef.current) {
    return value;
  }
  return visualControlRef.current.globalVisualControl(key, value, schema);
};
// src/api/watch-public-folder.ts
import { getRemotionEnvironment as getRemotionEnvironment6 } from "remotion";
var WATCH_REMOTION_STATIC_FILES = "remotion_staticFilesChanged";
var watchPublicFolder = (callback) => {
  if (!getRemotionEnvironment6().isStudio) {
    console.warn("The watchPublicFolder() API is only available while using the Remotion Studio.");
    return { cancel: () => {
      return;
    } };
  }
  if (window.remotion_isReadOnlyStudio) {
    throw new Error("watchPublicFolder() is not available in read-only Studio");
  }
  const emitUpdate = () => {
    callback(getStaticFiles());
  };
  window.addEventListener(WATCH_REMOTION_STATIC_FILES, emitUpdate);
  const cancel = () => {
    return window.removeEventListener(WATCH_REMOTION_STATIC_FILES, emitUpdate);
  };
  return { cancel };
};
// src/api/watch-static-file.ts
import { getRemotionEnvironment as getRemotionEnvironment7 } from "remotion";
var watchStaticFile = (fileName, callback) => {
  if (!getRemotionEnvironment7().isStudio) {
    console.warn("watchStaticFile() is only available while using the Remotion Studio.");
    return { cancel: () => {
      return;
    } };
  }
  if (window.remotion_isReadOnlyStudio) {
    console.warn("watchStaticFile() is only available in an interactive Studio.");
    return { cancel: () => {
      return;
    } };
  }
  const withoutStaticBase = fileName.startsWith(window.remotion_staticBase) ? fileName.replace(window.remotion_staticBase, "") : fileName;
  const withoutLeadingSlash = withoutStaticBase.startsWith("/") ? withoutStaticBase.slice(1) : withoutStaticBase;
  let prevFileData = window.remotion_staticFiles.find((file) => file.name === withoutLeadingSlash);
  const { cancel } = watchPublicFolder((staticFiles) => {
    const newFileData = staticFiles.find((file) => file.name === withoutLeadingSlash);
    if (!newFileData) {
      if (prevFileData !== undefined) {
        callback(null);
      }
      prevFileData = undefined;
      return;
    }
    if (prevFileData === undefined || prevFileData.lastModified !== newFileData.lastModified) {
      callback(newFileData);
      prevFileData = newFileData;
    }
  });
  return { cancel };
};
// src/api/write-static-file.ts
var writeStaticFile = async ({
  contents,
  filePath
}) => {
  if (window.remotion_isReadOnlyStudio) {
    throw new Error("writeStaticFile() is not available in read-only Studio");
  }
  const url = new URL(`${window.remotion_staticBase}/api/add-asset`, window.location.origin);
  if (filePath.includes("\\")) {
    return Promise.reject(new Error("File path cannot contain backslashes"));
  }
  url.search = new URLSearchParams({
    filePath
  }).toString();
  const response = await fetch(url, {
    method: "POST",
    body: contents
  });
  if (!response.ok) {
    const jsonResponse = await response.json();
    throw new Error(jsonResponse.error);
  }
};

// src/index.ts
var StudioInternals = {
  createComposition,
  createStill
};
export {
  writeStaticFile,
  watchStaticFile,
  watchPublicFolder,
  visualControl,
  updateDefaultProps,
  toggle,
  seek,
  saveDefaultProps,
  restartStudio,
  reevaluateComposition,
  play,
  pause,
  goToComposition,
  getStaticFiles,
  focusDefaultPropsPath,
  deleteStaticFile,
  StudioInternals
};
