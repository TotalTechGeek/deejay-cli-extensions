// @ts-check
import { Subject, finalize, firstValueFrom } from 'rxjs'
import { Kafka } from 'kafkajs'
import { commits } from '../operators/commits.js'

// Sets up the kafka client
const kafka = new Kafka({
    clientId: process.env.CLIENT_ID || 'DSL-Forwarder',
    brokers: (process.env.BROKERS || 'localhost:9092').split(',')
})

const consumer = kafka.consumer({ groupId: 'DSL-Forwarder', allowAutoTopicCreation: true })

/**
 * The various commit strategies to select from.
 * @type {{ [key: string]: 'None' | 'Message' | 'Batch' }}
 */
const COMMIT_STRATEGIES = { 
    'none': 'None',
    '': 'Batch',
    'message': 'Message',
    'batch': 'Batch'
}

/** 
 * The strategy used for committing data coming through the pipeline. 
 */
const COMMIT_STRATEGY = COMMIT_STRATEGIES[process.env.COMMIT_STRATEGY || 'batch']

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
            eachBatchAutoResolve: false,
            eachBatch: async ({ batch, heartbeat, resolveOffset }) => {
                const listener = (COMMIT_STRATEGY === 'None') ? null : firstValueFrom(commits)
                for (const message of batch.messages) {
                    // Todo: Add the ability to adjust the way the messages are parsed (Avro?)
                    // @ts-ignore JSON.parse can work on buffers.
                    subject.next(JSON.parse(message.value))

                    if (COMMIT_STRATEGY === 'Message') {
                        // Wait for the commit to complete, then resolve the offset for the message.
                        await listener
                        resolveOffset(message.offset)
                    }
                }

            
                if (COMMIT_STRATEGY === 'Batch') {
                    // Wait for the commit to execute on the batch & resolve each message's offset
                    await listener
                    batch.messages.forEach(message => resolveOffset(message.offset))
                }

                await heartbeat()
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