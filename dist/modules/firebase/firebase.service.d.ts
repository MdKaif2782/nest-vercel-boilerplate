import { Request } from 'express';
export declare class FirebaseService {
    sayMyName(): Promise<{
        message: string;
        response: string;
    }>;
    validateToken(token: string): Promise<boolean>;
    getCustomerIdFromToken(request: Request): Promise<string>;
    sendNotificationToTopic(topic: string, data: any, notification?: {
        title: string;
        body: string;
        imageUrl?: string;
    }): Promise<{
        message: string;
        response: string;
    }>;
    sendTestNotification(): Promise<{
        message: string;
        response: string;
    }>;
    sendNotificationToToken(token: string, data: any, notification?: {
        title: string;
        body: string;
        imageUrl?: string;
    }): Promise<{
        message: string;
        response: string;
    }>;
}
