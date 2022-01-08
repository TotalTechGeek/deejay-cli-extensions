// @ts-check
import Kafka from "./kafka.js"
import HTTP from './http.js'
import webhook from "./webhook.js"

// Creates a new input mechanisms for the Deejay CLI application.
export const inputs = {
    Kafka,
    HTTP
}

// Creates a new output mechanism for the Deejay CLI application (Webhook).
export const operators = {
    webhook
}