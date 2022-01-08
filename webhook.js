// @ts-check
import { pipe, mergeMap } from "rxjs";
import superagent from "superagent";

/**
 * @param {string} url The url to send the request to.
 * @param {'get'|'post'|'delete'|'patch'|'put'} method 
 * @param {*} message 
 */
function request (url, method, message) {
    // @ts-ignore This is just for safety.
    method = method.toLowerCase();

    const request = superagent[method](url);

    if (method !== 'get') {
        request.send(message);
    }

    return request;
}


/**
 * Fires off a request to the given url.
 * @param {string | ((item: any) => any)} message 
 * @param {'get'|'post'|'delete'|'patch'|'put'} method 
 * @param {*} url The url to send the request to.
 * @param {number} concurrency The number of concurrent requests to allow.
 * @returns 
 */
export default function webhook (message, url, method = 'post', concurrency = 1) {
    return pipe(
        mergeMap(async (item) => (await request(url, method, typeof message === 'string' ? message : message(item))).body, concurrency)
    )
}
