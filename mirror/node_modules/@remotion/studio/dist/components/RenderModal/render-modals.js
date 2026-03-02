"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flexer = exports.buttonStyle = exports.icon = exports.iconContainer = exports.horizontalTab = exports.leftSidebar = exports.horizontalLayout = exports.optionsPanel = exports.container = exports.outerModalStyle = void 0;
const colors_1 = require("../../helpers/colors");
const ModalContainer_1 = require("../ModalContainer");
exports.outerModalStyle = {
    width: (0, ModalContainer_1.getMaxModalWidth)(1000),
    height: (0, ModalContainer_1.getMaxModalHeight)(640),
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
};
exports.container = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid black',
};
exports.optionsPanel = {
    display: 'flex',
    width: '100%',
};
exports.horizontalLayout = {
    display: 'flex',
    flexDirection: 'row',
    overflowY: 'auto',
    flex: 1,
};
exports.leftSidebar = {
    padding: 12,
};
exports.horizontalTab = {
    width: 250,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'left',
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingTop: 12,
    paddingBottom: 12,
};
exports.iconContainer = {
    width: 20,
    height: 20,
    marginRight: 15,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
};
exports.icon = {
    color: 'currentcolor',
    height: 20,
};
exports.buttonStyle = {
    backgroundColor: colors_1.BLUE,
    color: 'white',
};
exports.flexer = {
    flex: 1,
};
