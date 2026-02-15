import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Loggin.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
			exceptionFactory: (errors) => {
				const messages = errors.map((error) => {
					return Object.values(error.constraints || {}).join(', ');
				});
				return new BadRequestException(messages.join('; ') || 'Validation failed');
			},
		}),
	);
	app.useGlobalInterceptors(new LoggingInterceptor());
	app.enableCors({ origin: true, credentials: true });
	app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 }));
	app.use('/uploads', express.static('./uploads')); // ochiqlash

	app.useWebSocketAdapter(new IoAdapter(app));
	await app.listen(process.env.PORT_API ?? 3000);
	console.log(`✅ Nestar API Server is running on: http://localhost:${process.env.PORT_API ?? 3000}`);
	console.log(`📡 GraphQL Playground: http://localhost:${process.env.PORT_API ?? 3000}/graphql`);
}
bootstrap();
