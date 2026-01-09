import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UserChatboxService } from '../../chatbox/service/user-chatbox.service';
import { ArticleServiceProxy } from '../../article/service/article.service-proxy';
import { Injectable, Inject, forwardRef } from '@nestjs/common';

@Processor('user-sync')
@Injectable()
export class UserSyncProcessor extends WorkerHost {
    constructor(
        private readonly userChatboxService: UserChatboxService,
        @Inject(forwardRef(() => ArticleServiceProxy))
        private readonly articleServiceProxy: ArticleServiceProxy,
    ) {
        super();
    }

    async process(job: Job<{ userId: string; name: string }>) {
        console.log(`[user-sync] Processing user sync for ${job.data.userId}, name: ${job.data.name}`);

        // Sync to chatbox service
        try {
            await this.userChatboxService.syncUser(job.data).toPromise();
            console.log(`[user-sync] Chatbox sync completed for user ${job.data.userId}`);
        } catch (error) {
            console.error(`[user-sync] Chatbox sync failed for user ${job.data.userId}:`, error);
        }

        // Sync to social service (update articles and comments)
        try {
            const result = await this.articleServiceProxy.syncUserInfo(job.data.userId, job.data.name, (job.data as any).avatar);
            console.log(`[user-sync] Social service sync completed for user ${job.data.userId}:`, result);
        } catch (error) {
            console.error(`[user-sync] Social service sync failed for user ${job.data.userId}:`, error);
        }
    }
}
