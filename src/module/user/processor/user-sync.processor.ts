import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UserChatboxService } from '../../chatbox/service/user-chatbox.service';
import { Injectable } from '@nestjs/common';

@Processor('user-sync')
@Injectable()
export class UserSyncProcessor extends WorkerHost {
    constructor(private readonly userChatboxService: UserChatboxService) {
        super();
    }

    async process(job: Job<{ userId: string; name: string }>) {
        console.log(`Processing user sync for ${job.data.userId}`);
        await this.userChatboxService.syncUser(job.data).toPromise();
        // .toPromise() because emit() returns Observable. WorkerHost expects promise mostly, or just execution.
        // Actually emit returns Observable<any>, we need to subscribe or convert to promise to ensure completion.
    }
}
