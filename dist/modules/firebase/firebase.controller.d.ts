import { FirebaseService } from './firebase.service';
export declare class FirebaseController {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    sayMyName(): Promise<{
        message: string;
        response: string;
    }>;
    sendTestNotification(): Promise<{
        message: string;
        response: string;
    }>;
    sendNotificationToToken(body: {
        token: string;
        data: any;
        notification?: any;
    }): Promise<{
        message: string;
        response: string;
    }>;
    testAuth(): Promise<{
        message: string;
    }>;
}
