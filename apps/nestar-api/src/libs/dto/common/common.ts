import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TotalCounter {
	@Field(() => Int, { nullable: true })
	total?: number;
}
