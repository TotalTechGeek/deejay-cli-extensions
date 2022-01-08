// @ts-check
import Kafka from "./inputs/kafka.js"
import HTTP from './inputs/http.js'
import webhook from "./operators/webhook.js"
import commit from "./operators/commits.js"

// Creates a new input mechanisms for the Deejay CLI application.
export const inputs = {
    Kafka,
    HTTP
}

// Introduces new operators to the Deejay CLI application
export const operators = {
    webhook,
    commit
}