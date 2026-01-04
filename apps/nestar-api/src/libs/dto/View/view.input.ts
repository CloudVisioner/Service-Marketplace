import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ViewGroup } from '../../enums/view.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class ViewInput {
	@IsNotEmpty()
	@Field(() => ViewGroup)
	viewRefId: ObjectId;

	@IsNotEmpty()
	@Field(() => ViewGroup)
	memberId: ObjectId;

	@IsNotEmpty()
	@Field(() => ViewGroup)
	viewGroup: string;
}
