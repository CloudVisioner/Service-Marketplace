import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { AuthModule } from './auth/auth.module';
import { CommmentModule } from './commment/commment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';

@Module({
	imports: [
		MemberModule,
		PropertyModule,
		AuthModule,
		CommmentModule,
		LikeModule,
		ViewModule,
		FollowModule,
		BoardArticleModule,
	],
})
export class ComponentsModule {}
