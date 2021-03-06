const mockDateNow = jest.spyOn(Date, 'now').mockImplementation();

/**
 *
 */
describe('Integration Testing', () => {
  let log: any;
  let returnConnect: any;
  let returnChannel: any;
  let queueName: string;
  let queueTag: string;
  let payload: any;
  let message: any;

  /**
   *
   */
  beforeEach(() => {
    log = {
      child: () => log,
      debug: () => {}, // tslint:disable-line: no-empty
      info: () => {}, // tslint:disable-line: no-empty
      error: 'soon',
      fatal: 'error',
    } as any;
  });

  const serviceValues: Array<[keyof SubType<Instance, (...args: any[]) => any>, any, string, number?]> = [
    ['worker', Worker, 'direct', 1],
    ['publisher', Publisher, 'fanout', undefined],
  ];

  /**
   *
   */
  test.each(serviceValues)('it should be create a service when %s() is called', async (type, ServiceType) => {
    const instance = await connect(
      log,
      'rabbitmq-url',
    );

    const service = await (instance[type] as any)('service-queue');

    expect(service).toBeInstanceOf(ServiceType);

    expect(mockLogError.mock.calls.length).toBe(0);
    expect(mockLogFatal.mock.calls.length).toBe(0);
  });

  test('it should be call amqp cancel() when shtudown is called', async () => {
    const mockConsumer = jest.fn();

    const instance = await connect(
      log,
      'rabbitmq-url',
    );

    mockAmqpConsume.mockResolvedValueOnce({ consumerTag: queueTag + 'p1' });
    mockAmqpConsume.mockResolvedValueOnce({ consumerTag: queueTag + 'p2' });
    mockAmqpConsume.mockResolvedValueOnce({ consumerTag: queueTag + 'w1' });
    mockAmqpConsume.mockResolvedValueOnce({ consumerTag: queueTag + 'w2' });

    const p1 = await instance.publisher('p1');
    const p2 = await instance.publisher('p2');
    const w1 = await instance.worker('w1');
    const w2 = await instance.worker('w2');
    const w3 = await instance.worker('w3');

    await p1.setConsumer(mockConsumer);
    await p2.setConsumer(mockConsumer);
    await w1.setConsumer(mockConsumer);
    await w2.setConsumer(mockConsumer);
    await w3.setConsumer(mockConsumer);

    await instance.shutdown();

    expect(mockAmqpChannelClose.mock.calls.length).toBe(1);

    expect(mockAmqpCancel.mock.calls.length).toBe(5);
    expect(mockAmqpCancel.mock.calls[0]).toEqual([queueTag + 'p1']);
    expect(mockAmqpCancel.mock.calls[1]).toEqual([queueTag + 'p2']);
    expect(mockAmqpCancel.mock.calls[2]).toEqual([queueTag + 'w1']);
    expect(mockAmqpCancel.mock.calls[3]).toEqual([queueTag + 'w2']);
    expect(mockAmqpCancel.mock.calls[4]).toEqual([queueTag]);
  });

  /**
   *
   */
  describe.each(serviceValues)('Check the %s service', (type, ServiceType, exchangeType, priority) => {
    let instance: Instance;
    let service: Service;

    /**
     *
     */
    beforeEach(async () => {
      instance = await connect(
        log,
        'rabbitmq-url',
      );

      service = await (instance[type] as any)(type + '-queue');
    });

    /**
     *
     */
    test('it should be call amqp publish() when job is created', async () => {
      mockDateNow.mockReturnValueOnce(1234567890123);

      await service.send({ ...payload });

      expect(mockAmqpAssertExchange.mock.calls.length).toBe(1);
      expect(mockAmqpAssertExchange.mock.calls[0]).toEqual([type + '-queue', exchangeType, { durable: true }]);

      expect(mockAmqpPublish.mock.calls.length).toBe(1);
      expect(mockAmqpConsume.mock.calls.length).toBe(0);
      expect(mockAmqpPublish.mock.calls[0]).toEqual([
        type + '-queue',
        '',
        Buffer.from(JSON.stringify(payload), 'utf8'),
        { persistent: true, priority, timestamp: 1234567890123 },
      ]);

      expect(mockLogError.mock.calls.length).toBe(0);
      expect(mockLogFatal.mock.calls.length).toBe(0);
    });

    /**
     *
     */
    test('it should be call amqp consume() when consumer is added', async () => {
      const queueNameInternal = type === 'publisher' ? 'randome-queue-name' : type + '-queue';
      const mockConsumer = jest.fn();

      await service.setConsumer(mockConsumer);

      expect(mockAmqpPublish.mock.calls.length).toBe(0);
      expect(mockAmqpConsume.mock.calls.length).toBe(1);
      expect(mockAmqpConsume.mock.calls[0]).toEqual([queueNameInternal, expect.any(Function), { noAck: false }]);
      expect(mockConsumer.mock.calls.length).toBe(0);

      expect(mockLogError.mock.calls.length).toBe(0);
      expect(mockLogFatal.mock.calls.length).toBe(0);
    });

    /**
     *
     */
    test('it should be complete the job successfully when a new job is created', async () => {
      expect.assertions(11);

      const mockConsumer = jest.fn(async (data: consumerDataType<any>) => {
        expect(data.log).toBe(log);
        expect(data.payload).toEqual(payload);

        await data.next();
      });

      await service.setConsumer(mockConsumer);

      expect(mockAmqpConsume.mock.calls.length).toBe(1);
      expect(mockAmqpConsume.mock.calls[0][1]).toEqual(expect.any(Function));

      const consumer = mockAmqpConsume.mock.calls[0][1];

      await consumer(message);

      expect(mockAmqpPublish.mock.calls.length).toBe(0);
      expect(mockConsumer.mock.calls.length).toBe(1);
      expect(mockAmqpAck.mock.calls.length).toBe(1);
      expect(mockAmqpNack.mock.calls.length).toBe(0);
      expect(mockLogError.mock.calls.length).toBe(0);
      expect(mockLogFatal.mock.calls.length).toBe(0);

      expect(mockAmqpAck.mock.calls[0]).toEqual([message]);
    });

    /**
     *
     */
    test('it should be throw an error when a new job is created', async () => {
      expect.assertions(8);

      const mockConsumer = jest.fn(async (data: consumerDataType<any>) => {
        throw new Error('Consumer Error');
      });

      await service.setConsumer(mockConsumer);

      expect(mockAmqpConsume.mock.calls.length).toBe(1);
      expect(mockAmqpConsume.mock.calls[0][1]).toEqual(expect.any(Function));

      const consumer = mockAmqpConsume.mock.calls[0][1];

      await consumer(message);

      expect(mockAmqpPublish.mock.calls.length).toBe(0);
      expect(mockConsumer.mock.calls.length).toBe(1);
      expect(mockAmqpAck.mock.calls.length).toBe(0);
      expect(mockAmqpNack.mock.calls.length).toBe(1);
      expect(mockLogError.mock.calls.length).toBe(1);
      expect(mockLogFatal.mock.calls.length).toBe(0);
    });

    /**
     *
     */
    test('it should be throw an error and forwards this when a new job is created', async () => {
      mockDateNow.mockReturnValueOnce(1987654321098);

      expect.assertions(9);

      const service2 = await (instance[type] as any)(type + '-queue-2', service);
      const error = new Error('Consumer Error with forwading');

      const mockConsumer = jest.fn(async (data: consumerDataType<any>) => {
        throw error;
      });

      await service2.setConsumer(mockConsumer);

      expect(mockAmqpConsume.mock.calls.length).toBe(1);
      expect(mockAmqpConsume.mock.calls[0][1]).toEqual(expect.any(Function));

      const consumer = mockAmqpConsume.mock.calls[0][1];

      await consumer(message);

      expect(mockAmqpPublish.mock.calls.length).toBe(1);
      expect(mockConsumer.mock.calls.length).toBe(1);
      expect(mockAmqpAck.mock.calls.length).toBe(0);
      expect(mockAmqpNack.mock.calls.length).toBe(1);
      expect(mockLogError.mock.calls.length).toBe(1);
      expect(mockLogFatal.mock.calls.length).toBe(0);

      expect(mockAmqpPublish.mock.calls[0]).toEqual([
        type + '-queue',
        '',
        Buffer.from(
          JSON.stringify({
            queue: type + '-queue-2',
            payload,
            name: error.name,
            message: error.message,
            stack: error.stack ? error.stack.split('\n') : [],
          }),
        ),
        { persistent: true, priority, timestamp: 1987654321098 },
      ]);
    });
  });
});
