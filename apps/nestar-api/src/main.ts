import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Loggin.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';
import { WsAdapter } from '@nestjs/platform-ws';
import * as dotenv from 'dotenv';

// Ensure .env is loaded before anything else
dotenv.config();
console.log('main.ts – CHATBASE_IDENTITY_SECRET at startup:', process.env.CHATBASE_IDENTITY_SECRET);

async function bootstrap() {
	// Disable NestJS built-in body parser to configure limits manually
	const app = await NestFactory.create(AppModule, {
		bodyParser: false,
	});

	// Configure body parser with increased limits BEFORE other middleware
	app.use(express.json({ limit: '50mb' }));
	app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
	
	// GraphQL upload middleware - must be after body parser
	app.use(graphqlUploadExpress({ maxFileSize: 50000000, maxFiles: 10 })); // 50MB
	
	app.use('/uploads', express.static('./uploads'));

	// Enable WebSocket adapter (REQUIRED for native WebSocket support)
	app.useWebSocketAdapter(new WsAdapter(app));
	await app.listen(process.env.PORT_API ?? 3000);
	console.log(`✅ Nestar API Server is running on: http://localhost:${process.env.PORT_API ?? 3000}`);
	console.log(`📡 GraphQL Playground: http://localhost:${process.env.PORT_API ?? 3000}/graphql`);
}
bootstrap();
