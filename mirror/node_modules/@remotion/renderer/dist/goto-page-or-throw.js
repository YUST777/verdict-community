"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gotoPageOrThrow = void 0;
const gotoPageOrThrow = async (page, urlToVisit, actualTimeout) => {
    try {
        const pageRes = await page.goto({ url: urlToVisit, timeout: actualTimeout });
        if (pageRes === null) {
            return [null, new Error(`Visited "${urlToVisit}" but got no response.`)];
        }
        return [pageRes, null];
    }
    catch (err) {
        return [null, err];
    }
};
exports.gotoPageOrThrow = gotoPageOrThrow;
