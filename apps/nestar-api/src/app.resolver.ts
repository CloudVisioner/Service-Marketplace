import { Query, Resolver } from '@nestjs/graphql';

@Resolver() // controller of graphQL
export class AppResolver {
    @Query(() => String)
    public sayHello(): string {
        return 'GraphQL API Server';
    }

}