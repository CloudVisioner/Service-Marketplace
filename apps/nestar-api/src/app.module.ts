import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';

@Module({
	// INTEGRATION
	imports: [
		ConfigModule.forRoot(),
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: true,
			uploads: false, // for receiving images, multipart/form-data is ON.
			autoSchemaFile: true,
		}),
		ComponentsModule,
		DatabaseModule,
	],
	controllers: [AppController], // For REST API
	providers: [AppService, AppResolver],
})
export class AppModule {}

// imports is the mechanism that connects (injectsm) the modules to AppModule
// @Module provideas the properties to AppModule {}.
