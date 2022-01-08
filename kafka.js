// @ts-check
import { Subject, finalize } from 'rxjs'
import { Kafka } from 'kafkajs'

// Sets up the kafka client
const kafka = new Kafka({
    clientId: process.env.CLIENT_ID || 'DSL-Forwarder',
    brokers: (process.env.BROKERS || 'localhost:9092').split(',')
})

const consumer = kafka.consumer({ groupId: 'DSL-Forwarder', allowAutoTopicCreation: true })

/**
 * @param {'Kafka'} type This parameter is typically used to pass in a file name, but because this is a custom input, it will always be 'Kafka'. Comes from the (-f, --format) flag.
 * @param {string} topic This is the topic to subscribe to. Comes from the (-a, --additional) flag.
 * @returns An Observable that emits the messages as they are received from Kafka.
 */
export default function kafkaObservable (type, topic) {
    const subject = new Subject()

    // Subscribe to the topic
    const setup = async () => {
        await consumer.connect()
        await consumer.subscribe({ topic })
        await consumer.run({
            eachMessage: async ({ message }) => {
                subject.next(message)
            }
        })
    }

    // If the setup fails, we need to alert & close.
    setup().catch(err => {
        console.error(err)
        process.exit(1)
    })

    return subject.pipe(
        // Close the consumer when the observable is complete
        finalize(async () => {
            await consumer.disconnect()
        })
    )
}