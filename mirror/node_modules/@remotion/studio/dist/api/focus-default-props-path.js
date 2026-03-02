"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusDefaultPropsPath = void 0;
const scroll_to_default_props_path_1 = require("../components/RenderModal/SchemaEditor/scroll-to-default-props-path");
const focusDefaultPropsPath = ({ path, scrollBehavior, }) => {
    const currentlyActive = document.querySelector(`.${scroll_to_default_props_path_1.DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME}`);
    if (currentlyActive !== null) {
        currentlyActive.classList.remove(scroll_to_default_props_path_1.DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME);
    }
    const query = document.querySelector(`.${scroll_to_default_props_path_1.DEFAULT_PROPS_PATH_CLASSNAME}[data-json-path="${path.join('.')}"]`);
    if (query === null) {
        return {
            success: false,
        };
    }
    query.scrollIntoView({ behavior: scrollBehavior });
    query.classList.add(scroll_to_default_props_path_1.DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME);
    return {
        success: true,
    };
};
exports.focusDefaultPropsPath = focusDefaultPropsPath;
