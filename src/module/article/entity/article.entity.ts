import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { UserEntity } from '@/module/user/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Column } from 'typeorm';
import { ArticleImageEntity } from './articleImage.entity';
import { ArticleCommentEntity } from './articleComment.entity';

@Entity('articles')
export class ArticleEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tiêu đề bài viết' })
    title: string;

    @Column({
        type: 'text',
    })
    @ApiProperty({ description: 'Nội dung bài viết' })
    content: string;

    @Column({
        type: 'int',
        default: 0,
    })
    @ApiProperty({ description: 'Số lượt xem' })
    count_views: number;

    @Column({
        type: 'mediumint',
        default: 0,
    })
    @ApiProperty({ description: 'Số lượt thích' })
    count_likes: number;

    @Column({
        type: 'mediumint',
        default: 0,
    })
    @ApiProperty({ description: 'Số lượt bình luận' })
    count_comments: number;

    @Column({
        type: 'bool',
        default: false,
    })
    @ApiProperty({ description: 'Hiển thị bài viết' })
    is_visible: boolean;

    @ManyToOne(() => UserEntity, (user) => user.articles, { nullable: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Người dùng' })
    user: UserEntity;

    @ManyToMany(() => UserEntity)
    @JoinTable({
        name: 'user_article_likes',
        joinColumn: { name: 'article_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    @ApiProperty({
        type: () => [UserEntity],
        description: 'Danh sách các người dùng thích bài viết',
    })
    users_like: UserEntity[];

    @OneToMany(() => ArticleImageEntity, (image) => image.article)
    @ApiProperty({ description: 'Ảnh bài viết' })
    images: ArticleImageEntity[];

    @OneToMany(() => ArticleCommentEntity, (comment) => comment.article)
    @ApiProperty({ description: 'Bình luận bài viết' })
    comments: ArticleCommentEntity[];
}
