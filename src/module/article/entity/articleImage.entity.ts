import { BaseEntityTimestamp } from "@/common/entity/BaseEntityTimestamp";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ArticleEntity } from "./article.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity('article_images')
export class ArticleImageEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    image_url: string;

    @ManyToOne(() => ArticleEntity, (article) => article.images, { nullable: false })
    @JoinColumn({ name: 'article_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Bài viết' })
    article: ArticleEntity;
}   