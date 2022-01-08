import {Kafka} from 'kafkajs'

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
})


function * gen (min = 1e3) {
    for (let i = 0; i < min; i++) {
        yield { value: JSON.stringify({ data: i }) }
    }

}

const producer = kafka.producer({ allowAutoTopicCreation: true })
await producer.connect()

await producer.send({
    topic: 'Testing',
    messages: [
        ...gen(1e4)
    ]
})

await producer.disconnect()