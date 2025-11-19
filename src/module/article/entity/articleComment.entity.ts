import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleEntity } from './article.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@/module/user/entity/user.entity';

@Entity('article_comments')
export class ArticleCommentEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'text',
    })
    @ApiProperty({ description: 'Nội dung bình luận' })
    content: string;

    @ManyToOne(() => ArticleEntity, (article) => article.comments, {
        nullable: false,
    })
    @JoinColumn({ name: 'article_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Bài viết' })
    article: ArticleEntity;

    @ManyToOne(() => UserEntity, (user) => user.comments, { nullable: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Người dùng' })
    user: UserEntity;

    @Index()
    @Column({ type: 'int', nullable: true })
    @ApiProperty({ description: 'ID của bình luận cha' })
    parent_id?: number | null;

    @ManyToOne(() => ArticleCommentEntity, (c) => c.children, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'parent_id' })
    @ApiProperty({ description: 'Bình luận cha' })
    parent?: ArticleCommentEntity | null;

    @OneToMany(() => ArticleCommentEntity, (c) => c.parent)
    @ApiProperty({ description: 'Bình luận con' })
    children: ArticleCommentEntity[];
}
