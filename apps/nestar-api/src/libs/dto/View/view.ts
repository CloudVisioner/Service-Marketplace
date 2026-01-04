import { Field, Int, ObjectType } from '@nestjs/graphql';
import  mongoose, { ObjectId } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { ViewGroup } from '../../enums/view.enum';

@ObjectType() // graphQL output return
export class View {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => ViewGroup)
	viewGroup: ViewGroup;

	@Field(() => String)
	viewRefId: ObjectId

	@Field(() => String)
	memberId: ObjectId

	@Field(() => Date, { nullable: true })
	createdAt: Date;

	@Field(() => Date, { nullable: true })
	updatedAt: Date;


}
