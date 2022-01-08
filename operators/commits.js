// @ts-check
import { Subject, tap, pipe } from "rxjs";

/**
 * A subject that emits the commits that are made, used for mechanisms like "Kafka"
 * to acknowledge the commits.
 */
export const commits = new Subject();

/**
 * An operator that emits when commits are made, used for mechanisms like "Kafka"
 */
const commit = () => pipe(
    tap(() => commits.next(1))
)

export default commit