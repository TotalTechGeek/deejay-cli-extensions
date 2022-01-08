// @ts-check
import { Subject, finalize } from 'rxjs'
import express from 'express'

/**
 * @param {'HTTP'} type This parameter is typically used to pass in a file name, but because this is a custom input, it will always be 'HTTP'. Comes from the (-f, --format) flag.
 * @param {string} port This is the port that the server will listen on. Comes from the (-a, --additional) flag.
 * @returns An Observable that emits the messages as they are received from the server.
 */
export default function httpObservable (type, port) {
    const subject = new Subject()

    const app = express()
    app.use(express.json())
    const server = app.listen(+port)

    // All path hits should be emitted to the subject.
    app.all(/.+/, (req, res) => {
        const { method, url, body } = req
        subject.next({ method, url, body })
        res.end()
    })

    return subject.pipe(
        // Close the server when the observable is complete
        finalize(async () => {
            server.close()
        })
    )
}