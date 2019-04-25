namespace Vidyano {
    export type ServiceBusCallback = (sender: any, message: string, detail: any) => void;

    export interface ServiceBusSubscriptionDisposer extends Vidyano.Common.ISubjectDisposer {
    }

    export interface IServiceBus {
        send(sender: any, message: string, parameters: any);
        subscribe(message: string, callback: ServiceBusCallback, receiveLast?: boolean): ServiceBusSubscriptionDisposer;
    }

    interface IServiceTopicMessage {
        sender: any;
        message: string;
        detail: any;
    }

    interface IServiceBusTopic {
        subject: Vidyano.Common.Subject<IServiceBus, IServiceTopicMessage>;
        notifier: Vidyano.Common.ISubjectNotifier<IServiceBus, IServiceTopicMessage>;
        lastMessage?: IServiceTopicMessage;
    }

    class ServiceBusImpl implements IServiceBus {
        private _topics: KeyValue<IServiceBusTopic> = {};

        private _getTopic(topic: string = ""): IServiceBusTopic {
            if (!this._topics[topic]) {
                const topicNotifier = {};
                this._topics[topic] = {
                    notifier: topicNotifier,
                    subject: new Vidyano.Common.Subject(topicNotifier)
                };
            }

            return this._topics[topic];
        }

        send(sender: any, message: string, detail?: any) {
            const topicOrMessage = message.split(":", 2);
            const topic = this._getTopic(topicOrMessage.length > 1 ? topicOrMessage[0] : "");
            message = topicOrMessage.length === 1 ? topicOrMessage[0] : topicOrMessage[1];

            topic.notifier.notify(this, topic.lastMessage = {
                sender: sender,
                message: message,
                detail: detail
            });
        }

        subscribe(message: string, callback: ServiceBusCallback, receiveLast?: boolean) {
            const topicOrMessage = message.split(":", 2);
            const topic = this._getTopic(topicOrMessage.length > 1 ? topicOrMessage[0] : "");
            message = topicOrMessage.length === 1 ? topicOrMessage[0] : topicOrMessage[1];

            const disposer = topic.subject.attach((_, detail) => {
                if (message === "*" || message === detail.message)
                    callback(detail.sender, detail.message, detail.detail);
            });

            if (receiveLast && topic.lastMessage != null) {
                if (message === "*" || message === topic.lastMessage.message)
                    callback(topic.lastMessage, topic.lastMessage.message, topic.lastMessage.detail);
            }

            return disposer;
        }
    }

    export const ServiceBus = new ServiceBusImpl();
}