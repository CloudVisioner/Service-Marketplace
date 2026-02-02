import { Field, Int, ObjectType } from '@nestjs/graphql';
import  mongoose, { ObjectId } from 'mongoose';
import { ViewGroup } from '../../enums/view.enum';

@ObjectType()
export class View {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => ViewGroup)
	viewGroup: ViewGroup;

	@Field(() => String)
	viewRefId: ObjectId

	@Field(() => String)
	userId: ObjectId

	@Field(() => Date, { nullable: true })
	createdAt: Date;

	@Field(() => Date, { nullable: true })
	updatedAt: Date;
}
